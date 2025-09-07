import React from 'react';
import { User, Order } from './types';
import { Logo } from './components';
import { useLanguage } from './i18n';

interface UserProfileViewProps {
    user: User;
    orders: Order[];
    onNavigate: (view: string) => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ user, orders, onNavigate }) => {
    const { t } = useLanguage();
    const userOrders = orders.filter(o => o.userId === user.id);
    const pendingProductOrders = userOrders.filter(o => o.status === 'Pending Approval' && !o.type).length;
    const pendingPayments = userOrders.filter(o => o.status === 'Pending Approval' && o.type === 'CREDIT').length;

    return (
        <div className="generic-view-container">
            <header className="dashboard-header">
                <Logo />
                <button onClick={() => onNavigate('DASHBOARD')} className="logout-button">{t('common.backToDashboard')}</button>
            </header>
            <main className="dashboard-main">
                <div className="nav-header">
                   <button onClick={() => onNavigate('DASHBOARD')} className="back-button">← {t('common.back')}</button>
                    <h3>{t('userProfile.title')}</h3>
                </div>
                <div className="profile-container">
                    <div className="profile-main-info">
                        <h2>{user.username}</h2>
                        <p>{t('userProfile.userId')} <span>{user.id}</span></p>
                    </div>

                    <div className="profile-balance-card">
                         <p>{t('userProfile.currentBalance')}</p>
                         <h3>{user.credits.toFixed(2)} C</h3>
                    </div>

                    <div className="profile-pending-section">
                        <h3>{t('userProfile.pendingActivity')}</h3>
                        <div className="pending-items">
                            <div className="pending-item">
                                <p>{t('userProfile.pendingProductOrders')}</p>
                                <span>{pendingProductOrders}</span>
                            </div>
                            <div className="pending-item">
                                <p>{t('userProfile.pendingCreditPayments')}</p>
                                <span>{pendingPayments}</span>
                            </div>
                        </div>
                        <button onClick={() => onNavigate('MY_ORDERS')} className="button-secondary" style={{width: '100%'}}>{t('userProfile.viewAllOrders')}</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserProfileView;