// Resetting App.jsx to clear any compilation deadlocks.
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminRoute, PrivateRoute, AuthRoute } from './components/ProtectedRoute';
import Dashboard from './pages/Admin/Dashboard';
import Products from './pages/Admin/Products';
import Orders from './pages/Admin/Orders';
import Users from './pages/Admin/Users';
import AdminBlogs from './pages/Admin/Blogs';
import AdminReports from './pages/Admin/Reports';
import AdminContact from './pages/Admin/Contact';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Home from './pages/Home';
import Layout from "./components/Layout";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import OrderSuccess from "./pages/OrderSuccess";
import Profile from "./pages/Profile";
import OrderHistory from "./pages/OrderHistory";
import OrderDetail from "./pages/OrderDetail";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import About from "./pages/About";
import Distributor from "./pages/Distributor";
import Contact from "./pages/Contact";
import PaymentResult from "./pages/PaymentResult";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      
      {/* Auth Routes */}
      <Route path="/auth/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/auth/register" element={<AuthRoute><Register /></AuthRoute>} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      
      <Route path="/payment/success" element={<PaymentResult />} />
      <Route path="/payment/failed" element={<PaymentResult />} />
      <Route path="/payment/result" element={<PaymentResult />} />
      
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/product" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/order-success" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/account" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/account/orders" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
        <Route path="/orders/:orderId" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/distributor" element={<Distributor />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><Products /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><Orders /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
      <Route path="/admin/blogs" element={<AdminRoute><AdminBlogs /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
      <Route path="/admin/contact" element={<AdminRoute><AdminContact /></AdminRoute>} />
      
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
