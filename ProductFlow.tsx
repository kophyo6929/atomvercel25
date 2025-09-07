import React, { useState } from 'react';
import { ProductsData, ProductItem, User, Order } from './types';
import { calculateCreditCost } from './utils';
import { Logo, EmptyState } from './components';
import { useLanguage } from './i18n';
import { useNotification } from './NotificationContext';
import api from './src/api';

// --- PRODUCT BROWSE & PURCHASE FLOW --- //

interface ProductFlowProps {
    products: ProductsData;
    onNavigate: (view: string) => void;
    user: User;
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    onAdminNotify: (message: string) => void;
    onUserUpdate: (updatedUser: User) => void;
}

const ProductFlow = ({ products, onNavigate, user, setOrders, onAdminNotify, onUserUpdate }: ProductFlowProps) => {
    const { t } = useLanguage();
    const { showNotification } = useNotification();
    const [step, setStep] = useState('OPERATOR'); // OPERATOR, CATEGORY, LIST
    const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const selectOperator = (operator: string) => {
        setSelectedOperator(operator);
        setStep('CATEGORY');
    };

    const selectCategory = (category: string) => {
        setSelectedCategory(category);
        setStep('LIST');
    };
    
    const goBack = () => {
        if (step === 'LIST') setStep('CATEGORY');
        else if (step === 'CATEGORY') {
            setStep('OPERATOR');
            setSelectedOperator(null);
        }
        else onNavigate('DASHBOARD');
    };
    
    const handlePurchase = async (product: ProductItem, deliveryInfo: string) => {
        if (!selectedOperator) return;
        const cost = calculateCreditCost(product.price_mmk);

        if (user.credits < cost) {
            showNotification(t('productFlow.confirmModal.alertNotEnoughCredits'), 'error');
            return;
        }

        try {
            // Make API call to purchase product
            const response = await api.createProductOrder(product.id);
            
            if (response.error) {
                console.error('Purchase failed', response);
                showNotification('Purchase failed: ' + response.error, 'error');
                return;
            }

            // Create local order record for display with pending status
            const newOrder: Order = {
                id: `PROD-${Date.now()}`,
                userId: user.id,
                product: { name: product.name, operator: selectedOperator },
                cost: cost,
                status: 'Pending Approval', // Order needs admin approval
                date: new Date().toISOString(),
                deliveryInfo,
            };
            setOrders(prevOrders => [...prevOrders, newOrder]);
            
            // Note: Credits will be deducted only when admin approves the order
            
            // Send notification to Admin
            onAdminNotify(`📦 New Order: ${user.username} bought ${product.name} for ${deliveryInfo}.`);

            showNotification(t('notifications.orderSuccess'), 'success');
            onNavigate('DASHBOARD');
        } catch (error) {
            console.error('Purchase failed', error);
            showNotification('Purchase failed. Please try again.', 'error');
        }
    };

    const getHeaderText = () => {
        if (step === 'OPERATOR') return t('productFlow.headerSelectOperator');
        if (step === 'CATEGORY' && selectedOperator) return t('productFlow.headerOperator', { operator: selectedOperator });
        if (step === 'LIST' && selectedCategory) return t('productFlow.headerCategory', { category: selectedCategory });
        return '';
    };

    return (
        <div className="product-flow-container">
            <header className="dashboard-header">
                <Logo />
                <button onClick={() => onNavigate('DASHBOARD')} className="logout-button">{t('common.backToDashboard')}</button>
            </header>
            <main className="dashboard-main">
                <div className="nav-header">
                    <button onClick={goBack} className="back-button">← {t('common.back')}</button>
                    <h3>{getHeaderText()}</h3>
                </div>
                {step === 'OPERATOR' && <OperatorList operators={Object.keys(products)} onSelect={selectOperator} />}
                {step === 'CATEGORY' && selectedOperator && <CategoryList categories={Object.keys(products[selectedOperator])} onSelect={selectCategory} />}
                {step === 'LIST' && selectedOperator && selectedCategory && <ProductList products={products[selectedOperator][selectedCategory] || []} onPurchase={handlePurchase} user={user} />}
            </main>
        </div>
    );
};

// --- Sub-components for ProductFlow --- //

const OperatorList: React.FC<{ operators: string[], onSelect: (op: string) => void }> = ({ operators, onSelect }) => (
    <div className="selection-grid">
        {operators.map(op => <div key={op} className="card" onClick={() => onSelect(op)}><h3>{op}</h3></div>)}
    </div>
);

const CategoryList: React.FC<{ categories: string[], onSelect: (cat: string) => void }> = ({ categories, onSelect }) => (
    <div className="selection-grid">
        {categories.map(cat => <div key={cat} className="card" onClick={() => onSelect(cat)}><h3>{cat}</h3></div>)}
    </div>
);

