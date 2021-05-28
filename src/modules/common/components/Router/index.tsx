import React, { FC, ReactNode } from 'react';
import { Redirect, Route, RouteProps, Switch } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import { CoreStore } from 'modules/core/stores/CoreStore';
import Error from 'modules/common/containers/Error';
import Login from 'modules/core/components/Login';
import Privacy from 'modules/common/containers/Privacy';
import RouterSection from 'modules/common/containers/RouterSection';

interface IProps {
  core?: CoreStore;
}

interface IPrivateRoute extends RouteProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any;
  token: string;
}

const PrivateRoute: FC<IPrivateRoute> = ({ component: Component, token, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props): ReactNode =>
        token ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

const Router: FC<IProps> = ({ core }) => {
  return (
    <Switch>
      <Route component={Login} exact path="/login" />
      <Route component={Privacy} exact path="/privacy" />
      <PrivateRoute component={Error} path="/error" token={core.token} />
      <PrivateRoute component={RouterSection} path="/:section" token={core.token} />
      <PrivateRoute component={RouterSection} path="/" token={core.token} />
    </Switch>
  );
};

export default inject('core')(observer(Router));
