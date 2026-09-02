import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatAgeRangeForDisplay } from '@/lib/constants';
import type { ProductWithCategory, Category } from '@/types';
import ProductCard from '@/components/ProductCard';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'best-sellers';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCategory = searchParams.get('category') ?? '';
  const selectedGender = searchParams.get('gender') ?? '';
  const selectedAge = searchParams.get('age') ?? '';
  const sort = (searchParams.get('sort') ?? 'newest') as SortOption;
  const maxPrice = searchParams.get('maxPrice') ?? '';

  useEffect(() => {
    (async () => {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
      ]);
      setProducts((prods ?? []) as unknown as ProductWithCategory[]);
      setCategories(cats ?? []);
      setLoading(false);
    })();
  }, []);

  const ageGroups = [
    { value: '0-2', label: 'Baby (0-2 Years)' },
    { value: '2-6', label: 'Kids (2-6 Years)' },
    { value: '7-14', label: 'Juniors (7-14 Years)' },
  ];

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q));
    }
    if (selectedCategory) {
      result = result.filter((p) => p.category?.slug === selectedCategory);
    }
    if (selectedGender) {
      result = result.filter((p) => p.gender === selectedGender || p.gender === 'Unisex');
    }
    if (selectedAge) {
      result = result.filter((p) => {
        const ageRange = p.age_range ?? '';
        const [min, max] = selectedAge.split('-').map(Number);
        
        // Check if the product's age range overlaps with the selected range
        const ageMatches = ageRange.split(',').some(range => {
          const match = range.match(/(\d+)-(\d+)([MY])/i);
          if (!match) return false;
          
          const rangeStart = parseInt(match[1]);
          const rangeEnd = parseInt(match[2]);
          const unit = match[3].toUpperCase();
          
          if (unit === 'M') {
            // Convert months to years for comparison
            const rangeStartYears = rangeStart / 12;
            const rangeEndYears = rangeEnd / 12;
            return !(rangeEndYears < min || rangeStartYears > max);
          } else {
            // Years comparison
            return !(rangeEnd < min || rangeStart > max);
          }
        });
        
        return ageMatches;
      });
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      result = result.filter((p) => (p.discount_price ?? p.price) <= max);
    }

    switch (sort) {
      case 'price-low':
        result.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
        break;
      case 'price-high':
        result.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
        break;
      case 'best-sellers':
        result.sort((a, b) => Number(b.best_seller) - Number(a.best_seller));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [products, search, selectedCategory, selectedGender, selectedAge, maxPrice, sort]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearch('');
  };

  const activeFilterCount = [selectedCategory, selectedGender, selectedAge, maxPrice].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-ink-900 mb-2">Search</label>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/40" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="text-sm font-semibold text-ink-900 mb-2">Category</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam('category', '')}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-teal-50 text-teal-700 font-medium' : 'text-ink-700 hover:bg-cream-100'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.slug ? 'bg-teal-50 text-teal-700 font-medium' : 'text-ink-700 hover:bg-cream-100'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <h3 className="text-sm font-semibold text-ink-900 mb-2">Gender</h3>
        <div className="space-y-1.5">
          {['Boy', 'Girl', 'Unisex'].map((g) => (
            <button
              key={g}
              onClick={() => updateParam('gender', selectedGender === g ? '' : g)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedGender === g ? 'bg-teal-50 text-teal-700 font-medium' : 'text-ink-700 hover:bg-cream-100'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Age Group */}
      <div>
        <h3 className="text-sm font-semibold text-ink-900 mb-2">Age Group</h3>
        <div className="space-y-1.5">
          {ageGroups.map((a) => (
            <button
              key={a.value}
              onClick={() => updateParam('age', selectedAge === a.value ? '' : a.value)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedAge === a.value ? 'bg-teal-50 text-teal-700 font-medium' : 'text-ink-700 hover:bg-cream-100'}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-ink-900">Price Range</h3>
          <span className="text-sm font-semibold text-teal-700">
            {maxPrice ? `Up to ₹${parseInt(maxPrice)}` : 'Any Price'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-600 mb-2">
          <span>₹0</span>
          <span className="ml-auto">₹15,000</span>
        </div>
        <input
          type="range"
          min={0}
          max={15000}
          step={500}
          value={maxPrice || 15000}
          onChange={(e) => updateParam('maxPrice', e.target.value === '15000' ? '' : e.target.value)}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-cream-200 accent-teal-600"
          style={{
            background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${((maxPrice ? parseInt(maxPrice) : 15000) / 15000) * 100}%, #faf0d6 ${((maxPrice ? parseInt(maxPrice) : 15000) / 15000) * 100}%, #faf0d6 100%)`,
          }}
        />
        <div className="flex justify-between mt-2">
          <button
            onClick={() => updateParam('maxPrice', '')}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="w-full btn-outline text-sm py-2">
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
          Shop Kids&rsquo; Clothing
        </h1>
        <p className="text-ink-600 mt-1">Browse our full collection with free delivery in Darjeeling</p>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-28">
            <FilterPanel />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort & filter toggle */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white ring-1 ring-cream-200 text-sm font-medium text-ink-700"
            >
              <SlidersHorizontal size={16} /> Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-ink-600 hidden sm:inline">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="rounded-full border-2 border-cream-200 bg-white px-4 py-2 text-sm font-medium text-ink-800 focus:outline-none focus:border-teal-500"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="best-sellers">Best Sellers</option>
              </select>
            </div>
          </div>

          <p className="text-sm text-ink-600 mb-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="aspect-square bg-cream-200 rounded-xl mb-3" />
                  <div className="h-4 bg-cream-200 rounded mb-2" />
                  <div className="h-4 bg-cream-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-ink-600 text-lg">No products match your filters.</p>
              <button onClick={clearFilters} className="btn-outline mt-4">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-cream-50 shadow-2xl overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 rounded-full hover:bg-cream-200">
                <X size={20} />
              </button>
            </div>
            <FilterPanel />
            <button onClick={() => setShowFilters(false)} className="btn-primary w-full mt-6">
              Show {filtered.length} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
