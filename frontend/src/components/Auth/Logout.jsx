import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logoutApi } from "../../api/authApi"
import { logout } from "../../store/authSlice"

function Logout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutApi()
      dispatch(logout())
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message)
    }
  }

  return (
    <div className="px-3 py-2">
      <button
        className="w-full bg-gradient-to-r from-red-900 to-gray-500 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-300/25 transition-all duration-200 cursor-pointer"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  )
}

export { Logout }