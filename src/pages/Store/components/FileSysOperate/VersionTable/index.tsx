import CardOrTable from '@/components/CardOrTableComp';
import React, { useEffect, useState, useRef } from 'react';
import type { ProFormInstance } from '@ant-design/pro-components';
import { message, Modal, Image } from 'antd';
import { kernel } from '@/ts/base';
import { FileItemShare } from '@/ts/base/model';
import { XTarget } from '@/ts/base/schema';
import { IFileSystemItem } from '@/ts/core';
import { ProColumns } from '@ant-design/pro-table';

export type AppInformation = {
  id: 'snowId()';
  appName: string;
  platform: string;
  pubTime: 'sysdate()';
  version: string;
  pubTeam: XTarget;
  pubAuthor: XTarget;
  remark: string;
} & FileItemShare;

/** 移动或复制复选框 */
const CopyOrMoveModal = (props: {
  open: boolean;
  title: string; // 弹出框名称
  currentTaget: IFileSystemItem; // 需要操作的文件
  onChange: (val: boolean) => void;
}) => {
  const VersionColumns: ProColumns[] = [
    {
      title: '序号',
      valueType: 'index',
      width: 50,
    },
    {
      title: '应用图标',
      width: 150,
      render: (item, record) => {
        return (
          record.uploadName && <Image width="120px" src={record.uploadName.shareLink} />
        );
      },
    },
    {
      title: '应用名称',
      dataIndex: 'appName',
      key: 'appName',
      width: 150,
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 200,
    },
    {
      title: '发布者',
      width: 150,
      render: (item, record) => {
        return record.pubAuthor.name;
      },
    },
    {
      title: '发布时间',
      dataIndex: 'pubTime',
      key: 'pubTime',
      width: 150,
    },
    {
      title: '发布组织',
      width: 150,
      render: (item, record) => {
        return record.pubTeam.name;
      },
    },
    {
      title: '版本号',
      width: 150,
      render: (item, record) => {
        return record.version;
      },
    },
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
  ];

  const { open, title, onChange } = props;
  const [currentMesData, setCurrentData] = useState<AppInformation[]>([]);
  const [page, setPage] = useState<number>(1);
  const ref = useRef<ProFormInstance>();
  // 操作内容渲染函数
  const renderOperation = (item: AppInformation) => {
    return [
      {
        key: 'remove',
        label: <span style={{ color: 'red' }}>删除</span>,
        onClick: async () => {
          Modal.confirm({
            title: '提示',
            content: '是否确认删除当前数据',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
              const returnData = currentMesData.filter((innerItem) => {
                return item.id !== innerItem.id;
              });
              const result = await kernel.anystore.set(
                'version',
                {
                  operation: 'replaceAll',
                  data: { versionMes: returnData },
                },
                'all',
              );
              if (result.success) {
                message.success('删除成功');
                initData();
              }
            },
          });
        },
      },
    ];
  };

  const initData = async () => {
    const result: { data: { versionMes: AppInformation[] } } = await kernel.anystore.get(
      'version',
      'all',
    );

    if (result) {
      const getData = result?.data.versionMes || [];
      const currentData = getData.slice((page - 1) * 1, 10);
      setCurrentData([...currentData]);
    }
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPage(page);
    setCurrentData(currentMesData.slice((page - 1) * pageSize, page * pageSize));
  };

  useEffect(() => {
    initData();
  }, []);
  return (
    <Modal
      destroyOnClose
      title={title}
      open={open}
      width="1400px"
      onOk={() => {}}
      onCancel={() => {
        onChange(false);
      }}>
      {open && (
        <CardOrTable
          rowKey={'id'}
          params={{ id: currentMesData.length }}
          operation={renderOperation}
          onChange={handlePageChange}
          columns={VersionColumns}
          showChangeBtn={false}
          dataSource={currentMesData}
          formRef={ref}
        />
      )}
    </Modal>
  );
};
export default CopyOrMoveModal;
