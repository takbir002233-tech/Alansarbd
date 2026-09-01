import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import LiveChatWidget from './components/LiveChatWidget';
import NotificationToasts from './components/NotificationToasts';
import InvoiceModal from './components/InvoiceModal';

// Customer Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTrack from './pages/OrderTrack';
import UserDashboard from './pages/UserDashboard';
import ContactUs from './pages/ContactUs';
import QardHasana from './pages/QardHasana';
import TermsAndConditions from './pages/TermsAndConditions';
import { Login, Register, ForgotPassword } from './pages/AuthPages';

// Admin Pages
import SecretAdminLogin from './pages/SecretAdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminVouchers from './pages/admin/AdminVouchers';
import AdminUsers from './pages/admin/AdminUsers';
import AdminChatDesk from './pages/admin/AdminChatDesk';
import AdminSettings from './pages/admin/AdminSettings';

function MainApp() {
  const { user, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  // Admin Tab Navigation
  const [adminTab, setAdminTab] = useState('dashboard');

  // Check URL hash for secret admin route on mount or hash change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#/al-ansar-admin' || hash === '#admin' || hash === '#/admin') {
        setCurrentPage('al-ansar-admin');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL hash smoothly
    if (page === 'al-ansar-admin') {
      window.location.hash = '/al-ansar-admin';
    } else if (window.location.hash.includes('admin')) {
      window.location.hash = '';
    }
  };

  const handleOpenInvoice = (order) => {
    setInvoiceOrder(order);
  };

  const handleCloseInvoice = () => {
    setInvoiceOrder(null);
  };

  // Render Hidden Admin Portal (Accessible via /al-ansar-admin or #/al-ansar-admin)
  if (currentPage === 'al-ansar-admin' || currentPage === 'admin') {
    if (!isAdmin) {
      return (
        <SecretAdminLogin
          onLoginSuccess={() => navigate('al-ansar-admin')}
          onNavigate={navigate}
        />
      );
    }

    return (
      <AdminLayout activeTab={adminTab} setActiveTab={setAdminTab} onNavigate={navigate}>
        {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={setAdminTab} onOpenInvoice={handleOpenInvoice} />}
        {adminTab === 'orders' && <AdminOrders onOpenInvoice={handleOpenInvoice} />}
        {adminTab === 'products' && <AdminProducts />}
        {adminTab === 'categories' && <AdminCategories />}
        {adminTab === 'vouchers' && <AdminVouchers />}
        {adminTab === 'users' && <AdminUsers />}
        {adminTab === 'chat' && <AdminChatDesk />}
        {adminTab === 'settings' && <AdminSettings />}
        {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={handleCloseInvoice} />}
        <NotificationToasts />
      </AdminLayout>
    );
  }

  // Render Customer Storefront
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navbar (NO ADMIN BUTTONS) */}
      <Navbar
        onNavigate={navigate}
        currentPage={currentPage}
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
      />

      {/* Main Content Pages */}
      <main className="flex-1">
        {currentPage === 'home' && <Home onNavigate={navigate} />}
        {currentPage === 'catalog' && (
          <Catalog
            initialCategory={pageParams.category}
            initialSubcategory={pageParams.subcategory}
            initialSearch={pageParams.search || searchKeyword}
            initialFreeDelivery={pageParams.freeDelivery || false}
            onNavigate={navigate}
          />
        )}
        {currentPage === 'product-details' && (
          <ProductDetails
            productId={pageParams.productId}
            onNavigate={navigate}
          />
        )}
        {currentPage === 'checkout' && (
          <Checkout
            onNavigate={navigate}
            onOrderSuccess={(order) => navigate('order-confirmation', { order })}
          />
        )}
        {currentPage === 'order-confirmation' && (
          <OrderConfirmation
            order={pageParams.order}
            onNavigate={navigate}
            onOpenInvoice={handleOpenInvoice}
          />
        )}
        {currentPage === 'track-order' && (
          <OrderTrack
            initialCode={pageParams.code}
            onNavigate={navigate}
            onOpenInvoice={handleOpenInvoice}
          />
        )}
        {currentPage === 'dashboard' && (
          <UserDashboard
            initialTab={pageParams.tab || 'overview'}
            onNavigate={navigate}
            onOpenInvoice={handleOpenInvoice}
          />
        )}
        {currentPage === 'qard-hasana' && <QardHasana onNavigate={navigate} />}
        {currentPage === 'terms' && <TermsAndConditions onNavigate={navigate} />}
        {currentPage === 'contact' && <ContactUs onNavigate={navigate} />}
        {currentPage === 'login' && <Login onNavigate={navigate} />}
        {currentPage === 'register' && <Register onNavigate={navigate} />}
        {currentPage === 'forgot-password' && <ForgotPassword onNavigate={navigate} />}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Global Interactive Overlays */}
      <CartDrawer onNavigate={navigate} />
      <LiveChatWidget />
      <NotificationToasts />
      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={handleCloseInvoice} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <MainApp />
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}
