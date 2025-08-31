import { DashboardPage, LandingPage } from './pages/Pages.js'

import { useSelector } from "react-redux"

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      {isAuthenticated ? <DashboardPage /> : <LandingPage />}  
    </>
  )
}

export default App