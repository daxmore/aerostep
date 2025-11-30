import React from 'react';
import { useLocation } from 'react-router-dom';
import Router from './Router';
import AeroStepNavbar from './components/AeroStepNavbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div>
      <ScrollToTop />
      {!isAdminRoute && <AeroStepNavbar />}
      <Router />
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
