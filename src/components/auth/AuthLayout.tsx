import React from 'react';
import { CheckSquare } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  gradientFrom = 'blue-600',
  gradientTo = 'indigo-800'
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2247%22%20cy%3D%227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%227%22%20cy%3D%2227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2247%22%20cy%3D%2227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%227%22%20cy%3D%2247%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2247%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2247%22%20cy%3D%2247%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-xl"></div>
      
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-${gradientFrom} via-${gradientFrom.replace('-600', '-700')} to-${gradientTo} rounded-2xl mb-6 shadow-2xl relative`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
            <CheckSquare className="w-10 h-10 text-white relative z-10" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3 tracking-tight">
            {title}
          </h1>
          <p className="text-gray-400 text-lg font-medium">{subtitle}</p>
        </div>

        {/* Form Container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 relative overflow-hidden">
          {/* Card Glow Effect */}
          <div className={`absolute inset-0 bg-gradient-to-br from-${gradientFrom.replace('-600', '-500')}/5 via-transparent to-${gradientTo.replace('-800', '-500')}/5 rounded-3xl`}></div>
          
          <div className="relative z-10">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 font-medium">
            © 2025 TaskMaster. Все права защищены.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;