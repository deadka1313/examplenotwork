import { BeforeCapture, DropResult } from 'react-beautiful-dnd';
import {
  ICalculatedPreRoute,
  INotCoverage,
  IRouteCalculateForm,
  IRouteCreateForm,
  IRouteDraft,
  IRouteSettings,
  ITasksGroupCoverages,
} from 'modules/routesGenerator/models/types';
import { ICouriersCreateSessionPayload, ISession } from 'modules/couriers/models/types';
import { ITasks, ITasksFilter } from 'modules/tasks/models/types';
import { action, computed, makeObservable, observable, toJS } from 'mobx';
import {
  checkTaskForCompatibility,
  concurrenceCheck,
  reorderMultiDrag,
  tasksSortByTimeSlots,
} from '../models/utils';

import CouriersApi from 'modules/couriers/api/CouriersApi';
import CoveragesApi from 'modules/coverages/api/CoveragesApi';
import { ICoverage } from 'modules/coverages/models/types';
import { IRoute } from 'modules/routes/models/types';
import React from 'react';
import { RestException } from 'api/RestException';
import RoutesGeneratorApi from '../api/RoutesGeneratorApi';
import TasksApi from 'modules/tasks/api/TasksApi';
import WarehousesApi from 'modules/warehouses/api/WarehousesApi';
import { dateFormat } from 'helpers/string';
import { getDateTime } from 'helpers/date';
import groupBy from 'lodash.groupby';
import { initialFilter as initialFilterTasks } from 'modules/tasks/models/initial';
import { initialRouteSettings } from 'modules/routesGenerator/models/initial';
import mapValues from 'lodash.mapvalues';
import moment from 'moment';
import { notification } from 'antd';
import omit from 'lodash.omit';
import uniqBy from 'lodash.uniqby';

export class RoutesGeneratorStore {
  currency: string = null;

  routeSettings: IRouteSettings = initialRouteSettings;
  filterTasks: ITasksFilter = initialFilterTasks;
  isLoadingTasksList = false;
  tasksGroupCoverages: ITasksGroupCoverages = null;
  isGroupList = true;
  isLoadingGroupCoverages = false;

  tasksListSource: ITasks[] = [];
  routeDraftList: IRouteDraft[] = [];
  movedTasksToRouteGuids: React.Key[] = [];
  draggingTaskGuid: string = null;
  selectedTaskGuids: React.Key[] = [];

  openCardRouteDraftIndex: number = null;

  constructor() {
    makeObservable(this, {
      currency: observable,
      routeSettings: observable,
      filterTasks: observable,
      tasksGroupCoverages: observable,
      isLoadingTasksList: observable,
      tasksListSource: observable,
      isGroupList: observable,
      isLoadingGroupCoverages: observable,
      routeDraftList: observable,
      movedTasksToRouteGuids: observable,
      draggingTaskGuid: observable,
      selectedTaskGuids: observable,
      openCardRouteDraftIndex: observable,
      filterTasksDuplicates: action.bound,
      getTasksListSource: computed,
      getTasksListSourceGroupedByCoverages: computed,
      setCurrency: action.bound,
      setIsGroupList: action.bound,
      setOpenCardRouteDraftIndex: action.bound,
      setFilterTasksValue: action.bound,
      setFilterTasks: action.bound,
      getTasksForRouteWrapperLoading: action.bound,
      setTaskGroupCoverage: action.bound,
      getTasksForRoute: action.bound,
      setupRouteSettings: action.bound,
      removeTaskFromRouteDraft: action.bound,
      removeRoute: action.bound,
      getSelectedTaskGuids: action.bound,
      getCoverages: action.bound,
      setTasksListSource: action.bound,
      setColumnGroupDataCoverage: action.bound,
      setMovedTasksToRouteGuids: action.bound,
      setRouteDraftList: action.bound,
      setRouteDraftError: action.bound,
      setCourierDataRouteDraft: action.bound,
      setDraggingTaskGuid: action.bound,
      setSelectedTaskGuids: action.bound,
      onDragEnd: action.bound,
      onBeforeCapture: action.bound,
      createRoute: action.bound,
      createCourierSession: action.bound,
      calculateRoute: action.bound,
      toggleSelectionTask: action.bound,
      toggleSelectionList: action.bound,
      moveSelectedTasksToRoute: action.bound,
      refreshStore: action.bound,
    });
  }

