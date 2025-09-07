import React, { useState, useEffect } from 'react';
import { initialProducts, initialUsers, initialOrders } from './data';
import { User, Order, PaymentAccountDetails, ProductsData } from './types';
import AuthPage from './Auth';
import Dashboard from './Dashboard';
import ProductFlow from './ProductFlow';
import BuyCreditsView from './BuyCreditsView';
import MyOrdersView from './MyOrdersView';
import AdminPanel from './AdminPanel';
import FAQView from './FAQView';
import UserProfileView from './UserProfileView';
import { useLanguage } from './i18n';
import { LoadingSpinner } from './components';
import { usePersistentState } from './utils';
import api from './src/api';

const initialPaymentDetails: PaymentAccountDetails = {
    'KPay': { name: 'ATOM Point Admin', number: '09 987 654 321' },
    'Wave Pay': { name: 'ATOM Point Services', number: '09 123 456 789' }
};

const App = () => {
  const { t } = useLanguage();
  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('DASHBOARD');
  
  // Persisted "Database" State - NOW USING API BACKEND FOR USERS
  const [products, setProducts] = usePersistentState<ProductsData>('app_products', initialProducts);
  // Note: users state removed - now managed by backend API
  const [orders, setOrders] = usePersistentState<Order[]>('app_orders', initialOrders);

  // Persisted Site-wide editable settings
  const [paymentDetails, setPaymentDetails] = usePersistentState<PaymentAccountDetails>('app_paymentDetails', initialPaymentDetails);
  const [adminContact, setAdminContact] = usePersistentState<string>('app_adminContact', 'https://t.me/CEO_METAVERSE');

  // Effect to restore session on initial load - NOW USING API
  useEffect(() => {
    const checkAuthSession = async () => {
      try {
        // Try to get current user from backend (checks JWT cookie)
        const response = await api.getCurrentUser();
        
        if (response.data && typeof response.data === 'object' && 'user' in response.data) {
          setCurrentUser((response.data as any).user);
          setIsLoggedIn(true);
          
          // Restore view from sessionStorage
          const storedView = sessionStorage.getItem('currentView');
          setCurrentView(storedView || 'DASHBOARD');
        }
      } catch (error) {
        console.log("No active session found");
        // Clear any old session storage
        sessionStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthSession();
  }, []);


  // Effect to manage body class for dynamic backgrounds
  useEffect(() => {
    const className = isLoggedIn ? 'dashboard-background' : 'auth-background';
    document.documentElement.className = className;
    document.body.className = className;

    // Cleanup on component unmount
    return () => {
      document.documentElement.className = '';
      document.body.className = '';
    };
  }, [isLoggedIn]);


  // Note: Removed localStorage users dependency - now using API-based authentication
  // Users are managed by the backend database, not frontend state

  const handleLoginSuccess = async (username: string, password?: string) => {
    // NOW USING API BACKEND
    if (!password) return;
    
    try {
      const response = await api.login(username, password);
      
      if (response.error) {
        if (response.error.includes('banned')) {
          alert(t('app.alerts.accountBanned'));
        } else {
          alert(t('app.alerts.invalidCredentials'));
        }
        return;
      }

      if (response.data && typeof response.data === 'object' && 'user' in response.data) {
        setCurrentUser((response.data as any).user);
        setIsLoggedIn(true);
        setCurrentView('DASHBOARD');
        sessionStorage.setItem('currentView', 'DASHBOARD');
        
        console.log('🎉 LOGIN SUCCESS - Data now stored in DATABASE, not localStorage!');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(t('app.alerts.invalidCredentials'));
    }
  };

  const handleRegisterSuccess = async (username: string, password: string, securityAmount: number) => {
    // NOW USING API BACKEND  
    try {
      const response = await api.register(username, password, securityAmount);
      
      if (response.error) {
        if (response.error.includes('banned')) {
          alert(t('app.alerts.usernameBanned'));
        } else if (response.error.includes('taken')) {
          alert(t('app.alerts.usernameTaken'));
        } else {
          alert('Registration failed: ' + response.error);
        }
        return;
      }

      if (response.data && typeof response.data === 'object' && 'user' in response.data) {
        const user = (response.data as any).user;
        setCurrentUser(user);
        setIsLoggedIn(true);
        setCurrentView('DASHBOARD');
        sessionStorage.setItem('currentView', 'DASHBOARD');
        
        alert(t('app.alerts.registrationSuccess', { id: user.id }));
        console.log('🎉 REGISTRATION SUCCESS - Data now stored in DATABASE, not localStorage!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const handlePasswordReset = async (userId: number, newPassword: string) => {
    // NOW USING API BACKEND
    try {
      await api.resetPassword(userId, newPassword);
      alert('Password reset successful!');
    } catch (error) {
      console.error('Password reset error:', error);
      alert('Password reset failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    // NOW USING API BACKEND
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setCurrentUser(null);
    setIsLoggedIn(false);
    sessionStorage.removeItem('currentView');
    console.log('🚪 LOGOUT - Session cleared from backend and frontend');
  };

  const handleBroadcast = async (message: string, targetIds: number[]) => {
      // NOW USING API BACKEND - notifications will be handled by backend
      try {
        // For now, show success message - backend will handle notifications
        alert(t('app.alerts.broadcastSent', { count: targetIds.length }));
      } catch (error) {
        console.error('Broadcast error:', error);
        alert('Broadcast failed. Please try again.');
      }
  };

  const sendAdminNotification = async (message: string) => {
    // NOW USING API BACKEND - admin notifications handled by backend
    try {
      // For now, just log the notification - backend will handle storage
      console.log('Admin notification sent:', message);
    } catch (error) {
      console.error('Admin notification error:', error);
    }
  };
  
  const navigateTo = (view: string) => {
    setCurrentView(view);
    sessionStorage.setItem('currentView', view);
  };

  // --- View Renderer --- //
  const renderView = () => {
    if (!currentUser) return null; // Should not happen if logged in
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} adminContact={adminContact} onUserUpdate={setCurrentUser} />;
      case 'BROWSE_PRODUCTS':
        return <ProductFlow products={products} onNavigate={navigateTo} user={currentUser} setOrders={setOrders} onAdminNotify={sendAdminNotification} onUserUpdate={setCurrentUser} />;
      case 'BUY_CREDITS':
        return <BuyCreditsView user={currentUser} onNavigate={navigateTo} setOrders={setOrders} onAdminNotify={sendAdminNotification} paymentAccountDetails={paymentDetails} />;
      case 'MY_ORDERS':
        return <MyOrdersView user={currentUser} onNavigate={navigateTo} orders={orders} setOrders={setOrders} />;
      case 'ADMIN_PANEL':
        return <AdminPanel 
                    onNavigate={navigateTo} 
                    products={products} setProducts={setProducts} 
                    orders={orders} setOrders={setOrders}
                    onBroadcast={handleBroadcast}
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    onLogout={handleLogout}
                    paymentDetails={paymentDetails}
                    setPaymentDetails={setPaymentDetails}
                    adminContact={adminContact}
                    setAdminContact={setAdminContact}
                />;
       case 'FAQ':
        return <FAQView onNavigate={navigateTo} />;
      case 'USER_PROFILE':
        return <UserProfileView user={currentUser} orders={orders} onNavigate={navigateTo} />;
      default:
        return <Dashboard user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} adminContact={adminContact} onUserUpdate={setCurrentUser} />;
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {isLoggedIn && currentUser ? (
        renderView()
      ) : (
        <AuthPage 
            onLoginSuccess={handleLoginSuccess} 
            onRegisterSuccess={handleRegisterSuccess}
            onPasswordReset={handlePasswordReset}
            adminContact={adminContact}
        />
      )}
    </>
  );
};

export default App;
