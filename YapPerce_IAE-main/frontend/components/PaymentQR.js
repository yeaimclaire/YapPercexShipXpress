import { useState, useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentQR({ 
  amount, 
  onQRExpired, 
  paymentId,
  isRefreshing = false 
}) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isExpired, setIsExpired] = useState(false);
  const [qrKey, setQrKey] = useState(Date.now());

  useEffect(() => {
    if (isExpired || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          if (onQRExpired) {
            onQRExpired();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isExpired, onQRExpired]);

  const handleRefreshQR = () => {
    setTimeLeft(60);
    setIsExpired(false);
    setQrKey(Date.now());
    toast.success('QR code refreshed!');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getWarningLevel = () => {
    if (timeLeft > 45) return 'bg-green-50 border-green-200';
    if (timeLeft > 15) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getTimerColor = () => {
    if (timeLeft > 45) return 'text-green-600';
    if (timeLeft > 15) return 'text-yellow-600';
    return 'text-red-600 animate-pulse';
  };

  const getTimerBgColor = () => {
    if (timeLeft > 45) return 'bg-green-100';
    if (timeLeft > 15) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className={`rounded-xl border-2 p-6 mb-6 transition-all duration-300 ${getWarningLevel()}`}>
      <div className="flex flex-col items-center text-center gap-4">
        {/* Amount Section */}
        <div className="w-full">
          <p className="text-xs font-medium text-gray-600 mb-1">AMOUNT TO PAY</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatPrice(amount)}
          </p>
        </div>

        {/* QR Code */}
        <div className={`p-4 bg-white rounded-lg ${isExpired ? 'opacity-50 grayscale' : ''}`}>
          <img
            key={qrKey}
            src="/qr-dummy.svg"
            alt="QR payment code"
            className="h-44 w-44"
          />
        </div>

        {/* Instructions */}
        <div className="w-full">
          <p className="text-sm font-medium text-gray-800">
            Scan this QR code to pay
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Confirm the payment after you complete the transfer.
          </p>
        </div>

        {/* Timer Section */}
        <div className="w-full flex items-center justify-center gap-2">
          <div className={`px-4 py-2 rounded-lg font-mono font-bold text-lg ${getTimerColor()} ${getTimerBgColor()}`}>
            {formatTime(timeLeft)}
          </div>
          <span className="text-xs text-gray-600">remaining</span>
        </div>

        {/* Status Message */}
        {isExpired ? (
          <div className="w-full bg-red-100 border border-red-300 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="font-semibold text-red-800 text-sm">QR Code Expired</p>
              <p className="text-red-700 text-xs mt-1">
                Your QR code has expired. Please refresh to get a new one.
              </p>
            </div>
          </div>
        ) : timeLeft <= 15 ? (
          <div className="w-full bg-yellow-100 border border-yellow-300 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="font-semibold text-yellow-800 text-sm">Hurry! QR expiring soon</p>
              <p className="text-yellow-700 text-xs mt-1">
                Complete your payment within {formatTime(timeLeft)}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full bg-blue-100 border border-blue-300 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="font-semibold text-blue-800 text-sm">QR Code Active</p>
              <p className="text-blue-700 text-xs mt-1">
                You have {formatTime(timeLeft)} to complete the payment
              </p>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        {isExpired && (
          <button
            onClick={handleRefreshQR}
            disabled={isRefreshing}
            className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Payment QR'}
          </button>
        )}
      </div>
    </div>
  );
}
