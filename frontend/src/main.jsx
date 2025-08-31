import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardPage, AuthPage, LandingPage, CreateRoomPage, RoomPage } from './pages/Pages.js'
import { ProfileEditor } from './components/UserProfile/ProfileEditor.jsx'
import Spinner from './components/Spinner.jsx'
import { Provider } from 'react-redux';
import { PublicRoute, PrivateRoute } from './routes/routes.js'
import { store, persistor } from './store/Store.js';
import { Toaster } from 'react-hot-toast';
import { PersistGate } from 'redux-persist/integration/react';

createRoot(document.getElementById('root')).render(
  <>
  <BrowserRouter>
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={<Spinner />}>
        <Toaster />
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route 
            path='/login' 
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            } 
          />
          <Route 
            path='/register' 
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            } 
          />
          <Route 
            path='/dashboard' 
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } 
          />
          <Route
            path='/dashboard/create-room'
            element={
              <PrivateRoute>
                <CreateRoomPage />
              </PrivateRoute>
            }
          />
          <Route 
            path='/room/:roomId/:language'
            element={
              <PrivateRoute>
                <RoomPage />
              </PrivateRoute>
            }
          />
          <Route
            path='/users/:username'
            element={
              <PrivateRoute>
                <ProfileEditor />
              </PrivateRoute>
            }
          />
        </Routes>
      </PersistGate>
    </Provider>
  </BrowserRouter>
  </>
)
