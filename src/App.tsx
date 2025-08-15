import React from 'react';
import { useAuth } from './hooks/useAuth';
import Dashboard from './components/Dashboard';
import AuthLayout from './components/auth/AuthLayout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import VerifyOTPForm from './components/auth/VerifyOTPForm';
import LoadingSpinner from './components/ui/LoadingSpinner';

const App: React.FC = () => {
  const { isAuthenticated, user, loading, login, logout } = useAuth();
  const [currentAuthView, setCurrentAuthView] = React.useState<'login' | 'register' | 'verify-otp'>('login');
  const [otpPhone, setOtpPhone] = React.useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Загрузка..." />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Dashboard user={user} onLogout={logout} />;
  }

  const handleSwitchToVerifyOTP = (phone: string) => {
    setOtpPhone(phone);
    setCurrentAuthView('verify-otp');
  };

  const handleBackToLogin = () => {
    setCurrentAuthView('login');
    setOtpPhone('');
  };

  const handleResendOTP = () => {
    // Logic to resend OTP would go here
    console.log('Resending OTP to:', otpPhone);
  };

  return (
    <div className="min-h-screen">
      {currentAuthView === 'login' && (
        <AuthLayout
          title="TaskMaster"
          subtitle="Система управления задачами"
          gradientFrom="blue-600"
          gradientTo="indigo-800"
        >
          <LoginForm
            onSuccess={login}
            onSwitchToRegister={() => setCurrentAuthView('register')}
            onSwitchToVerifyOTP={handleSwitchToVerifyOTP}
          />
        </AuthLayout>
      )}

      {currentAuthView === 'register' && (
        <AuthLayout
          title="Регистрация"
          subtitle="Создайте новый аккаунт"
          gradientFrom="emerald-600"
          gradientTo="teal-800"
        >
          <RegisterForm
            onSuccess={login}
            onSwitchToLogin={() => setCurrentAuthView('login')}
            onSwitchToVerifyOTP={handleSwitchToVerifyOTP}
          />
        </AuthLayout>
      )}

      {currentAuthView === 'verify-otp' && (
        <AuthLayout
          title="Подтверждение"
          subtitle="Введите код из Telegram"
          gradientFrom="purple-600"
          gradientTo="indigo-800"
        >
          <VerifyOTPForm
            phone={otpPhone}
            onSuccess={login}
            onBack={handleBackToLogin}
            onResend={handleResendOTP}
          />
        </AuthLayout>
      )}
    </div>
  );
};

export default App;