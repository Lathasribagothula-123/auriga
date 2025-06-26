import React from 'react';
import BikeDashboard from './components/BikeDashboard';
import "./index.css";
import logo from "../src/images/logo.svg"

function App() {
  return (
    <div className="min-h-screen">

     <div className='header text-white w-full px-6 py-2'> 
      <div className='flex items-center justify-between w-full'>
        <div><img src={logo} alt="Logo" /></div>
        <div className='font-bold'>Dashboard</div>
      </div>
     </div>
     <div className='cuborder'></div>

      <BikeDashboard />
    </div>
  );
}

export default App;
