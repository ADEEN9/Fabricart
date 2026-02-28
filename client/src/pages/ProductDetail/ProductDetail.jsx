import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, clearProduct } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getImageUrl, getProductImage } from '../../utils/api';

const ProductDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { product, loading, error } = useSelector((state) => state.products);
    const [qty, setQty] = useState(0.5);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        dispatch(fetchProductById(id));
        return () => dispatch(clearProduct());
    }, [dispatch, id]);

    const handleAddToCart = () => {
        dispatch(addToCart({ ...product, qty }));
        toast.success(`${product.name} added to cart!`);
    };

    if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;
    if (error) return <div className="container page-wrapper"><div className="alert alert-error">{error}</div></div>;
    if (!product) return null;

    // Build image list: use images[] array, fallback to legacy imageUrl
    const imageList = product.images && product.images.length > 0
        ? product.images.map((img) => getImageUrl(img.url))
        : [getProductImage(product)];

    return (
        <div className="page-wrapper">
            <div className="container">
                <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-xl)' }}>
                    <FiArrowLeft /> Back
                </button>

                <div className="product-detail animate-in">
                    <div className="product-detail-image">
                        <img src={imageList[activeImage]} alt={product.name} />
                        {imageList.length > 1 && (
                            <div className="product-thumbnails">
                                {imageList.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`${product.name} ${idx + 1}`}
                                        className={`product-thumbnail ${idx === activeImage ? 'active' : ''}`}
                                        onClick={() => setActiveImage(idx)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="product-detail-info">
                        <div className="product-detail-brand">{product.brand}</div>
                        <h1>{product.name}</h1>
                        <div className="product-detail-price">₹{product.price.toLocaleString()}<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--color-text-light)' }}> / meter</span></div>

                        <div className="product-detail-meta">
                            <div className="product-detail-meta-item">
                                <label>Category</label>
                                <p>{product.category}</p>
                            </div>
                            <div className="product-detail-meta-item">
                                <label>Material</label>
                                <p>{product.material}</p>
                            </div>
                            <div className="product-detail-meta-item">
                                <label>Rating</label>
                                <p>⭐ {product.ratings} ({product.numReviews} reviews)</p>
                            </div>
                            <div className="product-detail-meta-item">
                                <label>Availability</label>
                                <p>
                                    <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                        {product.stock > 0 ? `${product.stock} mtr in stock` : 'Out of Stock'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <p style={{ color: 'var(--color-text-light)', lineHeight: 1.8, marginBottom: 'var(--space-xl)' }}>
                            {product.description}
                        </p>

                        {product.stock > 0 && (
                            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                                <div className="qty-control">
                                    <button onClick={() => setQty(Math.max(0.5, +(qty - 0.5).toFixed(1)))}>−</button>
                                    <input
                                        type="number"
                                        className="qty-input"
                                        value={qty}
                                        min="0.1"
                                        max={product.stock}
                                        step="0.1"
                                        onChange={(e) => setQty(e.target.value === '' ? '' : +e.target.value)}
                                        onBlur={() => {
                                            const val = parseFloat(qty);
                                            if (isNaN(val) || val < 0.1) setQty(0.5);
                                            else setQty(Math.min(product.stock, +val.toFixed(1)));
                                        }}
                                    />
                                    <span className="qty-unit">mtr</span>
                                    <button onClick={() => setQty(Math.min(product.stock, +(qty + 0.5).toFixed(1)))}>+</button>
                                </div>
                                <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                                    <FiShoppingCart /> Add to Cart
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
