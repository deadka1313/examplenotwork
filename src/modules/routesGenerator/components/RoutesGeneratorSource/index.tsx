import './style.less';

import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';

import Baron from 'modules/common/components/Baron';
import { Button } from 'antd';
import { DeliveryMethodsStore } from 'modules/delivery-methods/stores/DeliveryMethodsStore';
import { FilterSvg } from '../RoutesGeneratorFormFilter/FilterSvg';
import Icon from '@ant-design/icons';
import RoutesGeneratorFormFilter from '../RoutesGeneratorFormFilter';
import RoutesGeneratorMap from 'modules/routesGenerator/components/RoutesGeneratorMap';
import { RoutesGeneratorStore } from 'modules/routesGenerator/stores/RoutesGeneratorStore';
import RoutesGeneratorTasksList from '../RoutesGeneratorTasksList';
import { TasksStore } from 'modules/tasks/stores/TasksStore';
import Title from 'modules/common/components/Title';
import { WarehousesStore } from 'modules/warehouses/stores/WarehousesStore';

interface IProps {
  deliveryMethods?: DeliveryMethodsStore;
  routesGenerator?: RoutesGeneratorStore;
  tasks?: TasksStore;
  warehouses?: WarehousesStore;
}

const RoutesGeneratorSource = ({ deliveryMethods, tasks, routesGenerator, warehouses }: IProps) => {
  const [isMap, setIsMap] = useState(false);
  const [viewFilter, setViewFilter] = useState(false);

  const FilterIcon = (props) => <Icon component={FilterSvg} {...props} />;

  useEffect(() => {
    deliveryMethods.getDeliveryMethods({ pageSize: 100, current: 1 }, false);
    tasks.getTasksTypes();
    routesGenerator.getTasksForRouteWrapperLoading();
    warehouses
      .getWarehouse(routesGenerator.filterTasks.warehouses[0])
      .then((item) => routesGenerator.setCurrency(item.shops[0].currency));
  }, []);

  return (
    <div className="routes-generator-source">
      <div className="routes-generator-source_list">
        <div className="routes-generator-source_nav">
          <div>
            <button
              className={`routes-generator-source_nav-button ${
                !isMap ? 'routes-generator-source_nav-button__active' : ''
              }`}
              onClick={(): void => setIsMap(false)}
            >
              Списком
            </button>
            <button
              className={`routes-generator-source_nav-button ${
                isMap ? 'routes-generator-source_nav-button__active' : ''
              }`}
              onClick={(): void => setIsMap(true)}
            >
              На карте
            </button>
          </div>
          <div onClick={() => setViewFilter(!viewFilter)}>
            <Title
              size={Title.SIZE.H3}
              className={`routes-generator-source_filter-button ${
                viewFilter ? 'routes-generator-source_filter-button__active' : ''
              }`}
            >
              <FilterIcon /> Фильтры
            </Title>
          </div>
        </div>
        {viewFilter && <RoutesGeneratorFormFilter isMapView={isMap} />}
        <div className="routes-generator-source_header-count">
          <div>
            <span>Выбрано: {routesGenerator.selectedTaskGuids.length}</span>
            {routesGenerator.selectedTaskGuids.length > 0 && (
              <Button type="link" onClick={() => routesGenerator.setSelectedTaskGuids([])}>
                Очистить
              </Button>
            )}
          </div>
          <Button
            type="primary"
            disabled={routesGenerator.selectedTaskGuids.length === 0}
            onClick={routesGenerator.moveSelectedTasksToRoute}
          >
            Добавить в маршрут
          </Button>
        </div>
        <div className="routes-generator-source_tabs">
          <div className="routes-generator-source_tabs-wrap">
            {isMap ? (
              <RoutesGeneratorMap
                selectedList={routesGenerator.selectedTaskGuids}
                warehouses={warehouses.warehousesListAll.filter((item) =>
                  routesGenerator.filterTasks.warehouses.some((guid) => guid === item.guid),
                )}
                handleSelectItem={routesGenerator.toggleSelectionTask}
                handleSelectList={routesGenerator.toggleSelectionList}
              />
            ) : (
              <Baron className="routes-generator-source_tabs-list-content">
                <RoutesGeneratorTasksList />
              </Baron>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default inject(
  'tasks',
  'deliveryMethods',
  'routesGenerator',
  'warehouses',
)(observer(RoutesGeneratorSource));
