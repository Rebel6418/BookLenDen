import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SellBook from './pages/SellBook';
import BookDetails from './pages/BookDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import MyBooks from './pages/MyBooks';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/admin/Dashboard';
import UsersManagement from './pages/admin/UsersManagement';
import BooksManagement from './pages/admin/BooksManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import Reports from './pages/admin/Reports';
import CategoryPage from './pages/CategoryPage';
//import UsersManagement from './pages/admin/UsersManagement';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/books" element={<BooksManagement />} />
          <Route path="/admin/orders" element={<OrdersManagement />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route 
            path="/sell" 
            element={
              <ProtectedRoute>
                <SellBook />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/my-books" 
            element={
              <ProtectedRoute>
                <MyBooks />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/wishlist" 
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;