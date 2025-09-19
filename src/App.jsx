import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
