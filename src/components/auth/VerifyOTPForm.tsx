import React, { useState } from 'react';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { API_BASE_URL } from '../../constants';
import { AuthManager } from '../../utils/auth';
import { AuthResponse } from '../../types';

interface VerifyOTPFormProps {
  phone: string;
  onSuccess: (data: AuthResponse) => void;
  onBack: () => void;
  onResend: () => void;
}

const VerifyOTPForm: React.FC<VerifyOTPFormProps> = ({
  phone,
  onSuccess,
  onBack,
  onResend
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await AuthManager.apiRequest(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        body: JSON.stringify({ phone, code: otp })
      });

      const data: AuthResponse = await response.json();

      if (response.ok) {
        AuthManager.saveAuth(data);
        onSuccess(data);
      } else {
        setError('Неверный код');
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
        type="text"
        label="OTP код *"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="123456"
        maxLength={6}
        className="text-center text-3xl tracking-widest font-bold"
        icon={MessageSquare}
        required
      />

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-purple-700 text-sm font-bold mb-2 flex items-center">
          <span className="text-lg mr-2">📱</span>
          Откройте Telegram бот @EshikchiPM_Bot
        </p>
        <p className="text-indigo-600 text-sm font-medium">
          OTP код отправлен на номер: <span className="font-bold">{phone}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <Button 
        type="submit" 
        loading={loading} 
        disabled={otp.length !== 6}
        className="w-full"
      >
        Войти
      </Button>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button 
          type="button"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 font-bold transition-all duration-200 flex items-center space-x-2 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>
        <button 
          type="button"
          onClick={onResend}
          className="text-purple-600 hover:text-purple-800 font-bold transition-all duration-200 hover:underline"
        >
          Отправить повторно
        </button>
      </div>
    </form>
  );
};

export default VerifyOTPForm;