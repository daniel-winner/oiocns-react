import React from 'react';
import { Modal, Button, Card, Descriptions } from 'antd';
import cls from './index.module.less';
import { schema } from '@/ts/base';

/**
 * @description: 应用详情弹窗
 * @return {*}
 */

interface Iprops {
  title: string;
  open: boolean;
  onClose: () => void;
  data: any;
  width?: number;
}

const ProductDetailModal: React.FC<Iprops> = ({ title, open, onClose, width, data }) => {
  let merchandise = data as schema.XMerchandise;
  const content = merchandise && (
    <Card bordered={false}>
      <Descriptions bordered column={2}>
        <Descriptions.Item label="应用名称" span={2}>
          {merchandise.caption}
        </Descriptions.Item>
        <Descriptions.Item label="售卖价格">
          {merchandise.price ? <>{`${merchandise.price}元`}</> : '免费'}
        </Descriptions.Item>
        <Descriptions.Item label="使用期限">
          {merchandise.days ? <>{`${merchandise.days}天`}</> : '永久'}
        </Descriptions.Item>
        <Descriptions.Item label="售卖权属" span={2}>
          {merchandise.sellAuth}
        </Descriptions.Item>
        <Descriptions.Item label="应用类型">
          {merchandise['product']?.typeName || 'Web应用'}
        </Descriptions.Item>
        <Descriptions.Item label="归属">
          {merchandise['product']?.belongId || ''}
        </Descriptions.Item>
        <Descriptions.Item label="创建人员">{merchandise.createUser}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{merchandise?.createTime}</Descriptions.Item>
        <Descriptions.Item label="应用描述" span={2}>
          {merchandise.information}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
  /**
   * @description: 自定义弹窗页脚
   * @return {*}
   */
  const footer = (
    <Button type="primary" onClick={onClose}>
      关闭
    </Button>
  );
  return (
    <div className={cls['product-detail']}>
      <Modal
        title={title}
        open={open}
        onOk={onClose}
        onCancel={onClose}
        getContainer={false}
        width={width ?? 900}
        footer={footer}>
        {content}
      </Modal>
    </div>
  );
};
export default ProductDetailModal;
