import React, { FC, ReactNode } from 'react';
import { inject, observer } from 'mobx-react';

import { CoreStore } from 'modules/core/stores/CoreStore';
import { Feature } from 'geojson';
import { ITasks } from 'modules/tasks/models/types';
import { IWarehouses } from 'modules/warehouses/models/types';
import L from 'leaflet';
import Map from 'modules/map/containers/Map';
import MarkerCluster from 'modules/map/containers/MarkerCluster';
import RoutePath from 'modules/routes/components/RoutePath';
import TaskPoint from 'modules/tasks/components/TaskPoint';
import ViewPort from 'modules/map/containers/ViewPort';
import WarehouseMarker from 'modules/warehouse/containers/OldWarehouseMarker';
import Zoom from 'modules/map/containers/Zoom';
import { getPointProp } from 'modules/tasks/helpers/propHelper';

interface IProps {
  tasksList: ITasks[];
  showRoute: boolean;
  warehouses?: IWarehouses[];
  core?: CoreStore;
}

const RoutesGeneratorMapShowRoute: FC<IProps> = ({
  tasksList,
  warehouses,
  core,
  showRoute,
}: IProps) => {
  const warehousesPoint: Feature[] =
    warehouses &&
    warehouses.map((item) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [item.point.lon, item.point.lat],
        },
        properties: {
          name: item.title,
          address: item.address,
          guid: item.guid,
        },
      };
    });

  const renderWarehouseMarker = (warehousePoint: Feature): ReactNode => {
    if (warehousePoint && warehousePoint.geometry) {
      return <WarehouseMarker key={warehousePoint.properties.guid} warehouse={warehousePoint} />;
    }

    return null;
  };

  const renderPoint = (task: ITasks, index): ReactNode => {
    return showRoute ? (
      <TaskPoint key={task.guid} task={task} isTooltip content={index + 1} />
    ) : (
      <TaskPoint key={task.guid} task={task} isTooltip isChecked />
    );
  };

  const tasksPoints = tasksList
    .filter((task) => task.order[getPointProp(task)] && task.order[getPointProp(task)].lat)
    .map((task) => ({
      type: 'Point',
      coordinates: [
        task.order && task.order[getPointProp(task)].lon,
        task.order && task.order[getPointProp(task)].lat,
      ],
    }));

  const mapView = warehouses ? [...tasksPoints, ...warehousesPoint] : [...tasksPoints];

  const iconCreateFunction = (cluster): L.DivIcon => {
    return L.divIcon({
      className: '',
      html: `<div class="marker-cluster" style="color: gray">
                <div class="marker-cluster__back"></div>
                <div class="marker-cluster__content" style="background: grey">
                <span class="marker-cluster__content-inner">${cluster.getChildCount()}</span>
              </div>
            </div>`,
      iconSize: new L.Point(40, 40),
    });
  };

  const pointList = showRoute
    ? [
        warehousesPoint[0],
        ...tasksPoints,
        warehousesPoint.length > 1 ? warehousesPoint[1] : warehousesPoint[0],
      ]
    : [];

  return (
    <Map tiles={core.config.tile}>
      <ViewPort mapView={mapView.length > 0 ? mapView : null} isDefaultFit />
      <Zoom />
      <MarkerCluster iconCreateFunction={iconCreateFunction}>
        {warehouses &&
          warehouses.length > 0 &&
          [...warehousesPoint].map((item) => renderWarehouseMarker(item))}
        {tasksList.map((item, index) => renderPoint(item, index))}
      </MarkerCluster>
      {showRoute && <RoutePath pointList={pointList} customColor="#00CC66" />}
    </Map>
  );
};

export default inject('core')(observer(RoutesGeneratorMapShowRoute));
