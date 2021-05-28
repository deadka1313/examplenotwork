import Arm2 from 'modules/arm2/components/Arm';
import Directory from 'modules/directory/containers/Directory/index.tsx';
import Geo from 'modules/geo/components/Geo';
import User from 'modules/user/components/User';

interface ISection {
  [sectionName: string]: {
    access?: string | string[];
    component: any;
  };
}

export const SECTION_DATA: ISection = {
  arm2: {
    access: ['orders.list', 'tasks.list', 'routes.list', 'courier-sessions.list'],
    component: Arm2,
  },
  geo: {
    access: 'coverages.list',
    component: Geo,
  },
  directories: {
    component: Directory,
  },
  user: {
    access: 'profiles.create',
    component: User,
  },
};

export const SECTION_LIST: string[] = ['arm2', 'locations', 'directories', 'user'];
