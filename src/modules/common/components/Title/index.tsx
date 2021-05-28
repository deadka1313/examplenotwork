import * as React from 'react';

import { ReactNode } from 'react';
import classNames from 'classnames/bind';
import styles from './style.less';

const { PureComponent } = React;

const cx = classNames.bind(styles);

export enum Sizes {
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
}

enum Weight {
  NORMAL = 'normal',
  SEMIBOLD = 'semibold',
}

interface IProps {
  size?: Sizes;
  className?: string;
  weight?: Weight;
}

class Title extends PureComponent<IProps> {
  static SIZE = Sizes;
  static WEIGHT = Weight;

  static defaultProps: Partial<IProps> = {
    size: Sizes.H1,
  };

  render(): ReactNode {
    const { size, weight, children, className } = this.props;
    const Tag = size;

    return (
      <Tag
        className={cx(className, {
          title: true,
          [`title_size_${size}`]: size,
          [`title_weight_${weight}`]: weight,
        })}
      >
        {children}
      </Tag>
    );
  }
}

export default Title;
