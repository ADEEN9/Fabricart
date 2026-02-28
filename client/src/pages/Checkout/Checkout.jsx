import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveShippingAddress, clearCart } from '../../store/slices/cartSlice';
import { createOrder } from '../../store/slices/orderSlice';
import { FiCreditCard, FiTruck, FiShield, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../utils/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Stripe Elements card style
const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#0f2439',
            fontFamily: '"Inter", sans-serif',
            '::placeholder': { color: '#aab7c4' },
        },
        invalid: { color: '#e74c3c' },
    },
};

// ─── Stripe Checkout Form ─────────────────────────────────────────────
const StripeCheckoutForm = ({ order, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        try {
            // Create payment intent on server
            const { data } = await API.post('/orders/create-payment-intent', {
                amount: order.totalPrice,
                orderId: order._id,
            });

            // Confirm card payment
            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });

            if (result.error) {
                setError(result.error.message);
                setProcessing(false);
            } else if (result.paymentIntent.status === 'succeeded') {
                // Verify on server
                await API.post('/orders/confirm-payment', {
                    paymentIntentId: result.paymentIntent.id,
                    orderId: order._id,
                });
                onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Payment failed');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handlePayment}>
            <div style={{
                padding: 'var(--space-lg)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                background: '#fff',
                marginBottom: 'var(--space-lg)',
            }}>
                <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-md)' }}>
                    {error}
                </div>
            )}
            <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={!stripe || processing}
            >
                {processing ? 'Processing Payment...' : `Pay ₹${order.totalPrice.toLocaleString()}`}
            </button>
        </form>
    );
};

