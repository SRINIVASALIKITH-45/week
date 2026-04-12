import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import Home from './pages/Home';
import UnifiedLogin from './pages/UnifiedLogin';
import CustomerRegister from './pages/CustomerRegister';
import PublicMenu from './pages/PublicMenu';
import CustomerOrders from './pages/CustomerOrders';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Drivers from './pages/Drivers';
import Coupons from './pages/Coupons';
import Settings from './pages/Settings';
import AdminLogs from './pages/AdminLogs';
import KitchenStaff from './pages/KitchenStaff';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerProtectedRoute from './components/CustomerProtectedRoute';
import DriverProtectedRoute from './components/DriverProtectedRoute';
import AdminLayout from './components/AdminLayout';

// ── Customer Panel Pages ──────────────────────────────────────
import CustomerHome from './pages/customer/CustomerHome';
import CustomerListing from './pages/customer/CustomerListing';
import CustomerProductDetail from './pages/customer/CustomerProductDetail';
import CustomerCart from './pages/customer/CustomerCart';
import CustomerOrderTracking from './pages/customer/CustomerOrderTracking';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerPayment from './pages/customer/CustomerPayment';

// ── Driver Panel Pages ──────────────────────────────────────
const DriverLoginPlaceholder = () => <Navigate to="/login" replace />; // Redirect legacy path
import DriverHome from './pages/driver/DriverHome';
import DriverActiveDelivery from './pages/driver/DriverActiveDelivery';
import DriverEarnings from './pages/driver/DriverEarnings';
import DriverProfile from './pages/driver/DriverProfile';

// ── Writer Panel Pages ──────────────────────────────────────
import WriterLayout from './components/writer/WriterLayout';
import WriterProtectedRoute from './components/WriterProtectedRoute';
import WriterHome from './pages/writer/WriterHome';
import WriterOrder from './pages/writer/WriterOrder';
import WriterCart from './pages/writer/WriterCart';
import WriterKOTs from './pages/writer/WriterKOTs';
import WriterProfile from './pages/writer/WriterProfile';
import KitchenPanel from './pages/kitchen/KitchenPanel';
import KitchenProtectedRoute from './components/KitchenProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<UnifiedLogin />} />
        <Route path="/admin-login" element={<Navigate to="/login?role=admin" replace />} />
        <Route path="/customer-login" element={<Navigate to="/login" replace />} />
        <Route path="/customer-register" element={<CustomerRegister />} />

        {/* Legacy Customer Routes (Redirecting to new structure) */}
        <Route path="/menu" element={<Navigate to="/customer/restaurants" replace />} />
        <Route path="/my-orders" element={<Navigate to="/customer/orders" replace />} />

        {/* ── Customer Panel (/customer/*) ─────────────────────── */}
        <Route
          path="/customer/home"
          element={<CustomerProtectedRoute><CustomerHome /></CustomerProtectedRoute>}
        />
        <Route
          path="/customer/restaurants"
          element={<CustomerProtectedRoute><CustomerListing /></CustomerProtectedRoute>}
        />
        <Route
          path="/customer/product/:id"
          element={<CustomerProtectedRoute><CustomerProductDetail /></CustomerProtectedRoute>}
        />
        <Route
          path="/customer/cart"
          element={<CustomerProtectedRoute><CustomerCart /></CustomerProtectedRoute>}
        />
        <Route
          path="/customer/payment"
          element={<CustomerProtectedRoute><CustomerPayment /></CustomerProtectedRoute>}
        />
        <Route
          path="/customer/orders"
          element={<CustomerProtectedRoute><CustomerOrderTracking /></CustomerProtectedRoute>}
        />
        <Route
          path="/customer/profile"
          element={<CustomerProtectedRoute><CustomerProfile /></CustomerProtectedRoute>}
        />
        {/* Redirect bare /customer to /customer/home */}
        <Route path="/customer" element={<Navigate to="/customer/home" replace />} />

        {/* ── Driver Panel (/driver/*) ─────────────────────── */}
        <Route path="/driver/login" element={<Navigate to="/login" replace />} />
        <Route path="/driver/home" element={<DriverProtectedRoute><DriverHome /></DriverProtectedRoute>} />
        <Route path="/driver/active-delivery" element={<DriverProtectedRoute><DriverActiveDelivery /></DriverProtectedRoute>} />
        <Route path="/driver/earnings" element={<DriverProtectedRoute><DriverEarnings /></DriverProtectedRoute>} />
        <Route path="/driver/profile" element={<DriverProtectedRoute><DriverProfile /></DriverProtectedRoute>} />
        <Route path="/driver" element={<Navigate to="/driver/home" replace />} />

        {/* ── Writer Panel (/writer/*) ─────────────────────── */}
        <Route element={<WriterProtectedRoute><WriterLayout /></WriterProtectedRoute>}>
          <Route path="/writer/home" element={<WriterHome />} />
          <Route path="/writer/order/:id" element={<WriterOrder />} />
          <Route path="/writer/cart/:id" element={<WriterCart />} />
          <Route path="/writer/kots" element={<WriterKOTs />} />
          <Route path="/writer/profile" element={<WriterProfile />} />
        </Route>
        <Route path="/writer" element={<Navigate to="/writer/home" replace />} />

        {/* ── Admin Routes ─────────────────────────────────────── */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/add" element={<AddProduct />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logs" element={<AdminLogs />} />
          <Route path="/kitchen-staff" element={<KitchenStaff />} />
        </Route>

        {/* ── Kitchen Display (standalone screen) ───────────────── */}
        <Route path="/kitchen" element={<KitchenProtectedRoute><KitchenPanel /></KitchenProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
