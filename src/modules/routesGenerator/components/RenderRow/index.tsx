import './style.less';

import React, { FC } from 'react';
import { inject, observer } from 'mobx-react';

import { Checkbox } from 'antd';
import { DeliveryMethodsStore } from 'modules/delivery-methods/stores/DeliveryMethodsStore';
import { Draggable } from 'react-beautiful-dnd';
import { FireOutlined } from '@ant-design/icons';
import { ITasks } from 'modules/tasks/models/types';
import { RoutesGeneratorStore } from 'modules/routesGenerator/stores/RoutesGeneratorStore';
import { TasksStore } from 'modules/tasks/stores/TasksStore';
import { getAddressProp } from 'modules/tasks/helpers/propHelper';
import moment from 'moment';

interface IProps {
  task: ITasks;
  index: number;
  isGrouped?: boolean;
  deliveryMethods?: DeliveryMethodsStore;
  routesGenerator?: RoutesGeneratorStore;
  tasks?: TasksStore;
}

const Index: FC<IProps> = ({ task, index, routesGenerator, deliveryMethods, tasks }) => {
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
    <Draggable key={task.guid} draggableId={task.guid} index={index}>
      {(provided, snapshot) => (
        <div
          className={`routes-generator-tasks-row ${
            isGhosting ? 'routes-generator-tasks-row_ghosting' : ''
          } ${snapshot.isDragging ? 'routes-generator-tasks-row_dragging' : ''}`}
          key={task.guid}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="routes-generator-tasks-row_left">
            <div>
              <Checkbox
                className="routes-generator-tasks-row_left-checkbox"
                checked={isSelected}
                onChange={() => {
                  routesGenerator.toggleSelectionTask(task.guid);
                }}
              />
            </div>
            <div>
              <div
                className={`routes-generator-tasks-row_date ${
                  task.problems && task.problems.length > 0
                    ? 'routes-generator-tasks-row_date__problems'
                    : ''
                }`}
              >
                {task.problems && task.problems.length > 0 && <FireOutlined />}
                {task.time_slot_start}&nbsp;-&nbsp;{task.time_slot_end}&nbsp;/&nbsp;
                {moment(task.delivery_date).format('DD.MM')}
              </div>
              <div className="routes-generator-tasks-row_address">
                {task.order && task.order[getAddressProp(task)]}
              </div>
              <div className="routes-generator-tasks-row_number">#{task.number}</div>
            </div>
          </div>
          <div className="routes-generator-tasks-row_right">
            <div className="routes-generator-tasks-row_info-wrapper">
              <div className="routes-generator-tasks-row_sizes">
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
              <div className="routes-generator-tasks-row_delivery-type">
                {currentDeliveryMethod && currentDeliveryMethod.name}, {type && type.title}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default inject('routesGenerator', 'deliveryMethods', 'tasks')(observer(Index));
