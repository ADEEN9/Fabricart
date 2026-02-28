import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, updateCartQty, clearCart } from '../../store/slices/cartSlice';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { getImageUrl } from '../../utils/api';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);

    const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shipping = subtotal > 2000 ? 0 : 100;
    const tax = Number((subtotal * 0.18).toFixed(2));
    const total = subtotal + shipping + tax;

    const handleCheckout = () => {
        if (!userInfo) {
            navigate('/login?redirect=checkout');
        } else {
            navigate('/checkout');
        }
    };

    if (items.length === 0) {
        return (
            <div className="page-wrapper">
                <div className="container" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
                    <FiShoppingBag size={64} color="var(--color-border)" style={{ marginBottom: 'var(--space-lg)' }} />
                    <h2 style={{ marginBottom: 'var(--space-md)' }}>Your cart is empty</h2>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-xl)' }}>
                        Add some premium fabrics to get started.
                    </p>
                    <Link to="/products" className="btn btn-primary btn-lg">Browse Fabrics</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <div className="container">
                <h2 style={{ marginBottom: 'var(--space-xl)' }}>Shopping Cart ({items.length} items)</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-2xl)', alignItems: 'start' }}>
                    {/* Cart Items */}
                    <div>
                        <table className="cart-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                                <img src={getImageUrl(item.imageUrl)} alt={item.name} className="cart-item-image" />
                                                <div className="cart-item-info">
                                                    <h4>{item.name}</h4>
                                                    <p>{item.brand} • {item.material}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>₹{item.price.toLocaleString()}</td>
                                        <td>
                                            <div className="qty-control">
                                                <button onClick={() => dispatch(updateCartQty({ id: item._id, qty: Math.max(0.5, +(item.qty - 0.5).toFixed(1)) }))}>−</button>
                                                <input
                                                    type="number"
                                                    className="qty-input"
                                                    value={item.qty}
                                                    min="0.1"
                                                    max={item.stock}
                                                    step="0.1"
                                                    onChange={(e) => {
                                                        const val = e.target.value === '' ? 0.5 : +e.target.value;
                                                        dispatch(updateCartQty({ id: item._id, qty: val }));
                                                    }}
                                                    onBlur={() => {
                                                        const val = parseFloat(item.qty);
                                                        const clamped = isNaN(val) || val < 0.1 ? 0.5 : Math.min(item.stock, +val.toFixed(1));
                                                        dispatch(updateCartQty({ id: item._id, qty: clamped }));
                                                    }}
                                                />
                                                <span className="qty-unit">mtr</span>
                                                <button onClick={() => dispatch(updateCartQty({ id: item._id, qty: Math.min(item.stock, +(item.qty + 0.5).toFixed(1)) }))}>+</button>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>₹{(item.price * item.qty).toLocaleString()}</td>
                                        <td>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => dispatch(removeFromCart(item._id))}
                                                style={{ color: 'var(--color-danger)' }}
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="cart-summary">
                        <h3 style={{ marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-display)' }}>Order Summary</h3>
                        <div className="cart-summary-row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="cart-summary-row">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                        </div>
                        <div className="cart-summary-row">
                            <span>GST (18%)</span>
                            <span>₹{tax.toLocaleString()}</span>
                        </div>
                        <div className="cart-summary-row total">
                            <span>Total</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                        <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 'var(--space-lg)' }} onClick={handleCheckout}>
                            Proceed to Checkout
                        </button>
                        <button className="btn btn-outline btn-block btn-sm" style={{ marginTop: 'var(--space-sm)' }} onClick={() => dispatch(clearCart())}>
                            Clear Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
