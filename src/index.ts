import 'style/index.less';

import { start } from './start';

const root: HTMLElement | null = document.getElementById('root');

if (root) {
  start(root);
}
