import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import { common } from 'typings/common';
import AppCard from './card';
import thingCtrl from '@/ts/controller/thing';
import CardOrTable from '@/components/CardOrTableComp';
import { InnerApplicationColumns } from '@/pages/Store/config/columns';
import appCtrl from '@/ts/controller/store/appCtrl';
import { XFlowDefine } from '@/ts/base/schema';
import WorkStartDo from '@/pages/Todo/content/Work/WorkStartDo';
import Design from '@/pages/Setting/content/Standard/Flow/Design';
import userCtrl from '@/ts/controller/setting';
import useCtrlUpdate from '@/hooks/useCtrlUpdate';
import { ISpeciesItem } from '@/ts/core';

const InnerApp: React.FC<{ type: string }> = ({ type }) => {
  const [tableKey, setTableKey] = useCtrlUpdate(appCtrl);
  // const [tableKey, setTabKey] = useState<string>();
  const [currentDefine, setCurrentDefine] = useState<XFlowDefine>();
  const [flowSpeciesItem, setFlowSpeciesItem] = useState<ISpeciesItem>();
  const [dataSource, setDataSource] = useState<XFlowDefine[]>([]);
  useEffect(() => {
    setTimeout(async () => {
      let res = await thingCtrl.loadFlowDefine();
      if (res.success && res.data.result) {
        let data = res.data.result!;
        switch (type) {
          case '共享的':
            data = data.filter(
              (a) =>
                a.target.id != userCtrl.space.id &&
                a.target.belongId != userCtrl.space.id,
            );
            break;
          case '创建的':
            data = data.filter(
              (a) =>
                a.target.id == userCtrl.space.id ||
                a.target.belongId == userCtrl.space.id,
            );
            break;
          default:
            break;
        }
        setDataSource(data);
        setTableKey();
      }
    }, 10);
  }, [type]);

  const renderOperation = (item: XFlowDefine): common.OperationType[] => {
    let isCommon = appCtrl.caches.map((cache) => cache.key).includes(item.id);
    return [
      {
        key: 'open',
        label: '发起',
        onClick: () => {
          setFlowSpeciesItem(undefined);
          setCurrentDefine(item);
        },
      },
      {
        key: 'detail',
        label: '详情',
        onClick: () => {
          let species = thingCtrl.speciesList.filter((it) => it.id == item.speciesId)[0];
          setFlowSpeciesItem(species);
          setCurrentDefine(item);
        },
      },
      {
        key: 'common',
        label: isCommon ? '取消常用' : '设为常用',
        onClick: () => {
          appCtrl.setCommon(
            {
              title: item.name,
              url: '/img/appLogo.png',
              desc: item.remark || item.name,
              key: item.id,
            },
            !isCommon,
          );
          setTableKey();
          message.success('设置成功');
        },
      },
    ];
  };
  //卡片内容渲染函数;
  const renderCardFun = (dataArr: XFlowDefine[]): React.ReactNode[] => {
    return dataArr.map((item: XFlowDefine) => {
      return (
        <AppCard
          className="card"
          current={item}
          key={item.id}
          operation={renderOperation}
        />
      );
    });
  };

  return (
    <>
      {!currentDefine && (
        <CardOrTable<XFlowDefine>
          key={tableKey}
          dataSource={dataSource}
          renderCardContent={renderCardFun}
          operation={renderOperation}
          columns={InnerApplicationColumns}
          rowKey={(record: any) => record?.target?.id}
        />
      )}
      {currentDefine && !flowSpeciesItem && (
        <WorkStartDo
          currentDefine={currentDefine}
          goBack={() => {
            setCurrentDefine(undefined);
          }}></WorkStartDo>
      )}
      {currentDefine && flowSpeciesItem && (
        <Design
          current={currentDefine}
          species={flowSpeciesItem}
          setInstance={() => {}}
          operateOrgId={userCtrl.space.id}
          defaultEditable={false}
          setOperateOrgId={() => {}}
          onBack={() => {
            setCurrentDefine(undefined);
            setFlowSpeciesItem(undefined);
          }}
          modalType={'设计流程'}
          setModalType={() => {}}
        />
      )}
    </>
  );
};

export default React.memo(InnerApp);
