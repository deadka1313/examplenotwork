import './style.less';

import Icon, { ArrowLeftOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { inject, observer } from 'mobx-react';

import Baron from 'modules/common/components/Baron';
import { Button } from 'antd';
import { Droppable } from 'react-beautiful-dnd';
import { EmptyRouteSmallSvg } from './EmptyRouteSmallSvg';
import { EmptyRouteSvg } from './EmptyRouteSvg';
import { IRouteDraft } from 'modules/routesGenerator/models/types';
import RoutesGeneratorRouteCard from 'modules/routesGenerator/components/RoutesGeneratorRouteCard';
import { RoutesGeneratorStore } from 'modules/routesGenerator/stores/RoutesGeneratorStore';
import Title from 'modules/common/components/Title';
import { dateFormat } from 'helpers/string';
import moment from 'moment';
import uniqBy from 'lodash.uniqby';

interface IProps {
  routesGenerator?: RoutesGeneratorStore;
}

const RoutesGeneratorRouteDraft = ({ routesGenerator }: IProps) => {
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  const EmptyRoute = (props) => <Icon component={EmptyRouteSvg} {...props} />;
  const EmptyRouteSmall = (props) => <Icon component={EmptyRouteSmallSvg} {...props} />;

  const EmptyText = () => (
    <p>
      Перетащите сюда задания,
      <br />
      чтобы составить маршрут.
    </p>
  );

  const isDisableCalculateAll = (): boolean => {
    for (let i = 0; i < routesGenerator.routeDraftList.length; i++) {
      if (
        routesGenerator.routeDraftList[i].courierGuid &&
        routesGenerator.routeDraftList[i].tasksList.length > 0 &&
        !routesGenerator.routeDraftList[i].error
      ) {
        return false;
      }
    }
    return true;
  };

  const isDisableCreateAll = (): boolean => {
    for (let i = 0; i < routesGenerator.routeDraftList.length; i++) {
      if (
        routesGenerator.routeDraftList[i].courierGuid &&
        routesGenerator.routeDraftList[i].tasksList.length > 0 &&
        routesGenerator.routeDraftList[i].isCalculated &&
        !routesGenerator.routeDraftList[i].error
      ) {
        return false;
      }
    }
    return true;
  };

  const checkIsCalculateRoutes = (): boolean => {
    for (let i = 0; i < routesGenerator.routeDraftList.length; i++) {
      if (
        routesGenerator.routeDraftList[i].courierGuid &&
        !routesGenerator.routeDraftList[i].isCalculated
      ) {
        return false;
      }
    }
    return true;
  };

  const createRoute = async (index: number) => {
    await routesGenerator
      .createRoute(index)
      .then(() => {
        routesGenerator.removeRoute(index);
        routesGenerator.getTasksForRouteWrapperLoading();
        setIsLoadingCards(false);
      })
      .catch(() => setIsLoadingCards(false));
  };

  const createRoutes = async (): Promise<void> => {
    setIsLoadingCards(true);
    const uniqRouteDrafts = await uniqBy([...routesGenerator.routeDraftList], 'courierGuid');
    Promise.all(
      uniqRouteDrafts.map(async (item) => {
        if (!item.sessionGuid) {
          await routesGenerator.createCourierSession({
            courier_guid: item.courierGuid,
            planned_date: moment(routesGenerator.routeSettings.deliveryDate).format(
              dateFormat.search,
            ),
            transport_guid: item.transportGuid,
          });
        }
      }),
    ).then(() => {
      Promise.all(
        routesGenerator.routeDraftList.map((item, index) => {
          if (item.courierGuid && item.isCalculated && !item.error) {
            return routesGenerator
              .createRoute(index)
              .then(() => {
                return index;
              })
              .catch((err) => {
                return err;
              });
          }
        }),
      ).then((items) => {
        const deleteItemsIndexes = items.filter((item) => typeof item === 'number');
        setIsLoadingCards(false);
        deleteItemsIndexes.length > 0 &&
          routesGenerator.getTasksForRouteWrapperLoading().then(() => {
            for (let i = deleteItemsIndexes.length - 1; i >= 0; i--) {
              routesGenerator.removeRoute(deleteItemsIndexes[i]);
            }
          });
      });
    });
  };

  const saveRoute = (index: number): void => {
    setIsLoadingCards(true);
    if (routesGenerator.routeDraftList[index].sessionGuid) {
      createRoute(index);
    } else {
      routesGenerator
        .createCourierSession({
          courier_guid: routesGenerator.routeDraftList[index].courierGuid,
          planned_date: moment(routesGenerator.routeSettings.deliveryDate).format(
            dateFormat.search,
          ),
          transport_guid: routesGenerator.routeDraftList[index].transportGuid,
        })
        .then(() => {
          createRoute(index);
        });
    }
  };

  const calculateRoute = (index: number): void => {
    setIsLoadingCards(true);
    routesGenerator
      .calculateRoute(index)
      .then(() => setIsLoadingCards(false))
      .catch(() => setIsLoadingCards(false));
  };

  const saveRoutes = (): void => {
    setIsLoadingCards(true);
    createRoutes()
      .then(() => setIsLoadingCards(false))
      .catch(() => setIsLoadingCards(false));
  };

  const calculateRoutes = async () => {
    setIsLoadingCards(true);
    Promise.all(
      routesGenerator.routeDraftList.map((item, index) => {
        if (item.courierGuid && !item.isCalculated && !item.error) {
          routesGenerator.calculateRoute(index);
        }
      }),
    ).then(() => setIsLoadingCards(false));
  };

  const renderHeader = () => {
    if (routesGenerator.openCardRouteDraftIndex === null) {
      return (
        <>
          <div className="routes-generator-route-draft_title">
            <Title size={Title.SIZE.H3} weight={Title.WEIGHT.SEMIBOLD}>
              Формирование маршрута
            </Title>
            <span className="routes-generator-route-draft_title-date">
              на{' '}
              {routesGenerator.routeSettings.deliveryDate &&
                routesGenerator.routeSettings.deliveryDate.format(dateFormat.string)}
            </span>
          </div>
          {routesGenerator.routeDraftList.length > 0 && checkIsCalculateRoutes() ? (
            <Button
              type="primary"
              onClick={saveRoutes}
              loading={isLoadingCards}
              disabled={isDisableCreateAll()}
            >
              Сохранить всё
            </Button>
          ) : (
            <Button
              type="primary"
              disabled={isDisableCalculateAll()}
              onClick={calculateRoutes}
              loading={isLoadingCards}
            >
              Рассчитать всё
            </Button>
          )}
        </>
      );
    } else {
      const routeDraft: IRouteDraft =
        routesGenerator.routeDraftList[routesGenerator.openCardRouteDraftIndex];
      return (
        <>
          <div className="routes-generator-route-draft_title">
            <Title size={Title.SIZE.H3} weight={Title.WEIGHT.SEMIBOLD}>
              <a
                className="routes-generator-route-draft_back-link"
                onClick={() => routesGenerator.setOpenCardRouteDraftIndex(null)}
              >
                <ArrowLeftOutlined />
              </a>
              Вернуться к списку
            </Title>
          </div>
          {routeDraft.isCalculated ? (
            <Button
              type="primary"
              onClick={() => saveRoute(routesGenerator.openCardRouteDraftIndex)}
              disabled={Boolean(routeDraft.error)}
              loading={routeDraft.isLoadingCard}
            >
              Сохранить
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => calculateRoute(routesGenerator.openCardRouteDraftIndex)}
              disabled={
                !routeDraft.courierGuid ||
                routeDraft.tasksList.length === 0 ||
                Boolean(routeDraft.error)
              }
              loading={routeDraft.isLoadingCard}
            >
              Рассчитать
            </Button>
          )}
        </>
      );
    }
  };

  const renderDroppableContent = (item: IRouteDraft, index: number) => (
    <Droppable droppableId={String(index)} key={index}>
      {(provided, snapshot) => (
        <RoutesGeneratorRouteCard
          provided={provided}
          snapshot={snapshot}
          cardData={item}
          serialNumber={index + 1}
          index={index}
        />
      )}
    </Droppable>
  );

  const renderContent = () => {
    if (routesGenerator.openCardRouteDraftIndex === null) {
      return (
        <div className="routes-generator-route-draft_body-scroll">
          <div className="routes-generator-route-draft_body-scroll-wrap">
            <Baron className="routes-generator-route-draft_body-scroll-list-content">
              {routesGenerator.draggingTaskGuid && (
                <Droppable droppableId="new">
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef}>
                      <div
                        className={`routes-generator-route-draft_empty-small ${
                          snapshot.isDraggingOver
                            ? 'routes-generator-route-draft_empty__dragging'
                            : ''
                        } ${
                          routesGenerator.draggingTaskGuid
                            ? 'routes-generator-route-draft_empty__is-drag'
                            : ''
                        }`}
                      >
                        <EmptyRouteSmall />
                        <EmptyText />
                        <div style={{ display: 'none' }}>{provided.placeholder}</div>
                      </div>
                    </div>
                  )}
                </Droppable>
              )}
              {routesGenerator.routeDraftList.map((item, index) =>
                renderDroppableContent(item, index),
              )}
            </Baron>
          </div>
        </div>
      );
    } else {
      return (
        <div className="routes-generator-route-draft_body-wrapper__solo-card">
          {renderDroppableContent(
            routesGenerator.routeDraftList[routesGenerator.openCardRouteDraftIndex],
            routesGenerator.openCardRouteDraftIndex,
          )}
        </div>
      );
    }
  };

  const renderEmptyListContent = () => (
    <Droppable droppableId="new">
      {(provided, snapshot) => (
        <>
          <div
            ref={provided.innerRef}
            className={`routes-generator-route-draft_empty ${
              snapshot.isDraggingOver ? 'routes-generator-route-draft_empty__dragging' : ''
            } ${
              routesGenerator.draggingTaskGuid ? 'routes-generator-route-draft_empty__is-drag' : ''
            }`}
          >
            <EmptyRoute />
            <EmptyText />
            <div style={{ display: 'none' }}>{provided.placeholder}</div>
          </div>
        </>
      )}
    </Droppable>
  );

  return (
    <div className="routes-generator-route-draft">
      <div className="routes-generator-route-draft_header">{renderHeader()}</div>
      <div className="routes-generator-route-draft_body-wrapper">
        {routesGenerator.routeDraftList.length > 0 ? renderContent() : renderEmptyListContent()}
      </div>
    </div>
  );
};

export default inject('routesGenerator')(observer(RoutesGeneratorRouteDraft));
