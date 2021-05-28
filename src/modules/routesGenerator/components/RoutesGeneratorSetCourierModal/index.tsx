import './style.less';

import { Button, Divider, Form, Modal, ModalProps, Progress, Select, Tag } from 'antd';
import { CheckIcon, getSessionByDate } from './helpers';
import { ICouriers, ISession } from 'modules/couriers/models/types';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { dateFormat, timeFormat } from 'helpers/string';
import { inject, observer } from 'mobx-react';

import { CourierDirectoryStore } from 'modules/couriers/stores/CourierDirectoryStore';
import { CouriersStore } from 'modules/couriers/stores/CouriersStore';
import { IProfile } from 'modules/user/models/types';
import { IRouteDraft } from 'modules/routesGenerator/models/types';
import { ITransports } from 'modules/transports/models/types';
import { RoutesGeneratorStore } from 'modules/routesGenerator/stores/RoutesGeneratorStore';
import { TimePicker } from 'modules/common/containers/TimePicker';
import { TransportStore } from 'modules/transports/stores/TransportStore';
import { UserStore } from 'modules/user/stores/UserStore';
import { WarehousesStore } from 'modules/warehouses/stores/WarehousesStore';
import moment from 'moment';
import { selectFilter } from 'helpers/form';

interface IProps {
  isModalOpened: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  index: number;
  initialValues: IRouteDraft;
  weight: string;
  volume: string;
  warehouses?: WarehousesStore;
  courierDirectory?: CourierDirectoryStore;
  routesGenerator?: RoutesGeneratorStore;
  couriers?: CouriersStore;
  transport?: TransportStore;
  user?: UserStore;
}

