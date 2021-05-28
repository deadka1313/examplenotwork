import App from 'modules/common/containers/App';
import React from 'react';
import { render } from 'react-dom';

export async function start(root: HTMLElement) {
  render(<App />, root);

  if (module.hot) {
    module.hot.accept('modules/common/containers/App', () => render(<App />, root));
  }
}
