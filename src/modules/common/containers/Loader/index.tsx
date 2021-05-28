import './style.less';

import React, { ReactNode } from 'react';

const itemCount = 3;
const itemTypeCount = 3;
const loaderItemList = Array(itemCount).fill(0);

type LoaderTypeProps = {
  show: boolean;
  size: number;
};

class Loader extends React.Component<LoaderTypeProps> {
  static defaultProps = {
    size: 5,
  };

  renderItem = (item: unknown, key: number) => {
    const { size } = this.props;
    const sizePx = `${size}px`;
    const propList = {
      className: `loader__item loader__item_${(key % itemTypeCount) + 1}`,
      style: {
        height: sizePx,
        marginLeft: `${Math.ceil(size / 2)}px`,
        marginRight: `${Math.floor(size / 2)}px`,
        width: sizePx,
      },
    };

    return <div {...propList} key={key} />;
  };

  render(): ReactNode {
    const { show, size } = this.props;
    const propList = {
      className: 'loader',
      style: {
        height: `${size}px`,
      },
    };

    if (show) {
      return <div {...propList}>{loaderItemList.map(this.renderItem)}</div>;
    }

    return null;
  }
}

export default Loader;
