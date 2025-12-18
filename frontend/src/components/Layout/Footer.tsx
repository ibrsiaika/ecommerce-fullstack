import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-b from-transparent to-black/40 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-14">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-lg shadow-amber-900/40 flex items-center justify-center text-slate-900 font-black">
                E.
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Maison</p>
                <p className="text-xl font-semibold text-white">E-Commerce</p>
              </div>
            </div>
            <p className="mt-4 text-white/70 leading-relaxed">
              Curated essentials, intentional luxuries, and a concierge team that cares about every parcel. 
              Every interaction is designed to feel private, personal, and beautifully considered.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-white/50">
              <span className="pill bg-white/10 text-white border-white/20">Same-week delivery</span>
              <span className="pill bg-white/5 text-white border-white/10">Insured shipments</span>
              <span className="pill bg-white/5 text-white border-white/10">Human concierge</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] text-white/60">Navigate</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/" className="text-white/80 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-white/80 hover:text-white transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-white/80 hover:text-white transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-white/80 hover:text-white transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] text-white/60">Concierge</h4>
            <ul className="mt-4 space-y-3 text-white/80">
              <li className="flex items-center justify-between">
                <span>Live chat</span>
                <span className="pill bg-emerald-400/10 text-emerald-200 border-emerald-200/20">Online</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Call</span>
                <span className="text-white font-semibold">+1 (555) 401-2024</span>
              </li>
              <li>
                <span className="block">White-glove support</span>
                <span className="text-xs text-white/60">10am – 10pm, 7 days a week</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© 2024 E-Commerce. Crafted for people who expect more.</p>
          <p className="text-white/50">Built with React, TypeScript, and a lot of care.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
