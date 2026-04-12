import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import Skeleton from '../components/Skeleton';
import { SlidersHorizontal } from 'lucide-react';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    sort: searchParams.get('sort') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    size: searchParams.get('size') || '',
    search: searchParams.get('q') || '',
  });

  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || '',
      tag: searchParams.get('tag') || '',
      sort: searchParams.get('sort') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      size: searchParams.get('size') || '',
      search: searchParams.get('q') || '',
    });
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.tag) params.append('tags', filters.tag);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.size) params.append('size', filters.size);
      if (filters.search) params.append('search', filters.search);

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
    setFilters({ category: '', tag: '', sort: '', minPrice: '', maxPrice: '', size: '', search: '' });
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
              <div className="mb-10">
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

              {/* Price Filter */}
              <div className="mb-10">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input 
                        type="number" 
                        placeholder="Min" 
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm font-bold focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                        type="number" 
                        placeholder="Max" 
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm font-bold focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[
                        { label: 'Under ₹5k', min: '0', max: '5000' },
                        { label: '₹5k - ₹10k', min: '5000', max: '10000' }
                    ].map((range) => (
                        <button
                            key={range.label}
                            onClick={() => {
                                handleFilterChange('minPrice', range.min);
                                handleFilterChange('maxPrice', range.max);
                            }}
                            className="bg-gray-100 px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-500 hover:bg-gray-200 transition-colors"
                        >
                            {range.label}
                        </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Size (UK)</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[6, 7, 8, 9, 10, 11, 12].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => handleFilterChange('size', filters.size == sz ? '' : sz)}
                      className={`h-10 rounded-lg text-sm font-bold border-2 transition-all ${filters.size == sz
                        ? 'bg-[#0F1720] text-white border-[#0F1720]'
                        : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                        }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                ))}
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
