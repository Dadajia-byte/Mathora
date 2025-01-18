import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { routesPC } from './routesPC';
import { routesMobile } from './routesMobile';
import { withTranslation } from 'react-i18next';
// import withTranslation from '@/hocs/withTranslation';

// 判断设备是否为移动设备
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const routes = isMobile ? routesMobile : routesPC;

const FinalRouter = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* 渲染路由 */}
          {routes.map((route, index) => {
            // 使用 withTranslation 包装组件
            const TranslatedComponent = withTranslation(route.namespaces)(route.component);
            return (
              <Route
                key={index}
                path={route.path}
                element={<TranslatedComponent/>}
              />
            );
          })}
        </Routes>
      </Suspense>
    </Router>
  );
};

export default FinalRouter;
