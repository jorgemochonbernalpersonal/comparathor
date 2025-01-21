// src/App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { RoleProvider } from './contexts/RoleContext';
import AllRoutes from './router/Index';
import Header from './components/Shared/Header';
import Footer from './components/Shared/Footer';

const App = () => {
  return (
      <UserProvider>
          <RoleProvider> 
              <Router>
                  <Header />
                  <main>
                      <AllRoutes />
                  </main>
                  <Footer />
              </Router>
          </RoleProvider>
      </UserProvider>
  );
};

export default App;