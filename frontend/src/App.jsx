// AppWrapper.jsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { login as authLogin } from './store/authSlice.js'
import { Routes, Route } from "react-router-dom";
import { DashboardPage, AuthPage, LandingPage, CreateRoomPage, RoomPage } from "./pages/Pages.js";
import { ProfileEditor } from "./components/UserProfile/ProfileEditor.jsx";
import { PublicRoute, PrivateRoute } from "./routes/routes.js";

function App() {
  const dispatch = useDispatch();


  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication status...")
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_SOCKET_URL}/api/users/auth-check`, {
          withCredentials: true,
        })

        console.log("Auth check response:", data.user) 

        if (data?.user) 
          dispatch(authLogin({ user: data.user }))
        
      } catch (err) {
        console.log("Not logged in yet", err)
      }
    }

    checkAuth()
  }, [dispatch])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/create-room"
        element={
          <PrivateRoute>
            <CreateRoomPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/room/:roomId/:language"
        element={
          <PrivateRoute>
            <RoomPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/users/:username"
        element={
          <PrivateRoute>
            <ProfileEditor />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
