import './style.less';

import { Link, Redirect, RouteComponentProps } from 'react-router-dom';
import React, { ReactNode } from 'react';
import { inject, observer } from 'mobx-react';

import { CoreStore } from 'modules/core/stores/CoreStore';
import Loader from 'modules/common/containers/Loader';
import { Location } from 'history';
import LoginForm from 'modules/core/components/LoginForm';
import { RouterStore } from 'mobx-react-router';
import { Spin } from 'antd';
import Title from 'modules/common/components/Title';

const year: number = new Date().getFullYear();

interface IProps extends RouteComponentProps {
  core?: CoreStore;
  router?: RouterStore;
  location: Location<{ from: { pathname: string } }>;
}

class Login extends React.Component<IProps> {
  loader = (<Loader show size={7} />);

  render(): ReactNode {
    const { loginIsLoading, token } = this.props.core;
    const { location } = this.props;

    if (token) {
      const { from } = location.state || { from: { pathname: '/' } };

      return <Redirect to={from} />;
    }

    return (
      <div className="login">
        <Spin
          indicator={this.loader}
          spinning={loginIsLoading}
          wrapperClassName="login__content"
          className="login__loader"
        >
          <div className="login__form">
            <Title className="login__title">MAG Delivery</Title>
            <LoginForm />
          </div>
        </Spin>
        <footer className="login__footer">
          <div
            style={{
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            {year}
          </div>
          <Link to="/privacy">Политика конфиденциальности</Link>
        </footer>
      </div>
    );
  }
}

export default inject('core', 'router')(observer(Login));
