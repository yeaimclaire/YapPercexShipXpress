import { useQuery, gql } from '@apollo/client';
import { Users, Truck, UserCircle, Package, MapPin, TrendingUp, ArrowUpRight, Activity } from 'lucide-react';
import BannerCarousel from '../components/BannerCarousel';

const GET_DASHBOARD_STATS = gql`
  query {
    customers {
      customer_id
    }
    vehicles {
      vehicle_id
    }
    drivers {
      driver_id
    }
    shipments {
      shipment_id
      status
    }
    trackingUpdates {
      tracking_id
    }
  }
`;

const Dashboard = () => {
  const { loading, error, data } = useQuery(GET_DASHBOARD_STATS);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-red-800 font-semibold">Error loading data</p>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Customers',
      value: data?.customers?.length || 0,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Vehicles',
      value: data?.vehicles?.length || 0,
      icon: Truck,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Drivers',
      value: data?.drivers?.length || 0,
      icon: UserCircle,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Shipments',
      value: data?.shipments?.length || 0,
      icon: Package,
      gradient: 'from-orange to-[#E8A01F]',
      bgGradient: 'from-orange/10 to-[#E8A01F]/10',
      textColor: 'text-orange',
    },
    {
      title: 'Tracking Updates',
      value: data?.trackingUpdates?.length || 0,
      icon: MapPin,
      gradient: 'from-red-500 to-rose-500',
      bgGradient: 'from-red-50 to-rose-50',
      textColor: 'text-red-600',
    },
  ];

  const pendingShipments = data?.shipments?.filter(s => s.status === 'pending').length || 0;
  const inTransitShipments = data?.shipments?.filter(s => s.status === 'In Transit').length || 0;
  const deliveredShipments = data?.shipments?.filter(s => s.status === 'delivered').length || 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Section - Compact */}
      <div className="flex items-center justify-between bg-gradient-to-r from-orange via-[#FAB12F] to-[#E8A01F] rounded-xl shadow-lg px-6 py-4 text-white">
        <h1 className="text-xl font-bold">Welcome to ShipXpress</h1>
        <Activity className="w-6 h-6 text-white/80" />
      </div>

      {/* Banner Carousel */}
      <BannerCarousel />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-orange/30 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-br ${stat.bgGradient} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <ArrowUpRight className={`w-5 h-5 ${stat.textColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                <p className={`text-4xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shipment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-[#FEF3E2] rounded-2xl shadow-lg p-6 border-l-4 border-orange hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange/20 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange" />
            </div>
            <span className="text-xs font-semibold text-orange bg-orange/10 px-3 py-1 rounded-full">Pending</span>
          </div>
          <h3 className="text-gray-700 font-semibold mb-2">Pending Shipments</h3>
          <p className="text-4xl font-bold text-orange">{pendingShipments}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Active</span>
          </div>
          <h3 className="text-gray-700 font-semibold mb-2">In Transit</h3>
          <p className="text-4xl font-bold text-blue-600">{inTransitShipments}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500/20 p-3 rounded-xl">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">Completed</span>
          </div>
          <h3 className="text-gray-700 font-semibold mb-2">Delivered</h3>
          <p className="text-4xl font-bold text-green-600">{deliveredShipments}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

