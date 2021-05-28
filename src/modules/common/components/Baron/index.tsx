import './style.less';

import React, { FC } from 'react';

import ReactBaron from 'react-baron';

type TBaronProps = {
  className?: string;
  onScroll?: (e: any) => void;
  rest?: any;
};

const Baron: FC<TBaronProps> = ({ children, className, ...rest }) => {
  const clipperCls = ['baron__clipper'];

  if (className) {
    clipperCls.push(className);
  }

  return (
    <ReactBaron
      {...rest}
      barCls="baron__bar"
      barOnCls="baron"
      clipperCls={clipperCls.join(' ')}
      scrollerCls="baron__scroller"
      trackCls="baron__track"
    >
      {children}
    </ReactBaron>
  );
};

export default Baron;
