import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const MobileHome = lazy(() => import('@/views/Home'));

function MobileRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<MobileHome />} />
        {/* 其他移动端路由 */}
      </Routes>
    </Suspense>
  );
}

export default MobileRoutes;