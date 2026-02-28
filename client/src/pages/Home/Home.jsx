import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import ProductCard from '../../components/ProductCard';
import { FiArrowRight, FiStar, FiTruck, FiShield } from 'react-icons/fi';

const Home = () => {
    const dispatch = useDispatch();
    const { items, loading } = useSelector((state) => state.products);

    useEffect(() => {
        dispatch(fetchProducts({ limit: 8 }));
    }, [dispatch]);

    return (
        <>
            {/* Hero Section */}
            <section className="hero">
                <div className="container hero-content">
                    <h1 className="animate-in">
                        Premium Fabrics for<br /><span>Exceptional Tailoring</span>
                    </h1>
                    <p className="animate-in animate-delay-1">
                        Discover curated collections of the finest shirting and suiting fabrics
                        from world-renowned brands. Quality that speaks for itself.
                    </p>
                    <div className="hero-actions animate-in animate-delay-2">
                        <Link to="/products?category=Shirting" className="btn btn-primary btn-lg">
                            Shop Shirting <FiArrowRight />
                        </Link>
                        <Link to="/products?category=Suiting" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
                            Shop Suiting
                        </Link>
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section style={{ background: '#fff', padding: 'var(--space-xl) 0', borderBottom: '1px solid var(--color-border)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                        <FiStar size={20} color="var(--color-accent)" /> Premium Quality
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                        <FiTruck size={20} color="var(--color-accent)" /> Free Shipping over ₹2000
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                        <FiShield size={20} color="var(--color-accent)" /> Secure Payments
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="category-section">
                <div className="container">
                    <div className="section-title">
                        <h2>Shop by Category</h2>
                        <p>Explore our premium fabric collections</p>
                        <div className="accent-line"></div>
                    </div>
                    <div className="category-grid">
                        <Link to="/products?category=Shirting" className="category-card">
                            <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600" alt="Shirting Fabrics" />
                            <div className="category-card-overlay">
                                <h3>Shirting</h3>
                                <p>Cotton, Linen, Silk & more for premium shirts</p>
                            </div>
                        </Link>
                        <Link to="/products?category=Suiting" className="category-card">
                            <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600" alt="Suiting Fabrics" />
                            <div className="category-card-overlay">
                                <h3>Suiting</h3>
                                <p>Wool, Polyester & Blends for bespoke suits</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section style={{ paddingBottom: 'var(--space-3xl)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Featured Fabrics</h2>
                        <p>Handpicked selections from our latest collection</p>
                        <div className="accent-line"></div>
                    </div>

                    {loading ? (
                        <div className="spinner-wrapper"><div className="spinner"></div></div>
                    ) : (
                        <div className="product-grid">
                            {items.slice(0, 8).map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
                        <Link to="/products" className="btn btn-secondary btn-lg">
                            View All Products <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;
