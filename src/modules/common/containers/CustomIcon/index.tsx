import React, { ReactNode } from 'react';

import AntIcon from '@ant-design/icons';

interface IIconProps {
  type: string;
  className?: any;
  style?: any;
}

type TIconState = {
  ReactComponent: any;
};

export class CustomIcon extends React.PureComponent<IIconProps, TIconState> {
  static defaultProps = {
    type: '',
  };

  constructor(props: IIconProps) {
    super(props);
    const { type } = props;

    if (type && typeof type === 'string') {
      this.importSvg(type);
    }
  }

  isMount = true;

  promise: Promise<any>;

  handleImport = ({ ReactComponent }: any) => {
    if (this.isMount) {
      this.setState({ ReactComponent });
    }
  };

  importSvg(type: string) {
    this.promise = import(`icons/${type}.svg`).then(this.handleImport);
  }

  render(): ReactNode {
    const props = {
      ...this.props,
      type: undefined,
    };
    const { ReactComponent } = this.state;

    if (ReactComponent) {
      return <AntIcon component={ReactComponent} {...props} />;
    }

    return null;
  }

  state = {
    ReactComponent: null,
  };

  componentDidUpdate(props: IIconProps) {
    if (this.props.type !== props.type) {
      this.importSvg(this.props.type);
    }
  }

  componentWillUnmount(): void {
    this.isMount = false;
  }
}
