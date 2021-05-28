import './style.less';

import { Button, Col, Progress, Row, Spin } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  EditOutlined,
  WarningFilled,
} from '@ant-design/icons';
import { DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';
import React, { ReactNode, useState } from 'react';
import { inject, observer } from 'mobx-react';

import { ClockCircleSvg } from './ClockCircleSvg';
import { EmptyRouteSvg } from 'modules/routesGenerator/components/RoutesGeneratorRouteDraft/EmptyRouteSvg';
import { IRouteDraft } from 'modules/routesGenerator/models/types';
import RoutesGeneratorRouteView from '../RoutesGeneratorRouteView';
import RoutesGeneratorSetCourierModal from 'modules/routesGenerator/components/RoutesGeneratorSetCourierModal';
import { RoutesGeneratorStore } from 'modules/routesGenerator/stores/RoutesGeneratorStore';
import { getAbbreviatedNameCurrency } from 'helpers/currency';
import moment from 'moment-timezone';
import { timeFormat } from 'helpers/string';

interface IProps {
  provided: DroppableProvided;
  snapshot: DroppableStateSnapshot;
  cardData: IRouteDraft;
  serialNumber: number;
  index: number;
  routesGenerator?: RoutesGeneratorStore;
}

const RoutesGeneratorRouteCard = ({
  provided,
  snapshot,
  cardData,
  serialNumber,
  index,
  routesGenerator,
}: IProps) => {
  const [isModalOpened, toggleModal] = useState(false);
  const closeModal = (): void => toggleModal(false);
  const openModal = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    toggleModal(true);
  };

  const onCancelHandler = (): void => closeModal();
  const onSubmitHandler = (): void => {
    closeModal();
  };

  const getAmount = (): number => {
    return cardData.tasksList.reduce((sum, item) => sum + item.meta.amount_without_tax, 0);
  };

  const getWeight = (): number => {
    return cardData.tasksList.reduce((sum, item) => sum + item.sizes.weight, 0);
  };

  const getVolume = (): number => {
    return cardData.tasksList.reduce((sum, item) => sum + item.sizes.volume, 0);
  };

  const getWeightPercent = (): number => {
    return cardData.transport ? (getWeight() * 100) / cardData.transport.weight : 0;
  };

  const getVolumePercent = (): number => {
    return cardData.transport ? (getVolume() * 100) / cardData.transport.volume : 0;
  };

  const openCardInfo = () => {
    routesGenerator.setOpenCardRouteDraftIndex(index);
  };

  const ClockCircle = (props) => <ClockCircleSvg component={EmptyRouteSvg} {...props} />;

  const isProblems = (): boolean => {
    if (getWeightPercent() > 100 && getWeightPercent() > 100) {
      return true;
    }
    for (let i = 0; i < cardData.tasksList.length; i++) {
      if (cardData.tasksList[i].problems && cardData.tasksList[i].problems.length > 0) {
        return true;
      }
    }
    return false;
  };

  const getTimeSlot = (): ReactNode => {
    if (cardData.tasksList.length === 0) {
      return (
        <div className="route-card-bottom_time route-card-bottom__no-time">
          <ClockCircle />
          Не определено
        </div>
      );
    }
    if (cardData.isCalculated) {
      return (
        <div className="route-card-bottom_time">
          <ClockCircle />
          {moment(cardData.start.datetime)
            .tz(cardData.start.warehouse.timezone)
            .format(timeFormat.simple)}
          &nbsp;-&nbsp;
          {moment(cardData.finish.datetime)
            .tz(cardData.finish.warehouse.timezone)
            .format(timeFormat.simple)}
        </div>
      );
    } else {
      let startSlot = cardData.tasksList[0].time_slot_start;
      let endSlot = cardData.tasksList[0].time_slot_end;
      cardData.tasksList.map((task) => {
        if (task.time_slot_start < startSlot) {
          startSlot = task.time_slot_start;
        }
        if (task.time_slot_end > endSlot) {
          endSlot = task.time_slot_end;
        }
      });
      return (
        <div className="route-card-bottom_time">
          <ClockCircle />
          {startSlot}&nbsp;-&nbsp;{endSlot}
        </div>
      );
    }
  };

  return (
    <>
      <Spin spinning={cardData.isLoadingCard}>
        <div ref={provided.innerRef} style={{ height: '100%' }}>
          <div
            className={`route-card ${
              routesGenerator.openCardRouteDraftIndex === null ? 'route-card_pointer' : ''
            } ${snapshot.isDraggingOver ? 'route-card_dragging' : ''} ${
              cardData.courierGuid ? 'route-card__is-set-courier' : ''
            } ${routesGenerator.openCardRouteDraftIndex === null ? 'route-card__hover' : ''}`}
            onClick={openCardInfo}
          >
            <div style={{ display: 'none' }}>{provided.placeholder}</div>
            <div className="route-card-top">
              <div>
                <div className="route-card-top_title">
                  {cardData.error && (
                    <Row align="middle">
                      <Col>
                        <div className="route-card-top_title-error">{cardData.error}</div>
                      </Col>
                    </Row>
                  )}
                  <Row align="middle">
                    <Col>
                      <div className="route-card-top_title__index">{serialNumber}.</div>
                    </Col>
                    <Col>
                      {cardData.courierGuid ? (
                        <div className="route-card-top_title__courier-and-car">
                          <div className="route-card-top_title__courier-and-car_car">
                            {cardData.error ? (
                              <CloseCircleFilled className="route-card-top_error" />
                            ) : (
                              cardData.isCalculated &&
                              (isProblems() ? (
                                <WarningFilled className="route-card-top_warning" />
                              ) : (
                                <CheckCircleFilled className="route-card-top_ok" />
                              ))
                            )}
                            <div>
                              {`${cardData.transport.name} ${cardData.transport.number}, ${cardData.transport.weight} кг, ${cardData.transport.volume}`}{' '}
                              <span>
                                м<sup>3</sup>
                              </span>
                            </div>
                            <EditOutlined
                              className="route-card-top_title__edit-courier-button"
                              onClick={openModal}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="route-card-top_title__courier-and-car">
                          Курьер и машина не выбраны
                        </div>
                      )}
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      {cardData.courierGuid && (
                        <div className="route-card-top_title__courier-and-car">
                          <div
                            className={`route-card-top_title__courier-and-car_courier ${
                              cardData.error || cardData.isCalculated
                                ? 'route-card-top_title__courier-and-car_courier-warning'
                                : ''
                            }`}
                          >
                            {cardData.fullName}
                          </div>
                        </div>
                      )}
                    </Col>
                  </Row>
                </div>
                {!cardData.courierGuid && (
                  <Button type="link" className="route-card-top_title__link" onClick={openModal}>
                    Выбрать
                  </Button>
                )}
              </div>
              <div className="route-card-top_progress">
                <div className="route-card-top_progress__price">
                  {getAmount().toLocaleString('ru-RU', {
                    minimumFractionDigits: 2,
                  })}
                  &nbsp;
                  <div className="route-card-top_progress__price-circle route-card-top_progress__price-circle__price">
                    {getAbbreviatedNameCurrency(routesGenerator.currency).markValue}
                  </div>
                </div>
                <div className="route-card-top_progress__weight">
                  <span>
                    {getWeight().toFixed(2)}&nbsp;
                    <span>кг</span>
                  </span>
                  <Progress
                    type="circle"
                    percent={getWeightPercent()}
                    width={22}
                    strokeWidth={15}
                    strokeColor={getWeightPercent() < 100 ? '#00CC66' : '#FAAD14'}
                    trailColor="#E3E3E3"
                    format={() => null}
                  />
                </div>
                <div className="route-card-top_progress__volume">
                  <span>
                    {getVolume().toFixed(3)}&nbsp;
                    <span>
                      м<sup>3</sup>
                    </span>
                  </span>
                  <Progress
                    type="circle"
                    percent={getVolumePercent()}
                    width={22}
                    strokeWidth={15}
                    strokeColor={getVolumePercent() < 100 ? '#00CC66' : '#FAAD14'}
                    trailColor="#E3E3E3"
                    format={() => null}
                  />
                </div>
              </div>
            </div>
            <div className="route-card-bottom">
              {getTimeSlot()}
              <div className="route-card-bottom_right-wrapper">
                {Array.isArray(cardData.coverages) && (
                  <div
                    className="route-card-bottom_coverages"
                    title={cardData.coverages.map((item) => item.name).join(', ')}
                  >
                    {cardData.coverages.map((item) => item.name).join(', ')}
                  </div>
                )}
                <div
                  className={`route-card-bottom_task-count ${
                    cardData.tasksList.length === 0 ? 'route-card-bottom_task-count__zero' : ''
                  }`}
                >
                  Заданий:&nbsp;{cardData.tasksList.length}
                </div>
              </div>
            </div>
          </div>
          {routesGenerator.openCardRouteDraftIndex === index && (
            <RoutesGeneratorRouteView card={cardData} index={index} />
          )}
        </div>
      </Spin>

      {isModalOpened && (
        <RoutesGeneratorSetCourierModal
          isModalOpened={isModalOpened}
          onSubmit={onSubmitHandler}
          onCancel={onCancelHandler}
          destroyOnClose={true}
          index={index}
          initialValues={cardData}
          volume={getVolume().toFixed(3)}
          weight={getWeight().toFixed(2)}
        />
      )}
    </>
  );
};

export default inject('routesGenerator')(observer(RoutesGeneratorRouteCard));
