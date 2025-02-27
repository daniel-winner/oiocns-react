import React, { useRef, useState } from 'react';
import storeCtrl from '@/ts/controller/store';
import MainLayout from '@/components/MainLayout';
import useMenuUpdate from './hooks/useMenuUpdate';
import { GroupMenuType } from './config/menuType';
import { IFileSystemItem } from '@/ts/core';
import Content, { TopBarExtra } from './content';
import { MenuItemType } from 'typings/globelType';
import FileSysOperate from './components/FileSysOperate';
import { IconFont } from '@/components/IconFont';
import { message, Modal } from 'antd';
import SelectOperation from '@/pages/Setting/content/Standard/Flow/Comp/SelectOperation';
import OioForm from '@/components/Form';
import { ProFormInstance } from '@ant-design/pro-components';
import thingCtrl from '@/ts/controller/thing';
/** 仓库模块 */
const Package: React.FC = () => {
  const formRef = useRef<ProFormInstance<any>>();
  const [operateTarget, setOperateTarget] = useState<MenuItemType>();
  const [operateKey, setOperateKey] = useState<string>();
  const [key, menus, refreshMenu, selectMenu, setSelectMenu] = useMenuUpdate();
  const [showData, setShowData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);

  if (!selectMenu) return <></>;

  return (
    <MainLayout
      title={{ label: '管理', icon: <IconFont type={'icon-store'} /> }}
      selectMenu={selectMenu}
      onSelect={async (data) => {
        storeCtrl.currentKey = data.key;
        if (data.itemType === GroupMenuType.FileSystemItem) {
          const item = data.item as IFileSystemItem;
          if (item.children.length === 0 && (await item.loadChildren())) {
            refreshMenu();
          }
        }
        setSelectMenu(data);
      }}
      rightBar={<TopBarExtra key={key} selectMenu={selectMenu} />}
      onMenuClick={async (data, key) => {
        setOperateKey(key);
        setOperateTarget(data);
        // if (key == '设为常用') {
        //   let menu_ = data;
        //   menu_.key = 'copy' + data.key;
        //   menu_.children = [];
        //   menu_.menus = data.menus?.filter((m: any) => !m.key.includes('常用'));
        //   menu_.menus?.push({
        //     key: '取消常用',
        //     label: '取消常用',
        //     icon: <im.ImHeartBroken />,
        //   });
        //   storeCtrl.setCommon(menu_, true);
        //   message.success('设置成功');
        // } else if (key == '取消常用') {
        //   storeCtrl.setCommon(data, false);
        //   message.success('取消成功');
        // }
      }}
      siderMenuData={menus}>
      <FileSysOperate
        operateKey={operateKey}
        operateTarget={
          operateTarget?.itemType === GroupMenuType.FileSystemItem
            ? operateTarget.item
            : undefined
        }
        operateDone={() => {
          setOperateKey(undefined);
          setOperateTarget(undefined);
        }}
      />
      {operateKey == '创建实体' && (
        <Modal
          title={`选择表单`}
          width={800}
          destroyOnClose={true}
          open={true}
          okText="确定"
          onOk={() => {
            if (showData.length == 0 || showData.length > 1) {
              message.warn('只能选择单条数据');
            }
            if (showData.length == 1) {
              setShowForm(true);
              setOperateKey(undefined);
            }
          }}
          onCancel={() => {
            setOperateKey(undefined);
          }}>
          <SelectOperation
            current={selectMenu.item}
            showData={showData}
            setShowData={setShowData}></SelectOperation>
        </Modal>
      )}
      {showForm && (
        <Modal
          title={`创建实体`}
          width={800}
          destroyOnClose={true}
          open={showForm}
          okText="确定"
          onOk={async () => {
            let values = await formRef.current?.validateFields();
            if (values) {
              /**调用创建物接口 */
              let res = await thingCtrl.createThing(values);
              if (res.success) {
                message.success('创建成功');
                setShowForm(false);
              } else {
                message.error('创建失败');
              }
            }
          }}
          onCancel={() => {
            setShowForm(false);
          }}>
          <OioForm
            operation={showData[0]?.item}
            formRef={formRef}
            submitter={{
              resetButtonProps: {
                style: { display: 'none' },
              },
              submitButtonProps: {
                style: { display: 'none' },
              },
            }}
          />
        </Modal>
      )}
      <Content key={key} selectMenu={selectMenu} />
    </MainLayout>
  );
};

export default Package;
