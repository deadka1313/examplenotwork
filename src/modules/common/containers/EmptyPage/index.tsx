import './style.less';

import { Link } from 'react-router-dom';
import React from 'react';
import { routerStore } from 'modules/common/containers/App';

type IEmptyPageProps = {
  description?: string;
  header?: string;
  icon?: string;
};

const EmptyPage: React.FC<IEmptyPageProps> = ({ description, header, icon }) => {
  return (
    <div className="empty-page">
      <div className="empty-page__inner">
        {icon && <img alt="" className="empty-page__icon" src={icon} />}
        {header && <div className="empty-page__header">{header}</div>}
        {description && <div className="empty-page__description">{description}</div>}
        <div className="empty-page__navigation">
          Вернуться{' '}
          <a href="#" onClick={routerStore.goBack}>
            Назад
          </a>{' '}
          или на <Link to="/">Главную</Link>
        </div>
      </div>
    </div>
  );
};

export default EmptyPage;
