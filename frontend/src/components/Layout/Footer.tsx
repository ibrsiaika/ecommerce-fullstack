import React from 'react';
import { Link } from 'react-router-dom';
import { FiTwitter, FiInstagram, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-white text-gray-900 mt-20">
      <div className="container px-2 sm:px-4 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-black to-gray-800 flex items-center justify-center text-white font-bold">
                E
              </div>
              <p className="text-lg sm:text-xl font-bold">E-Shop</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Thoughtfully curated essentials for the modern lifestyle. Quality, simplicity, and exceptional service.
            </p>
            <div className="flex gap-3">
              {[
                { icon: FiTwitter, href: '#' },
                { icon: FiInstagram, href: '#' },
                { icon: FiLinkedin, href: '#' },
              ].map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    className="p-2.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-all duration-300"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-6">Shop</h4>
            <ul className="space-y-3">
              {[
                { label: 'Collections', href: '/products' },
                { label: 'New Arrivals', href: '/products' },
                { label: 'Best Sellers', href: '/products' },
                { label: 'Gift Cards', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.href} 
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors relative group"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-6">Account</h4>
            <ul className="space-y-3">
              {[
                { label: 'Orders', href: '/orders' },
                { label: 'Profile', href: '/profile' },
                { label: 'Wishlist', href: '#' },
                { label: 'Returns', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.href} 
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors relative group"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-6">Support</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <p className="text-xs font-semibold text-gray-700 mb-1">Email</p>
                <a href="mailto:hello@eshop.com" className="text-gray-600 hover:text-gray-900 transition flex items-center gap-2">
                  <FiMail size={14} />
                  hello@eshop.com
                </a>
              </li>
              <li>
                <p className="text-xs font-semibold text-gray-700 mb-1">Phone</p>
                <a href="tel:+15554012025" className="text-gray-600 hover:text-gray-900 transition">
                  +1 (555) 401-2025
                </a>
              </li>
              <li>
                <p className="text-xs font-semibold text-gray-700 mb-1">Hours</p>
                <p className="text-gray-600">Mon–Fri, 9am–6pm ET</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 pt-8 sm:pt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-600">
            <div>
              <p className="font-semibold text-gray-900 mb-2">© 2025 E-Shop. All rights reserved.</p>
              <div className="flex flex-wrap gap-4 mt-3">
                <a href="#" className="hover:text-gray-900 transition">Privacy Policy</a>
                <a href="#" className="hover:text-gray-900 transition">Terms of Service</a>
                <a href="#" className="hover:text-gray-900 transition">Cookie Settings</a>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-gray-500">Crafted with precision for the modern shopper</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