  setCurrency(currency: string): void {
    this.currency = currency;
  }

  setIsGroupList(isGroupList: boolean): void {
    this.isGroupList = isGroupList;
  }

  setOpenCardRouteDraftIndex(index: number): void {
    this.openCardRouteDraftIndex = index;
  }

  setTasksListSource(tasks: ITasks[]): void {
    const tasksNotError: ITasks[] = tasks.map((item) => {
      return { ...item, problems: null };
    });
    this.tasksListSource = tasksNotError;
    const tasksGroupCoverages = mapValues(groupBy(tasksNotError, 'coverage_guid'), (clist) =>
      clist.map((task) => omit(task, 'coverage_guid')),
    );
    let newTasksGroupCoverages = null;
    Object.keys(tasksGroupCoverages).map((coverageGuid) => {
      newTasksGroupCoverages = {
        ...newTasksGroupCoverages,
        [coverageGuid]: {
          tasks: tasksGroupCoverages[coverageGuid],
        },
      };
    });
    this.tasksGroupCoverages = newTasksGroupCoverages;
  }

  setColumnGroupDataCoverage(key: string, coverage: ICoverage | INotCoverage): void {
    this.tasksGroupCoverages[key] = {
      ...this.tasksGroupCoverages[key],
      coverage,
    };
  }

  setMovedTasksToRouteGuids(guids: React.Key[]): void {
    this.movedTasksToRouteGuids = guids;
  }

  filterTasksDuplicates(tasks: ITasks[]): ITasks[] {
    return tasks.filter((item) => !concurrenceCheck(item, this.movedTasksToRouteGuids));
  }

  get getTasksListSource(): ITasks[] {
    const filterTasks = this.tasksListSource.slice();
    if (this.movedTasksToRouteGuids.length > 0) {
      return this.filterTasksDuplicates(filterTasks);
    }
    return this.tasksListSource;
  }

  get getTasksListSourceGroupedByCoverages(): ITasksGroupCoverages {
    return this.tasksGroupCoverages;
  }

  setFilterTasksValue(key: string, value: string | string[] | boolean | number): void {
    this.filterTasks[key] = value;
  }

  setFilterTasks(filter: ITasksFilter): void {
    this.filterTasks = filter;
  }

  refreshStore(): void {
    this.routeSettings = initialRouteSettings;
    this.filterTasks = initialFilterTasks;
    this.routeDraftList = [];
    this.tasksListSource = [];
    this.movedTasksToRouteGuids = [];
    this.selectedTaskGuids = [];
    this.openCardRouteDraftIndex = null;
    this.tasksGroupCoverages = null;
  }

  async getTasksForRouteWrapperLoading(filter: ITasksFilter = this.filterTasks): Promise<ITasks[]> {
    this.isLoadingTasksList = true;
    try {
      const res = await this.getTasksForRoute(filter);
      this.isLoadingTasksList = false;
      this.setTasksListSource(res);
      this.setFilterTasks(filter);
      return res;
    } catch (e) {
      this.isLoadingTasksList = false;
    }
  }

  async setTaskGroupCoverage(): Promise<(ICoverage | INotCoverage)[]> {
    try {
      const coveragesData: (ICoverage | INotCoverage)[] = [];
      this.isLoadingGroupCoverages = true;
      const keys = Object.keys(this.tasksGroupCoverages);
      for (let i = 0; i < keys.length; i++) {
        let coverageData: ICoverage | INotCoverage = null;
        if (keys[i] !== 'null') {
          const { data: res } = await CoveragesApi.getCoverage(keys[i]);
          coverageData = res.data;
        } else {
          coverageData = {
            guid: 'null',
            name: 'Без покрытия',
          };
        }
        coveragesData.push(coverageData);
      }
      coveragesData.map((item) => {
        this.setColumnGroupDataCoverage(item.guid, item);
      });
      this.isLoadingGroupCoverages = false;
      return coveragesData;
    } catch (e) {
      this.isLoadingGroupCoverages = false;
    }
  }

