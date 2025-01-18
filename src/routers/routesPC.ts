import { lazy } from 'react';

const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));

export const routesPC = [
  { path: '/', component: Home, namespaces: ['common'] },
  { path: '/about', component: About, namespaces: ['test'] },
];