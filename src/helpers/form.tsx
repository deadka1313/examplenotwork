import { FieldData } from 'rc-field-form/es/interface';
import { Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { IApiResponseErrorMD2 } from 'api/types';
import React from 'react';

type TypeFieldKey = string;

export type IFieldData = {
  [key in TypeFieldKey]: IField;
};

interface IField {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any;
  formItem?: any;
  name: string;
  params?: any;
  props?: any;
}

export const selectFilter = (input: string, option: any): boolean =>
  option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0;

export const moreThanNullNumberValidator = async (_, value) => {
  if (value && value === '0') {
    return Promise.reject(new Error('Значение должно быть больше нуля'));
  }
};

export const positiveNumberValidator = async (_, value) => {
  if (value && value < 0) {
    return Promise.reject(new Error('Значение должно быть положительным'));
  }
};

export const integerNumberValidator = async (_, value) => {
  if (value && !Number.isInteger(Number(value))) {
    return Promise.reject(new Error('Значение должно быть целым'));
  }
};

export const compareWithPasswordValidator = (form: FormInstance) => async (_, value) => {
  const passwordConfirm = value;
  const password = form.getFieldValue('password');

  if (password && password !== passwordConfirm) {
    return Promise.reject(new Error('Пароли должны совпадать'));
  }
};

const getField = (fieldErrorList: Record<string, string[]>, valueList: Record<string, never>) => (
  valueKey: string,
) => ({
  name: valueKey,
  errors: fieldErrorList[valueKey] || [],
  value: valueList[valueKey],
});

const getFieldError = (
  prev: Record<string, string[]>,
  error: IApiResponseErrorMD2,
): Record<string, string[]> => {
  return {
    ...prev,
    [error.key]: [error.error],
  };
};

const getFieldErrorList = (response: any): Record<string, never> =>
  response.data.errors.reduce(getFieldError, {});

export const getFieldDataList = (response: any, valueList: Record<string, never>): FieldData[] => {
  const fieldErrorList: Record<string, string[]> = getFieldErrorList(response);

  return Object.keys(valueList).map(getField(fieldErrorList, valueList));
};

export const renderFields = (fieldsList: string[], fieldsData: IFieldData): React.ReactNode => {
  return fieldsList.map((key) => {
    const field = fieldsData[key];
    const Field = field.component;
    return (
      <Form.Item key={key} name={field.name} {...field.formItem} {...field.params}>
        <Field {...field.props} />
      </Form.Item>
    );
  });
};