// ─── Main Checkout Component ──────────────────────────────────────────
const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, shippingAddress } = useSelector((state) => state.cart);
    const { loading } = useSelector((state) => state.orders);

    const [address, setAddress] = useState({
        street: shippingAddress.street || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        zipCode: shippingAddress.zipCode || '',
        country: shippingAddress.country || 'India',
    });

    const [paymentMethod, setPaymentMethod] = useState('Stripe');
    const [step, setStep] = useState('address'); // 'address' | 'payment'
    const [createdOrder, setCreatedOrder] = useState(null);
    const [stripePromise, setStripePromise] = useState(null);
    const [processing, setProcessing] = useState(false);

    const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shipping = subtotal > 2000 ? 0 : 100;
    const tax = Number((subtotal * 0.18).toFixed(2));
    const total = subtotal + shipping + tax;

    // Load Stripe publishable key
    useEffect(() => {
        const loadStripeKey = async () => {
            try {
                const { data } = await API.get('/config/stripe');
                if (data.publishableKey) {
                    setStripePromise(loadStripe(data.publishableKey));
                }
            } catch (err) {
                console.error('Failed to load Stripe config');
            }
        };
        loadStripeKey();
    }, []);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setProcessing(true);

        dispatch(saveShippingAddress(address));

        const orderData = {
            orderItems: items.map((item) => ({
                product: item._id,
                quantity: item.qty,
            })),
            shippingAddress: address,
            paymentMethod,
        };

        try {
            const result = await dispatch(createOrder(orderData)).unwrap();

            if (paymentMethod === 'Stripe') {
                setCreatedOrder(result);
                setStep('payment');
            } else {
                // COD
                dispatch(clearCart());
                toast.success('Order placed! Cash on Delivery.');
                navigate('/orders');
            }
        } catch (err) {
            toast.error(err || 'Failed to place order');
        } finally {
            setProcessing(false);
        }
    };

    const handlePaymentSuccess = () => {
        dispatch(clearCart());
        toast.success('Payment successful! Order confirmed.');
        navigate('/orders');
    };

    if (items.length === 0 && !createdOrder) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="page-wrapper">
            <div className="container">
                {/* Step indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <span className={`checkout-step ${step === 'address' ? 'active' : 'done'}`}>1</span>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Address</span>
                    </div>
                    <div style={{ flex: 1, height: 2, background: 'var(--color-border)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <span className={`checkout-step ${step === 'payment' ? 'active' : ''}`}>2</span>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: step === 'payment' ? 'var(--color-text)' : 'var(--color-text-light)' }}>Payment</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 'var(--space-2xl)', alignItems: 'start' }}>

                    {/* Left Column */}
                    <div>
                        {step === 'address' && (
                            <form onSubmit={handlePlaceOrder}>
                                {/* Shipping Address */}
                                <div style={{ background: 'var(--color-bg-card)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-xl)' }}>
                                    <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                        <FiTruck /> Shipping Address
                                    </h3>
                                    <div className="form-group">
                                        <label>Street Address</label>
                                        <input type="text" className="form-control" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} required />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                        <div className="form-group">
                                            <label>City</label>
                                            <input type="text" className="form-control" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>State</label>
                                            <input type="text" className="form-control" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                        <div className="form-group">
                                            <label>ZIP Code</label>
                                            <input type="text" className="form-control" value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Country</label>
                                            <input type="text" className="form-control" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method Selection */}
                                <div style={{ background: 'var(--color-bg-card)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                                    <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                        <FiCreditCard /> Payment Method
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                        <label className={`payment-option ${paymentMethod === 'Stripe' ? 'selected' : ''}`} onClick={() => setPaymentMethod('Stripe')}>
                                            <input type="radio" name="payment" value="Stripe" checked={paymentMethod === 'Stripe'} onChange={() => setPaymentMethod('Stripe')} />
                                            <div className="payment-option-content">
                                                <div className="payment-option-title">
                                                    <FiCreditCard size={18} />
                                                    <span>Pay with Card</span>
                                                    {paymentMethod === 'Stripe' && <FiCheckCircle size={16} color="var(--color-success)" />}
                                                </div>
                                                <p>Credit / Debit Card (Visa, Mastercard, RuPay)</p>
                                            </div>
                                        </label>

                                        <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`} onClick={() => setPaymentMethod('COD')}>
                                            <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                                            <div className="payment-option-content">
                                                <div className="payment-option-title">
                                                    <FiTruck size={18} />
                                                    <span>Cash on Delivery</span>
                                                    {paymentMethod === 'COD' && <FiCheckCircle size={16} color="var(--color-success)" />}
                                                </div>
                                                <p>Pay when your order arrives</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Trust Badges */}
                                <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)', justifyContent: 'center' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                                        <FiShield size={14} color="var(--color-success)" /> Secure Payment
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                                        <FiCheckCircle size={14} color="var(--color-success)" /> 100% Genuine
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block btn-lg"
                                    style={{ marginTop: 'var(--space-lg)' }}
                                    disabled={loading || processing}
                                >
                                    {processing ? 'Processing...' : paymentMethod === 'Stripe' ? 'Continue to Payment' : `Place Order — ₹${total.toLocaleString()} (COD)`}
                                </button>
                            </form>
                        )}

                        {step === 'payment' && createdOrder && stripePromise && (
                            <div style={{ background: 'var(--color-bg-card)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-xs)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                    <FiCreditCard /> Enter Card Details
                                </h3>
                                <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: 'var(--space-xl)' }}>
                                    Your order has been created. Complete the payment below.
                                </p>
                                <Elements stripe={stripePromise}>
                                    <StripeCheckoutForm order={createdOrder} onSuccess={handlePaymentSuccess} />
                                </Elements>
                                <p style={{ textAlign: 'center', marginTop: 'var(--space-md)', fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                                    🔒 Secured by Stripe. We never store your card details.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="cart-summary">
                        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-lg)' }}>Order Summary</h3>
                        {items.map((item) => (
                            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-sm) 0', fontSize: '0.9rem' }}>
                                <span>{item.name} × {item.qty} mtr</span>
                                <span>₹{(item.price * item.qty).toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="cart-summary-row" style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-md)' }}>
                            <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="cart-summary-row">
                            <span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                        </div>
                        <div className="cart-summary-row">
                            <span>GST (18%)</span><span>₹{tax.toLocaleString()}</span>
                        </div>
                        <div className="cart-summary-row total">
                            <span>Total</span><span>₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
