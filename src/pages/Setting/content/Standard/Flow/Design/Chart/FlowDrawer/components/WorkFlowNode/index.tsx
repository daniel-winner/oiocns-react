import React, { useEffect, useState } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { Row, Button, Space, Modal, message } from 'antd';
import cls from './index.module.less';
import { NodeType } from '../../processType';
import { ISpeciesItem } from '@/ts/core';
import WorkSelectTable from './WorkSelectTable';
import ShareShowComp from '@/bizcomponents/IndentityManage/ShareShowComp';
import { schema } from '@/ts/base';
import userCtrl from '@/ts/controller/setting';

interface IProps {
  current: NodeType;
  orgId?: string;
  species?: ISpeciesItem;
  disableIds: string[];
}

/**
 * @description: 子流程对象
 * @return {*}
 */

const WorkFlowNode: React.FC<IProps> = (props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false); // 打开弹窗
  const [selectChildWork, setSelectChildWork] = useState<schema.XFlowDefine>();
  const [currentData, setCurrentData] = useState({
    title: props.current.props.assignedUser[0]?.name,
    key: props.current.props.assignedUser[0]?.id,
    data: {
      id: props.current.props.assignedUser[0]?.id,
      name: props.current.props.assignedUser[0]?.name,
    },
  });
  useEffect(() => {
    if (!props.current.belongId) {
      props.current.belongId = props.orgId;
    }
  }, []);

  return (
    <div className={cls[`app-roval-node`]}>
      <div className={cls[`roval-node`]}>
        <Row style={{ marginBottom: '10px' }}>
          <SettingOutlined style={{ marginTop: '3px' }} />
          <span className={cls[`roval-node-title`]}>选择其他办事</span>
        </Row>
        <Space>
          <Button
            type="primary"
            shape="round"
            size="small"
            onClick={() => {
              props.current.props.assignedType = 'JOB';
              setIsOpen(true);
            }}>
            选择其他办事
          </Button>
        </Space>
        <div>
          {currentData?.title ? (
            <ShareShowComp
              departData={[currentData.data]}
              deleteFuc={(_id: string) => {
                props.current.props.assignedUser = { id: '', name: '' };
                setCurrentData({
                  title: '',
                  key: '',
                  data: { id: '', name: '' },
                });
              }}></ShareShowComp>
          ) : null}
        </div>
      </div>

      <Modal
        width="80%"
        title="选择其他办事"
        open={isOpen}
        destroyOnClose={true}
        onOk={() => {
          if (!selectChildWork) {
            message.warn('请选择办事');
            return;
          }
          let name =
            selectChildWork.name +
            ' [' +
            userCtrl.findTeamInfoById(selectChildWork.belongId).name +
            ']';
          props.current.props.assignedUser = [
            {
              name: name,
              id: selectChildWork.id,
            },
          ];
          setCurrentData({
            title: name,
            key: selectChildWork.id,
            data: {
              id: selectChildWork.id,
              name: name,
            },
          });
          setIsOpen(false);
        }}
        onCancel={() => setIsOpen(false)}>
        <WorkSelectTable
          disableIds={props.disableIds}
          searchFn={(params: schema.XFlowDefine) => {
            setSelectChildWork(params);
          }}
        />
      </Modal>
    </div>
  );
};
export default WorkFlowNode;
