import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import userCtrl from '@/ts/controller/setting';
import { ISpeciesItem, ITarget, TargetType } from '@/ts/core';
import Content from './content';
import useMenuUpdate from './hooks/useMenuUpdate';
import TeamModal from '@/bizcomponents/GlobalComps/createTeam';
import TransToDict from '@/pages/Setting/content/Standard/Dict/transToDict';
import SpeciesModal from './components/speciesModal';
import { GroupMenuType } from './config/menuType';
import { Modal } from 'antd';
import { TopBarExtra } from '../Store/content';
import { IconFont } from '@/components/IconFont';
import AuthorityModal from './content/Authority/AuthorityModal';

const TeamSetting: React.FC = () => {
  const [species, setSpecies] = useState<ISpeciesItem>();
  const [key, menus, refreshMenu, selectMenu, setSelectMenu] = useMenuUpdate();
  const [editTarget, setEditTarget] = useState<ITarget>();
  const [operateKeys, setOperateKeys] = useState<string[]>(['']);
  console.log('selectMenu====', selectMenu);
  return (
    <MainLayout
      selectMenu={selectMenu}
      tabKey={'1'}
      rightBar={<TopBarExtra key={key} selectMenu={selectMenu} />}
      onSelect={async (data) => {
        if (data.itemType === GroupMenuType.Species) {
          setSpecies(data.item);
        } else {
          setSpecies(undefined);
          userCtrl.currentKey = data.key;
          const item = data.item as ITarget;
          if (data.itemType === GroupMenuType.Agency) {
            if (item.subTeam.length === 0) {
              const subs = await item.loadSubTeam();
              if (subs.length > 0) {
                refreshMenu();
              }
            }
          }
        }
        setSelectMenu(data);
      }}
      onMenuClick={async (data, key) => {
        switch (key) {
          case '删除':
            Modal.confirm({
              content: '确定要删除吗?',
              onOk: async () => {
                if (await (data.item as ITarget).delete()) {
                  refreshMenu();
                }
              },
            });
            break;
          case '退出':
            Modal.confirm({
              content: '确定要退出吗?',
              onOk: async () => {
                let item = data.item as ITarget;
                switch (item.typeName) {
                  case TargetType.Group:
                    userCtrl.company.quitGroup((data.item as ITarget).id);
                    break;
                  case TargetType.Cohort:
                    userCtrl.user.quitCohorts((data.item as ITarget).id);
                    break;
                }
                refreshMenu();
              },
            });
            break;
          case '移除':
            Modal.confirm({
              content: '确定要删除吗?',
              onOk: async () => {
                if (await (data.item as ISpeciesItem).delete()) {
                  refreshMenu();
                }
              },
            });
            break;
          default:
            setEditTarget(data.item);
            setOperateKeys(key.split('|'));
            break;
        }
      }}
      title={{ label: '设置', icon: <IconFont type={'icon-setting'} /> }}
      tabs={menus}
      siderMenuData={menus[0]?.menu}
      onCheckedChange={(_: string[]) => {
        refreshMenu();
      }}
      checkedList={[]}
      onTabChanged={() => {
        refreshMenu();
      }}>
      {/** 组织模态框 */}
      <TeamModal
        title={operateKeys[0]}
        open={['新建', '编辑'].includes(operateKeys[0])}
        handleCancel={function (): void {
          setOperateKeys(['']);
        }}
        handleOk={(newItem) => {
          if (newItem) {
            refreshMenu();
            setOperateKeys(['']);
          }
        }}
        current={editTarget || userCtrl.space}
        typeNames={operateKeys.slice(1)}
      />
      {/** 分类模态框 */}
      {selectMenu.itemType !== '职权' && (
        <SpeciesModal
          title={operateKeys[0]}
          open={['新增', '修改'].includes(operateKeys[0])}
          handleCancel={function (): void {
            setOperateKeys(['']);
          }}
          handleOk={(newItem) => {
            if (newItem) {
              refreshMenu();
              setOperateKeys(['']);
            }
          }}
          targetId={(selectMenu.item as ITarget)?.id}
          current={species}
        />
      )}
      {/** 职权模态框 */}
      {selectMenu.itemType == '职权' && (
        <AuthorityModal
          title={operateKeys[0] + selectMenu.itemType}
          open={['新增', '修改'].includes(operateKeys[0])}
          handleCancel={function (): void {
            setOperateKeys(['']);
          }}
          handleOk={(newItem) => {
            if (newItem) {
              refreshMenu();
              setOperateKeys(['']);
            }
          }}
          current={selectMenu.item}
        />
      )}
      {/* 分类转字典 */}
      {species && (
        <TransToDict
          open={['转为字典'].includes(operateKeys[0])}
          setOpen={() => setOperateKeys([''])}
          currentSpeciesItem={species}></TransToDict>
      )}
      <Content key={key} selectMenu={selectMenu} species={species} />
    </MainLayout>
  );
};

export default TeamSetting;
