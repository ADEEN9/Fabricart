import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { getProductImage } from '../utils/api';

const ProductCard = ({ product }) => {
    return (
        <div className="product-card animate-in">
            <Link to={`/product/${product._id}`}>
                <div className="product-card-image-wrapper">
                    <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="product-card-image"
                        loading="lazy"
                    />
                    <span className="product-card-badge">{product.category}</span>
                </div>
                <div className="product-card-body">
                    <div className="product-card-brand">{product.brand}</div>
                    <h3 className="product-card-name">{product.name}</h3>
                    <div className="product-card-material">{product.material} • {product.stock > 0 ? `${product.stock} mtr in stock` : 'Out of stock'}</div>
                    <div className="product-card-footer">
                        <div className="product-card-price">
                            ₹{product.price.toLocaleString()} <span>/ meter</span>
                        </div>
                        <button className="btn btn-primary btn-sm" title="View Product">
                            <FiShoppingBag size={14} />
                        </button>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
