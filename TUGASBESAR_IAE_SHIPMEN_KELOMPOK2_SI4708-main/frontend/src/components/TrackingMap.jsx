import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Package, Truck } from 'lucide-react';

const TrackingMap = ({ trackingUpdates, shipment }) => {
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(0);

  // Simulate real-time tracking
  useEffect(() => {
    if (trackingUpdates && trackingUpdates.length > 0) {
      const interval = setInterval(() => {
        setCurrentLocation((prev) => {
          if (prev < trackingUpdates.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [trackingUpdates]);

  if (!trackingUpdates || trackingUpdates.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No tracking updates available</p>
      </div>
    );
  }

  const origin = shipment?.origin_address || 'Origin';
  const destination = shipment?.destination_address || 'Destination';
  const progress = ((currentLocation + 1) / trackingUpdates.length) * 100;

  return (
    <div className="space-y-6">
      {/* Map Visualization */}
      <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 rounded-2xl shadow-xl p-8 border-2 border-blue-200">
        <div className="relative h-96 rounded-xl overflow-hidden bg-white">
          {/* Route Line */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-orange absolute top-1/2 transform -translate-y-1/2 opacity-30"></div>
          </div>

          {/* Origin Point */}
          <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
            <div className="bg-green-500 p-4 rounded-full shadow-lg border-4 border-white">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="mt-2 bg-white px-3 py-1 rounded-lg shadow-md text-xs font-semibold text-gray-800 whitespace-nowrap">
              {origin}
            </div>
          </div>

          {/* Current Location (Moving) */}
          {trackingUpdates[currentLocation] && (
            <div
              className="absolute top-1/2 transform -translate-y-1/2 z-20 transition-all duration-1000"
              style={{
                left: `${20 + (progress / 100) * 60}%`,
              }}
            >
              <div className="relative">
                <div className="bg-orange p-4 rounded-full shadow-xl border-4 border-white animate-pulse">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-orange min-w-[200px]">
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-orange" />
                    <span className="text-sm font-bold text-gray-800">
                      {trackingUpdates[currentLocation].location}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {trackingUpdates[currentLocation].status}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Previous Tracking Points */}
          {trackingUpdates.map((update, index) => {
            if (index >= currentLocation) return null;
            const pointProgress = ((index + 1) / trackingUpdates.length) * 100;
            return (
              <div
                key={update.tracking_id}
                className="absolute top-1/2 transform -translate-y-1/2 z-10"
                style={{
                  left: `${20 + (pointProgress / 100) * 60}%`,
                }}
              >
                <div className="bg-blue-500 p-2 rounded-full shadow-md border-2 border-white">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
              </div>
            );
          })}

          {/* Destination Point */}
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
            <div className="bg-orange p-4 rounded-full shadow-lg border-4 border-white">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="mt-2 bg-white px-3 py-1 rounded-lg shadow-md text-xs font-semibold text-gray-800 whitespace-nowrap">
              {destination}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Progress</span>
            <span className="text-sm font-bold text-orange">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 via-blue-500 to-orange h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-orange" />
          <span>Tracking Timeline</span>
        </h3>
        <div className="space-y-4">
          {trackingUpdates.map((update, index) => {
            const isActive = index === currentLocation;
            const isPast = index < currentLocation;
            return (
              <div
                key={update.tracking_id}
                className={`flex items-start space-x-4 p-4 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange/10 to-[#E8A01F]/10 border-2 border-orange shadow-md'
                    : isPast
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
                onClick={() => setSelectedUpdate(update)}
              >
                <div
                  className={`p-3 rounded-full ${
                    isActive
                      ? 'bg-orange text-white'
                      : isPast
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isActive ? (
                    <Truck className="w-5 h-5 animate-pulse" />
                  ) : isPast ? (
                    <MapPin className="w-5 h-5" />
                  ) : (
                    <MapPin className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-800">{update.location}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isActive
                          ? 'bg-orange text-white'
                          : isPast
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {update.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{update.updated_at}</p>
                  {isActive && (
                    <div className="mt-2 flex items-center space-x-2 text-orange text-sm font-semibold">
                      <Navigation className="w-4 h-4 animate-spin" />
                      <span>Current Location</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrackingMap;

