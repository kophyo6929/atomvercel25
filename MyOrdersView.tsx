import React, { useState, useEffect } from 'react';
import { User, Order } from './types';
import { Logo, EmptyState } from './components';
import { useLanguage } from './i18n';
import api from './src/api';

interface MyOrdersViewProps {
    user: User;
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    onNavigate: (view: string) => void;
}

const MyOrdersView = ({ user, orders, setOrders, onNavigate }: MyOrdersViewProps) => {
    const { t } = useLanguage();
    const [statusFilter, setStatusFilter] = useState('All');
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const filterOptions = [
        { key: 'All', label: t('myOrders.filters.all') },
        { key: 'Pending Approval', label: t('myOrders.filters.pending') },
        { key: 'Completed', label: t('myOrders.filters.completed') },
        { key: 'Declined', label: t('myOrders.filters.declined') }
    ];
    
    const userOrders = orders.filter(o => o.userId === user.id);

    const filteredOrders = userOrders
        .filter(o => statusFilter === 'All' || o.status === statusFilter)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Refresh orders from backend
    const refreshOrders = async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        
        try {
            const response = await api.getUserOrders();
            if (response.data && !response.error && response.data?.orders) {
                // Update orders state with fresh data from backend
                const backendOrders = response.data.orders.map((order: any) => ({
                    id: order.id,
                    userId: order.userId,
                    type: order.type,
                    product: { name: order.productName || `${order.type} Order` },
                    cost: order.amount,
                    paymentMethod: order.paymentMethod || 'N/A',
                    paymentProof: order.proofImage,
                    status: order.status === 'APPROVED' ? 'Completed' : 
                           order.status === 'DECLINED' ? 'Declined' : 
                           'Pending Approval',
                    date: order.createdAt,
                    deliveryInfo: order.deliveryPhone
                }));
                
                // Replace orders entirely with backend data to avoid duplicates
                setOrders(backendOrders);
            }
        } catch (error) {
            console.error('Failed to refresh orders:', error);
        } finally {
            setIsRefreshing(false);
        }
    };
    
    // Auto-refresh orders every 15 seconds when viewing My Orders
    useEffect(() => {
        refreshOrders(); // Initial refresh
        
        const interval = setInterval(() => {
            refreshOrders();
        }, 15000); // Refresh every 15 seconds
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="generic-view-container">
            <header className="dashboard-header">
                <Logo />
                <button onClick={() => onNavigate('DASHBOARD')} className="logout-button">{t('common.backToDashboard')}</button>
            </header>
            <main className="dashboard-main">
                <div className="nav-header">
                   <button onClick={() => onNavigate('DASHBOARD')} className="back-button">← {t('common.back')}</button>
                </div>
                <div className="my-orders-header">
                    <h3>{t('myOrders.title')}</h3>
                    <div className="user-refresh-controls">
                        <div className="refresh-status">
                            <div className={`refresh-indicator ${isRefreshing ? 'active' : ''}`}>
                                <svg className="refresh-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                                </svg>
                                <span className="refresh-text">
                                    {isRefreshing ? 'Updating...' : 'Auto-refresh: 15s'}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={refreshOrders} 
                            disabled={isRefreshing}
                            className={`user-refresh-button ${isRefreshing ? 'loading' : ''}`}
                            title="Refresh your orders"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                            </svg>
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {userOrders.length > 0 ? (
                    <>
                        <div className="order-filters">
                            {filterOptions.map(opt => (
                                <button 
                                    key={opt.key}
                                    className={`filter-btn ${statusFilter === opt.key ? 'active' : ''}`}
                                    onClick={() => setStatusFilter(opt.key)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <div className="order-list">
                            {filteredOrders.length > 0 ? filteredOrders.map((o, index) => (
                                <div key={`${o.id}-${index}`} className="order-item">
                                    <div className="order-info">
                                        <h4>{o.product.name}</h4>
                                        <p>{t('myOrders.orderId')} {o.id}</p>
                                        <p>{t('myOrders.date')} {new Date(o.date).toLocaleString()}</p>
                                        {o.deliveryInfo && <p>{t('myOrders.deliveredTo')} {o.deliveryInfo}</p>}
                                        {o.paymentMethod && <p>{t('myOrders.paymentVia')} {o.paymentMethod}</p>}
                                    </div>
                                    <div className="order-details">
                                        <span className={`status-badge status-${o.status.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>{o.status}</span>
                                        <p className="order-cost">
                                            {o.type === 'PRODUCT' ? `${o.cost.toFixed(2)} C` : `${o.cost.toLocaleString()} MMK`}
                                        </p>
                                    </div>
                                </div>
                            )) : <EmptyState message={t('myOrders.emptyFilterTitle')} subMessage={t('myOrders.emptyFilterSubtitle')} />}
                        </div>
                    </>
                ) : (
                     <EmptyState 
                        message={t('myOrders.emptyTitle')}
                        subMessage={t('myOrders.emptySubtitle')}
                    />
                )}
            </main>
        </div>
    );
};

export default MyOrdersView;