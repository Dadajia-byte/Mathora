import { lazy } from 'react';
import { routerConfig } from './type';

const Home = lazy(() => import('@/views/Home'));


export const routesMobile:routerConfig = [
  { path: '/', component: Home, namespaces: ['common', 'home'] },
];