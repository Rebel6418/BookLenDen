import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsProfileOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
      isScrolled ? 'shadow-md' : 'border-b border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo - SVG Image */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src="/logo.png" 
              alt="BookLenDen" 
              className="h-40"
              onError={(e) => {
                // Fallback if logo.svg not found
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            {/* Fallback text (hidden by default) */}
            <div className="hidden bg-blue-600 text-white px-4 py-2 rounded-lg">
              <span className="text-xl font-bold">BookLenDen</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">

            {/* Sell Book Button - Solid Color */}
            <Link
              to="/sell"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Sell Book
            </Link>

            {/* Orders Icon */}
            <Link
              to="/orders"
              className={`p-2.5 rounded-lg transition-colors ${
                isActive('/orders') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="My Orders"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </Link>

            {/* Cart Icon with Badge */}
            <Link
              to="/cart"
              className={`relative p-2.5 rounded-lg transition-colors ${
                isActive('/cart') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="Cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                0
              </span>
            </Link>

            {/* Admin Button (if admin) */}
            {token && user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className={`px-4 py-2.5 rounded-lg font-semibold transition-colors ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                Admin
              </Link>
            )}

            {/* User Profile or Login */}
            {token ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <svg className={`w-4 h-4 text-gray-600 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-20">
                      
                      {/* User Info Header */}
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 text-gray-700 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Admin Dashboard
                          </Link>
                        )}
                        
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 text-gray-700 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>

                        <Link
                          to="/my-books"
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 text-gray-700 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          My Books
                        </Link>

                        <Link
                          to="/my-sales"
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 text-gray-700 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          My Sales
                        </Link>

                        <Link
                          to="/wishlist"
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 text-gray-700 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Wishlist
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-200">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold rounded-lg transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            {token ? (
              <>
                {/* User Info */}
                <div className="px-4 py-3 bg-gray-50 rounded-lg mb-3">
                  <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="block px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}

                <Link
                  to="/sell"
                  className="block px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🚀 Sell Book
                </Link>

                <Link
                  to="/my-sales"
                  className="block px-4 py-2.5 hover:bg-gray-100 rounded-lg text-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  📦 My Sales
                </Link>

                <Link
                  to="/my-books"
                  className="block px-4 py-2.5 hover:bg-gray-100 rounded-lg text-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  📚 My Books
                </Link>

                <Link
                  to="/orders"
                  className="block px-4 py-2.5 hover:bg-gray-100 rounded-lg text-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🛍️ My Orders
                </Link>

                <Link
                  to="/cart"
                  className="block px-4 py-2.5 hover:bg-gray-100 rounded-lg text-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🛒 Cart
                </Link>

                <Link
                  to="/wishlist"
                  className="block px-4 py-2.5 hover:bg-gray-100 rounded-lg text-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ❤️ Wishlist
                </Link>

                <Link
                  to="/profile"
                  className="block px-4 py-2.5 hover:bg-gray-100 rounded-lg text-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  👤 Profile
                </Link>

                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 hover:bg-red-50 rounded-lg text-red-600"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/sell"
                  className="block px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🚀 Sell Book
                </Link>
                <Link
                  to="/login"
                  className="block px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;