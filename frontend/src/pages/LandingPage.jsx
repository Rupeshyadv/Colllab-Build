import Header from '../components/Header/Header.jsx'
import Footer from '../components/Footer.jsx'
import Hero from '../components/Hero.jsx'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { logout } from '../store/authSlice.js'
import { isUserAuthenticatedApi } from '../api/authApi.js'

function LandingPage() {
  const dispatch = useDispatch()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await isUserAuthenticatedApi()
      } catch (error) {
        dispatch(logout())
      }
    }

    checkAuth()
  })

  return (
    <div>
        <Header />
        <Hero />
        <Footer />
    </div>
        
  )
}

export default LandingPage