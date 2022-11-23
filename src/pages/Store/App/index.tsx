import { Card, Modal } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import AppShowComp from '@/bizcomponents/AppTablePage2';
import cls from './index.module.less';
import { Route, useHistory } from 'react-router-dom';
import { BtnGroupDiv } from '@/components/CommonComp';
import PutawayComp from './Putaway';
import ShareComp from '../components/ShareComp';
import CreateApp from './CreatApp'; // 上架弹窗
import PublishList from './PublishList'; // 上架列表
import AppInfo from './Info'; //应用信息页面
import Manage from './Manage'; //应用管理页面
import StoreRecent from '../components/Recent';
import { MarketTypes } from 'typings/marketType';
import StoreContent from '@/ts/controller/store/content';
import Provider from '@/ts/core/provider';
import StoreSidebar from '@/ts/controller/store/sidebar';
// const service = new MarketService({
//   nameSpace: 'myApp',
//   searchApi: Provider.getPerson.getJoinMarkets,
//   createApi: API.product.register,
//   deleteApi: API.product.delete,
//   updateApi: API.product.update,
// });
type ststusTypes = '全部' | '创建的' | '购买的' | '共享的' | '分配的';

const StoreApp: React.FC = () => {
  const history = useHistory();
  const [data, setData] = useState([]);
  const [statusKey, setStatusKey] = useState<ststusTypes>('全部');
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [checkNodes, setCheckNodes] = useState<Array<any>>([{}]);
  const [selectAppInfo, setSelectAppInfo] = useState<MarketTypes.ProductType>(
    {} as MarketTypes.ProductType,
  );
  const items = useMemo(() =>
    // [
    //   {
    //     tab: `全部`,
    //     key: 'all',
    //   },
    //   {
    //     tab: `创建的`,
    //     key: 'created',
    //   },
    //   {
    //     tab: `购买的`,
    //     key: 'purchased',
    //   },
    //   {
    //     tab: `共享的`,
    //     key: 'shared',
    //   },
    //   {
    //     tab: `分配的`,
    //     key: 'allotted',
    //   },
    // ]
    {
      let typeSet = new Set(['全部']);
      data.forEach((v: any) => {
        typeSet.add(v.prod.source);
      });
      console.log('sssss', Array.from(typeSet));

      return Array.from(typeSet).map((k) => {
        return { tab: k, key: k };
      });
    }, [data]);

  useEffect(() => {
    // storeContent.curPageType = 'myApps';
    StoreContent.marketTableCallBack = setData;
    StoreContent.getStoreProduct();
  }, []);

  const BtnsList = ['购买', '创建', '暂存'];
  const handleBtnsClick = (item: { text: string }) => {
    // console.log('按钮点击', item);
    switch (item.text) {
      case '购买':
        StoreSidebar.changePageType('market');
        // StoreSidebar.getTreeData();
        history.push('/market/shop');
        break;
      case '创建':
        history.push('/store/app/create');
        break;
      case '暂存':
        console.log('点击事件', '暂存');
        break;
      default:
        console.log('点击事件未注册', item.text);
        break;
    }
  };

  const onCheckeds = (checkedValus: any) => {
    setCheckNodes(checkedValus);
  };

  // 共享确认回调
  const submitShare = () => {
    console.log('当前被选中的每一项', checkNodes);

    setShowShareModal(false);
  };
  const renderOperation = (
    item: MarketTypes.ProductType,
  ): MarketTypes.OperationType[] => {
    return [
      {
        key: 'open',
        label: '打开',
        onClick: () => {
          history.push({ pathname: '/online', state: { appId: item.id } });
          console.log('按钮事件', 'open', item);
        },
      },
      {
        key: 'detail',
        label: '详情',
        onClick: () => {
          history.push({ pathname: '/store/app/info', state: { appId: item.id } });
          console.log('按钮事件', 'detail', item);
        },
      },
      {
        key: 'manage',
        label: '管理',
        onClick: () => {
          history.push({ pathname: '/store/app/manage', state: { appId: item.id } });
          console.log('按钮事件', 'manage', item);
        },
      },
      {
        key: 'putaway',
        label: '上架',
        onClick: () => {
          console.log('按钮事件', 'putaway', item);
          history.push({ pathname: '/store/app/putaway', state: { appId: item.id } });
        },
      },
      {
        key: 'share',
        label: '共享',
        onClick: () => {
          setShowShareModal(true);
        },
      },
      {
        key: 'share2',
        label: '分配',
        onClick: () => {
          console.log('按钮事件', 'share2', item);
        },
      },
      {
        key: 'save',
        label: '暂存',
        onClick: () => {
          // setShowPublishListModal(true);
          setSelectAppInfo({ ...item });
          history.push({ pathname: '/store/app/publish', state: { appId: item.id } });
          console.log('按钮事件', 'save', item);
        },
      },
    ];
  };
  // 应用首页dom
  const AppIndex = useMemo(() => {
    return (
      <div className={`pages-wrap flex flex-direction-col ${cls['pages-wrap']}`}>
        {<StoreRecent />}
        <Card
          title="应用"
          className={cls['app-tabs']}
          extra={<BtnGroupDiv list={BtnsList} onClick={handleBtnsClick} />}
          tabList={items}
          onTabChange={(key) => {
            setStatusKey(key as ststusTypes);
          }}>
          <div className={cls['page-content-table']}>
            <AppShowComp
              queryFun={Provider.getPerson!.getOwnProducts}
              list={data}
              searchParams={{ status: statusKey }}
              columns={StoreContent.getColumns('myApp')}
              renderOperation={renderOperation}
            />
          </div>
        </Card>
      </div>
    );
  }, [data, statusKey]);

  return (
    <>
      {location.pathname === '/store/app' && AppIndex}
      <Modal
        title="应用分享"
        width={800}
        destroyOnClose={true}
        open={showShareModal}
        okText="确定"
        onOk={() => {
          submitShare();
        }}
        onCancel={() => {
          console.log(`取消按钮`);
          setShowShareModal(false);
        }}>
        <ShareComp onCheckeds={onCheckeds} />
      </Modal>
      {/* 详情页面 /store/app/info*/}
      <Route
        exact
        path="/store/app/info"
        render={() => <AppInfo appId={selectAppInfo.id} />}></Route>
      <Route
        exact
        path="/store/app/publish"
        render={() => <PublishList appId={selectAppInfo.id} />}></Route>
      <Route
        exact
        path="/store/app/manage"
        render={() => <Manage appId={selectAppInfo.id} />}></Route>
      <Route exact path="/store/app/create" component={CreateApp}></Route>
      <Route
        exact
        path="/store/app/putaway"
        render={() => <PutawayComp appId={selectAppInfo.id} />}></Route>
    </>
  );
};

export default React.memo(StoreApp);
