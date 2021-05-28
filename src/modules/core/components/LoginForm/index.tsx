import './style.less';

import { Button, Form, Input } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import React, { FC } from 'react';
import { inject, observer } from 'mobx-react';

import { CoreStore } from 'modules/core/stores/CoreStore';
import { getFieldDataList } from 'helpers/form';

interface IProps {
  core?: CoreStore;
}

const LoginForm: FC<IProps> = ({ core }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any): void => {
    core.login(values).catch((error) => {
      form.setFields(getFieldDataList(error, values));
    });
  };

  return (
    <Form className="login-form" onFinish={handleSubmit} form={form}>
      <Form.Item name="login" rules={[{ required: true, message: 'Пожалуйста, укажите логин' }]}>
        <Input placeholder="Логин" prefix={<UserOutlined className="login-form__icon" />} />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Пожалуйста, укажите пароль' }]}
      >
        <Input.Password
          placeholder="Пароль"
          prefix={<LockOutlined className="login-form__icon" />}
        />
      </Form.Item>
      <div>
        <Button htmlType="submit" type="primary">
          Войти
        </Button>
      </div>
    </Form>
  );
};

export default inject('core')(observer(LoginForm));
