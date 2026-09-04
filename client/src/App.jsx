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
import Reviews from './pages/Reviews';
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
  
  // Navigation History Stack for true "Back to previous page" behavior
  const [historyStack, setHistoryStack] = useState([{ page: 'home', params: {} }]);

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
    setHistoryStack(prev => [...prev, { page, params }]);
    setCurrentPage(page);
    setPageParams(params);
    if (params.search !== undefined) {
      setSearchKeyword(params.search);
    } else if (params.category !== undefined) {
      setSearchKeyword('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL hash smoothly
    if (page === 'al-ansar-admin') {
      window.location.hash = '/al-ansar-admin';
    } else if (window.location.hash.includes('admin')) {
      window.location.hash = '';
    }
  };

  const handleBack = () => {
    if (historyStack.length > 1) {
      const newStack = [...historyStack];
      newStack.pop(); // Remove current page
      const prev = newStack[newStack.length - 1];
      setHistoryStack(newStack);
      setCurrentPage(prev.page);
      setPageParams(prev.params || {});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentPage('home');
      setPageParams({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenInvoice = (order) => {
    setInvoiceOrder(order);
  };

  const handleCloseInvoice = () => {
    setInvoiceOrder(null);
  };

  // Render Hidden Admin Portal
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
      </AdminLayout>
    );
  }

  // Render Public Customer Storefront
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* Top Navbar */}
      <Navbar
        onNavigate={navigate}
        currentPage={currentPage}
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <Home 
            onNavigate={navigate} 
            searchKeyword={searchKeyword} 
            setSearchKeyword={setSearchKeyword} 
          />
        )}

        {currentPage === 'catalog' && (
          <Catalog
            onNavigate={navigate}
            onBack={handleBack}
            initialCategory={pageParams.category}
            initialSubcategory={pageParams.subcategory}
            initialSearch={pageParams.search !== undefined ? pageParams.search : searchKeyword}
            searchQuery={pageParams.search !== undefined ? pageParams.search : searchKeyword}
            freeDeliveryOnly={pageParams.freeDelivery}
          />
        )}

        {currentPage === 'product-details' && (
          <ProductDetails
            productId={pageParams.productId}
            onNavigate={navigate}
            onBack={handleBack}
          />
        )}

        {currentPage === 'checkout' && (
          <Checkout
            onNavigate={navigate}
            onBack={handleBack}
            onOrderSuccess={(order) => navigate('order-confirmation', { order })}
          />
        )}

        {currentPage === 'order-confirmation' && (
          <OrderConfirmation
            order={pageParams.order}
            onNavigate={navigate}
            onBack={handleBack}
            onOpenInvoice={handleOpenInvoice}
          />
        )}

        {currentPage === 'track-order' && (
          <OrderTrack
            onNavigate={navigate}
            onBack={handleBack}
            initialOrderNumber={pageParams.orderNumber}
            onOpenInvoice={handleOpenInvoice}
          />
        )}

        {currentPage === 'dashboard' && (
          <UserDashboard
            onNavigate={navigate}
            onBack={handleBack}
            initialTab={pageParams.tab}
            onOpenInvoice={handleOpenInvoice}
          />
        )}

        {currentPage === 'contact' && (
          <ContactUs onNavigate={navigate} onBack={handleBack} />
        )}

        {currentPage === 'qard-hasana' && (
          <QardHasana onNavigate={navigate} onBack={handleBack} />
        )}

        {currentPage === 'terms' && (
          <TermsAndConditions onNavigate={navigate} onBack={handleBack} />
        )}

        {currentPage === 'reviews' && (
          <Reviews onNavigate={navigate} onBack={handleBack} />
        )}

        {currentPage === 'login' && (
          <Login onNavigate={navigate} onBack={handleBack} />
        )}

        {currentPage === 'register' && (
          <Register onNavigate={navigate} onBack={handleBack} />
        )}

        {currentPage === 'forgot-password' && (
          <ForgotPassword onNavigate={navigate} onBack={handleBack} />
        )}
      </main>

      {/* Global In-App Live Chat Widget */}
      <LiveChatWidget onNavigate={navigate} />

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer onNavigate={navigate} />

      {/* Global Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal order={invoiceOrder} onClose={handleCloseInvoice} />
      )}

      {/* Global Toast Notifications */}
      <NotificationToasts />

      {/* Footer */}
      <Footer onNavigate={navigate} />
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
