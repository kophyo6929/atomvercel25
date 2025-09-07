import React, { useState } from 'react';
import { Logo } from './components';
import { User } from './types';
import { useLanguage } from './i18n';

// --- AUTHENTICATION COMPONENTS --- //

const HelpIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>
);


interface AuthProps {
    onLoginSuccess: (username: string, password?: string) => void;
    onRegisterSuccess: (username: string, password: string, securityAmount: number) => void;
    onPasswordReset: (userId: number, newPassword: string) => void;
    adminContact: string;
}

const AuthPage = ({ onLoginSuccess, onRegisterSuccess, onPasswordReset, adminContact }: AuthProps) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const { t } = useLanguage();
  const toggleView = () => setIsLoginView(!isLoginView);

  return (
    <div className="auth-container">
      <Logo />
      <div className="auth-form-wrapper">
        {isLoginView ? (
          <LoginForm onToggleView={toggleView} onLoginSuccess={onLoginSuccess} onPasswordReset={onPasswordReset} />
        ) : (
          <RegisterForm onToggleView={toggleView} onRegisterSuccess={onRegisterSuccess} />
        )}
        <a href={adminContact} target="_blank" rel="noopener noreferrer" className="contact-admin-link">
            <HelpIcon />
            <span>{t('auth.contactAdmin')}</span>
        </a>
      </div>
    </div>
  );
};

interface ForgotPasswordModalProps {
    onClose: () => void;
    onPasswordReset: (userId: number, newPassword: string) => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onPasswordReset }) => {
    const { t } = useLanguage();
    const [step, setStep] = useState<'verify' | 'reset'>('verify');
    const [userIdInput, setUserIdInput] = useState('');
    const [securityAmountInput, setSecurityAmountInput] = useState('');
    const [verifiedUser, setVerifiedUser] = useState<User | null>(null);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const id = parseInt(userIdInput, 10);
        const amount = parseInt(securityAmountInput, 10);

        if (isNaN(id) || isNaN(amount)) {
            alert(t('auth.forgotPasswordModal.alerts.invalidInput'));
            return;
        }

        // For now, create a simplified user object for password reset
        // In production, this would verify against the backend API
        const user = { id, securityAmount: amount, username: `user${id}` };
        setVerifiedUser(user as User);
        setStep('reset');
    };

    const handleResetSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifiedUser) return;

        if (!newPassword || newPassword.length < 6) {
             alert(t('auth.resetPasswordModal.alerts.passwordTooShort'));
             return;
        }

        if (newPassword !== confirmPassword) {
            alert(t('auth.resetPasswordModal.alerts.passwordsDontMatch'));
            return;
        }
        
        onPasswordReset(verifiedUser.id, newPassword);
        alert(t('auth.resetPasswordModal.alerts.passwordResetSuccess', { username: verifiedUser.username }));
        onClose();
    };


    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                {step === 'verify' ? (
                <>
                    <h3>{t('auth.forgotPasswordModal.title')}</h3>
                    <p>{t('auth.forgotPasswordModal.description')}</p>
                    <form onSubmit={handleVerifySubmit} className="auth-form">
                        <div className="input-group">
                            <label htmlFor="recovery-userid">{t('auth.forgotPasswordModal.userIdLabel')}</label>
                            <input id="recovery-userid" className="input-field" type="number" value={userIdInput} onChange={e => setUserIdInput(e.target.value)} placeholder={t('auth.forgotPasswordModal.userIdPlaceholder')} required />
                        </div>
                         <div className="input-group">
                            <label htmlFor="recovery-amount">{t('auth.forgotPasswordModal.securityAmountLabel')}</label>
                            <input id="recovery-amount" className="input-field" type="number" value={securityAmountInput} onChange={e => setSecurityAmountInput(e.target.value)} placeholder={t('auth.forgotPasswordModal.securityAmountPlaceholder')} required />
                        </div>
                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="button-secondary">{t('common.cancel')}</button>
                            <button type="submit" className="submit-button">{t('auth.forgotPasswordModal.verifyButton')}</button>
                        </div>
                    </form>
                </>
                ) : verifiedUser && (
                <>
                    <h3>{t('auth.resetPasswordModal.title')}</h3>
                    <p>{t('auth.resetPasswordModal.description', { username: verifiedUser.username })}</p>
                    <form onSubmit={handleResetSubmit} className="auth-form">
                        <div className="input-group">
                            <label htmlFor="reset-new-password">{t('auth.resetPasswordModal.newPasswordLabel')}</label>
                            <input id="reset-new-password" className="input-field" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('auth.resetPasswordModal.newPasswordPlaceholder')} required />
                        </div>
                         <div className="input-group">
                            <label htmlFor="reset-confirm-password">{t('auth.resetPasswordModal.confirmPasswordLabel')}</label>
                            <input id="reset-confirm-password" className="input-field" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </div>
                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="button-secondary">{t('common.cancel')}</button>
                            <button type="submit" className="submit-button">{t('auth.resetPasswordModal.setNewPasswordButton')}</button>
                        </div>
                    </form>
                </>
                )}
            </div>
        </div>
    );
};