  async getTasksForRoute(filter: ITasksFilter = this.filterTasks): Promise<ITasks[]> {
    try {
      const availableStatuses = ['new'];
      const pageSizeMax = 100;

      const { data: res } = await TasksApi.getTasksList({
        ...filter,
        status: availableStatuses,
        pageSize: pageSizeMax,
        current: 1,
      });

      const count = Math.ceil(res.pagination.total / res.pagination.page_size);
      if (count > 1) {
        const promises = [];
        for (let i = 2; i <= count; i++) {
          promises.push(
            TasksApi.getTasksList({
              ...filter,
              status: availableStatuses,
              pageSize: pageSizeMax,
              current: i,
            }),
          );
        }
        return [
          ...res.data,
          ...(await Promise.all(promises)).reduce(
            (acc, response) => [...acc, ...response.data.data],
            [],
          ),
        ];
      }

      return res.data;
    } catch (e) {
      throw new RestException(e);
    }
  }

  setupRouteSettings(settings: IRouteSettings): void {
    this.routeSettings = settings;
    this.filterTasks = {
      ...this.filterTasks,
      ...settings,
      deliveryDate: settings.deliveryDate.format(dateFormat.search),
    };
  }

  setRouteDraftList(tasks: ITasks[], index: number, coverages?: ICoverage[]): void {
    const taskForCompatibility = checkTaskForCompatibility(tasks, this.routeDraftList[index]);
    this.routeDraftList[index] = {
      ...this.routeDraftList[index],
      isCalculated: false,
      tasksList: tasksSortByTimeSlots(taskForCompatibility.tasks),
      error: taskForCompatibility.error,
      coverages: coverages || this.routeDraftList[index].coverages,
    };
  }

  setRouteDraftError(index: number, error: string): void {
    this.routeDraftList[index].error = error;
  }

  setCourierDataRouteDraft(courierData: IRouteDraft, index: number): void {
    const taskForCompatibility = checkTaskForCompatibility(
      this.routeDraftList[index].tasksList,
      courierData,
    );
    this.routeDraftList[index] = {
      ...this.routeDraftList[index],
      ...courierData,
      tasksList: tasksSortByTimeSlots(taskForCompatibility.tasks),
      error: taskForCompatibility.error,
      isCalculated: false,
    };
  }

  setDraggingTaskGuid(guid: string): void {
    this.draggingTaskGuid = guid;
  }

  setSelectedTaskGuids(guids: React.Key[]): void {
    this.selectedTaskGuids = guids;
  }

  removeTaskFromRouteDraft(task: ITasks, index: number): void {
    const tasks = this.routeDraftList[index].tasksList.filter((item) => {
      if (item.guid === task.guid) {
        this.setMovedTasksToRouteGuids(
          this.movedTasksToRouteGuids.filter((guid) => guid !== item.guid),
        );
        return false;
      } else {
        return true;
      }
    });
    const coveragesGuids = uniqBy(
      tasks.map((item) => {
        return item.coverage_guid !== null ? item.coverage_guid : 'null';
      }),
    );
    const coverages = coveragesGuids.map((guid) =>
      this.routeDraftList[index].coverages.find((item) => item.guid === guid),
    );
    this.routeDraftList[index] = {
      ...this.routeDraftList[index],
      tasksList: tasks,
      isCalculated: false,
      coverages,
      error: null,
    };
  }

  removeRoute(index: number): void {
    this.routeDraftList = this.routeDraftList.filter((item, indexItem) => {
      if (indexItem === index) {
        let movedTasksToRouteGuids = this.movedTasksToRouteGuids.slice();
        item.tasksList.map((task) => {
          movedTasksToRouteGuids = movedTasksToRouteGuids.filter((guid) => {
            return guid !== task.guid;
          });
        });
        this.setMovedTasksToRouteGuids(movedTasksToRouteGuids);
        return false;
      } else {
        return true;
      }
    });
  }

