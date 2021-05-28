import './style.less';

import React, { ReactNode } from 'react';

import Header from 'modules/common/components/Header';
import { observer } from 'mobx-react';

interface ILayoutProps {
  children: any;
  showMenu?: boolean;
  showUser?: boolean;
}

class Layout extends React.Component<ILayoutProps> {
  static defaultProps = {
    showMenu: true,
    showUser: true,
  };

  render(): ReactNode {
    const { showMenu, showUser, children } = this.props;
    return (
      <div className="layout">
        <Header showMenu={showMenu} showUser={showUser} />
        <div className="content">{children}</div>
      </div>
    );
  }
}

export default observer(Layout);
