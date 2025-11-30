import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal } from 'lucide-react';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    sort: searchParams.get('sort') || '',
  });

  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || '',
      tag: searchParams.get('tag') || '',
      sort: searchParams.get('sort') || '',
    });
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.tag) params.append('tags', filters.tag);
      if (filters.sort) params.append('sort', filters.sort);

      const response = await axios.get(`http://localhost:5000/api/products?${params.toString()}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newParams.set(k, v);
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({ category: '', tag: '', sort: '' });
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-16 lg:py-24 px-12 lg:px-20">
        {/* Header - Minimal & Bold */}
        <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">
              Collection
            </div>
            <h1 className="text-heading text-5xl lg:text-7xl font-black text-[#0F1720] tracking-tight leading-none">
              SHOP ALL
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Sort By:</span>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="bg-gray-50 border-none text-sm font-bold text-[#0F1720] rounded-lg px-4 py-3 focus:ring-0 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Filters Sidebar - Clean & Minimal */}
          <div className="lg:col-span-3 space-y-10">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-[#0F1720] uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </h2>
                {(filters.category || filters.tag || filters.sort) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-wider"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-10">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Category</h3>
                <div className="space-y-3">
                  {['All', 'Running', 'Training', 'Casual', 'Basketball', 'Football'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleFilterChange('category', cat === 'All' ? '' : cat)}
                      className={`block w-full text-left text-sm font-bold transition-all duration-200 ${(filters.category === cat) || (cat === 'All' && !filters.category)
                        ? 'text-blue-600 translate-x-2'
                        : 'text-gray-500 hover:text-blue-600 hover:translate-x-1'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Filter */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Collections</h3>
                <div className="space-y-3">
                  {['New Arrival', 'Best Seller', 'Limited Edition'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleFilterChange('tag', filters.tag === tag ? '' : tag)}
                      className={`block w-full text-left text-sm font-bold transition-all duration-200 ${filters.tag === tag
                        ? 'text-blue-600 translate-x-2'
                        : 'text-gray-500 hover:text-blue-600 hover:translate-x-1'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0F1720] rounded-full animate-spin"></div>
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Loading Gear...</div>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-32 bg-gray-50 rounded-3xl">
                <h2 className="text-2xl font-black text-[#0F1720] mb-4">No products found</h2>
                <p className="text-gray-500 mb-8">Try adjusting your filters to find what you're looking for.</p>
                <button onClick={clearFilters} className="inline-flex items-center justify-center bg-[#0F1720] text-white font-bold px-8 py-4 rounded-full hover:bg-[#2a3441] transition-colors uppercase tracking-wide text-sm">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Showing {products.length} Results
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
