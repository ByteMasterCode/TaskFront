import React, { useState } from 'react';
import { Phone, MessageSquare, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { API_BASE_URL } from '../../constants';
import { AuthManager } from '../../utils/auth';

interface RegisterFormProps {
  onSuccess: (data: any) => void;
  onSwitchToLogin: () => void;
  onSwitchToVerifyOTP: (phone: string) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
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
        setError(data.message || 'Ошибка при регистрации');
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

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <p className="text-sm text-emerald-700 font-medium flex items-center">
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
        Отправить OTP
      </Button>

      <div className="text-center">
        <button 
          type="button"
          onClick={onSwitchToLogin}
          className="text-emerald-600 hover:text-emerald-800 font-bold transition-all duration-200 flex items-center justify-center space-x-2 mx-auto hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад к входу</span>
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;