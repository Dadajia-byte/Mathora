import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { routesPC } from './routesPC';
import { routesMobile } from './routesMobile';
import { withTranslation } from 'react-i18next';
import { routerConfig } from './type';

// 判断设备是否为移动设备
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const routes = isMobile ? routesMobile : routesPC;

const FinalRouter = () => {
  const renderRoutes = (routes: routerConfig, parentNamespaces: string | string[] = '') => {
    return routes.map((childRoute, childIndex) => {
      const namespaces = childRoute.namespaces || parentNamespaces;
      const TranslatedComponent = withTranslation(namespaces)(childRoute.component);
      return (
        <Route
          key={childIndex}
          path={childRoute.path}
          element={<TranslatedComponent />}
        >
          {childRoute.children && renderRoutes(childRoute.children, namespaces)}
        </Route>
      );
    });
  };

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {renderRoutes(routes)}
        </Routes>
      </Suspense>
    </Router>
  );
};
export default FinalRouter;
