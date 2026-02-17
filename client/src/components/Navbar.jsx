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
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg">
                <span className="text-xl font-black tracking-tight">BookLenDen</span>
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">

            {/* Sell Book Button */}
            <Link to="/sell" className="relative px-6 py-2.5 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative text-white font-bold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Sell Book
              </span>
            </Link>

            {/* Orders Icon */}
            <Link to="/orders" className={`relative p-3 rounded-xl transition-all group ${isActive('/orders') ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
              <svg className={`w-6 h-6 transition-colors ${isActive('/orders') ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className={`relative p-3 rounded-xl transition-all group ${isActive('/cart') ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
              <svg className={`w-6 h-6 transition-colors ${isActive('/cart') ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">0</span>
            </Link>

            {/* Admin Button */}
            {token && user?.role === 'admin' && (
              <Link to="/admin/dashboard" className={`relative px-4 py-2.5 rounded-xl transition-all ${location.pathname.startsWith('/admin') ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
                <span className="font-bold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Admin
                </span>
              </Link>
            )}

            {/* Profile Dropdown */}
            {token ? (
              <div className="relative ml-2">
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all group">
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition"></div>
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {user?.firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-600 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20">

                      {/* User Info */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                        <p className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-gray-600">{user?.mobile || user?.email}</p>
                        {user?.role === 'admin' && (
                          <span className="inline-block mt-2 px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">Admin</span>
                        )}
                      </div>

                      <div className="p-2">
                        {/* Admin Dashboard */}
                        {user?.role === 'admin' && (
                          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 rounded-xl transition-all text-purple-700 font-medium" onClick={() => setIsProfileOpen(false)}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Admin Dashboard
                          </Link>
                        )}

                        {/* My Profile */}
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all text-gray-700 font-medium" onClick={() => setIsProfileOpen(false)}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>

                        {/* My Books */}
                        <Link to="/my-books" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all text-gray-700 font-medium" onClick={() => setIsProfileOpen(false)}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          My Books
                        </Link>

                        {/* ✅ MY SALES - NEW */}
                        <Link to="/my-sales" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/my-sales') ? 'bg-green-50 text-green-700' : 'hover:bg-green-50 text-gray-700 hover:text-green-700'}`} onClick={() => setIsProfileOpen(false)}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          My Sales
                        </Link>

                        {/* Wishlist */}
                        <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all text-gray-700 font-medium" onClick={() => setIsProfileOpen(false)}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Wishlist
                        </Link>
                      </div>

                      <div className="p-2 border-t border-gray-100">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-all text-red-600 font-medium">
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
              <Link to="/login" className="relative px-6 py-2.5 overflow-hidden group ml-2">
                <div className="absolute inset-0 border-2 border-blue-600 rounded-xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative text-blue-600 group-hover:text-white font-bold transition-colors">Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
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
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-2">
            {token ? (
              <>
                {/* User Info */}
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-3">
                  <p className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-600">{user?.mobile || user?.email}</p>
                </div>

                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="block w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-center" onClick={() => setIsMobileMenuOpen(false)}>
                    🎯 Admin Dashboard
                  </Link>
                )}

                <Link to="/sell" className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-center" onClick={() => setIsMobileMenuOpen(false)}>
                  🚀 Sell Book
                </Link>

                <Link to="/my-sales" className="block px-4 py-3 hover:bg-green-50 rounded-xl text-gray-700 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  📦 My Sales
                </Link>

                <Link to="/my-books" className="block px-4 py-3 hover:bg-gray-50 rounded-xl text-gray-700 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  📚 My Books
                </Link>

                <Link to="/orders" className="block px-4 py-3 hover:bg-gray-50 rounded-xl text-gray-700 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  🛍️ My Orders
                </Link>

                <Link to="/cart" className="block px-4 py-3 hover:bg-gray-50 rounded-xl text-gray-700 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  🛒 Cart
                </Link>

                <Link to="/wishlist" className="block px-4 py-3 hover:bg-gray-50 rounded-xl text-gray-700 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  ❤️ Wishlist
                </Link>

                <Link to="/profile" className="block px-4 py-3 hover:bg-gray-50 rounded-xl text-gray-700 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  👤 Profile
                </Link>

                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 hover:bg-red-50 rounded-xl text-red-600 font-medium">
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/sell" className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-center" onClick={() => setIsMobileMenuOpen(false)}>
                  🚀 Sell Book
                </Link>
                <Link to="/login" className="block w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-center" onClick={() => setIsMobileMenuOpen(false)}>
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