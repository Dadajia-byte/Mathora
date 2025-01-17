import { Suspense } from 'react';
import { BrowserRouter as Router, Routes } from 'react-router-dom';
import NamespaceRoute from '@/routers/NamespaceRoute';
import { routesPC } from './routers/routesPC';
import { routesMobile } from './routers/routesMobile';

function App() {
  // 判断是否为移动端
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const routes = isMobile ? routesMobile : routesPC;

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {routes.map((route, index) => (
            <NamespaceRoute
              key={index}
              path={route.path}
              namespaces={route.namespaces}
              component={route.component}
            />
          ))}
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;