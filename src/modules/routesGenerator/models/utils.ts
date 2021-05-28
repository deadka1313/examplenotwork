import {
  IRouteDraft,
  ISettingsData,
  ITaskForCompatibility,
} from 'modules/routesGenerator/models/types';

import { ITasks } from 'modules/tasks/models/types';
import React from 'react';

export interface IMultiDragAwareReorderArgs {
  tasksListSource: ITasks[];
  routeDraftList: IRouteDraft[];
  selectedTaskGuids: React.Key[];
  droppableId: string;
}

export const concurrenceCheck = (task: ITasks, guids: React.Key[]): boolean => {
  for (let i = 0; i < guids.length; i++) {
    if (task.guid === guids[i]) {
      return true;
    }
  }
  return false;
};

export const reorderMultiDrag = ({
  tasksListSource,
  routeDraftList,
  selectedTaskGuids,
  droppableId,
}: IMultiDragAwareReorderArgs): ITasks[] => {
  const newTasksListRouteDraft: ITasks[] =
    droppableId !== 'new' ? routeDraftList[Number(droppableId)].tasksList : [];
  const newTasksListSource = tasksListSource;
  for (let i = 0; i < newTasksListSource.length; i++) {
    if (concurrenceCheck(newTasksListSource[i], selectedTaskGuids)) {
      newTasksListRouteDraft.push(newTasksListSource[i]);
    }
  }

  return newTasksListRouteDraft;
};

export const tasksSortByTimeSlots = (tasks: ITasks[]): ITasks[] => {
  return tasks.sort((a, b) => {
    if (a.time_slot_start < b.time_slot_start) {
      return -1;
    } else if (a.time_slot_start > b.time_slot_start) {
      return 1;
    }
    if (a.time_slot_end < b.time_slot_end) {
      return -1;
    } else if (a.time_slot_end > b.time_slot_end) {
      return 1;
    }
    return 0;
  });
};

export const checkTaskForCompatibility = (
  tasks: ITasks[],
  settingsData: ISettingsData,
): ITaskForCompatibility => {
  let error: string = null;
  const tasksCheckError: ITasks[] = tasks.map((task) => {
    const problems: string[] = [];
    if (
      settingsData.transport &&
      Array.isArray(settingsData.transport.warehouses) &&
      !settingsData.transport.warehouses.some((item) => item.guid === task.warehouse_guid)
    ) {
      problems.push('Склад не совпадает с доступным автомобилю');
      error = 'Автомобиль не поедет: есть задания с недоступным способом доставки';
    }
    if (
      settingsData.profile &&
      Array.isArray(settingsData.profile.warehouses) &&
      !settingsData.profile.warehouses.some((item) => item.guid === task.warehouse_guid)
    ) {
      problems.push('Склад не совпадает с доступным курьеру');
      error = 'Курьер не поедет: есть задания с недоступным складом';
    }
    if (
      settingsData.transport &&
      Array.isArray(settingsData.transport.delivery_methods) &&
      !settingsData.transport.delivery_methods.some(
        (item) => item.guid === task.delivery_method_guid,
      )
    ) {
      problems.push('Способ доставки не совпадает с доступным автомобилю');
      error = 'Автомобиль не поедет: есть задания с недоступным способом доставки';
    }
    return { ...task, problems };
  });

  return {
    tasks: tasksCheckError,
    error,
  };
};
