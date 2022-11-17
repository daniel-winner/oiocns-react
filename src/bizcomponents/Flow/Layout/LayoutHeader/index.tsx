import React, { useState } from 'react';
import Node from '@/bizcomponents/Flow/Process/Node';
import {
  ArrowLeftOutlined,
  EyeOutlined,
  SendOutlined,
  MinusOutlined,
  PlusOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Select, Menu, Button, message, Popconfirm, Modal, Input } from 'antd';
import { useAppwfConfig } from '@/module/flow/flow';
import cls from './index.module.less';
type LayoutHeaderProps = {
  OnPreview: Function;
  OnExit: Function;
  [key: string]: any;
};
const { confirm } = Modal;
/**
 * 标题栏
 * @returns
 */
const LayoutHeader: React.FC<LayoutHeaderProps> = (props: LayoutHeaderProps) => {
  const form = useAppwfConfig((state: any) => state.form);
  const scale = useAppwfConfig((state: any) => state.scale);
  const setScale = useAppwfConfig((state: any) => state.setScale);
  const [showInput, setShowInput] = useState(false);
  const changeScale = (val: any) => {
    setScale(val);
  };
  const exit = () => {
    confirm({
      title: '未发布的内容将不会被保存，是否直接退出?',
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        props.OnExit();
      },
      onCancel() {},
    });
  };
  const onkeydown = (e: any) => {
    if (e.keyCode === 13) {
      setShowInput(false);
    }
  };
  const preview = () => {
    props.OnPreview();
  };

  const publish = () => {
    message.warning('该功能尚未开放');
  };
  return (
    <>
      <div className={cls['layout-title']}>
        <span className={cls['layout-title-business']}>业务名：测试业务1</span>
        <span className={cls['layout-titlebinding']} style={{ paddingLeft: '30px' }}>
          绑定已有流程：
        </span>
      </div>
      <div>
        {form.formId && (
          <div className={cls['layout-header']}>
            <span style={{ paddingLeft: '20px', color: 'grey' }}>
              业务名：{form.formName || form.business || form.formId}
            </span>
            <span style={{ paddingLeft: '10px' }}>
              绑定已有流程：
              <Select
                style={{ width: 100 }}
                placeholder="请选择流程"
                allowClear
                options={[]}
              />
            </span>
          </div>
        )}
        <div className={cls['layout-header']}>
          <div className={cls['back']}>
            <span>
              流程名：
              {showInput && (
                <Input
                  style={{ width: '200px' }}
                  onBlur={() => setShowInput(false)}
                  onKeyDown={(e) => onkeydown(e)}></Input>
              )}
              {!showInput && (
                <span onClick={() => setShowInput(true)}>
                  新增流程
                  <EditOutlined />
                </span>
              )}
            </span>
            {/* <Button  size="small" onClick={exit} style={{ width: 100 }}>
        <CloseOutlined />
          退出
        </Button> */}
          </div>
          <div className={cls['el-menu-demo']}>
            <span className={cls['el-menu-demo-span']}>流程设计</span>
          </div>
          <div className={cls['publish']}>
            <Button className={cls['publish-preview']} size="small" onClick={preview}>
              <EyeOutlined />
              预览
            </Button>
            <Button
              className={cls['publis-issue']}
              size="small"
              type="primary"
              onClick={publish}>
              <SendOutlined />
              发布
            </Button>
            <Button
              className={cls['scale']}
              size="small"
              disabled={scale <= 40}
              onClick={() => changeScale(scale - 10)}>
              <MinusOutlined />
            </Button>
            <span>{scale}%</span>
            <Button
              size="small"
              disabled={scale >= 150}
              onClick={() => changeScale(scale + 10)}>
              <PlusOutlined />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LayoutHeader;
