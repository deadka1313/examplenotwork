import './style.less';

import React, { FC, useState } from 'react';
import { inject, observer } from 'mobx-react';

import Baron from 'modules/common/components/Baron';
import { DeleteOutlined } from '@ant-design/icons';
import { IRouteDraft } from 'modules/routesGenerator/models/types';
import { IWarehouses } from 'modules/warehouses/models/types';
import { Popconfirm } from 'antd';
import RoutesGeneratorMapShowRoute from '../RoutesGeneratorMapShowRoute';
import RoutesGeneratorRouteViewTasksList from 'modules/routesGenerator/components/RoutesGeneratorRouteViewTasksList';
import { RoutesGeneratorStore } from 'modules/routesGenerator/stores/RoutesGeneratorStore';

interface IProps {
  card: IRouteDraft;
  index: number;
  routesGenerator?: RoutesGeneratorStore;
}

const RoutesGeneratorRouteView: FC<IProps> = ({ card, index, routesGenerator }) => {
  const [isMap, setIsMap] = useState(false);

  const removeRoute = () => {
    routesGenerator.setOpenCardRouteDraftIndex(null);
    routesGenerator.removeRoute(index);
  };

  const getWarehousesForMap = (): IWarehouses[] => {
    if (card.start && card.start.warehouse && card.finish && card.finish.warehouse) {
      if (card.start.warehouse.guid !== card.finish.warehouse.guid) {
        return [card.start.warehouse, card.finish.warehouse];
      } else {
        return [card.start.warehouse];
      }
    } else {
      return [];
    }
  };

  return (
    <div className="routes-generator-view-route">
      <div className="routes-generator-view-route_list">
        <div className="routes-generator-view-route_nav">
          <div>
            <button
              className={`routes-generator-view-route_nav-button ${
                !isMap ? 'routes-generator-view-route_nav-button__active' : ''
              }`}
              onClick={(): void => setIsMap(false)}
            >
              Списком
            </button>
            <button
              className={`routes-generator-view-route_nav-button ${
                isMap ? 'routes-generator-view-route_nav-button__active' : ''
              }`}
              onClick={(): void => setIsMap(true)}
            >
              На карте
            </button>
          </div>
          <div className="routes-generator-view-route_delete-route">
            <Popconfirm onConfirm={removeRoute} placement="rightTop" title="Вы уверены?">
              <DeleteOutlined /> Удалить маршрут
            </Popconfirm>
          </div>
        </div>
        <div className="routes-generator-view-route_tabs">
          {isMap ? (
            <RoutesGeneratorMapShowRoute
              tasksList={card.tasksList}
              warehouses={getWarehousesForMap()}
              showRoute={card.isCalculated}
            />
          ) : (
            <div className="routes-generator-view-route_tabs-wrap">
              <Baron className="routes-generator-view-route_tabs-list-content">
                <RoutesGeneratorRouteViewTasksList routeDraft={card} index={index} />
              </Baron>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default inject('routesGenerator')(observer(RoutesGeneratorRouteView));
