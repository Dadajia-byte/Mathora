import { lazy } from 'react';

const Home = lazy(() => import('@/views/Home'));


export const routesMobile = [
  { path: '/', component: Home, namespaces: ['common', 'home'] },
];