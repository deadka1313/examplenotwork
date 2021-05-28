import { ISession } from 'modules/couriers/models/types';
import Icon from '@ant-design/icons';
import React from 'react';

export const getSessionByDate = (list: ISession[], _date): ISession => {
  const ses = list.find(
    (s) =>
      s.planned_date === _date &&
      ['planned', 'processes', 'awaiting_courier', 'in_process'].includes(s.status),
  );
  return ses;
};

const CheckSvg = () => (
  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.12473 9.76114C3.0966 9.76114 3.07004 9.75957 3.04191 9.75488C2.84816 9.72832 2.67941 9.61426 2.58254 9.44551L0.0934752 5.09082C-0.0783998 4.79082 0.0262876 4.40957 0.326288 4.2377C0.626288 4.06582 1.00754 4.17051 1.17941 4.47051L3.26066 8.11426L10.9325 0.418947C11.1763 0.175197 11.5716 0.173635 11.8169 0.417385C12.0607 0.661135 12.0622 1.05645 11.8185 1.30176L3.5966 9.54863L3.56691 9.57832C3.44816 9.69707 3.28879 9.76114 3.12473 9.76114Z"
      fill="#00CC66"
    />
  </svg>
);

export const CheckIcon = (props) => <Icon component={CheckSvg} {...props} />;
