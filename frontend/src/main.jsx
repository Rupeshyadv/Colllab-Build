import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/DashboardPage.jsx';
import Spinner from './components/Spinner.jsx'
import { Provider } from 'react-redux';
import { store, persistor } from './store/Store.js';
import { PersistGate } from 'redux-persist/integration/react';
import LandingPage from './pages/LandingPage.jsx';

createRoot(document.getElementById('root')).render(
  <>
  <BrowserRouter>
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={<Spinner />}>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/login' element={<AuthPage />} />
          <Route path='/register' element={<AuthPage/>} />
          <Route path='/dashboard' element={<Dashboard />} />
        </Routes>
      </PersistGate>
    </Provider>
  </BrowserRouter>
  </>
)
