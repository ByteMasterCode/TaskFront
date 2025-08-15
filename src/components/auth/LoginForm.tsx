import React, { useState } from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { API_BASE_URL } from '../../constants';
import { AuthManager } from '../../utils/auth';

interface LoginFormProps {
  onSuccess: (data: any) => void;
  onSwitchToRegister: () => void;
  onSwitchToVerifyOTP: (phone: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  onSwitchToVerifyOTP
}) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await AuthManager.apiRequest(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP код отправлен в Telegram бот @EshikchiPM_Bot');
        onSwitchToVerifyOTP(phone);
      } else {
        setError(data.message || 'Ошибка при получении OTP');
      }
    } catch (error) {
      setError('Ошибка сети. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        type="tel"
        label="Номер телефона *"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+998 90 123 45 67"
        icon={Phone}
        required
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700 font-medium flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" />
          OTP код будет отправлен в Telegram бот 
          <span className="font-bold ml-1">@EshikchiPM_Bot</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        Получить OTP
      </Button>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">или</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600 font-medium">
          Нет аккаунта?{' '}
          <button 
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-800 font-bold transition-all duration-200 hover:underline"
          >
            Зарегистрироваться
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;