interface LoginFormProps {
    onToggleView: () => void;
    onLoginSuccess: (username: string, password?: string) => void;
    onPasswordReset: (userId: number, newPassword: string) => void;
}

const LoginForm = ({ onToggleView, onLoginSuccess, onPasswordReset }: LoginFormProps) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(username, password);
  };

  return (
    <>
      <h1>{t('auth.signInTitle')}</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
         <div className="input-group">
          <label htmlFor="login-username">{t('auth.usernameLabel')}</label>
          <input id="login-username" className="input-field" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required aria-label={t('auth.usernameLabel')} />
        </div>
        <div className="input-group">
          <label htmlFor="login-password">{t('auth.passwordLabel')}</label>
          <input id="login-password" className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required aria-label={t('auth.passwordLabel')} />
        </div>
        <div className="forgot-password-container">
            <button
                type="button"
                className="forgot-password-link"
                onClick={() => setShowForgotPassword(true)}
            >
                {t('auth.forgotPasswordLink')}
            </button>
        </div>
        <button type="submit" className="submit-button">{t('auth.loginButton')}</button>
      </form>
      <div className="toggle-form-container">
        <span>{t('auth.registerPrompt')} </span>
        <button onClick={onToggleView} className="toggle-form-link" aria-label="Switch to registration form">{t('auth.registerLink')}</button>
      </div>
      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} onPasswordReset={onPasswordReset} />}
    </>
  );
};

interface RegisterFormProps {
    onToggleView: () => void;
    onRegisterSuccess: (username: string, password: string, securityAmount: number) => void;
}

const RegisterForm = ({ onToggleView, onRegisterSuccess }: RegisterFormProps) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityAmount, setSecurityAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert(t('auth.resetPasswordModal.alerts.passwordsDontMatch'));
      return;
    }
    const amount = parseInt(securityAmount, 10);
    if (isNaN(amount) || securityAmount.length !== 4) {
        alert(t('auth.forgotPasswordModal.alerts.invalidInput')); // Re-using a similar alert
        return;
    }
    onRegisterSuccess(username, password, amount);
  };

  return (
    <>
      <h1>{t('auth.createAccountTitle')}</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="register-username">{t('auth.usernameLabel')}</label>
          <input id="register-username" className="input-field" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required aria-label={t('auth.usernameLabel')} />
        </div>
        <div className="input-group">
          <label htmlFor="register-password">{t('auth.passwordLabel')}</label>
          <input id="register-password" className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required aria-label={t('auth.passwordLabel')} />
        </div>
        <div className="input-group">
          <label htmlFor="register-confirm-password">{t('auth.confirmPasswordLabel')}</label>
          <input id="register-confirm-password" className="input-field" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required aria-label={t('auth.confirmPasswordLabel')} />
        </div>
        <div className="input-group">
          <label htmlFor="register-security-amount">{t('auth.securityAmountLabel')}</label>
          <input id="register-security-amount" className="input-field" type="number" value={securityAmount} onChange={(e) => setSecurityAmount(e.target.value)} required aria-label={t('auth.securityAmountLabel')} placeholder={t('auth.securityAmountPlaceholder')} />
        </div>
        <button type="submit" className="submit-button">{t('auth.registerButton')}</button>
      </form>
      <div className="toggle-form-container">
        <span>{t('auth.loginPrompt')} </span>
        <button onClick={onToggleView} className="toggle-form-link" aria-label="Switch to login form">{t('auth.loginLink')}</button>
      </div>
    </>
  );
};

export default AuthPage;