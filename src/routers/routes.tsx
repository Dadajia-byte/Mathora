import { BrowserRouter as Router } from 'react-router-dom';
import MobileRoutes from './MobileRoutes';
import WebRoutes from './WebRoutes';

// 是否在PC端
let deviceType = 'pc';
if (window.navigator.userAgent.match(/(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i)) {
  deviceType = 'm'; //移动端
}

function AppRoutes() {
  return (
    <Router>
      {deviceType === 'm' ? <MobileRoutes /> : <WebRoutes />}
    </Router>
  );
}

export default AppRoutes;