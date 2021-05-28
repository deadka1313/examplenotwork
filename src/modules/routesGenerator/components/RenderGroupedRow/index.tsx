import './style.less';

import { DownOutlined, FireOutlined, UpOutlined } from '@ant-design/icons';
import { INotCoverage, ITasksGroupCoverage } from 'modules/routesGenerator/models/types';
import React, { FC, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';

import { Checkbox } from 'antd';
import { DeliveryMethodsStore } from 'modules/delivery-methods/stores/DeliveryMethodsStore';
import { Draggable } from 'react-beautiful-dnd';
import { ICoverage } from 'modules/coverages/models/types';
import { ITasks } from 'modules/tasks/models/types';
import { RoutesGeneratorStore } from 'modules/routesGenerator/stores/RoutesGeneratorStore';
import { TasksStore } from 'modules/tasks/stores/TasksStore';
import { getAddressProp } from 'modules/tasks/helpers/propHelper';
import moment from 'moment';
import { stopPropagation } from 'helpers/stopPropagation';

interface IProps {
  coverageGuid: string;
  data: ITasksGroupCoverage;
  index: number;
  coverage: ICoverage | INotCoverage;
  deliveryMethods?: DeliveryMethodsStore;
  routesGenerator?: RoutesGeneratorStore;
  tasks?: TasksStore;
}

const RenderGroupedRow: FC<IProps> = ({
  coverageGuid,
  data,
  index,
  coverage,
  routesGenerator,
  deliveryMethods,
  tasks,
}) => {
  const [isHideTasks, setIsHideTasks] = useState(true);
  const [filterTasks, setFilterTasks] = useState<ITasks[]>([]);

  useEffect(() => {
    !routesGenerator.isLoadingTasksList &&
      !routesGenerator.isLoadingGroupCoverages &&
      data &&
      data.tasks &&
      setFilterTasks(routesGenerator.filterTasksDuplicates(data.tasks));
  }, [
    routesGenerator.movedTasksToRouteGuids,
    data,
    routesGenerator.isLoadingGroupCoverages,
    routesGenerator.isLoadingTasksList,
  ]);

  const getAmount = (): number => {
    return filterTasks.reduce((sum, item) => sum + item.meta.amount_without_tax, 0);
  };

  const getWeight = (): number => {
    return filterTasks.reduce((sum, item) => sum + item.sizes.weight, 0);
  };

  const getVolume = (): number => {
    return filterTasks.reduce((sum, item) => sum + item.sizes.volume, 0);
  };

  const hideTasks = (e) => {
    stopPropagation(e);
    setIsHideTasks(!isHideTasks);
  };

  const selectAllTasks = (e) => {
    if (e.target.checked) {
      const filterTasksNotChecked = filterTasks.filter(
        (task) =>
          !routesGenerator.selectedTaskGuids.some(
            (selectedTaskGuid) => selectedTaskGuid === task.guid,
          ),
      );
      const newSelectedGuids = filterTasksNotChecked.map((task) => task.guid);
      routesGenerator.setSelectedTaskGuids([
        ...routesGenerator.selectedTaskGuids,
        ...newSelectedGuids,
      ]);
    } else {
      const filterTasksChecked = filterTasks.filter((task) =>
        routesGenerator.selectedTaskGuids.some(
          (selectedTaskGuid) => selectedTaskGuid === task.guid,
        ),
      );
      const newSelectedGuids = routesGenerator.selectedTaskGuids.filter(
        (guid) => !filterTasksChecked.some((task) => guid === task.guid),
      );
      routesGenerator.setSelectedTaskGuids([...newSelectedGuids]);
    }
  };

  const renderTask = (task, newIndex) => {
    const isSelected = routesGenerator.selectedTaskGuids.some(
      (selectedTaskGuid) => selectedTaskGuid === task.guid,
    );
    const isGhosting =
      isSelected &&
      Boolean(routesGenerator.draggingTaskGuid) &&
      routesGenerator.draggingTaskGuid !== task.guid;
    const currentDeliveryMethod = deliveryMethods.deliveryMethodsList.find(
      (d) => d.guid === task.delivery_method_guid,
    );
    const type = tasks.tasksTypes.find((d) => d.value === task.type);

    return (
      <Draggable key={task.guid} draggableId={task.guid} index={newIndex}>
        {(provided, snapshot) => (
          <div
            className="routes-generator-tasks-grouped-row_task"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            key={task.guid}
          >
            <div>
              <Checkbox
                className="routes-generator-tasks-grouped-row_task-checkbox"
                checked={isSelected}
                onChange={() => {
                  routesGenerator.toggleSelectionTask(task.guid);
                }}
              />
            </div>
            <div
              className={`routes-generator-tasks-grouped-row ${
                isGhosting ? 'routes-generator-tasks-grouped-row_ghosting' : ''
              } ${snapshot.isDragging ? 'routes-generator-tasks-grouped-row_dragging' : ''}`}
            >
              <div className="routes-generator-tasks-grouped-row_left">
                <div>
                  <div
                    className={`routes-generator-tasks-grouped-row_date ${
                      task.problems && task.problems.length > 0
                        ? 'routes-generator-tasks-grouped-row_date__problems'
                        : ''
                    }`}
                  >
                    {task.problems && task.problems.length > 0 && <FireOutlined />}
                    {task.time_slot_start}&nbsp;-&nbsp;{task.time_slot_end}&nbsp;/&nbsp;
                    {moment(task.delivery_date).format('DD.MM')}
                  </div>
                  <div className="routes-generator-tasks-grouped-row_address">
                    {task.order && task.order[getAddressProp(task)]}
                  </div>
                  <div className="routes-generator-tasks-grouped-row_number">#{task.number}</div>
                </div>
              </div>
              <div className="routes-generator-tasks-grouped-row_right">
                <div className="routes-generator-tasks-grouped-row_info-wrapper">
                  <div className="routes-generator-tasks-grouped-row_sizes">
                    {task?.meta?.amount_without_tax && (
                      <>
                        {task.meta.amount_without_tax.toLocaleString('ru-RU', {
                          style: 'currency',
                          currency: routesGenerator.currency,
                        })}
                        &nbsp;/&nbsp;
                      </>
                    )}
                    {task?.sizes?.weight && task.sizes.weight.toFixed(2)}&nbsp;кг&nbsp;/&nbsp;
                    {task?.sizes?.volume && task.sizes.volume.toFixed(3)}&nbsp;м
                    <sup>3</sup>
                  </div>
                  <div
                    className="routes-generator-tasks-grouped-row_delivery-type"
                    title={`${currentDeliveryMethod && currentDeliveryMethod.name}, ${
                      type && type.title
                    }`}
                  >
                    {currentDeliveryMethod && currentDeliveryMethod.name}, {type && type.title}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  const isSelectedGroup =
    filterTasks &&
    !filterTasks
      .map((item) =>
        routesGenerator.selectedTaskGuids.some(
          (selectedTaskGuid) => selectedTaskGuid === item.guid,
        ),
      )
      .some((bool) => bool === false);
  const isGhostingGroup = isSelectedGroup && Boolean(routesGenerator.draggingTaskGuid);

  return (
    <>
      {filterTasks.length > 0 && (
        <Draggable key={coverageGuid} draggableId={`coverage=${coverageGuid}`} index={index}>
          {(provided, snapshot) => (
            <div
              className={`routes-generator-tasks-grouped-row  ${
                isGhostingGroup ? 'routes-generator-tasks-grouped-row_ghosting' : ''
              } ${snapshot.isDragging ? 'routes-generator-tasks-grouped-row_dragging' : ''}`}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <div
                className={`routes-generator-tasks-grouped-row_left-group ${
                  !isHideTasks ? 'routes-generator-tasks-grouped-row_open-tasks' : ''
                }`}
              >
                <Checkbox
                  className="routes-generator-tasks-grouped-row_left-checkbox-group"
                  checked={isSelectedGroup}
                  onChange={selectAllTasks}
                />
                <span>
                  {coverage && coverage.name} ({filterTasks.length})
                </span>
                {isHideTasks ? (
                  <DownOutlined
                    className="routes-generator-tasks-grouped-row_left-collapse"
                    onClick={hideTasks}
                  />
                ) : (
                  <UpOutlined
                    className="routes-generator-tasks-grouped-row_left-collapse routes-generator-tasks-grouped-row_open-tasks"
                    onClick={hideTasks}
                  />
                )}
              </div>
              <div
                className={`${!isHideTasks ? 'routes-generator-tasks-grouped-row_open-tasks' : ''}`}
              >
                {getAmount().toLocaleString('ru-RU', {
                  style: 'currency',
                  currency: routesGenerator.currency,
                })}
                &nbsp;/&nbsp;
                {getWeight().toFixed(2)}&nbsp;кг&nbsp;/&nbsp;
                {getVolume().toFixed(3)}&nbsp;м
                <sup>3</sup>
              </div>
            </div>
          )}
        </Draggable>
      )}
      {!isHideTasks && filterTasks.length > 0 && (
        <div className="routes-generator-tasks-grouped-row_open-tasks-wrapper">
          {filterTasks.map((item, newIndex) => renderTask(item, newIndex))}
        </div>
      )}
    </>
  );
};

export default inject('routesGenerator', 'deliveryMethods', 'tasks')(observer(RenderGroupedRow));
