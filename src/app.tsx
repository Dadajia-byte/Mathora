import { useEffect } from 'react';
import Router from './routers';
import events from './utils/events';

function App() {
  useEffect(()=>{
    events.on('API:DEDUPLICATOR',()=>{
      console.log('重复请求');
      
    })
  })
  return (
    <Router />
  );
}

export default App;