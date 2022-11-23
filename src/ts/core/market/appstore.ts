import { kernel } from '../../base';
import { CommonStatus, TargetType } from '../enum';
import { model } from '../../base';
import { XMarket, XMarketRelationArray, XMerchandiseArray } from '../../base/schema';

export default class AppStore {
  // 商店实体
  public readonly store: XMarket;

  constructor(store: XMarket) {
    this.store = store;
  }

  /**
   * 更新商店信息
   * @param name 商店名称
   * @param code 商店编号
   * @param samrId 监管组织/个人
   * @param remark 备注
   * @param ispublic 是否公开
   * @returns
   */
  public async update(
    name: string,
    code: string,
    samrId: string,
    remark: string,
    ispublic: boolean,
  ): Promise<model.ResultType<any>> {
    const res = await kernel.updateMarket({
      id: this.store.id,
      name,
      code,
      samrId,
      remark,
      public: ispublic,
      belongId: this.store.belongId,
    });
    if (res.success) {
      this.store.name = name;
      this.store.code = code;
      this.store.samrId = samrId;
      this.store.remark = remark;
      this.store.public = ispublic;
    }
    return res;
  }

  /**
   * 分页获取商店成员
   * @param page 分页参数
   * @returns 加入的商店成员
   */
  public async getUser(
    page: model.PageRequest,
  ): Promise<model.ResultType<XMarketRelationArray>> {
    return await kernel.queryMarketMember({
      id: this.store.id,
      page: page,
    });
  }

  /**
   * 分页获取加入商店申请
   * @param page
   */
  public async getUserApply(
    page: model.PageRequest,
  ): Promise<model.ResultType<XMarketRelationArray>> {
    return await kernel.queryJoinMarketApply({
      id: this.store.id,
      page,
    });
  }

  /**
   * 审批商店成员加入申请
   * @param id 申请ID
   * @param status 审批结果
   * @returns 是否成功
   */
  public async approvalJoinApply(
    id: string,
    status: number = CommonStatus.RejectStartStatus,
  ): Promise<model.ResultType<any>> {
    return await kernel.approvalJoinApply({ id, status });
  }

  /**
   * 拉对象加入商店
   * @param targetIds 对象ID集合
   * @param typenames 对象类型
   * @returns 是否成功
   */
  public async pull(
    targetIds: string[],
    typenames: string[],
  ): Promise<model.ResultType<any>> {
    return await kernel.pullAnyToMarket({
      marketId: this.store.id,
      targetIds: targetIds,
      typeNames: typenames,
    });
  }

  /**
   * 移除商店成员
   * @param id 成员ID
   * @param typename 成员类型
   * @return 移除人员结果
   */
  public async removeMember(
    id: string,
    typename: TargetType,
  ): Promise<model.ResultType<any>> {
    return await kernel.removeMarketMember({ id: id, belongId: '', typeName: typename });
  }

  /**
   * 获取商品列表
   * @param page 分页参数
   * @returns 返回商店商品列表
   */
  public async getMerchandise(
    page: model.PageRequest,
  ): Promise<model.ResultType<XMerchandiseArray>> {
    return await kernel.searchMerchandise({
      id: this.store.id,
      page: page,
    });
  }

  /**
   * 获取商品上架申请列表
   * @param page 分页参数
   * @returns 返回商品上架申请列表
   */
  public async getMerchandiseApply(
    page: model.PageRequest,
  ): Promise<model.ResultType<XMerchandiseArray>> {
    return await kernel.queryMerchandiesApplyByManager({
      id: this.store.id,
      page: page,
    });
  }

  /**
   * 审批商品上架申请
   * @param id 申请ID
   * @param status 审批结果
   * @returns 是否成功
   */
  public async approvalPublishApply(
    id: string,
    status: number = CommonStatus.RejectStartStatus,
  ): Promise<model.ResultType<any>> {
    return await kernel.approvalMerchandise({ id, status });
  }

  /**
   * 下架商品
   * @param merchandiseId 下架商品ID
   * @returns 下架是否成功
   */
  public async unPublish(
    merchandiseId: string,
    belongId: string,
  ): Promise<model.ResultType<any>> {
    return await kernel.deleteMerchandiseByManager({
      id: merchandiseId,
      belongId: belongId,
    });
  }
}
