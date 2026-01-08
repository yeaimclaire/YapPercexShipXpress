import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Tag, Percent, Gift } from 'lucide-react';

const banners = [
  {
    id: 1,
    title: 'Special Discount!',
    subtitle: 'Get 20% OFF on International Shipments',
    description: 'Limited time offer for all corporate customers',
    color: 'from-orange to-[#E8A01F]',
    icon: Percent,
    action: 'Learn More',
  },
  {
    id: 2,
    title: 'New Partner Added',
    subtitle: 'Express Delivery Available',
    description: 'Same-day delivery for selected routes',
    color: 'from-blue-500 to-cyan-500',
    icon: Tag,
    action: 'View Details',
  },
  {
    id: 3,
    title: 'Loyalty Rewards',
    subtitle: 'Earn Points with Every Shipment',
    description: 'Join our loyalty program and get exclusive benefits',
    color: 'from-purple-500 to-pink-500',
    icon: Gift,
    action: 'Join Now',
  },
];

const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToBanner = (index) => {
    setCurrentIndex(index);
  };

  if (!isVisible) return null;

  const currentBanner = banners[currentIndex];
  const Icon = currentBanner.icon;

  return (
    <div className="relative bg-gradient-to-r from-orange via-[#FAB12F] to-[#E8A01F] rounded-2xl shadow-xl overflow-hidden mb-6">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative p-8 md:p-12">
        {/* Navigation Arrows */}
        <button
          onClick={prevBanner}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextBanner}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Banner Content */}
        <div className="flex items-center justify-between">
          <div className="flex-1 text-white">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold">
                {currentBanner.title}
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-2">{currentBanner.subtitle}</h3>
            <p className="text-white/90 text-lg mb-4">{currentBanner.description}</p>
            <button className="bg-white text-orange px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg">
              {currentBanner.action}
            </button>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl">
              <Icon className="w-24 h-24 text-white/30" />
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center space-x-2 mt-6">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToBanner(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/40 w-2 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerCarousel;

