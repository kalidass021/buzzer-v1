import { Outlet } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';

const App = () => {
  return (
    <div className='flex max-w-6xl mx-auto'>
      {/* Sidebar & RightPanel are a common component */}
      <Sidebar />
      <Outlet />
      <RightPanel />
    </div>
  );
};

export default App;
