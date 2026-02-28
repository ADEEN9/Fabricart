import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders, cancelOrder } from '../../store/slices/orderSlice';
import { Link } from 'react-router-dom';
import { FaShoppingBag, FaWallet, FaClock, FaUserCircle, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';
import { FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { myOrders, loading } = useSelector((state) => state.orders);
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchMyOrders());
    }, [dispatch]);

    const handleCancel = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await dispatch(cancelOrder(orderId)).unwrap();
                toast.success('Order cancelled successfully');
            } catch (err) {
                toast.error(err);
            }
        }
    };

    if (loading && myOrders.length === 0) return <div className="spinner-wrapper"><div className="spinner"></div></div>;

    // Calculate Stats
    const totalOrders = myOrders.length;
    const totalSpent = myOrders.filter(o => o.isPaid && o.status !== 'Cancelled').reduce((acc, o) => acc + o.totalPrice, 0);
    const pendingOrders = myOrders.filter(o => o.status === 'Processing').length;

    return (
        <div className="page-wrapper">
            <div className="container">
                <div className="dashboard-layout">
                    {/* ──── LEFT COMPONENT: Profile Sidebar ──── */}
                    <aside className="dashboard-sidebar">
                        <div className="profile-card animate-in">
                            <div className="profile-avatar">
                                <FaUserCircle size={80} color="var(--color-border)" />
                            </div>
                            <h3 className="profile-name">{userInfo?.name}</h3>
                            <div className="profile-role">
                                <span className={`badge ${userInfo?.role === 'admin' ? 'badge-paid' : 'badge-unpaid'}`}>
                                    {userInfo?.role?.toUpperCase()}
                                </span>
                            </div>

                            <div className="profile-details">
                                <div className="profile-detail-item">
                                    <FaEnvelope className="detail-icon" />
                                    <span>{userInfo?.email}</span>
                                </div>
                                <div className="profile-detail-item">
                                    <FaCalendarAlt className="detail-icon" />
                                    <span>Joined {new Date().getFullYear()}</span> {/* You could add createdAt to user model and pass here */}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* ──── RIGHT COMPONENT: Dashboard Content ──── */}
                    <main className="dashboard-content">
                        <h2 style={{ marginBottom: 'var(--space-xl)', fontFamily: 'var(--font-display)' }}>Dashboard Overview</h2>

                        {/* Summary Stats Cards */}
                        <div className="stats-grid">
                            <div className="stat-card animate-in">
                                <div className="stat-icon-wrapper" style={{ background: 'rgba(201, 168, 76, 0.1)', color: 'var(--color-accent)' }}>
                                    <FaShoppingBag size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Total Orders</span>
                                    <h3 className="stat-value">{totalOrders}</h3>
                                </div>
                            </div>

                            <div className="stat-card animate-in" style={{ animationDelay: '0.1s' }}>
                                <div className="stat-icon-wrapper" style={{ background: 'rgba(46, 204, 113, 0.1)', color: 'var(--color-success)' }}>
                                    <FaWallet size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Total Spent</span>
                                    <h3 className="stat-value">₹{totalSpent.toLocaleString()}</h3>
                                </div>
                            </div>

                            <div className="stat-card animate-in" style={{ animationDelay: '0.2s' }}>
                                <div className="stat-icon-wrapper" style={{ background: 'rgba(231, 76, 60, 0.1)', color: 'var(--color-danger)' }}>
                                    <FaClock size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Pending Orders</span>
                                    <h3 className="stat-value">{pendingOrders}</h3>
                                </div>
                            </div>
                        </div>

                        <h3 style={{ marginTop: 'var(--space-2xl)', marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-display)' }}>Recent Orders</h3>

                        {/* Orders List */}
                        {myOrders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
                                <h3>No orders yet</h3>
                                <p style={{ marginTop: 'var(--space-sm)', marginBottom: 'var(--space-lg)', color: 'var(--color-text-light)' }}>Start shopping to see your orders here.</p>
                                <Link to="/products" className="btn btn-primary">Browse Fabrics</Link>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {myOrders.map((order, idx) => (
                                    <div key={order._id} className="order-card animate-in" style={{ animationDelay: `${0.1 * idx}s` }}>
                                        {/* Order Header */}
                                        <div className="order-card-header">
                                            <div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</div>
                                                <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.95rem' }}>#{order._id.slice(-8).toUpperCase()}</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</div>
                                                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
                                                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>₹{order.totalPrice.toLocaleString()}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                                                <span className={`badge ${order.isPaid ? 'badge-paid' : 'badge-unpaid'}`}>
                                                    {order.isPaid ? 'Paid' : 'Unpaid'}
                                                </span>
                                                <span className={`badge badge-${order.status.toLowerCase()}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="order-card-items">
                                            {order.orderItems.map((item, idxx) => (
                                                <div key={idxx} className="order-item-row">
                                                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                                                    <span style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
                                                        {item.quantity} mtr × ₹{item.price.toLocaleString()} = <strong>₹{(item.quantity * item.price).toLocaleString()}</strong>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Order Footer with Cancel */}
                                        <div className="order-card-footer">
                                            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                                                {order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 Paid Online'}
                                            </div>
                                            {order.status === 'Processing' && (
                                                <button
                                                    className="btn btn-outline btn-sm"
                                                    style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                                                    onClick={() => handleCancel(order._id)}
                                                >
                                                    <FiXCircle size={14} /> Cancel Order
                                                </button>
                                            )}
                                            {order.status === 'Cancelled' && (
                                                <span style={{ fontSize: '0.82rem', color: 'var(--color-danger)', fontWeight: 500 }}>
                                                    ✕ Order Cancelled
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
