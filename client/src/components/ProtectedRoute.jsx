import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
    const { userInfo } = useSelector((state) => state.auth);
    return userInfo ? children : <Navigate to="/login" replace />;
};

export const AdminRoute = ({ children }) => {
    const { userInfo } = useSelector((state) => state.auth);
    if (!userInfo) return <Navigate to="/login" replace />;
    if (userInfo.role !== 'admin') return <Navigate to="/" replace />;
    return children;
};
