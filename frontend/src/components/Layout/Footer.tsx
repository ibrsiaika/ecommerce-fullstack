import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-gray-900">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white font-bold">
                E
              </div>
              <p className="text-lg font-semibold">E-Commerce</p>
            </div>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Quality essentials and thoughtful curation. We focus on simplicity, reliability, and care in every transaction.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="pill">Fast delivery</span>
              <span className="pill">Secure</span>
              <span className="pill">Support</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700">Navigate</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700">Support</h4>
            <ul className="mt-4 space-y-3 text-gray-600">
              <li>
                <span className="block">Email</span>
                <span className="text-sm">hello@ecommerce.com</span>
              </li>
              <li>
                <span className="block">Phone</span>
                <span className="text-sm font-medium text-gray-900">+1 (555) 401-2025</span>
              </li>
              <li>
                <span className="block text-sm">Monday – Friday, 9am – 6pm</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-6 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
          <p>© 2025 E-Commerce. All rights reserved.</p>
          <p className="text-gray-500">Built with React, TypeScript, and Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
