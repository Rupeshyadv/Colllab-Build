import AuthPage from "./pages/AuthPage"
import LandingPage from "./pages/LandingPage"
import { useSelector } from "react-redux"

function App() {
  const { isAuthenticated, userData } = useSelector((state) => state.auth);

  return (
    <>
      {isAuthenticated ? <LandingPage /> : <AuthPage />}  
    </>
  )
}

export default App