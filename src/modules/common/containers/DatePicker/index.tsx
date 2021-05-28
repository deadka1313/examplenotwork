import React, { ReactNode } from 'react';

import { DatePicker as AntDatePicker } from 'antd';
import { DatePickerProps } from 'antd/lib/date-picker';
import { Moment } from 'moment';

type IDatePickerProps = DatePickerProps & {
  className?: string;
  onChange?: (value: Moment) => void;
};

export default class DatePicker extends React.Component<IDatePickerProps> {
  constructor(props: IDatePickerProps) {
    super(props);
  }

  handleChange = (newValue: Moment): void => {
    const { onChange } = this.props;

    if (typeof onChange === 'function') {
      onChange(newValue);
    }
  };

  render(): ReactNode {
    return (
      <AntDatePicker {...this.props} onSelect={this.handleChange} onChange={this.handleChange} />
    );
  }
}
