import React, { useState } from 'react';

// --- SHARED UI COMPONENTS --- //

export const Logo = () => (
    <div className="logo">
        <svg className="logo-icon-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#F39C12'}} />
                    <stop offset="100%" style={{stopColor: '#E67E22'}} />
                </linearGradient>
            </defs>
            <path
                fill="url(#logo-gradient)"
                d="M50 0 L66.6 25 L98 25 L76 44 L83 75 L50 60 L17 75 L24 44 L2 25 L33.3 25 Z"
            />
            <path
                fill="rgba(255,255,255,0.8)"
                d="M50 10 L61.6 28 L84 28 L67 41 L72 65 L50 54 L28 65 L33 41 L16 28 L38.3 28 Z"
            />
             <path
                fill="url(#logo-gradient)"
                d="M50 18 L58 32 L75 32 L62 41 L65 58 L50 50 L35 58 L38 41 L25 32 L42 32 Z"
            />
        </svg>
        <div className="logo-text-container">
            <span className="logo-title">Operators Store</span>
        </div>
    </div>
);


interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    startOpen?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, startOpen = false }) => {
    const [isOpen, setIsOpen] = useState(startOpen);
    return (
        <div className="collapsible-section">
            <div className="section-header" onClick={() => setIsOpen(!isOpen)} role="button" tabIndex={0} onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && setIsOpen(!isOpen)} aria-expanded={isOpen}>
                <h3>{title}</h3>
                <span className={`indicator ${isOpen ? 'open' : ''}`}>&#10148;</span>
            </div>
            {isOpen && <div className="section-content">{children}</div>}
        </div>
    );
};

export const EmptyState: React.FC<{ message: string; subMessage?: string; }> = ({ message, subMessage }) => (
    <div className="empty-state-container">
        <div className="empty-state-icon">📭</div>
        <h3>{message}</h3>
        {subMessage && <p>{subMessage}</p>}
    </div>
);

export const LoadingSpinner = () => (
    <div className="loading-spinner-overlay">
        <div className="loading-spinner"></div>
    </div>
);