import './style.less';

import React, { FC, ReactNode } from 'react';

type InfoFactTypeProps = {
  header: string | ReactNode;
  className?: string;
};

const InfoFact: FC<InfoFactTypeProps> = (props) => {
  const { children, header, className } = props;

  if (header) {
    return (
      <div className={`info-fact ${className}`}>
        <div className="info-fact__header">{header}</div>
        <div className="info-fact__content">{children || '\u2014'}</div>
      </div>
    );
  }

  return null;
};

InfoFact.defaultProps = {
  className: '',
  header: null,
};

export default InfoFact;
