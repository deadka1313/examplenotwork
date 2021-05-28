import React, { ReactNode } from 'react';

import { Input } from 'antd';

class InputNumeric extends React.Component<any, any> {
  onChange = (e) => {
    const { value } = e.target;
    const maxLength = this.props.maxLength || 11;
    const reg = /^-?[0-9]*(\.[0-9]*)?$/;
    if ((reg.test(value) && value.length <= maxLength) || value === '') {
      this.props.onChange(value);
    }
  };

  render(): ReactNode {
    return <Input {...this.props} onChange={this.onChange} />;
  }
}

export default InputNumeric;
