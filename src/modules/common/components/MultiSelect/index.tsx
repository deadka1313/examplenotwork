import { Select, Spin } from 'antd';

import React from 'react';
import { SelectProps } from 'antd/lib/select';
import debounce from 'lodash.debounce';

const { Option } = Select;

interface IOptionData {
  guid: string;
  title?: string;
  name?: string;
}

interface IProps {
  defaultOptions: IOptionData[];
  actionSearch: (value: string) => Promise<IOptionData[]>;
  format?: string[];
}

interface IState {
  options: IOptionData[];
  fetching: boolean;
}

class MultiSelect extends React.Component<IProps & SelectProps<any>, IState> {
  defaultOptions: IOptionData[];

  constructor(props) {
    super(props);
    this.fetchOptions = debounce(this.fetchOptions, 800);
    this.defaultOptions = props.defaultOptions;
    this.state = {
      options: props.defaultOptions,
      fetching: false,
    };
  }

  setDefaultOptions = (): void => {
    this.setState({
      options: this.defaultOptions,
      fetching: false,
    });
  };

  fetchOptions = (value: string): void => {
    if (value && value.length > 0) {
      this.setState({ options: [], fetching: true });
      this.props.actionSearch(value).then((response) => {
        this.setState({ options: response, fetching: false });
      });
    } else {
      this.setDefaultOptions();
    }
  };

  render(): JSX.Element {
    const { fetching, options } = this.state;
    const { defaultOptions, actionSearch, format, ...rest } = this.props;
    return (
      <Select
        {...rest}
        placeholder={this.props.placeholder}
        disabled={this.props.disabled}
        mode="multiple"
        labelInValue
        notFoundContent={fetching ? <Spin size="small" /> : 'Ничего не найдено'}
        filterOption={false}
        onSearch={this.fetchOptions}
        getPopupContainer={(trigger) => trigger.parentElement}
      >
        {options &&
          options.map((d) => (
            <Option key={d.guid} value={d.guid}>
              {this.props.format ? this.props.format.map((p) => d[p]).join(' ') : d.title || d.name}
            </Option>
          ))}
      </Select>
    );
  }
}

export default MultiSelect;
