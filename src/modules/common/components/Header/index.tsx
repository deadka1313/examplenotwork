import './style.less';

import { inject, observer } from 'mobx-react';

import { CoreStore } from 'modules/core/stores/CoreStore';
import { CustomIcon } from 'modules/common/containers/CustomIcon';
import { NavLink } from 'react-router-dom';
import React from 'react';

interface IHeaderProps {
  showMenu: boolean;
  showUser: boolean;
  core?: CoreStore;
}

class Header extends React.Component<IHeaderProps> {
  state = {
    isResizing: false,
  };

  constructor(props) {
    super(props);
    this.handleMousemove.bind(this);
  }

  handleLogout = (e) => {
    e.preventDefault();
    this.props.core.logout();
  };

  handleMouseDown = (e) => {
    e.preventDefault();
    this.setState({ isResizing: true });
  };

  handleMousemove = (e) => {
    if (this.state.isResizing) {
      document.body.style.cursor = 'ew-resize';

      this.props.core.toggleHeader(e.clientX > 100);
    }
  };

  handleMouseup = (e) => {
    e.preventDefault();
    this.setState({ isResizing: false });
    document.body.style.cursor = 'default';
  };

  componentDidMount() {
    document.addEventListener('mousemove', (e) => this.handleMousemove(e));
    document.addEventListener('mouseup', (e) => this.handleMouseup(e));
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', (e) => this.handleMousemove(e));
    document.removeEventListener('mouseup', (e) => this.handleMouseup(e));
  }

  render() {
    const isPermitted = (permissions?: string[]): boolean => {
      if (!permissions) {
        return true;
      }
      return permissions.reduce((acc, item) => {
        return !!this.props.core.permissions[item] && acc;
      }, true);
    };

    return (
      <div className={`header ${this.props.core.isHeaderOpened ? 'header--opened' : ''}`}>
        <div className="header__close" onMouseDown={this.handleMouseDown}></div>

        <div className="header__item">
          <NavLink className="header__title header__title--logo" to="/" exact>
            <CustomIcon className="header__title-icon" type="md-logo" />
            {this.props.core.isHeaderOpened && (
              <span className="header__title-text">Mag Delivery</span>
            )}
          </NavLink>
        </div>

        {this.props.showMenu && (
          <>
            {isPermitted(['orders.list', 'tasks.list', 'routes.list', 'courier-sessions.list']) && (
              <div className="header__item">
                <NavLink to="/arm2" className="header__title" title="Планирование">
                  <CustomIcon className="header__title-icon" type="arm" />
                  {this.props.core.isHeaderOpened && (
                    <span className="header__title-text">Планирование</span>
                  )}
                </NavLink>
              </div>
            )}
            {isPermitted(['coverages.list']) && (
              <div className="header__item">
                <NavLink to="/geo" className="header__title" title="Тарификация">
                  <CustomIcon className="header__title-icon" type="geo" />
                  {this.props.core.isHeaderOpened && (
                    <span className="header__title-text">Тарификация</span>
                  )}
                </NavLink>
              </div>
            )}
            {isPermitted() && (
              <div className="header__item">
                <NavLink to="/directories" className="header__title" title="Справочник">
                  <CustomIcon className="header__title-icon" type="dir" />
                  {this.props.core.isHeaderOpened && (
                    <span className="header__title-text">Справочник</span>
                  )}
                </NavLink>
              </div>
            )}
          </>
        )}

        {this.props.showUser && (
          <div className="header__item header__item--logout">
            <a
              href="#"
              onClick={this.handleLogout}
              className="header__title"
              title={`${this.props.core.accountData.name} ${this.props.core.accountData.surname}`}
            >
              <CustomIcon className="header__title-icon" type="logout" />
              {this.props.core.isHeaderOpened && <span className="header__title-text">Выход</span>}
            </a>
          </div>
        )}
      </div>
    );
  }
}

export default inject('core')(observer(Header));
