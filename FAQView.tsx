import React, { useState } from 'react';
import { faqData } from './data';
import { Logo } from './components';
import { useLanguage } from './i18n';
import { FAQ } from './types';

interface FAQViewProps {
    onNavigate: (view: string) => void;
}

const FAQView = ({ onNavigate }: FAQViewProps) => {
    const { t } = useLanguage();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // A simple way to get translated FAQ data based on current language
    const getTranslatedFaqData = (): FAQ[] => {
      // In a real app, this might come from a different endpoint or a more complex key structure
      // For this implementation, we can just translate the hardcoded data.
      return faqData.map((item, index) => ({
        q: t(`faq.questions.q${index + 1}`),
        a: t(`faq.questions.a${index + 1}`),
      }));
    };

    const translatedFaqs = getTranslatedFaqData();
    
    return (
        <div className="generic-view-container">
            <header className="dashboard-header">
                <Logo />
                <button onClick={() => onNavigate('DASHBOARD')} className="logout-button">{t('common.backToDashboard')}</button>
            </header>
            <main className="dashboard-main">
                 <div className="nav-header">
                   <button onClick={() => onNavigate('DASHBOARD')} className="back-button">← {t('common.back')}</button>
                    <h3>{t('faq.title')}</h3>
                </div>
                <div className="faq-list">
                    {translatedFaqs.map((item, index) => (
                        <div key={index} className="faq-item">
                            <div 
                                className={`faq-question ${openIndex === index ? 'open' : ''}`}
                                onClick={() => toggleFAQ(index)}
                                role="button"
                                tabIndex={0}
                                aria-expanded={openIndex === index}
                                onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && toggleFAQ(index)}
                            >
                                <span>{item.q}</span>
                                <span className="indicator">+</span>
                            </div>
                            <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
                                <p>{item.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default FAQView;