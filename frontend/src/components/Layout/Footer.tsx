import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-gray-900">
      <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-sm">
                E
              </div>
              <p className="text-base sm:text-lg font-semibold">E-Shop</p>
            </div>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
              Quality essentials and thoughtful curation. We focus on simplicity, reliability, and care.
            </p>
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
              <span className="pill text-xs sm:text-sm">Fast delivery</span>
              <span className="pill text-xs sm:text-sm">Secure</span>
              <span className="pill text-xs sm:text-sm">Support</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-700">Navigate</h4>
            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-700">Support</h4>
            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-gray-600">
              <li>
                <span className="block text-xs sm:text-sm font-medium">Email</span>
                <span className="text-xs sm:text-sm">hello@ecommerce.com</span>
              </li>
              <li>
                <span className="block text-xs sm:text-sm font-medium">Phone</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">+1 (555) 401-2025</span>
              </li>
              <li>
                <span className="block text-xs sm:text-sm">Mon–Fri, 9am–6pm</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 border-t border-gray-200 pt-4 sm:pt-6 text-xs sm:text-sm text-gray-600 sm:items-center sm:justify-between">
          <p>© 2025 E-Shop. All rights reserved.</p>
          <p className="text-gray-500">Built with React, TypeScript, and Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
