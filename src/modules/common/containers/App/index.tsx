import { ConfigProvider, Empty } from 'antd';
import React, { ReactNode } from 'react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';

import { ClientGroupsStore } from 'modules/client-groups/stores/ClientGroupsStore';
import { CoreStore } from 'modules/core/stores/CoreStore';
import { CourierDirectoryStore } from 'modules/couriers/stores/CourierDirectoryStore';
import { CouriersStore } from 'modules/couriers/stores/CouriersStore';
import { CoverageStore } from 'modules/coverages/stores/CoverageStore';
import { CurrencyStore } from 'modules/currency/stores/CurrencyStore';
import { DeliveryMethodsStore } from 'modules/delivery-methods/stores/DeliveryMethodsStore';
import { LocationsStore } from 'modules/locations/stores/LocationsStore';
import { OrdersStore } from 'modules/orders/stores/OrdersStore';
import { Provider } from 'mobx-react';
import { RatesStore } from 'modules/rates/stores/RatesStore';
import { Router as ReactRouter } from 'react-router';
import Router from 'modules/common/components/Router';
import { RoutesGeneratorStore } from 'modules/routesGenerator/stores/RoutesGeneratorStore';
import { RoutesStore } from 'modules/routes/stores/RoutesStore';
import { SchedulesStore } from 'modules/schedules/stores/SchedulesStore';
import { ServiceZonesStore } from 'modules/service-zones/stores/ServiceZonesStore';
import { ShopsStore } from 'modules/shops/stores/ShopsStore';
import { TasksStore } from 'modules/tasks/stores/TasksStore';
import { TransportStore } from 'modules/transports/stores/TransportStore';
import { UserStore } from 'modules/user/stores/UserStore';
import { WarehousesStore } from 'modules/warehouses/stores/WarehousesStore';
import history from 'helpers/browser-history';
import ruRU from 'antd/es/locale/ru_RU';

export const routerStore = new RouterStore();
const courierDirectoryStore = new CourierDirectoryStore();
const coreStore = new CoreStore();
const couriersStore = new CouriersStore();
const coverageStore = new CoverageStore();
const schedulesStore = new SchedulesStore();
const userStore = new UserStore();
const transportStore = new TransportStore();
const locationsStore = new LocationsStore();
const warehousesStore = new WarehousesStore();
const serviceZonesStore = new ServiceZonesStore();
const clientGroupsStore = new ClientGroupsStore();
const deliveryMethodsStore = new DeliveryMethodsStore();
const ratesStore = new RatesStore();
const ordersStore = new OrdersStore();
const shopsStore = new ShopsStore();
const tasksStore = new TasksStore();
const routesStore = new RoutesStore();
const routesGeneratorStore = new RoutesGeneratorStore();
const currencyStore = new CurrencyStore();

const stores = {
  router: routerStore,
  core: coreStore,
  courierDirectory: courierDirectoryStore,
  couriers: couriersStore,
  coverage: coverageStore,
  schedules: schedulesStore,
  user: userStore,
  transport: transportStore,
  locations: locationsStore,
  warehouses: warehousesStore,
  serviceZones: serviceZonesStore,
  clientGroups: clientGroupsStore,
  deliveryMethods: deliveryMethodsStore,
  rates: ratesStore,
  orders: ordersStore,
  shops: shopsStore,
  tasks: tasksStore,
  routes: routesStore,
  routesGenerator: routesGeneratorStore,
  currency: currencyStore,
};

export default class App extends React.Component {
  renderEmpty = (): ReactNode => <Empty />;

  render(): ReactNode {
    const locale = {
      ...ruRU,
      DatePicker: {
        ...ruRU.DatePicker,
        lang: {
          ...ruRU.DatePicker.lang,
          placeholder: 'Дата',
        },
      },
    };

    return (
      <Provider {...stores}>
        <ReactRouter history={syncHistoryWithStore(history, routerStore)}>
          <ConfigProvider renderEmpty={this.renderEmpty} locale={locale}>
            <Router />
          </ConfigProvider>
        </ReactRouter>
      </Provider>
    );
  }
}
