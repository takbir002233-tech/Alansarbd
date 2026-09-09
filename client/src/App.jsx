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
import AuthModal from './components/AuthModal';

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
import LoyaltyCard from './pages/LoyaltyCard';
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

// Parse current page and params from window.location.hash or localStorage so refresh never loses state!
function parseInitialRoute() {
  try {
    const raw = (window.location.hash || '').replace(/^#\/?/, '');
    if (raw) {
      const [pagePart, queryPart] = raw.split('?');
      const page = pagePart.toLowerCase();
      const params = {};
      if (queryPart) {
        const sp = new URLSearchParams(queryPart);
        sp.forEach((v, k) => { params[k] = v; });
      }
      
      const aliasMap = {
        'admin': 'al-ansar-admin',
        'vip': 'loyalty-card',
        'vip-card': 'loyalty-card',
        'loyalty': 'loyalty-card',
        'qard': 'qard-hasana'
      };
      const resolvedPage = aliasMap[page] || page;
      if (resolvedPage) {
        return { page: resolvedPage, params };
      }
    }

    const saved = localStorage.getItem('alansar_active_page');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.page) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error parsing route:', e);
  }
  return { page: 'home', params: {} };
}

function MainApp() {
  const { user, isAdmin } = useAuth();
  const initialRoute = parseInitialRoute();
  const [currentPage, setCurrentPage] = useState(initialRoute.page);
  const [pageParams, setPageParams] = useState(initialRoute.params || {});
  const [searchKeyword, setSearchKeyword] = useState(initialRoute.params?.search || '');
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | null
  
  // Navigation History Stack for true "Back to previous page" behavior
  const [historyStack, setHistoryStack] = useState([{ page: initialRoute.page, params: initialRoute.params || {} }]);

  // Admin Tab Navigation
  const [adminTab, setAdminTab] = useState('dashboard');

  // Handle native browser back and mobile phone hardware/gesture back buttons
  useEffect(() => {
    const route = parseInitialRoute();
    if (route && route.page) {
      setCurrentPage(route.page);
      setPageParams(route.params || {});
      if (route.params?.search !== undefined) {
        setSearchKeyword(route.params.search);
      }
    }

    const handlePopState = (event) => {
      // If modal is open, close modal first on back button press
      if (authModal) {
        setAuthModal(null);
        return;
      }
      if (invoiceOrder) {
        setInvoiceOrder(null);
        return;
      }

      const state = event.state;
      if (state && state.page) {
        setCurrentPage(state.page);
        setPageParams(state.params || {});
        if (state.params?.search !== undefined) {
          setSearchKeyword(state.params.search);
        }
        try {
          localStorage.setItem('alansar_active_page', JSON.stringify(state));
        } catch (e) {}
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const fallbackRoute = parseInitialRoute();
        setCurrentPage(fallbackRoute.page);
        setPageParams(fallbackRoute.params || {});
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [authModal, invoiceOrder]);

  const navigate = (page, params = {}, options = {}) => {
    // Open Login / Register as sleek popup modal without navigating away from current page
    if (page === 'login' || page === 'register') {
      setAuthModal(page);
      return;
    }

    // Push into browser HTML5 history for phone/browser back button support
    const stateObj = { page, params };
    let hashUrl = page === 'al-ansar-admin' ? '#/al-ansar-admin' : '#' + page;
    const qParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
          qParams.set(k, params[k]);
        }
      });
    }
    const qStr = qParams.toString();
    if (qStr) {
      hashUrl += '?' + qStr;
    }

    try {
      localStorage.setItem('alansar_active_page', JSON.stringify(stateObj));
    } catch (e) {}

    if (options.replace) {
      window.history.replaceState(stateObj, '', hashUrl);
    } else {
      window.history.pushState(stateObj, '', hashUrl);
    }

    setHistoryStack(prev => [...prev, { page, params }]);
    setCurrentPage(page);
    setPageParams(params);
    if (params.search !== undefined) {
      setSearchKeyword(params.search);
    } else if (params.category !== undefined) {
      setSearchKeyword('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else if (historyStack.length > 1) {
      const newStack = [...historyStack];
      newStack.pop(); // Remove current page
      const prev = newStack[newStack.length - 1];
      setHistoryStack(newStack);
      navigate(prev.page, prev.params || {}, { replace: true });
    } else {
      navigate('home', {}, { replace: true });
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
    <div className="min-h-screen flex justify-center selection:bg-amber-500 selection:text-slate-950 font-sans">
      <div className="w-[96%] sm:w-[95%] xl:w-[94%] max-w-[1220px] min-h-screen flex flex-col bg-white shadow-[0_0_40px_rgba(0,0,0,0.06)] text-slate-900 relative">
        
        {/* Top Navbar */}
        <Navbar
          onNavigate={navigate}
          openAuthModal={(mode) => setAuthModal(mode || 'login')}
          currentPage={currentPage}
          currentCategory={pageParams?.category || (currentPage === 'catalog' && !pageParams?.category ? 'all' : null)}
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

        {(currentPage === 'qard-hasana' || currentPage === 'qard') && (
          <QardHasana onNavigate={navigate} onBack={handleBack} />
        )}

        {(currentPage === 'loyalty-card' || currentPage === 'loyalty' || currentPage === 'vip' || currentPage === 'vip-card') && (
          <LoyaltyCard onNavigate={navigate} onBack={handleBack} />
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

        {/* Safety Fallback: Render Home if unknown route is given so background is never empty */}
        {![
          'home', 'catalog', 'product', 'cart', 'checkout', 'dashboard', 'contact',
          'qard-hasana', 'qard', 'loyalty-card', 'loyalty', 'vip', 'vip-card',
          'terms', 'reviews', 'login', 'register', 'forgot-password', 'al-ansar-admin'
        ].includes(currentPage) && (
          <Home onNavigate={navigate} />
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

      {/* Global Auth Modal (Login / Register Popup with Bikroy.com Cascading Location) */}
      <AuthModal
        isOpen={!!authModal}
        initialMode={authModal || 'login'}
        onClose={() => setAuthModal(null)}
        onNavigate={navigate}
      />

      {/* Global Toast Notifications */}
      <NotificationToasts />

      {/* Footer - Strictly ONLY on Home and Category (Catalog) pages */}
      {(currentPage === 'home' || currentPage === 'catalog') && (
        <Footer onNavigate={navigate} />
      )}
      </div>
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
