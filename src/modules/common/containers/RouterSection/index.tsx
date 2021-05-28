import React, { ReactNode } from 'react';
import { Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import { SECTION_DATA, SECTION_LIST } from './constants';
import { inject, observer } from 'mobx-react';

import { CoreStore } from 'modules/core/stores/CoreStore';
import Loader from 'modules/common/containers/Loader';
import { Spin } from 'antd';

interface IProps extends RouteComponentProps<{ section: string }> {
  core?: CoreStore;
}

class RouterSection extends React.Component<IProps> {
  checkAccess = (menuItem) => {
    if (!menuItem.access) {
      return true;
    }
    if (typeof menuItem.access === 'string') {
      return !!this.props.core.permissions[menuItem.access];
    }
    return menuItem.access.reduce((acc, item) => {
      return !!this.props.core.permissions[item] && acc;
    }, true);
  };

  checkPlace = (sectionName: string): boolean => {
    const section = SECTION_DATA[sectionName];

    return section && this.checkAccess(section);
  };

  renderSection = (sectionName: string): ReactNode => {
    const Section = SECTION_DATA[sectionName].component;
    return <Section />;
  };

  redirectSection = (): ReactNode => {
    const sectionName = SECTION_LIST.find(this.checkPlace);

    if (sectionName) {
      return <Redirect to={`/${sectionName}`} />;
    }

    return null;
  };

  render(): ReactNode {
    const { match, core } = this.props;

    if (!core.accountIsLoading && !core.permissionsIsLoading) {
      const sectionName = match.params.section;

      if (sectionName && this.checkPlace(sectionName)) {
        return this.renderSection(sectionName);
      }

      return this.redirectSection();
    } else {
      return (
        <Spin
          indicator={<Loader show />}
          spinning={true}
          wrapperClassName="locations__form-footer"
        />
      );
    }
  }
}

export default withRouter(inject('core')(observer(RouterSection)));
