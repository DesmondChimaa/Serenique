import { Link, Outlet, useLocation } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function PublicLayout() {
  const location = useLocation();
  const isBooking = location.pathname.startsWith('/book');
  const isHome = location.pathname === '/';

  return (
    <div className="flex flex-col h-full w-full bg-stone-50 text-stone-900 font-sans overflow-x-hidden min-h-screen relative">
      <header className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl bg-white rounded-full flex items-center justify-between px-4 md:px-8 py-2 md:py-3.5 shadow-lg shadow-stone-900/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-stone-50 font-serif italic text-lg leading-none">S</span>
          </div>
          <span className="font-serif tracking-tight text-xl text-stone-900 font-medium hidden sm:block">Serenique</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <Link to="/" className={`${isHome && !isBooking ? 'text-primary-600 font-bold' : 'hover:text-primary-600 transition-colors'}`}>Home</Link>
          <a href="/#about" className="hover:text-primary-600 transition-colors">About Us</a>
          <Link to={isBooking ? "#" : "/#services"} className={`${isBooking ? 'text-primary-600 font-bold' : 'hover:text-primary-600 transition-colors'}`}>Services</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/book" 
            className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 disabled:pointer-events-none disabled:opacity-50 bg-primary-600 text-white shadow-md shadow-primary-600/20 hover:bg-primary-700 h-9 md:h-10 px-5 md:px-6 py-2 md:py-2.5"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="px-6 md:px-10 py-6 bg-white border-t border-stone-200 flex flex-col md:flex-row items-center justify-center md:justify-between text-[11px] uppercase tracking-widest font-bold text-stone-500 gap-4">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-center md:text-left">
          <span>123 Wellness Ave, Suite 100</span>
          <span className="hidden md:inline">•</span>
          <span>Contact: (555) 123-4567</span>
        </div>
      </footer>
    </div>
  );
}
