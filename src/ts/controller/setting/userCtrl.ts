import { Emitter } from '@/ts/base/common';
import { kernel, model, schema } from '@/ts/base';
import {
  IPerson,
  ICompany,
  ISpace,
  createPerson,
  DomainTypes,
  emitter,
  ITarget,
  findTargetShare,
} from '@/ts/core';
import { RegisterType, TargetShare } from '@/ts/base/model';
const sessionUserName = 'sessionUser';
const sessionSpaceName = 'sessionSpace';
const DefaultSpaceName = 'defaultSpaceName';
const FirstLogin = 'firstLogin';
/** 用户控制器 */
class UserController extends Emitter {
  public currentKey: string = '';
  private _user: IPerson | undefined;
  private _curSpace: ICompany | undefined;
  private _caches: { defaultSpaceId: string } = { defaultSpaceId: '' };
  /**构造方法 */
  constructor() {
    super();
    const userJson = sessionStorage.getItem(sessionUserName);
    if (userJson && userJson.length > 0) {
      this._loadUser(JSON.parse(userJson));
      setTimeout(async () => {
        await this._user?.getJoinedCompanys();

        if (sessionStorage.getItem(FirstLogin) === '1') {
          setTimeout(async () => {
            const getSpaceId: { data: { defaultSpaceId: '' } } =
              await kernel.anystore.get(DefaultSpaceName, 'user');
            this.setCurSpace(getSpaceId?.data.defaultSpaceId);
          }, 200);
        }
        this._curSpace = this._findCompany(
          sessionStorage.getItem(sessionSpaceName) || '',
        );
        if (this._curSpace) {
          this.changCallbackPart(DomainTypes.Company);
          emitter.changCallbackPart(DomainTypes.Company);
        }
      }, 10);
    }
  }
  /** 是否已登录 */
  get logined(): boolean {
    return !!this._user?.target.id;
  }

  get caches(): {} {
    return this._caches;
  }
  /** 是否为单位空间 */
  get isCompanySpace(): boolean {
    return this._curSpace != undefined;
  }
  /** 当前用户 */
  get user(): IPerson {
    if (this._user) {
      return this._user;
    } else {
      return { id: '', target: { id: '' } } as unknown as IPerson;
    }
  }
  /** 当前单位空间 */
  get company(): ICompany {
    if (this._curSpace) {
      return this._curSpace;
    } else {
      return { id: '', target: { id: '' } } as unknown as ICompany;
    }
  }
  /** 当前空间对象 */
  get space(): ISpace {
    if (this._curSpace) {
      return this._curSpace;
    }
    return this._user!;
  }
  /** 设置当前空间 */
  public setCurSpace(id: string) {
    if (id === this._user!.id) {
      this._curSpace = undefined;
      sessionStorage.setItem(sessionSpaceName, '');
    } else {
      this._curSpace = this._findCompany(id);
      if (this._curSpace) {
        sessionStorage.setItem(sessionSpaceName, id);
      }
    }
    if (this.currentKey === '') {
      this.currentKey = this.space.key;
    }
    this.changCallbackPart(DomainTypes.Company);
    emitter.changCallbackPart(DomainTypes.Company);
  }
  public setDefaultValue(id: string) {
    this._caches = { defaultSpaceId: id };
    this._cacheSpacedata();
  }
  /** 组织树 */
  public async getTeamTree(isShare: boolean = true): Promise<ITarget[]> {
    const result: any[] = [];
    if (this._curSpace) {
      result.push(this.space);
      if (isShare) {
        const groups = await this._curSpace.getJoinedGroups(false);
        result.push(...groups);
      }
    } else {
      result.push(this.user);
      const cohorts = await this._user!.getCohorts(false);
      result.push(...cohorts);
    }
    return result;
  }
  /** 加载组织树 */
  public buildTargetTree(targets: ITarget[], menus?: (item: ITarget) => any[]) {
    const result: any[] = [];
    for (const item of targets) {
      result.push({
        id: item.id,
        item: item,
        isLeaf: item.subTeam.length == 0,
        menus: menus ? menus(item) : [],
        name: item === this.user ? '我的好友' : item.name,
        children: this.buildTargetTree(item.subTeam, menus),
      });
    }
    return result;
  }
  /**
   * 查询组织信息
   * @param id 组织id
   */
  public findTeamInfoById(id: string): TargetShare {
    return findTargetShare(id);
  }
  /**
   * 登录
   * @param account 账户
   * @param password 密码
   */
  public async login(account: string, password: string): Promise<model.ResultType<any>> {
    let res = await kernel.login(account, password);
    if (res.success) {
      await this._loadUser(res.data.person);
    }
    return res;
  }
  /**
   * 注册用户
   * @param {RegisterType} params 参数
   */
  public async register(params: RegisterType): Promise<model.ResultType<any>> {
    let res = await kernel.register(params);
    if (res.success) {
      await this._loadUser(res.data.person);
    }
    return res;
  }
  /**
   * 变更密码
   * @param account 账号
   * @param password 密码
   * @param privateKey 私钥
   * @returns
   */
  public async resetPassword(
    account: string,
    password: string,
    privateKey: string,
  ): Promise<model.ResultType<any>> {
    return await kernel.resetPassword(account, password, privateKey);
  }

  private async _loadUser(person: schema.XTarget): Promise<void> {
    sessionStorage.setItem(sessionUserName, JSON.stringify(person));
    this._user = createPerson(person);
    this._curSpace = undefined;
    await this._user.getJoinedCompanys(false);
    this.changCallbackPart(DomainTypes.User);
    emitter.changCallbackPart(DomainTypes.User);
  }

  private _findCompany(id: string): ICompany | undefined {
    if (this._user && id.length > 0) {
      for (const item of this._user.joinedCompany) {
        if (item.target.id === id) {
          return item;
        }
      }
    }
  }

  private _cacheSpacedata(): void {
    kernel.anystore.set(
      DefaultSpaceName,
      {
        operation: 'replaceAll',
        data: this._caches,
      },
      'user',
    );
  }
}

export default new UserController();
