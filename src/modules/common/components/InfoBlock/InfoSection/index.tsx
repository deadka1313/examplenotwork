import './style.less';

import React, { FC, ReactNode } from 'react';

interface IProps {
  children: ReactNode;
  header?: ReactNode | string;
  className?: string;
}

const renderHeader = (header: ReactNode | string): ReactNode => {
  if (header) {
    return <h2 className="info-section__header">{header}</h2>;
  }

  return null;
};

const InfoSection: FC<IProps> = ({ children, header, className }) => {
  return (
    <div className={className ? `info-section ${className}` : 'info-section'}>
      {renderHeader(header)}
      <div className="info-section__content">{children}</div>
    </div>
  );
};

export default InfoSection;
