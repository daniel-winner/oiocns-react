import React, { useEffect, useState } from 'react';
import InsertButton from '../InsertButton';
import { CopyOutlined, CloseOutlined } from '@ant-design/icons';
import cls from './index.module.less';
import { Tooltip } from 'antd';
import userCtrl from '@/ts/controller/setting';
import SelectOrg from '@/pages/Setting/content/Standard/Flow/Comp/selectOrg';
import { dataType } from '../../FlowDrawer/processType';
type DeptWayNodeProps = {
  //默认操作组织id
  operateOrgId?: string;
  onInsertNode: Function;
  onDelNode: Function;
  onCopy: Function;
  onSelected: Function;
  config: any;
  level: any;
  defaultEditable: boolean;
  [key: string]: any;
  // config?: any,
  //  _disabled?: boolean,
  // level?: number,
  // //条件数
  // size?:number
};

/**
 * 并行节点
 * @returns
 */
const DeptWayNode: React.FC<DeptWayNodeProps> = (props: DeptWayNodeProps) => {
  const [editable, setEditable] = useState<boolean>(true);
  const [key, setKey] = useState<number>(0);
  const [orgId, setOrgId] = useState<string>();
  const delNode = () => {
    props.onDelNode();
  };
  const copy = () => {
    props.onCopy();
  };
  const select = () => {
    props.onSelected();
  };
  const isEditable = (): boolean => {
    let editable = props.defaultEditable;
    if (
      props.config.belongId &&
      props.config.belongId != '' &&
      props.config.belongId != userCtrl.space.id
    ) {
      editable = false;
    }
    return editable;
  };
  useEffect(() => {
    setEditable(isEditable());
    if (props.config.conditions.length == 0) {
      props.config.conditions = [
        {
          pos: 1,
          paramKey: 'belongId',
          paramLabel: '组织',
          key: 'EQ',
          label: '=',
          type: dataType.BELONG,
          val: userCtrl.space.id,
        },
      ];
      setKey(key + 1);
    }
    if (!isEditable()) {
      setOrgId(props.config.conditions[0]?.val);
    } else {
      setOrgId(userCtrl.space.id);
    }
  }, []);

  const footer = (
    <>
      <div className={cls['btn']}>
        {editable && <InsertButton onInsertNode={props.onInsertNode}></InsertButton>}
      </div>
    </>
  );
  const nodeHeader = (
    <div className={cls['node-body-main-header']}>
      <span className={cls['title']}>
        <i className={cls['el-icon-s-operation']}></i>
        <span className={cls['name']}>
          {props.config.name ? props.config.name : '组织分支' + props.level}
        </span>
      </span>
      {editable && props.config.readonly && (
        <span className={cls['option']}>
          <CopyOutlined
            style={{ fontSize: '12px', paddingRight: '5px' }}
            onClick={copy}
          />
          <CloseOutlined style={{ fontSize: '12px' }} onClick={delNode} />
        </span>
      )}
    </div>
  );

  const onChange = (newValue: string) => {
    props.config.conditions[0].val = newValue;
    setKey(key + 1);
  };

  const nodeContent = (
    <div className={cls['node-body-main-content']} onClick={select}>
      {/* <span>组织分支</span> */}
      <span>
        {' '}
        {editable && (
          <SelectOrg
            key={key}
            onChange={onChange}
            orgId={orgId}
            value={props.config.conditions[0]?.val}
            readonly={props.config.readonly}
            rootDisable={false}></SelectOrg>
        )}
        {!editable && userCtrl.getBelongName(props.config.conditions[0]?.val)}
      </span>
    </div>
  );

  return (
    <div className={editable ? cls['node'] : cls['node-unEdit']}>
      <Tooltip
        title={<span>创建组织: {userCtrl.getBelongName(props.config.belongId)}</span>}
        placement="right">
        <div className={cls['node-body']}>
          <div className={cls['node-body-main']}>
            {nodeHeader}
            {nodeContent}
          </div>
        </div>
        <div className={cls['node-footer']}>{footer}</div>
      </Tooltip>
    </div>
  );
};

DeptWayNode.defaultProps = {
  config: {},
  level: 1,
  size: 0,
};

export default DeptWayNode;
