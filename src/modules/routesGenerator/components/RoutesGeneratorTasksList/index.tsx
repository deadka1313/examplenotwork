import './style.less';

import { Empty, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';

import { Droppable } from 'react-beautiful-dnd';
import { ICoverage } from 'modules/coverages/models/types';
import { INotCoverage } from 'modules/routesGenerator/models/types';
import { ITasks } from 'modules/tasks/models/types';
import RenderGroupedRow from 'modules/routesGenerator/components/RenderGroupedRow';
import RenderRow from '../RenderRow';
import { RoutesGeneratorStore } from 'modules/routesGenerator/stores/RoutesGeneratorStore';
import { TableProps } from 'antd/lib/table/Table';

interface IProps extends TableProps<ITasks> {
  routesGenerator?: RoutesGeneratorStore;
}

const RoutesGeneratorTasksList = ({ routesGenerator }: IProps) => {
  const [coverages, setCoverages] = useState<(ICoverage | INotCoverage)[]>([]);
  const columnData = routesGenerator.getTasksListSource;
  const columnGroupData = routesGenerator.getTasksListSourceGroupedByCoverages;

  useEffect(() => {
    columnGroupData
      ? routesGenerator.setTaskGroupCoverage().then((coveragesData) => {
          coveragesData && setCoverages(coveragesData.sort((a, b) => (a.name > b.name ? 1 : -1)));
        })
      : setCoverages([]);
  }, [routesGenerator.tasksGroupCoverages]);

  const onWindowKeyDown = useCallback((e) => {
    if (e.defaultPrevented) {
      return;
    }

    if (e.key === 'Escape') {
      routesGenerator.setSelectedTaskGuids([]);
    }
  }, []);

  const onWindowTouchEnd = useCallback((e) => {
    if (e.defaultPrevented) {
      return;
    }
    routesGenerator.setSelectedTaskGuids([]);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', onWindowKeyDown);
    window.addEventListener('touchend', onWindowTouchEnd);

    return () => {
      window.removeEventListener('keydown', onWindowKeyDown);
      window.removeEventListener('touchend', onWindowTouchEnd);
    };
  }, [onWindowKeyDown, onWindowTouchEnd]);

  return (
    <Spin spinning={routesGenerator.isLoadingTasksList || routesGenerator.isLoadingGroupCoverages}>
      {routesGenerator.isGroupList ? (
        <Droppable droppableId="source" isDropDisabled>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <div style={{ display: 'none' }}>{provided.placeholder}</div>
              {columnGroupData && coverages && coverages.length > 0 ? (
                coverages.map(
                  (item, index) =>
                    columnGroupData[item.guid] && (
                      <RenderGroupedRow
                        key={index}
                        index={index}
                        data={columnGroupData[item.guid]}
                        coverageGuid={item.guid}
                        coverage={item}
                      />
                    ),
                )
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          )}
        </Droppable>
      ) : (
        <Droppable droppableId="source" isDropDisabled>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <div style={{ display: 'none' }}>{provided.placeholder}</div>
              {columnData.length > 0 ? (
                columnData.map((item, index) => <RenderRow key={index} task={item} index={index} />)
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          )}
        </Droppable>
      )}
    </Spin>
  );
};

export default inject('routesGenerator')(observer(RoutesGeneratorTasksList));
