import { lazy } from 'react';
import { routerConfig } from './type';

const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));

export const routesPC:routerConfig = [
  { 
    name: '', // 后期可能写页面title，也需要考虑多语言（考虑再写一个高阶组件？）
    path: '/', 
    component: Home, 
    namespaces: ['common'] 
  },
  { 
    path: '/about', 
    component: About, 
    namespaces: ['test'] 
  },
  {
    path: '/user',
    component: lazy(() => import('@/pages/User')),
    namespaces: ['user'],
    children: [
      {
        path: '/user/info',
        component: lazy(() => import('@/pages/User/Info')),
        namespaces: ['test']
      },

    ]
  }
];