const RoutesGeneratorSetCourierModal: FC<IProps & ModalProps> = ({
  isModalOpened,
  onSubmit,
  onCancel,
  index,
  initialValues,
  courierDirectory,
  routesGenerator,
  couriers,
  transport,
  weight,
  volume,
  user,
}: IProps) => {
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [isLoadingCourier, setIsLoadingCourier] = useState(false);
  const [isLoadingTransport, setIsLoadingTransport] = useState(false);
  const [session, setSession] = useState<ISession>(null);
  const [courierData, setCourierData] = useState<ICouriers>(null);
  const [transportData, setTransportData] = useState<ITransports>(null);
  const [profileData, setProfileData] = useState<IProfile>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isModalOpened) {
      courierDirectory.getCouriers({ current: 1, pageSize: 100 }, false);
      initialValues &&
        initialValues.courierGuid &&
        setupCourier(initialValues.courierGuid, initialValues.transportGuid);
    }
  }, [isModalOpened]);

  const handleCancel = () => (): void => {
    form.resetFields();
    onCancel();
  };

  const submitClickHandler = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    form.submit();
  };

  const submit = (values, guid) => {
    routesGenerator.setCourierDataRouteDraft(
      {
        ...values,
        sessionGuid: guid,
        fullName: `${courierData.profile.name} ${courierData.profile.surname}`,
        transport: transportData,
        profile: profileData,
      },
      index,
    );

    onSubmit && onSubmit();
    setIsLoadingModal(false);

    form.resetFields();
  };

  const handleSubmit = (values) => {
    setIsLoadingModal(true);
    submit(values, session ? session.guid : null);
  };

  const setupCourier = (courierGuid: string, transportGuid?: string) => {
    const dateFormatted = routesGenerator.routeSettings.deliveryDate
      ? routesGenerator.routeSettings.deliveryDate.format(dateFormat.search)
      : null;

    if (courierGuid) {
      setIsLoadingCourier(true);
      couriers.getCourier(courierGuid).then((courier) => {
        setCourierData(courier);
        couriers
          .getCourierSessions({
            current: 1,
            pageSize: 100,
            courier_guid: [courierGuid],
            planned_date: [
              moment(routesGenerator.routeSettings.deliveryDate).format(dateFormat.search),
            ],
          })
          .then((sessions) => {
            const newSession = getSessionByDate(sessions, dateFormatted);
            const newTransportGuid: string = newSession
              ? newSession.transport.guid
              : transportGuid || null;
            onTransportChange(newTransportGuid);
            form.setFieldsValue({
              transportGuid: newTransportGuid,
            });
            setSession(newSession);
            setIsLoadingCourier(false);
          });
        user.getProfile(courier.profile_guid).then((item) => setProfileData(item));
      });
    }
  };

  const onCourierChange = (courierGuid: string): void => {
    if (!courierGuid) {
      setCourierData(null);
      setProfileData(null);
      setTransportData(null);
      setSession(null);
    } else {
      setupCourier(courierGuid);
    }
  };

  const onTransportChange = (transportGuid: string): void => {
    if (!transportGuid) {
      form.setFieldsValue({
        transportGuid: null,
      });
      setTransportData(null);
    } else {
      setIsLoadingTransport(true);
      transport.getTransport(transportGuid).then((newTransport) => {
        setTransportData(newTransport);
        setIsLoadingTransport(false);
      });
    }
  };

  const renderFooter = (): ReactNode => {
    return (
      <div>
        <Button htmlType="button" key="cancel" onClick={handleCancel()} type="ghost">
          Отменить
        </Button>
        <Button
          loading={isLoadingModal || isLoadingCourier || isLoadingTransport}
          htmlType="submit"
          key="save"
          onClick={submitClickHandler}
          type="primary"
        >
          Сохранить
        </Button>
      </div>
    );
  };

  const getWeightPercent = (): number => {
    return transportData ? (Number(weight) * 100) / transportData.weight : 0;
  };

  const getVolumePercent = (): number => {
    return transportData ? (Number(volume) * 100) / transportData.volume : 0;
  };

  return (
    <Modal
      title="Выбрать курьера и машину"
      footer={renderFooter()}
      visible={isModalOpened}
      onCancel={handleCancel()}
      className="routes-generator-set-courier"
    >
      <Form name="basic" form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label="Время отправки на погрузку"
          name="time"
          rules={[{ required: true, message: 'Выберите время' }]}
          initialValue={(initialValues && initialValues.time) || undefined}
        >
          <TimePicker format={timeFormat.simple} placeholder="Время" allowClear />
        </Form.Item>
        <Divider />
        <Form.Item
          label="Курьер"
          name="courierGuid"
          rules={[{ required: true, message: 'Укажите курьера' }]}
          initialValue={(initialValues && initialValues.courierGuid) || undefined}
        >
          <Select
            allowClear
            filterOption={selectFilter}
            showSearch
            placeholder={'Выбрать курьера'}
            style={{ minWidth: 200 }}
            dropdownMatchSelectWidth={false}
            getPopupContainer={(trigger) => trigger.parentElement}
            onChange={onCourierChange}
            loading={isLoadingCourier}
          >
            {courierDirectory.couriersList.map((c) => {
              return (
                <Select.Option key={c.guid} value={c.guid}>
                  {`${c.profile.name} ${c.profile.surname}${
                    c.profile.disabled ? ' (неактивен)' : ''
                  }`}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        {profileData && profileData.warehouses && (
          <div className="routes-generator-set-courier_tags">
            <div className="routes-generator-set-courier_tags-title">Склады</div>
            <div>
              {profileData.warehouses.map((item) => (
                <Tag
                  key={item.guid}
                  className="routes-generator-set-courier_tag"
                  color="rgba(0, 0, 0, 0.04)"
                >
                  {item.title || item.guid} {item.disabled ? ' (неактивен)' : ''}
                </Tag>
              ))}
            </div>
          </div>
        )}
        <Divider />
        <Form.Item
          label="Транспортное средство"
          name="transportGuid"
          rules={[{ required: true, message: 'Укажите транспорт' }]}
          initialValue={(initialValues && initialValues.transportGuid) || undefined}
        >
          <Select
            allowClear
            filterOption={(input, option): boolean =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            showSearch
            placeholder={'Выбрать транспорт'}
            style={{ minWidth: 200 }}
            dropdownMatchSelectWidth={false}
            getPopupContainer={(trigger) => trigger.parentElement}
            onChange={onTransportChange}
            disabled={Boolean(session && session.planned_date)}
            loading={isLoadingTransport}
          >
            {courierData &&
              courierData.transports &&
              courierData.transports.map((t) => {
                return (
                  <Select.Option key={t.guid} value={t.guid}>
                    {`${t.name} ${t.number}${t.disabled ? ' (неактивно)' : ''}`}
                  </Select.Option>
                );
              })}
          </Select>
        </Form.Item>
        {transportData && transportData.warehouses && (
          <div className="routes-generator-set-courier_tags">
            <div className="routes-generator-set-courier_tags-title">Склады</div>
            <div>
              {transportData.warehouses.map((item) => (
                <Tag
                  key={item.guid}
                  className="routes-generator-set-courier_tag"
                  color="rgba(0, 0, 0, 0.04)"
                >
                  {item.title || item.guid} {item.disabled ? ' (неактивен)' : ''}
                </Tag>
              ))}
            </div>
          </div>
        )}
        {transportData && transportData.delivery_methods && (
          <div className="routes-generator-set-courier_tags">
            <div className="routes-generator-set-courier_tags-title">Способы доставки</div>
            <div>
              {transportData.delivery_methods.map((item) => (
                <Tag
                  key={item.guid}
                  className="routes-generator-set-courier_tag"
                  color="rgba(0, 0, 0, 0.04)"
                >
                  {item.name || item.guid} {item.disabled ? ' (неактивен)' : ''}
                </Tag>
              ))}
            </div>
          </div>
        )}
        <Divider />
        {transportData && (
          <div className="routes-generator-set-courier_fullness">
            <div>
              <div className="routes-generator-set-courier_fullness-header">Загрузка по весу</div>
              <div className="routes-generator-set-courier_fullness-text">
                <Progress
                  type="circle"
                  percent={getWeightPercent()}
                  width={22}
                  strokeWidth={15}
                  strokeColor={getWeightPercent() < 100 ? '#00CC66' : '#FAAD14'}
                  trailColor="#E3E3E3"
                  format={() => null}
                />
                {weight}&nbsp;/&nbsp;{transportData.weight}&nbsp;кг
              </div>
            </div>
            <div>
              <div className="routes-generator-set-courier_fullness-header">Загрузка по объему</div>
              <div className="routes-generator-set-courier_fullness-text">
                <Progress
                  type="circle"
                  percent={getVolumePercent()}
                  width={22}
                  strokeWidth={15}
                  strokeColor={getVolumePercent() < 100 ? '#00CC66' : '#FAAD14'}
                  trailColor="#E3E3E3"
                  format={() => null}
                />
                {volume}&nbsp;/&nbsp;{transportData.volume}&nbsp;м<sup>3</sup>
              </div>
            </div>
          </div>
        )}

        <Divider />

        {session && (
          <div className="routes-generator-set-courier__session-field">
            <CheckIcon className="routes-generator-set-courier__check" /> Смена от{' '}
            {moment(session.planned_date).format(dateFormat.string)}
          </div>
        )}
        {!session && courierData && (
          <div className="routes-generator-set-courier__session-field">
            <CheckIcon className="routes-generator-set-courier__check" />
            Смена будет создана автоматически
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default inject(
  'courierDirectory',
  'routesGenerator',
  'couriers',
  'transport',
  'user',
)(observer(RoutesGeneratorSetCourierModal));
