import React from 'react';
import { AlertOctagon, Clock } from 'lucide-react';

interface SuspendedScreenProps {
  remainingTime: string;
}

export const SuspendedScreen: React.FC<SuspendedScreenProps> = ({ remainingTime }) => {
  return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-200">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertOctagon className="w-12 h-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Suspended</h1>
        <p className="text-gray-600 mb-6">
          Your access has been temporarily suspended due to a violation of our security and integrity policies (tampering detected).
        </p>
        
        <div className="bg-red-50 rounded-lg p-4 flex items-center justify-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-red-600" />
          <span className="font-semibold text-red-800">Lifted in: {remainingTime}</span>
        </div>
        
        <div className="text-sm text-gray-500">
          Please wait until the suspension period is over.
        </div>
      </div>
    </div>
  );
};
