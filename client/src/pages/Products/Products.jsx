import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import ProductCard from '../../components/ProductCard';

const Products = () => {
    const dispatch = useDispatch();
    const { items, pagination, loading } = useSelector((state) => state.products);
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        material: searchParams.get('material') || '',
        brand: searchParams.get('brand') || '',
        sort: searchParams.get('sort') || '',
        search: searchParams.get('search') || '',
        page: searchParams.get('page') || 1,
    });

    useEffect(() => {
        const params = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        dispatch(fetchProducts(params));
    }, [dispatch, filters]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value, page: 1 };
        setFilters(newFilters);
        const params = {};
        Object.entries(newFilters).forEach(([k, v]) => { if (v) params[k] = v; });
        setSearchParams(params);
    };

    const handlePageChange = (page) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    return (
        <div className="page-wrapper">
            <div className="container">
                <div className="section-title" style={{ marginBottom: 'var(--space-xl)' }}>
                    <h2>{filters.category || 'All'} Fabrics</h2>
                    <p>Browse our complete collection</p>
                    <div className="accent-line"></div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="filter-group">
                        <label>Category</label>
                        <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                            <option value="">All Categories</option>
                            <option value="Shirting">Shirting</option>
                            <option value="Suiting">Suiting</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Material</label>
                        <select value={filters.material} onChange={(e) => handleFilterChange('material', e.target.value)}>
                            <option value="">All Materials</option>
                            <option value="Cotton">Cotton</option>
                            <option value="Linen">Linen</option>
                            <option value="Silk">Silk</option>
                            <option value="Wool">Wool</option>
                            <option value="Polyester">Polyester</option>
                            <option value="Blend">Blend</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Sort By</label>
                        <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}>
                            <option value="">Newest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                            <option value="name">Name A-Z</option>
                        </select>
                    </div>
                    <div className="filter-group" style={{ flex: 1 }}>
                        <label>Search</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search fabrics..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            style={{ padding: '0.45rem 0.8rem' }}
                        />
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="spinner-wrapper"><div className="spinner"></div></div>
                ) : items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--color-text-light)' }}>
                        <p style={{ fontSize: '1.1rem' }}>No products found matching your criteria.</p>
                    </div>
                ) : (
                    <>
                        <div className="product-grid">
                            {items.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-2xl)' }}>
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        className={`btn ${page === pagination.currentPage ? 'btn-primary' : 'btn-outline'} btn-sm`}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Products;