interface ProductListProps {
    products: ProductItem[];
    onPurchase: (product: ProductItem, deliveryInfo: string) => void;
    user: User;
}

const ProductList = ({ products, onPurchase, user }: ProductListProps) => {
    const { t } = useLanguage();
    const { showNotification } = useNotification();
    const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
    const [phone, setPhone] = useState('');
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleBuyClick = (product: ProductItem) => {
        setSelectedProduct(product);
        setShowPhoneModal(true);
    };

    const handleProceedToConfirm = () => {
        if (!phone.match(/^[0-9]{7,11}$/)) {
            showNotification(t('productFlow.deliveryModal.alertInvalidPhone'), 'error');
            return;
        }
        setShowPhoneModal(false);
        setShowConfirmModal(true);
    };
    
    const handleConfirmPurchase = () => {
        if (isSubmitting || !selectedProduct) return;
        setIsSubmitting(true);

        // Use a short timeout to allow the UI to update to the 'disabled' state
        // before navigating away, which improves perceived performance.
        setTimeout(() => {
            try {
                onPurchase(selectedProduct, phone);
                // onPurchase navigates away, so no need to reset state here.
                // The component will unmount.
            } catch (e) {
                console.error("Purchase failed", e);
                const message = e instanceof Error ? e.message : 'An unknown error occurred.';
                showNotification(`Error: ${message}`, 'error');
                setIsSubmitting(false); // Re-enable on error
            }
        }, 50);
    };

    const closeModals = () => {
        setShowPhoneModal(false);
        setShowConfirmModal(false);
        setSelectedProduct(null);
        setPhone('');
        setIsSubmitting(false); // Reset submitting state on any close action
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <input 
                type="text"
                placeholder={t('productFlow.searchInputPlaceholder')}
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={products.length === 0}
            />
            <div className="product-list">
                 {products.length > 0 ? (
                    filteredProducts.length > 0 ? filteredProducts.map(p => (
                        <div key={p.id} className="product-item">
                            <div className="product-info">
                                <h4>{p.name}</h4>
                                {p.extra && <p className="product-extra">{p.extra}</p>}
                                <p>{p.price_mmk.toLocaleString()} MMK / {calculateCreditCost(p.price_mmk).toFixed(2)} C</p>
                            </div>
                            <button onClick={() => handleBuyClick(p)} className="buy-button">{t('productFlow.buyButton')}</button>
                        </div>
                    )) : <EmptyState message={t('common.noItemsFound')} subMessage={t('productFlow.searchInputPlaceholder')} />
                ) : (
                    <EmptyState message={t('productFlow.emptyCategory')} subMessage={t('productFlow.emptyCategorySub')} />
                )}
            </div>

            {showPhoneModal && selectedProduct && (
                 <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3>{t('productFlow.deliveryModal.title')}</h3>
                        <p>{t('productFlow.deliveryModal.description', { productName: selectedProduct.name })}</p>
                        <div className="input-group">
                            <label htmlFor="phone">{t('productFlow.deliveryModal.phoneLabel')}</label>
                            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder={t('productFlow.deliveryModal.phonePlaceholder')} />
                        </div>
                        <div className="modal-actions">
                            <button onClick={closeModals} className="button-secondary">{t('common.cancel')}</button>
                            <button onClick={handleProceedToConfirm} className="submit-button">{t('productFlow.deliveryModal.proceedButton')}</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showConfirmModal && selectedProduct && (
                 <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3>{t('productFlow.confirmModal.title')}</h3>
                        <div className="confirmation-summary">
                            <p><span>{t('productFlow.confirmModal.product')}</span> <strong>{selectedProduct.name}</strong></p>
                            <p><span>{t('productFlow.confirmModal.deliverTo')}</span> <strong>{phone}</strong></p>
                            <p><span>{t('productFlow.confirmModal.cost')}</span> <strong className="yellow-text">{calculateCreditCost(selectedProduct.price_mmk).toFixed(2)} C</strong></p>
                            <hr />
                            <p><span>{t('productFlow.confirmModal.yourBalance')}</span> {user.credits.toFixed(2)} C</p>
                            <p><span>{t('productFlow.confirmModal.balanceAfter')}</span> <strong className="yellow-text">{(user.credits - calculateCreditCost(selectedProduct.price_mmk)).toFixed(2)} C</strong></p>
                        </div>
                        <div className="modal-actions">
                            <button onClick={closeModals} className="button-secondary">{t('common.cancel')}</button>
                            <button onClick={handleConfirmPurchase} className="submit-button" disabled={isSubmitting}>
                                {isSubmitting ? t('common.processing') : t('productFlow.confirmModal.confirmButton')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductFlow;