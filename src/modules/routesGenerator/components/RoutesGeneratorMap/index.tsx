import React, { FC, ReactNode, useState } from 'react';
import { inject, observer } from 'mobx-react';

import Control from 'modules/map/containers/Control/index';
import ControlBar from 'modules/map/containers/ControlBar/index';
import { CoreStore } from 'modules/core/stores/CoreStore';
import CreateManager from 'modules/map/containers/CreateManager';
import { Feature } from 'geojson';
import { ITasks } from 'modules/tasks/models/types';
import { IWarehouses } from 'modules/warehouses/models/types';
import L from 'leaflet';
import Map from 'modules/map/containers/Map';
import MarkerCluster from 'modules/map/containers/MarkerCluster';
import { RoutesGeneratorStore } from 'modules/routesGenerator/stores/RoutesGeneratorStore';
import { TMarkerEvent } from 'modules/map/containers/Marker';
import TaskPoint from 'modules/tasks/components/TaskPoint';
import ViewPort from 'modules/map/containers/ViewPort';
import WarehouseMarker from 'modules/warehouse/containers/OldWarehouseMarker';
import Zoom from 'modules/map/containers/Zoom';
import { getPointProp } from 'modules/tasks/helpers/propHelper';
import insidePolygon from 'point-in-polygon';

interface IProps {
  selectedList: React.Key[];
  handleSelectItem?: (guid: string) => void;
  handleSelectList?: (list: string[]) => void;
  warehouses?: IWarehouses[];
  core?: CoreStore;
  routesGenerator?: RoutesGeneratorStore;
}

const RoutesGeneratorMap: FC<IProps> = ({
  warehouses,
  selectedList,
  handleSelectItem,
  handleSelectList,
  core,
  routesGenerator,
}: IProps) => {
  const tasksList = routesGenerator.getTasksListSource;
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

  const eventList: TMarkerEvent[] = [
    {
      name: 'click',
      handler: (event): void => handleSelectItem(event.target.feature.properties.guid),
    },
  ];

  const renderMarker = (task: ITasks): ReactNode => (
    <TaskPoint
      key={task.guid}
      task={{ ...task, status: 'new' }}
      isChecked={selectedList.includes(task.guid)}
      eventList={eventList}
      isTooltip
    />
  );

  const tasksView = tasksList
    .filter(
      (task) => task.order && task.order[getPointProp(task)] && task.order[getPointProp(task)].lat,
    )
    .map((task) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          task.order && task.order[getPointProp(task)].lon,
          task.order && task.order[getPointProp(task)].lat,
        ],
      },
      properties: {
        guid: task.guid,
      },
    }));

  const mapView = warehouses ? [...tasksView, ...warehousesPoint] : [...tasksView];

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

  const [isPolygonSelect, updatePolygonSelect] = useState(false);

  const handlePolygonCreate = (e): void => {
    const { layer } = e;

    layer.remove();

    updatePolygonSelect(false);

    const polygon = layer.toGeoJSON().geometry.coordinates[0];

    const selected = tasksView
      .filter((point) => insidePolygon(point.geometry.coordinates, polygon))
      .map((point) => point.properties.guid);

    handleSelectList(selected);
  };

  return (
    <Map tiles={core.config.tile}>
      <ViewPort mapView={mapView.length > 0 ? mapView : null} isDefaultFit />
      <Zoom />
      <ControlBar>
        <Control
          icon="leaflet-pm-icon-polygon"
          onClick={(): void => updatePolygonSelect(!isPolygonSelect)}
        />
      </ControlBar>
      {isPolygonSelect && <CreateManager onCreate={handlePolygonCreate} />}
      <MarkerCluster iconCreateFunction={iconCreateFunction}>
        {warehouses &&
          warehouses.length > 0 &&
          [...warehousesPoint].map((item) => renderWarehouseMarker(item))}
        {tasksList.map((item) => renderMarker(item))}
      </MarkerCluster>
    </Map>
  );
};

export default inject('core', 'routesGenerator')(observer(RoutesGeneratorMap));
