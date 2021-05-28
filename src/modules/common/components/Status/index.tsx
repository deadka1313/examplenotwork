import './style.less';

import React, { FC } from 'react';

import { IOrderStatus } from 'modules/orders/models/types';
import { IRoutesStatus } from 'modules/routes/models/types';
import { ISessionStatus } from 'modules/couriers/models/types';
import { ITasksStatus } from 'modules/tasks/models/types';
import { getStatusIconImg } from 'helpers/statusIcon';

interface IProps {
  status?: IOrderStatus | IRoutesStatus | ITasksStatus | ISessionStatus;
}

const Status: FC<IProps> = ({ status }) => {
  return status ? (
    <div className="status">
      {getStatusIconImg(status.value)}
      <span>{status.title}</span>
    </div>
  ) : null;
};

export default Status;
