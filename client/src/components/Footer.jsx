import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-grid">
                <div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
                        Fabri<span style={{ color: 'var(--color-accent)' }}>Cart</span>
                    </h4>
                    <p style={{ marginTop: '1rem', maxWidth: '320px' }}>
                        Premium clothing fabrics for discerning tailors and fashion houses.
                        Experience the finest shirting and suiting materials from top brands.
                    </p>
                </div>
                <div>
                    <h4>Shop</h4>
                    <p><Link to="/products?category=Shirting">Shirting Fabrics</Link></p>
                    <p><Link to="/products?category=Suiting">Suiting Fabrics</Link></p>
                    <p><Link to="/products">All Products</Link></p>
                </div>
                <div>
                    <h4>Account</h4>
                    <p><Link to="/login">Sign In</Link></p>
                    <p><Link to="/register">Create Account</Link></p>
                    <p><Link to="/orders">My Orders</Link></p>
                    <p><Link to="/cart">Cart</Link></p>
                </div>
                <div>
                    <h4>Support</h4>
                    <p><a href="mailto:support@fabricart.com">support@fabricart.com</a></p>
                    <p>+91 98765 43210</p>
                    <p>Mon – Sat, 10AM – 7PM</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} FabriCart. All rights reserved. Crafted with precision.</p>
            </div>
        </footer>
    );
};

export default Footer;
