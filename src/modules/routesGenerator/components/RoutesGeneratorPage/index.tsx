import './style.less';

import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { DragDropContext } from 'react-beautiful-dnd';
import { RouterStore } from 'mobx-react-router';
import RoutesGeneratorRouteDraft from '../RoutesGeneratorRouteDraft';
import RoutesGeneratorSource from '../RoutesGeneratorSource';
import { RoutesGeneratorStore } from 'modules/routesGenerator/stores/RoutesGeneratorStore';
import Title from 'modules/common/components/Title';

interface IProps {
  baseUrl: string;
  router?: RouterStore;
  routesGenerator?: RoutesGeneratorStore;
}

const RoutesGeneratorPage = ({ baseUrl, router, routesGenerator }: IProps) => {
  const handleBackLink = (): void => {
    router.push(baseUrl);
  };

  useEffect(() => {
    if (!routesGenerator.routeSettings.deliveryDate) {
      router.push(baseUrl);
    }

    return (): void => {
      routesGenerator.refreshStore();
    };
  }, []);

  return (
    <div className="routes-generator-page">
      {routesGenerator.routeSettings.deliveryDate && (
        <>
          <div className="routes-generator-page__header">
            <Title size={Title.SIZE.H2} weight={Title.WEIGHT.SEMIBOLD}>
              <a className="routes-generator-page__back-link" onClick={handleBackLink}>
                <ArrowLeftOutlined />
              </a>
              Генератор маршрутов
            </Title>
          </div>
          <div className="routes-generator-page__content">
            <DragDropContext
              onBeforeCapture={routesGenerator.onBeforeCapture}
              onDragEnd={routesGenerator.onDragEnd}
            >
              <RoutesGeneratorSource />
              <RoutesGeneratorRouteDraft />
            </DragDropContext>
          </div>
        </>
      )}
    </div>
  );
};

export default inject('router', 'routesGenerator')(observer(RoutesGeneratorPage));
