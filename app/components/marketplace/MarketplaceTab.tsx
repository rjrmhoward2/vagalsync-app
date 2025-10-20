'use client';

import React, { useState } from 'react';
import { ShoppingCart, Sparkles, Settings, Package, Star, TrendingUp, ExternalLink, Filter } from 'lucide-react';

export default function MarketplaceTab() {
  const [priceFilter, setPriceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [budgetOnly, setBudgetOnly] = useState(false);

  // Sample marketplace items
  const marketplaceItems = [
    {
      id: 1,
      name: 'Apollo Neuro',
      category: 'Neuromodulation',
      price: 349,
      rating: 4.8,
      reviews: 2847,
      effectiveness: 94,
      image: '🎧',
      description: 'Wearable that uses gentle vibrations to improve HRV and reduce stress'
    },
    {
      id: 2,
      name: 'Muse S Headband',
      category: 'Wearables',
      price: 399,
      rating: 4.6,
      reviews: 1923,
      effectiveness: 89,
      image: '🎯',
      description: 'Real-time EEG feedback for meditation and sleep tracking'
    }
  ];

  const filteredItems = marketplaceItems.filter(item => {
    if (priceFilter !== 'all') {
      if (priceFilter === 'budget' && item.price > 100) return false;
      if (priceFilter === 'moderate' && (item.price < 25 || item.price > 75)) return false;
      if (priceFilter === 'premium' && item.price < 300) return false;
    }
    if (categoryFilter !== 'all' && item.category.toLowerCase() !== categoryFilter) return false;
    if (budgetOnly && item.price > 200) return false;
    return true;
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-white mb-4 flex items-center justify-center">
          <ShoppingCart className="w-12 h-12 mr-4 text-cyan-300" />
          VagalSync Marketplace
          <Sparkles className="w-10 h-10 ml-4 text-yellow-400" />
        </h2>
        <p className="text-2xl text-cyan-300/80">
          Evidence-based devices and tools to optimize your wellness journey
        </p>
      </div>

      {/* FILTERS SECTION - FIXED CONTRAST */}
      <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 rounded-3xl p-8 border border-gray-600/50 backdrop-blur-xl">
        <h3 className="text-white text-xl font-bold mb-6 flex items-center">
          <Filter className="w-6 h-6 mr-3 text-cyan-400" />
          Filters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Price Range - FIXED */}
          <div>
            <label className="block text-white font-medium mb-3 text-base">
              💰 Price Range
            </label>
            <select 
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full bg-gray-700 text-white border-2 border-gray-600 rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer hover:bg-gray-650 transition-colors"
            >
              <option value="all" className="bg-gray-700 text-white">All Prices</option>
              <option value="budget" className="bg-gray-700 text-white">Budget ($0-$100)</option>
              <option value="moderate" className="bg-gray-700 text-white">Moderate ($25-$75)</option>
              <option value="premium" className="bg-gray-700 text-white">Premium ($300+)</option>
            </select>
          </div>

          {/* Category - FIXED */}
          <div>
            <label className="block text-white font-medium mb-3 text-base">
              📂 Category
            </label>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-gray-700 text-white border-2 border-gray-600 rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer hover:bg-gray-650 transition-colors"
            >
              <option value="all" className="bg-gray-700 text-white">All Categories</option>
              <option value="wearables" className="bg-gray-700 text-white">Wearables</option>
              <option value="neuromodulation" className="bg-gray-700 text-white">Neuromodulation</option>
              <option value="lab-testing" className="bg-gray-700 text-white">Lab Testing</option>
              <option value="supplements" className="bg-gray-700 text-white">Supplements</option>
            </select>
          </div>

          {/* Budget Toggle - FIXED */}
          <div>
            <label className="block text-white font-medium mb-3 text-base">
              ✅ Budget Filter
            </label>
            <div className="flex items-center space-x-3 bg-gray-700 rounded-xl px-4 py-3 border-2 border-gray-600 hover:bg-gray-650 transition-colors">
              <input 
                type="checkbox"
                id="budget-toggle"
                checked={budgetOnly}
                onChange={(e) => setBudgetOnly(e.target.checked)}
                className="w-5 h-5 rounded border-gray-500 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              />
              <label htmlFor="budget-toggle" className="text-white font-medium cursor-pointer flex-1">
                Only show products in my budget
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button 
            onClick={() => {
              setPriceFilter('all');
              setCategoryFilter('all');
              setBudgetOnly(false);
            }}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Clear All Filters
          </button>
          <div className="text-white/60 text-sm">
            Showing {filteredItems.length} of {marketplaceItems.length} products
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-cyan-400/50 transition-all hover:scale-105 backdrop-blur-xl"
          >
            {/* Product Image/Icon */}
            <div className="text-6xl mb-4 text-center">{item.image}</div>

            {/* Product Info */}
            <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
            <p className="text-cyan-400 text-sm mb-3">{item.category}</p>
            <p className="text-white/70 text-sm mb-4">{item.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-yellow-400 text-sm mb-1 flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Rating
                </div>
                <div className="text-white font-bold">{item.rating}/5.0</div>
                <div className="text-white/50 text-xs">{item.reviews} reviews</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-green-400 text-sm mb-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Effective
                </div>
                <div className="text-white font-bold">{item.effectiveness}%</div>
                <div className="text-white/50 text-xs">User data</div>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <div className="text-2xl font-bold text-cyan-400">${item.price}</div>
                <div className="text-white/50 text-xs">One-time purchase</div>
              </div>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-full font-bold hover:from-cyan-600 hover:to-blue-600 transition-all flex items-center space-x-2">
                <span>View</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="bg-white/10 rounded-3xl p-12 text-center backdrop-blur-xl border border-white/20">
          <Package className="w-20 h-20 mx-auto mb-6 text-gray-400" />
          <h3 className="text-2xl font-bold text-white mb-4">No Products Found</h3>
          <p className="text-white/70 text-lg mb-6">
            Try adjusting your filters to see more products
          </p>
          <button
            onClick={() => {
              setPriceFilter('all');
              setCategoryFilter('all');
              setBudgetOnly(false);
            }}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-full font-bold hover:from-cyan-600 hover:to-blue-600 transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* AI Shopping Assistant */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-3xl p-8 border border-purple-400/30 backdrop-blur-xl">
        <div className="flex items-start space-x-4">
          <div className="text-4xl">🤖</div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">AI Shopping Assistant</h3>
            <p className="text-white/70 mb-4">
              Based on your myVagal Tone™ score and biomarker data, we recommend the Apollo Neuro 
              for improving HRV and stress management. It has shown 94% effectiveness in users with 
              similar profiles to yours.
            </p>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold hover:from-purple-700 hover:to-pink-700 transition-all">
              Get Personalized Recommendations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