  getSelectedTaskGuids(draggableId: string): React.Key[] {
    if (draggableId.indexOf('coverage=') !== -1) {
      return [
        ...this.filterTasksDuplicates(
          this.getTasksListSourceGroupedByCoverages[draggableId.replace('coverage=', '')].tasks,
        ).map((item) => item.guid),
        ...this.selectedTaskGuids,
      ];
    } else {
      return this.selectedTaskGuids.length > 0 ? this.selectedTaskGuids : [draggableId];
    }
  }

  getCoverages(tasks: ITasks[]): ICoverage[] {
    const coveragesGuids = uniqBy(
      tasks.map((item) => {
        return item.coverage_guid !== null ? item.coverage_guid : 'null';
      }),
    );
    return coveragesGuids.map((guid) =>
      guid !== 'null'
        ? this.tasksGroupCoverages[guid].coverage
        : {
            guid: 'null',
            name: 'Без покрытия',
          },
    );
  }

  onDragEnd(result: DropResult): void {
    const destination = result.destination;

    const isNotDragging =
      !destination ||
      result.reason === 'CANCEL' ||
      (destination.droppableId !== 'new' &&
        this.routeDraftList[Number(destination.droppableId)].isLoadingCard);

    if (isNotDragging) {
      this.setDraggingTaskGuid(null);
      return;
    }

    const selectedTaskGuids = this.getSelectedTaskGuids(result.draggableId);

    const newTasksListRouteDraft = reorderMultiDrag({
      tasksListSource: toJS(this.tasksListSource).slice(),
      routeDraftList: toJS(this.routeDraftList).slice(),
      selectedTaskGuids: toJS(selectedTaskGuids).slice(),
      droppableId: destination.droppableId,
    });

    this.setMovedTasksToRouteGuids([...this.movedTasksToRouteGuids, ...selectedTaskGuids]);
    if (destination.droppableId === 'new') {
      const coverages = this.getCoverages(newTasksListRouteDraft);
      this.routeDraftList.unshift({
        tasksList: newTasksListRouteDraft,
        isLoadingCard: false,
        isCalculated: false,
        error: null,
        coverages,
      });
    } else {
      const filterNewTasksListRouteDraft = newTasksListRouteDraft.filter(
        (item) =>
          !this.routeDraftList[destination.droppableId].tasksList.some(
            (task) => task.guid === item.guid,
          ),
      );
      const coverages = [
        ...this.routeDraftList[destination.droppableId].coverages,
        ...this.getCoverages(filterNewTasksListRouteDraft.slice()),
      ];
      this.setRouteDraftList(
        newTasksListRouteDraft,
        Number(destination.droppableId),
        uniqBy(coverages),
      );
    }

    this.setSelectedTaskGuids([]);
    this.setDraggingTaskGuid(null);
  }

  moveSelectedTasksToRoute(): void {
    const droppableId =
      this.openCardRouteDraftIndex !== null ? this.openCardRouteDraftIndex.toString() : 'new';

    const newTasksListRouteDraft = reorderMultiDrag({
      tasksListSource: toJS(this.tasksListSource).slice(),
      routeDraftList: toJS(this.routeDraftList).slice(),
      selectedTaskGuids: toJS(this.selectedTaskGuids).slice(),
      droppableId,
    });

    this.setMovedTasksToRouteGuids([...this.movedTasksToRouteGuids, ...this.selectedTaskGuids]);

    if (droppableId === 'new') {
      const coverages = this.getCoverages(newTasksListRouteDraft);
      this.routeDraftList.unshift({
        tasksList: newTasksListRouteDraft,
        isLoadingCard: false,
        isCalculated: false,
        error: null,
        coverages,
      });
    } else {
      const filterNewTasksListRouteDraft = newTasksListRouteDraft.filter(
        (item) =>
          !this.routeDraftList[droppableId].tasksList.some((task) => task.guid === item.guid),
      );
      const coverages = [
        ...this.routeDraftList[droppableId].coverages,
        ...this.getCoverages(filterNewTasksListRouteDraft.slice()),
      ];
      this.setRouteDraftList(newTasksListRouteDraft, Number(droppableId), uniqBy(coverages));
    }

    this.setSelectedTaskGuids([]);
  }

