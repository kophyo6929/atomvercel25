import React, { useState } from 'react';
import { User, Order, PaymentAccountDetails } from './types';
import { MMK_PER_CREDIT } from './utils';
import { Logo } from './components';
import { useLanguage } from './i18n';
import { useNotification } from './NotificationContext';
import api from './src/api';

interface BuyCreditsViewProps {
    user: User;
    onNavigate: (view: string) => void;
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    onAdminNotify: (message: string) => void;
    paymentAccountDetails: PaymentAccountDetails;
}

const BuyCreditsView = ({ user, onNavigate, setOrders, onAdminNotify, paymentAccountDetails }: BuyCreditsViewProps) => {
    const { t } = useLanguage();
    const { showNotification } = useNotification();
    const [step, setStep] = useState(1); // 1: amount, 2: method, 3: upload
    const [amountMMK, setAmountMMK] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(''); // 'KPay' or 'Wave Pay'
    const [paymentProof, setPaymentProof] = useState<string | null>(null); // base64 string
    const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null); // object URL for preview
    const [isSubmitting, setIsSubmitting] = useState(false);

    const creditPackages = [10, 30, 50, 100];

    const handlePackageSelect = (creditAmount: number) => {
        setAmountMMK((creditAmount * MMK_PER_CREDIT).toString());
        setStep(2);
    };

    const handleAmountSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (parseFloat(amountMMK) > 0) {
            setStep(2);
        } else {
            showNotification(t('buyCredits.alerts.invalidAmount'), 'error');
        }
    };

    const selectPaymentMethod = (method: string) => {
        setPaymentMethod(method);
        setStep(3);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPaymentProof(reader.result as string);
            };
            reader.readAsDataURL(file);
            setPaymentProofPreview(URL.createObjectURL(file));
        } else {
            setPaymentProof(null);
            setPaymentProofPreview(null);
        }
    };
    
    const handleSubmitRequest = async () => {
        if (isSubmitting) return;

        if (!paymentProof) {
            showNotification(t('buyCredits.alerts.noProof'), 'error');
            return;
        }
        setIsSubmitting(true);

        try {
            // Call backend API to create the credit order
            const response = await api.createCreditOrder(parseFloat(amountMMK), paymentProof);
            
            if (response.data && !response.error) {
                // Create local order for immediate display
                const creditAmount = parseFloat(amountMMK) / MMK_PER_CREDIT;
                const newOrder: Order = {
                    id: response.data?.order?.id || `CRD-${Date.now()}`,
                    userId: user.id,
                    type: 'CREDIT',
                    product: { name: `${creditAmount.toFixed(2)} Credits Purchase` },
                    cost: parseFloat(amountMMK), // Cost is in MMK
                    paymentMethod: paymentMethod,
                    paymentProof: paymentProof,
                    status: 'Pending Approval',
                    date: new Date().toISOString(),
                };
                setOrders(prev => [...prev, newOrder]);

                const notificationMessage = `💰 Credit Request: ${user.username} requests ${parseFloat(amountMMK).toLocaleString()} MMK via ${paymentMethod}.`;
                onAdminNotify(notificationMessage);

                showNotification(t('notifications.orderSuccess'), 'success');
                onNavigate('MY_ORDERS');
            } else {
                throw new Error(response.error || 'Failed to submit credit request');
            }
        } catch (error) {
            console.error("Failed to submit credit request:", error);
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            showNotification(`Error: ${message}`, 'error');
            setIsSubmitting(false); // Re-enable button on error
        }
    };

    const goBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            onNavigate('DASHBOARD');
        }
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                     <div className="buy-credits-flow">
                        <h3>{t('buyCredits.step1Title')}</h3>
                        
                        <div className="credit-packages">
                            <h4>{t('buyCredits.quickBuy')}</h4>
                            <div className="package-buttons">
                                {creditPackages.map(credits => (
                                    <button key={credits} className="package-btn" onClick={() => handlePackageSelect(credits)}>
                                        <span className="package-credits">{credits} C</span>
                                        <span className="package-price">{(credits * MMK_PER_CREDIT).toLocaleString()} MMK</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="or-divider">
                            <span>{t('buyCredits.or')}</span>
                        </div>
                        
                        <form onSubmit={handleAmountSubmit}>
                            <h4>{t('buyCredits.customAmount')}</h4>
                            <div className="input-group">
                                <label htmlFor="custom-mmk">{t('buyCredits.amountLabel')}</label>
                                <input 
                                    id="custom-mmk" 
                                    type="number" 
                                    value={amountMMK} 
                                    onChange={e => setAmountMMK(e.target.value)} 
                                    className="input-field" 
                                    placeholder={t('buyCredits.amountPlaceholder')}
                                />
                            </div>
                            <div className="credit-equivalent">
                                {t('buyCredits.youWillGet')} <span>{(amountMMK ? parseFloat(amountMMK) / MMK_PER_CREDIT : 0).toFixed(2)} C</span>
                            </div>
                            <button type="submit" className="submit-button" disabled={!amountMMK || parseFloat(amountMMK) <= 0}>
                                {t('buyCredits.nextButton')}
                            </button>
                        </form>
                    </div>
                );
            case 2:
                return (
                    <div className="buy-credits-flow">
                        <h3>{t('buyCredits.step2Title')}</h3>
                        <p>{t('buyCredits.purchasingFor', { amount: parseFloat(amountMMK).toLocaleString() })}</p>
                        <div className="payment-methods">
                            {Object.keys(paymentAccountDetails).map(method => (
                               <button key={method} className="payment-method-btn" onClick={() => selectPaymentMethod(method)}>{method}</button>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                 const account = paymentAccountDetails[paymentMethod];
                 if (!account) {
                     return <p>Error: Selected payment method is not configured.</p>
                 }
                return (
                    <div className="buy-credits-flow">
                        <h3>{t('buyCredits.step3Title')}</h3>
                        <div className="payment-instructions">
                            <p>{t('buyCredits.instructions', { amount: parseFloat(amountMMK).toLocaleString(), method: paymentMethod })}</p>
                            <div className="account-details">
                                <p><span>{t('buyCredits.accountName')}</span> <strong>{account.name}</strong></p>
                                <p><span>{t('buyCredits.accountNumber')}</span> <strong className="account-number">{account.number}</strong></p>
                            </div>
                            <p className="upload-instruction">{t('buyCredits.uploadInstruction')}</p>
                        </div>
                        <div className="upload-area">
                            <label htmlFor="file-upload" className="custom-file-upload">
                                {paymentProofPreview ? t('buyCredits.changeScreenshot') : t('buyCredits.chooseScreenshot')}
                            </label>
                            <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
                            {paymentProofPreview && (
                                <div className="image-preview">
                                    <img src={paymentProofPreview} alt="Payment proof preview" />
                                </div>
                            )}
                        </div>
                        <button onClick={handleSubmitRequest} className="submit-button" disabled={!paymentProof || isSubmitting}>
                           {isSubmitting ? t('common.processing') : t('buyCredits.submitRequestButton')}
                        </button>
                    </div>
                );
            default: return null;
        }
    }

    return (
         <div className="generic-view-container">
            <header className="dashboard-header">
                <Logo />
                <button onClick={() => onNavigate('DASHBOARD')} className="logout-button">{t('common.backToDashboard')}</button>
            </header>
            <main className="dashboard-main">
                <div className="nav-header">
                   <button onClick={goBack} className="back-button">← {t('common.back')}</button>
                    <h3>{t('buyCredits.title')}</h3>
                </div>
                {renderStep()}
            </main>
        </div>
    );
};

export default BuyCreditsView;