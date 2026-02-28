import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiGrid } from 'react-icons/fi';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { userInfo } = useSelector((state) => state.auth);
    const { items } = useSelector((state) => state.cart);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
        setMenuOpen(false);
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    Fabri<span>Cart</span>
                </Link>

                <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <FiX /> : <FiMenu />}
                </button>

                <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    <li><Link to="/products?category=Shirting" onClick={() => setMenuOpen(false)}>Shirting</Link></li>
                    <li><Link to="/products?category=Suiting" onClick={() => setMenuOpen(false)}>Suiting</Link></li>
                    <li>
                        <Link to="/cart" onClick={() => setMenuOpen(false)} style={{ position: 'relative' }}>
                            <FiShoppingCart size={18} />
                            {items.length > 0 && <span className="cart-badge">{items.length}</span>}
                        </Link>
                    </li>

                    {userInfo ? (
                        <>
                            {userInfo.role === 'admin' && (
                                <li>
                                    <Link to="/admin" onClick={() => setMenuOpen(false)}>
                                        <FiGrid size={16} style={{ marginRight: 4 }} /> Admin
                                    </Link>
                                </li>
                            )}
                            <li>
                                <Link to="/orders" onClick={() => setMenuOpen(false)}>
                                    <FiUser size={16} style={{ marginRight: 4 }} /> Dashboard
                                </Link>
                            </li>
                            <li>
                                <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                                    <FiLogOut size={14} /> Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <li>
                            <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                                Sign In
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
