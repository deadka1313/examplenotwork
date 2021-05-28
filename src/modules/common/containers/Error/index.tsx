import React, { ReactNode } from 'react';
import { inject, observer } from 'mobx-react';

import { CoreStore } from 'modules/core/stores/CoreStore';
import EmptyPage from 'modules/common/containers/EmptyPage';
import Layout from 'modules/common/containers/Layout';
import Loader from 'modules/common/containers/Loader';
import { Redirect } from 'react-router-dom';
import { Spin } from 'antd';
import img403 from 'img/403.svg';
import img404 from 'img/404.svg';
import img500 from 'img/500.svg';

interface IErrorProps {
  history: any;
  location: any;
  core?: CoreStore;
}

const iconMap = {
  '403': img403,
  '404': img404,
  '500': img500,
};

class Error extends React.Component<IErrorProps> {
  static getIcon(state): string {
    if (state && state.status) {
      return iconMap[state.status];
    }
    return iconMap['404'];
  }

  getErrorTitle = (prev, error) => {
    if (error.title) {
      return [...prev, error.title];
    }

    return prev;
  };

  renderMain(state): ReactNode {
    return (
      <EmptyPage
        description={this.getDescription(state)}
        header={this.getHeader(state)}
        icon={Error.getIcon(state)}
      />
    );
  }

  getDescription(state): string {
    if (state && state.data && state.data.errors.length > 0) {
      const errorTitleList = state.data.errors.reduce(this.getErrorTitle, []);
      return errorTitleList.join('; ');
    }
    return '';
  }

  getHeader(state): string {
    if (state && state.status) {
      return `Ошибка ${state.status}`;
    }
    return 'Что-то пошло не так';
  }

  render(): ReactNode {
    const { location } = this.props;

    if (location && location.state) {
      if (!this.props.core.accountIsLoading && !this.props.core.permissionsIsLoading) {
        return <Layout showMenu={false}>{this.renderMain(location.state)}</Layout>;
      } else {
        return <Spin indicator={<Loader show />} spinning={true} />;
      }
    }

    return <Redirect to="/" />;
  }
}

export default inject('core')(observer(Error));
