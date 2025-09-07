import React, { useState, useEffect, useRef } from 'react';
import { User } from './types';
import { Logo, EmptyState } from './components';
import { useLanguage } from './i18n';
import api from './src/api';

const NotificationsModal: React.FC<{ user: User, onClose: () => void, onClearNotifications: () => void }> = ({ user, onClose, onClearNotifications }) => {
    const { t } = useLanguage();
    const [isClearing, setIsClearing] = useState(false);

    const handleClearAll = async () => {
        setIsClearing(true);
        try {
            await onClearNotifications();
        } catch (error) {
            console.error('Error clearing notifications:', error);
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content notifications-modal">
                <div className="modal-header">
                    <h3>{t('dashboard.notificationsModal.title')}</h3>
                    {user.notifications.length > 0 && (
                        <span className="notification-count">({user.notifications.length})</span>
                    )}
                </div>
                {user.notifications.length > 0 ? (
                    <div className="notification-content">
                        <ul className="notification-list">
                            {[...user.notifications].reverse().map((msg, index) => (
                                <li key={index} className="notification-item">{msg}</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <EmptyState message={t('dashboard.notificationsModal.emptyMessage')} subMessage={t('dashboard.notificationsModal.emptySubMessage')}/>
                )}
                <div className="modal-actions">
                    {user.notifications.length > 0 && (
                        <button 
                            onClick={handleClearAll} 
                            disabled={isClearing}
                            className="button-danger"
                        >
                            {isClearing ? 'Clearing...' : 'Clear All'}
                        </button>
                    )}
                    <button onClick={onClose} className="button-secondary">{t('common.close')}</button>
                </div>
            </div>
        </div>
    );
};


const UserProfileDropdown: React.FC<{ user: User; onNavigate: (view: string) => void; onLogout: () => void; adminContact: string; }> = ({ user, onNavigate, onLogout, adminContact }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        setIsOpen(false);
        onLogout();
    };

    const handleNavigateAdmin = () => {
        setIsOpen(false);
        onNavigate('ADMIN_PANEL');
    };

    const handleNavigateProfile = () => {
        setIsOpen(false);
        onNavigate('USER_PROFILE');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="user-profile-dropdown" ref={dropdownRef}>
            <button className={`user-profile-button ${isOpen ? 'open' : ''}`} onClick={handleToggle} aria-haspopup="true" aria-expanded={isOpen}>
                {user.username}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            {isOpen && (
                <ul className="dropdown-menu" role="menu">
                     <li role="presentation">
                        <button onClick={handleNavigateProfile} className="dropdown-item" role="menuitem">
                           {t('dashboard.userDropdown.myProfile')}
                        </button>
                    </li>
                    {user.isAdmin && (
                        <li role="presentation">
                            <button onClick={handleNavigateAdmin} className="dropdown-item" role="menuitem">
                                {t('dashboard.userDropdown.adminPanel')}
                            </button>
                        </li>
                    )}
                     <li role="presentation">
                        <a href={adminContact} target="_blank" rel="noopener noreferrer" className="dropdown-item" role="menuitem">
                            {t('dashboard.userDropdown.contactAdmin')}
                        </a>
                    </li>
                    <li className="dropdown-divider" role="separator"></li>
                    <li role="presentation">
                        <button onClick={handleLogout} className="dropdown-item dropdown-item-logout" role="menuitem">
                            {t('dashboard.userDropdown.logout')}
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
};


interface DashboardProps {
    user: User;
    onNavigate: (view: string) => void;
    onLogout: () => void;
    adminContact: string;
    onUserUpdate: (updatedUser: User) => void;
}

const Dashboard = ({ user, onNavigate, onLogout, adminContact, onUserUpdate }: DashboardProps) => {
  const { t, language, setLanguage } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(user.notifications.length > 0);

  useEffect(() => {
    // This effect ensures that the unread status is based on the most current user prop
    setHasUnread(user.notifications.length > 0);
  }, [user.notifications]);


  const openNotifications = () => {
      setShowNotifications(true);
      if (hasUnread) {
          setHasUnread(false);
      }
  };

  const handleClearNotifications = async () => {
    try {
      const response = await api.clearNotifications();
      if (response.error) {
        console.error('Failed to clear notifications:', response.error);
        return;
      }
      
      // Update the user with cleared notifications
      const updatedUser = { ...user, notifications: [] };
      onUserUpdate(updatedUser);
      
      // Close the modal and reset unread status
      setShowNotifications(false);
      setHasUnread(false);
      
      console.log('✅ Notifications cleared successfully');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'my' : 'en');
  };


  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <Logo />
        <div className="header-actions">
            <button className="notification-bell" onClick={openNotifications} aria-label={t('dashboard.notificationBell')}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                 {hasUnread && <span className="notification-badge"></span>}
            </button>
            <button className="language-switcher" onClick={toggleLanguage}>
                {language === 'en' ? t('languageSwitcher.myanmar') : t('languageSwitcher.english')}
            </button>
            <UserProfileDropdown user={user} onNavigate={onNavigate} onLogout={onLogout} adminContact={adminContact} />
        </div>
      </header>
      <main className="dashboard-main">
        <h2>{t('dashboard.welcome', { username: user.username })}</h2>
        <p className="balance">{t('dashboard.yourCredits')} <span>{user.credits.toFixed(2)} C</span></p>
        <div className="action-cards">
          <div className="card" onClick={() => onNavigate('BROWSE_PRODUCTS')}>
            <h3>{t('dashboard.browseProductsCardTitle')}</h3>
            <p>{t('dashboard.browseProductsCardDescription')}</p>
          </div>
          <div className="card" onClick={() => onNavigate('BUY_CREDITS')}>
            <h3>{t('dashboard.buyCreditsCardTitle')}</h3>
            <p>{t('dashboard.buyCreditsCardDescription')}</p>
          </div>
          <div className="card" onClick={() => onNavigate('MY_ORDERS')}>
            <h3>{t('dashboard.myOrdersCardTitle')}</h3>
            <p>{t('dashboard.myOrdersCardDescription')}</p>
          </div>
           <div className="card" onClick={() => onNavigate('FAQ')}>
            <h3>{t('dashboard.faqCardTitle')}</h3>
            <p>{t('dashboard.faqCardDescription')}</p>
          </div>
        </div>
      </main>
      {showNotifications && <NotificationsModal user={user} onClose={() => setShowNotifications(false)} onClearNotifications={handleClearNotifications} />}
    </div>
  );
};

export default Dashboard;