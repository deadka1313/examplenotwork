import './style.less';

import { Checkbox, Spin } from 'antd';
import React, { FC } from 'react';
import { inject, observer } from 'mobx-react';

import DateFilter from 'modules/arm2/components/DateFilter';
import DeliveryMethodFilter from 'modules/arm2/components/DeliveryMethodFilter';
import ProblemFilter from 'modules/arm2/components/ProblemFilter';
import { RoutesGeneratorStore } from 'modules/routesGenerator/stores/RoutesGeneratorStore';
import TimeFilter from 'modules/arm2/components/TimeFilter';
import WarehouseFilter from 'modules/arm2/components/WarehouseFilter';
import debounce from 'lodash.debounce';

interface IProps {
  isMapView: boolean;
  routesGenerator?: RoutesGeneratorStore;
}

const RoutesGeneratorFormFilter: FC<IProps> = ({ isMapView, routesGenerator }: IProps) => {
  const getTasksForRouteWrapperLoading = debounce(
    routesGenerator.getTasksForRouteWrapperLoading,
    700,
  );

  const getTasks = () => {
    getTasksForRouteWrapperLoading();
  };

  return (
    <Spin spinning={routesGenerator.isLoadingTasksList || routesGenerator.isLoadingGroupCoverages}>
      <div className="routes-form-filter">
        <div className="routes-form-filter__content">
          <DateFilter
            className="routes-form-filter__date"
            setFilter={routesGenerator.setFilterTasksValue}
            getList={getTasks}
            value={routesGenerator.filterTasks.deliveryDate}
            defaultValue={routesGenerator.filterTasks.deliveryDate}
          />
          <TimeFilter
            className="routes-form-filter__time "
            setFilter={routesGenerator.setFilterTasksValue}
            getList={getTasks}
            value={{ from: routesGenerator.filterTasks.from, to: routesGenerator.filterTasks.to }}
          />
          <DeliveryMethodFilter
            className="routes-form-filter__delivery"
            getList={getTasks}
            setFilter={routesGenerator.setFilterTasksValue}
            value={routesGenerator.filterTasks.deliveryMethod}
          />
          <WarehouseFilter
            className="routes-form-filter__warehouse"
            setFilter={routesGenerator.setFilterTasksValue}
            getList={getTasks}
            value={routesGenerator.filterTasks.warehouses}
            defaultValue={routesGenerator.routeSettings.warehouses}
          />
          <ProblemFilter
            className="routes-form-filter__problem"
            getList={getTasks}
            setFilter={routesGenerator.setFilterTasksValue}
            value={routesGenerator.filterTasks.isProblem}
          />
          {!isMapView && (
            <Checkbox
              onChange={(e) => routesGenerator.setIsGroupList(e.target.checked)}
              checked={routesGenerator.isGroupList}
            >
              Группировать по покрытиям
            </Checkbox>
          )}
        </div>
      </div>
    </Spin>
  );
};

export default inject('routesGenerator')(observer(RoutesGeneratorFormFilter));
