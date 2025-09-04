import React from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import AdminRoutes from './routes/AdminRoutes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {AppRoutes()}
        {AdminRoutes()}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
