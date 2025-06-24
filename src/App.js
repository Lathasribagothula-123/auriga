import React from 'react';
import BikeDashboard from './components/BikeDashboard';
import "./index.css";
import logo from "../src/images/logo.svg"
import profile from "../src/images/profile.png"

function App() {
  return (
    <div className="min-h-screen">

      <div className='flex'>
        <div className='sidebar'>
          <div className='navsec'>
          <div><img src={logo} alt="Logo" /></div>
          <div className='cuborder'></div>

           <div className="active flexdiv mt-9">
               <img alt="icon" className='me-2'
           src="data:image/svg+xml,%3csvg%20width='32'%20height='32'%20viewBox='0%200%2032%2032'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_2814_3016)'%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M1.80078%202.6748C1.80078%202.19156%202.19253%201.7998%202.67578%201.7998H28.9258C29.409%201.7998%2029.8008%202.19156%2029.8008%202.6748V28.9248C29.8008%2029.4081%2029.409%2029.7998%2028.9258%2029.7998H2.67578C2.19253%2029.7998%201.80078%2029.4081%201.80078%2028.9248V2.6748ZM3.98828%203.9873V27.6123H27.6133V3.9873H3.98828Z'%20fill='white'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M16.457%206.6123C16.6987%206.6123%2016.8945%206.80818%2016.8945%207.04981V24.5498C16.8945%2024.7914%2016.6987%2024.9873%2016.457%2024.9873H15.1445C14.9029%2024.9873%2014.707%2024.7914%2014.707%2024.5498V7.0498C14.707%206.80818%2014.9029%206.6123%2015.1445%206.6123H16.457ZM9.67578%2012.7373C9.91741%2012.7373%2010.1133%2012.9332%2010.1133%2013.1748V24.5498C10.1133%2024.7914%209.91741%2024.9873%209.67578%2024.9873H8.36328C8.12166%2024.9873%207.92578%2024.7914%207.92578%2024.5498V13.1748C7.92578%2012.9332%208.12166%2012.7373%208.36328%2012.7373H9.67578ZM23.2383%2017.1123C23.4799%2017.1123%2023.6758%2017.3082%2023.6758%2017.5498V24.5498C23.6758%2024.7914%2023.4799%2024.9873%2023.2383%2024.9873H21.9258C21.6842%2024.9873%2021.4883%2024.7914%2021.4883%2024.5498V17.5498C21.4883%2017.3082%2021.6842%2017.1123%2021.9258%2017.1123H23.2383Z'%20fill='white'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_2814_3016'%3e%3crect%20width='32'%20height='32'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e" />
           Dashboard
           </div>

          <div class="profilesec"><img alt="Logo" src={profile} /></div>
          </div>
        </div>
        {/* <div className='cuborder'></div> */}
        <div className='content'>
          <BikeDashboard />
        </div>

      </div>
    </div>
  );
}

export default App;
