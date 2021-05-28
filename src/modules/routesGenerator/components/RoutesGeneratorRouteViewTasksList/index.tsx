import './style.less';

import { Empty, Tooltip } from 'antd';
import Icon, { CloseOutlined } from '@ant-design/icons';
import React, { FC } from 'react';
import { inject, observer } from 'mobx-react';

import { CommentSvg } from './CommentSvg';
import { DeliveryMethodsStore } from 'modules/delivery-methods/stores/DeliveryMethodsStore';
import { IRouteDraft } from 'modules/routesGenerator/models/types';
import { ITasks } from 'modules/tasks/models/types';
import { RoutesGeneratorStore } from 'modules/routesGenerator/stores/RoutesGeneratorStore';
import { TasksStore } from 'modules/tasks/stores/TasksStore';
import { getAddressProp } from 'modules/tasks/helpers/propHelper';
import moment from 'moment-timezone';
import { timeFormat } from 'helpers/string';

interface IProps {
  routeDraft: IRouteDraft;
  deliveryMethods?: DeliveryMethodsStore;
  tasks?: TasksStore;
  routesGenerator?: RoutesGeneratorStore;
  index: number;
}

const RoutesGeneratorRouteViewTasksList: FC<IProps> = ({
  routeDraft,
  deliveryMethods,
  tasks,
  routesGenerator,
  index,
}) => {
  const getProblems = (problems: string[]) => {
    return (
      <div>
        Обнаружены проблемы:{' '}
        {problems.map((p, i) => (
          <p key={i}>– {p}</p>
        ))}
      </div>
    );
  };

  const renderNumberTask = (task: ITasks) => {
    if (task.problems && task.problems.length > 0) {
      return (
        <Tooltip title={getProblems(task.problems)}>
          <div className="routes-generator-route-view-tasks-list_number routes-generator-route-view-tasks-list_number__warning">
            {task.number}
          </div>
        </Tooltip>
      );
    } else {
      return <div className="routes-generator-route-view-tasks-list_number">#{task.number}</div>;
    }
  };

  const renderLeftBlock = (task: ITasks) => (
    <div>
      <div className="routes-generator-route-view-tasks-list_date">
        {routeDraft.isCalculated && task.planned_delivery_time && (
          <b>
            в&nbsp;
            {moment(task.planned_delivery_time)
              .tz(routeDraft.start.warehouse.timezone)
              .format(timeFormat.simple)}
            &nbsp;&nbsp;/&nbsp;
          </b>
        )}
        {task.time_slot_start}&nbsp;-&nbsp;{task.time_slot_end}&nbsp;
      </div>
      <div className="routes-generator-route-view-tasks-list_address">
        {task.order && task.order[getAddressProp(task)]}
      </div>
      {renderNumberTask(task)}
    </div>
  );

  const renderRightBlock = (task: ITasks) => {
    const currentDeliveryMethod = deliveryMethods.deliveryMethodsList.find(
      (d) => d.guid === task.delivery_method_guid,
    );
    const type = tasks.tasksTypes.find((d) => d.value === task.type);

    return (
      <div className="routes-generator-route-view-tasks-list_right">
        <div className="routes-generator-route-view-tasks-list_info-wrapper">
          <div className="routes-generator-route-view-tasks-list_sizes">
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
          <div className="routes-generator-route-view-tasks-list_delivery-type">
            {currentDeliveryMethod && currentDeliveryMethod.name}, {type && type.title}
          </div>
        </div>
        <CloseOutlined
          className="routes-generator-route-view-tasks-list_remove-icon"
          onClick={() => routesGenerator.removeTaskFromRouteDraft(task, index)}
        />
      </div>
    );
  };

  const renderListMap = () => {
    if (routeDraft.tasksList.length > 0) {
      return routeDraft.tasksList.map((task) => (
        <div className="routes-generator-route-view-tasks-list" key={task.guid}>
          {renderLeftBlock(task)}
          {renderRightBlock(task)}
        </div>
      ));
    } else {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
  };

  const Comment = (props) => <Icon component={CommentSvg} {...props} />;

  return (
    <div className="routes-generator-route-view-tasks-list_wrapper">
      {routeDraft.isCalculated && (
        <>
          <div className="routes-generator-route-view-tasks-list_info-time">
            <Comment />
            <b>
              В{' '}
              {moment(routeDraft.start.datetime)
                .tz(routeDraft.start.warehouse.timezone)
                .format(timeFormat.simple)}
            </b>{' '}
            погрузка
          </div>
        </>
      )}
      {renderListMap()}
      {routeDraft.isCalculated && (
        <div className="routes-generator-route-view-tasks-list_info-time">
          <Comment />
          <b>
            В{' '}
            {moment(routeDraft.finish.datetime)
              .tz(routeDraft.finish.warehouse.timezone)
              .format(timeFormat.simple)}
          </b>{' '}
          возвращение на склад
        </div>
      )}
    </div>
  );
};

export default inject(
  'tasks',
  'deliveryMethods',
  'routesGenerator',
)(observer(RoutesGeneratorRouteViewTasksList));