  onBeforeCapture(before: BeforeCapture): void {
    const draggableId = before.draggableId;
    this.setDraggingTaskGuid(draggableId);
  }

  async createRoute(index: number): Promise<IRoute> {
    try {
      this.routeDraftList[index].isLoadingCard = true;
      const data: IRouteCreateForm = {
        date_time_planned_finish: moment(this.routeDraftList[index].finish.datetime).format(),
        date_time_planned_start: moment(this.routeDraftList[index].start.datetime).format(),
        session_guid: this.routeDraftList[index].sessionGuid,
        tasks: this.routeDraftList[index].tasksList.map((t) => ({
          guid: t.guid,
          planned_delivery_time: t.planned_delivery_time,
        })),
      };
      const { data: res } = await RoutesGeneratorApi.createRoute(data);
      notification.success({ message: 'Маршрут создан' });
      this.setOpenCardRouteDraftIndex(null);
      return res.data;
    } catch (e) {
      this.routeDraftList[index].isLoadingCard = false;
      if (e && e.data && e.data.errors && e.data.errors.length > 0) {
        this.routeDraftList[index].error = e.data.errors[0].error;
      }
      throw new RestException(e);
    }
  }

  async createCourierSession(data: ICouriersCreateSessionPayload): Promise<ISession> {
    try {
      this.routeDraftList.map((routeDraft, i) => {
        if (routeDraft.courierGuid === data.courier_guid) {
          this.routeDraftList[i] = {
            ...this.routeDraftList[i],
            isLoadingCard: true,
          };
        }
      });
      const { data: res } = await CouriersApi.createCourierSession(data);
      await this.routeDraftList.map((routeDraft, i) => {
        if (routeDraft.courierGuid === data.courier_guid) {
          this.routeDraftList[i] = {
            ...this.routeDraftList[i],
            sessionGuid: res.data.guid,
            isLoadingCard: false,
          };
        }
      });
      return res.data;
    } catch (e) {
      throw new RestException(e);
    }
  }

  async calculateRoute(index: number): Promise<ICalculatedPreRoute> {
    try {
      this.routeDraftList[index].isLoadingCard = true;
      const { data: warehouse } = await WarehousesApi.getWarehouse(
        this.routeDraftList[index].tasksList[0].warehouse_guid,
      );

      const data: IRouteCalculateForm = {
        courier_guid: this.routeDraftList[index].courierGuid,
        task_guids: this.routeDraftList[index].tasksList.map((t) => t.guid),
        transport_guid: this.routeDraftList[index].transportGuid,
        route_start_time: getDateTime(
          this.routeSettings.deliveryDate,
          this.routeDraftList[index].time,
          warehouse.data.timezone,
        ),
      };
      const { data: res } = await RoutesGeneratorApi.calculateRoute(data);
      notification.success({ message: 'Маршрут рассчитан' });
      const preRoute = {
        ...res.data,
        // в таске меняю статус, чтобы отрисовать "специальную" иконку вместо обычной
        task_list: res.data.task_list.map((t) => ({ ...t, status: 'in_pre_route' })),
      };
      this.routeDraftList[index] = {
        ...this.routeDraftList[index],
        tasksList: preRoute.task_list,
        start: preRoute.start,
        finish: preRoute.finish,
        isLoadingCard: false,
        isCalculated: true,
        warehouse: warehouse.data,
      };
      return res.data;
    } catch (e) {
      this.routeDraftList[index].isLoadingCard = false;
      throw new RestException(e);
    }
  }

  toggleSelectionTask = (taskGuid: string): void => {
    const taskIndex = this.selectedTaskGuids.indexOf(taskGuid);

    if (taskIndex === -1) {
      this.setSelectedTaskGuids([...this.selectedTaskGuids, taskGuid]);

      return;
    }

    const shallow = [...this.selectedTaskGuids];
    shallow.splice(taskIndex, 1);

    this.setSelectedTaskGuids(shallow);
  };

  toggleSelectionList = (taskGuid: string[]): void => {
    this.setSelectedTaskGuids(uniqBy([...this.selectedTaskGuids, ...taskGuid]));
  };
}
