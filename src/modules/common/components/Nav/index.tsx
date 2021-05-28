import './style.less';

import React, { FC } from 'react';

interface INavProps {
  className?: string;
}

const Nav: FC<INavProps> = (props) => {
  return <div className={`nav ${props.className}`}>{props.children}</div>;
};

export default Nav;
