import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../../store/slices/productSlice';
import { fetchAllOrders, fetchSalesStats, updateOrderStatus } from '../../store/slices/orderSlice';
import { FiPackage, FiDollarSign, FiShoppingBag, FiTruck, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API, { getProductImage } from '../../utils/api';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { items: products } = useSelector((state) => state.products);
    const { allOrders, stats } = useSelector((state) => state.orders);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        dispatch(fetchProducts({ limit: 100 }));
        dispatch(fetchAllOrders({}));
        dispatch(fetchSalesStats());
    }, [dispatch]);

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await dispatch(deleteProduct(id)).unwrap();
                toast.success('Product deleted');
            } catch (err) {
                toast.error(err);
            }
        }
    };

    const handleStatusUpdate = async (orderId, status) => {
        try {
            await dispatch(updateOrderStatus({ id: orderId, status })).unwrap();
            toast.success(`Order marked as ${status}`);
        } catch (err) {
            toast.error(err);
        }
    };

    const tabs = [
        { key: 'dashboard', label: 'Dashboard', icon: <FiPackage /> },
        { key: 'products', label: 'Products', icon: <FiShoppingBag /> },
        { key: 'orders', label: 'Orders', icon: <FiTruck /> },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div style={{ padding: '0 var(--space-xl) var(--space-xl)', fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700 }}>
                    Admin <span style={{ color: 'var(--color-accent)' }}>Panel</span>
                </div>
                <ul className="admin-sidebar-nav">
                    {tabs.map((tab) => (
                        <li key={tab.key}>
                            <a
                                href="#"
                                className={activeTab === tab.key ? 'active' : ''}
                                onClick={(e) => { e.preventDefault(); setActiveTab(tab.key); }}
                            >
                                {tab.icon} {tab.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <>
                        <h2 style={{ marginBottom: 'var(--space-xl)' }}>Dashboard Overview</h2>
                        <div className="stat-cards">
                            <div className="stat-card">
                                <div className="stat-card-icon" style={{ background: 'rgba(201, 168, 76, 0.12)', color: 'var(--color-accent)' }}>
                                    <FiDollarSign />
                                </div>
                                <div className="stat-card-label">Total Sales</div>
                                <div className="stat-card-value">₹{stats?.totalSales?.toLocaleString() || 0}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-icon" style={{ background: 'rgba(52, 152, 219, 0.12)', color: 'var(--color-info)' }}>
                                    <FiPackage />
                                </div>
                                <div className="stat-card-label">Total Orders</div>
                                <div className="stat-card-value">{stats?.totalOrders || 0}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-icon" style={{ background: 'rgba(243, 156, 18, 0.12)', color: 'var(--color-warning)' }}>
                                    <FiTruck />
                                </div>
                                <div className="stat-card-label">Pending Orders</div>
                                <div className="stat-card-value">{stats?.pendingOrders || 0}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-icon" style={{ background: 'rgba(39, 174, 96, 0.12)', color: 'var(--color-success)' }}>
                                    <FiShoppingBag />
                                </div>
                                <div className="stat-card-label">Products</div>
                                <div className="stat-card-value">{products.length}</div>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>Recent Orders</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allOrders.slice(0, 5).map((order) => (
                                    <tr key={order._id}>
                                        <td style={{ fontFamily: 'monospace' }}>{order._id.slice(-8).toUpperCase()}</td>
                                        <td>{order.user?.name || 'N/A'}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                                        <td style={{ fontWeight: 600 }}>₹{order.totalPrice.toLocaleString()}</td>
                                        <td><span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                            <h2>Manage Products</h2>
                            <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>
                                <FiPlus /> Add Product
                            </button>
                        </div>

                        {showProductForm && (
                            <ProductForm
                                product={editingProduct}
                                onClose={() => { setShowProductForm(false); setEditingProduct(null); }}
                                onSuccess={() => {
                                    setShowProductForm(false);
                                    setEditingProduct(null);
                                    dispatch(fetchProducts({ limit: 100 }));
                                }}
                            />
                        )}

                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Brand</th>
                                    <th>Category</th>
                                    <th>Price / mtr</th>
                                    <th>Stock (mtr)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id}>
                                        <td>
                                            <img src={getProductImage(product)} alt={product.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{product.name}</td>
                                        <td>{product.brand}</td>
                                        <td><span className="badge badge-processing">{product.category}</span></td>
                                        <td>₹{product.price.toLocaleString()}</td>
                                        <td>
                                            <span className={product.stock > 0 ? '' : 'badge badge-cancelled'}>
                                                {product.stock > 0 ? `${product.stock} mtr` : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                                                <button className="btn btn-outline btn-sm" onClick={() => { setEditingProduct(product); setShowProductForm(true); }}>
                                                    <FiEdit2 size={13} />
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(product._id)}>
                                                    <FiTrash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <>
                        <h2 style={{ marginBottom: 'var(--space-xl)' }}>All Orders</h2>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order._id.slice(-8).toUpperCase()}</td>
                                        <td>{order.user?.name || 'N/A'}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                                        <td>{order.orderItems.length}</td>
                                        <td style={{ fontWeight: 600 }}>₹{order.totalPrice.toLocaleString()}</td>
                                        <td><span className={`badge ${order.isPaid ? 'badge-paid' : 'badge-unpaid'}`}>{order.isPaid ? 'Paid' : 'Pending'}</span></td>
                                        <td><span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span></td>
                                        <td>
                                            <select
                                                className="form-control"
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', minWidth: 120 }}
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            >
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </main>
        </div>
    );
};

// ─── Product Form Sub-Component ──────────────────────────────────────
const ProductForm = ({ product, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        brand: product?.brand || '',
        category: product?.category || 'Shirting',
        material: product?.material || 'Cotton',
        price: product?.price || '',
        stock: product?.stock || '',
        description: product?.description || '',
    });
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }
        setImages(files);

        // Generate previews
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    const removePreview = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([key, val]) => fd.append(key, val));

            // Append multiple images
            images.forEach((img) => fd.append('images', img));

            if (product) {
                await API.put(`/products/${product._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Product updated!');
            } else {
                await API.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Product created!');
            }
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save product');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)' }}>{product ? 'Edit Product' : 'Add New Product'}</h3>
                <button className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="form-group">
                        <label>Product Name</label>
                        <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Brand</label>
                        <input type="text" className="form-control" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select className="form-control" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                            <option value="Shirting">Shirting</option>
                            <option value="Suiting">Suiting</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Material</label>
                        <select className="form-control" value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })}>
                            <option value="Cotton">Cotton</option>
                            <option value="Linen">Linen</option>
                            <option value="Silk">Silk</option>
                            <option value="Wool">Wool</option>
                            <option value="Polyester">Polyester</option>
                            <option value="Blend">Blend</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Price per Meter (₹)</label>
                        <input type="number" className="form-control" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required min="0" step="0.01" placeholder="e.g. 450" />
                    </div>
                    <div className="form-group">
                        <label>Stock (in Meters)</label>
                        <input type="number" className="form-control" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required min="0" step="0.5" placeholder="e.g. 100" />
                    </div>
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-control" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label>Product Images (up to 5)</label>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="form-control" />
                    {previews.length > 0 && (
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)', flexWrap: 'wrap' }}>
                            {previews.map((src, idx) => (
                                <div key={idx} style={{ position: 'relative', width: 80, height: 80 }}>
                                    <img
                                        src={src}
                                        alt={`Preview ${idx + 1}`}
                                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-border)' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePreview(idx)}
                                        style={{
                                            position: 'absolute', top: -6, right: -6,
                                            width: 20, height: 20, borderRadius: '50%',
                                            background: 'var(--color-danger)', color: '#fff',
                                            border: 'none', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '10px', padding: 0,
                                        }}
                                    >
                                        <FiX size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                    {submitting ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
                </button>
            </form>
        </div>
    );
};

export default AdminDashboard;
