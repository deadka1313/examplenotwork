import { Button, DatePicker, Form, Modal, ModalProps } from 'antd';
import React, { FC, ReactNode, useState } from 'react';
import { inject, observer } from 'mobx-react';
import moment, { Moment } from 'moment';

import DeliveryMethodsSelect from 'modules/delivery-methods/components/DeliveryMethodsSelect';
import { RoutesGeneratorStore } from 'modules/routesGenerator/stores/RoutesGeneratorStore';
import WarehousesSelect from 'modules/warehouses/components/WarehousesSelect';
import { WarehousesStore } from 'modules/warehouses/stores/WarehousesStore';
import { dateFormat } from 'helpers/string';

interface IProps {
  isModalOpened: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  warehouses?: WarehousesStore;
  routesGenerator?: RoutesGeneratorStore;
}

const RoutesGeneratorCreateModal: FC<IProps & ModalProps> = ({
  isModalOpened,
  onSubmit,
  onCancel,
  routesGenerator,
}: IProps) => {
  const [loadingModal, setLoadingModal] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    setLoadingModal(true);
    routesGenerator.setupRouteSettings(values);
    onSubmit();
  };

  const handleCancel = () => (): void => {
    form.resetFields();
    onCancel();
  };

  const submitClickHandler = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    form.submit();
  };

  const renderFooter = (): ReactNode => {
    return (
      <div>
        <Button htmlType="button" key="cancel" onClick={handleCancel()} type="ghost">
          Отмена
        </Button>
        <Button
          loading={loadingModal}
          htmlType="submit"
          key="save"
          onClick={submitClickHandler}
          type="primary"
        >
          Создать
        </Button>
      </div>
    );
  };

  return (
    <Modal
      title="Создание маршрута"
      footer={renderFooter()}
      visible={isModalOpened}
      onCancel={handleCancel()}
    >
      <Form name="basic" form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label="Доставка"
          name="deliveryMethod"
          rules={[{ required: true, message: 'Укажите способ доставки' }]}
        >
          <DeliveryMethodsSelect placeholder={'Выбрать способ доставки'} mode="multiple" />
        </Form.Item>
        <div>
          <Form.Item
            label="Дата начала"
            name="deliveryDate"
            rules={[{ required: true, message: 'Выберите дату' }]}
          >
            <DatePicker
              placeholder={'Дата'}
              format={dateFormat.string}
              disabledDate={(current: Moment): boolean => {
                const newCurrent = current.clone();
                const diff = moment.duration(moment().endOf('day').diff(newCurrent.endOf('day')));
                return current && diff.asDays() > 0;
              }}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Склад"
          name="warehouses"
          rules={[{ required: true, message: 'Укажите склад' }]}
        >
          <WarehousesSelect placeholder={'Выбрать склад'} mode="multiple" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default inject('routesGenerator')(observer(RoutesGeneratorCreateModal));
