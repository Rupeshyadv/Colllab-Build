import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export function ProfileCircle({
    decoration,
}) {
    const { userData } = useSelector((state) => state.auth);
    if (!userData) return null;

    const username = userData.user.username 

    return (
        <Link 
            to={`/users/${username}`}
            className="w-12 h-12 text-sm rounded-full flex items-center justify-center overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer bg-gradient-to-br from-blue-500 to-cyan-500"
        >
            <span className="font-semibold text-white">
            </span>
        </Link>
    );
}