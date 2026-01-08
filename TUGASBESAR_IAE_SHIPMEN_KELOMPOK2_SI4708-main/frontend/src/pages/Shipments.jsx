import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import { Plus, Package, MapPin, Weight, Truck, Edit, Trash2, X, Search, Filter, Eye, Calendar, User, Mail, Phone, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GET_SHIPMENTS = gql`
  query {
    shipments {
      shipment_id
      customer_id
      origin_address
      destination_address
      S_type
      weight
      status
      vehicle_id
      created_at
      customer {
        customer_id
        name
        email
        phone
        address
      }
      vehicle {
        vehicle_id
        license_plate
        V_type
        capacity
      }
    }
  }
`;

const GET_CUSTOMERS = gql`
  query {
    customers {
      customer_id
      name
      email
    }
  }
`;

const GET_VEHICLES = gql`
  query {
    vehicles {
      vehicle_id
      license_plate
      V_type
      capacity
      status
    }
  }
`;

const CREATE_SHIPMENT = gql`
  mutation CreateShipment(
    $customer_id: ID!
    $origin_address: String!
    $destination_address: String!
    $S_type: String!
    $weight: Float!
    $status: String!
    $vehicle_id: ID
  ) {
    createShipment(
      customer_id: $customer_id
      origin_address: $origin_address
      destination_address: $destination_address
      S_type: $S_type
      weight: $weight
      status: $status
      vehicle_id: $vehicle_id
    ) {
      shipment_id
      status
    }
  }
`;

const UPDATE_SHIPMENT = gql`
  mutation UpdateShipment(
    $id: ID!
    $customer_id: ID
    $origin_address: String
    $destination_address: String
    $S_type: String
    $weight: Float
    $status: String
    $vehicle_id: ID
  ) {
    updateShipment(
      id: $id
      customer_id: $customer_id
      origin_address: $origin_address
      destination_address: $destination_address
      S_type: $S_type
      weight: $weight
      status: $status
      vehicle_id: $vehicle_id
    ) {
      shipment_id
      status
    }
  }
`;

const DELETE_SHIPMENT = gql`
  mutation DeleteShipment($id: ID!) {
    deleteShipment(id: $id)
  }
`;

const Shipments = () => {
  const navigate = useNavigate();
  const { loading, error, data, refetch } = useQuery(GET_SHIPMENTS);
  const { data: customersData } = useQuery(GET_CUSTOMERS);
  const { data: vehiclesData } = useQuery(GET_VEHICLES);
  const [createShipment] = useMutation(CREATE_SHIPMENT);
  const [updateShipment] = useMutation(UPDATE_SHIPMENT);
  const [deleteShipment] = useMutation(DELETE_SHIPMENT);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [editingShipment, setEditingShipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [formData, setFormData] = useState({
    customer_id: '',
    origin_address: '',
    destination_address: '',
    S_type: 'Domestic',
    weight: '',
    status: 'pending',
    vehicle_id: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingShipment) {
        await updateShipment({
          variables: {
            id: editingShipment.shipment_id,
            ...formData,
            weight: formData.weight ? parseFloat(formData.weight) : undefined,
            vehicle_id: formData.vehicle_id || null,
            customer_id: formData.customer_id || undefined,
          },
        });
      } else {
        await createShipment({
          variables: {
            ...formData,
            weight: parseFloat(formData.weight),
            vehicle_id: formData.vehicle_id || null,
          },
        });
      }
      setShowModal(false);
      setEditingShipment(null);
      setFormData({
        customer_id: '',
        origin_address: '',
        destination_address: '',
        S_type: 'Domestic',
        weight: '',
        status: 'pending',
        vehicle_id: '',
      });
      refetch();
    } catch (err) {
      alert(`Error ${editingShipment ? 'updating' : 'creating'} shipment: ` + err.message);
    }
  };

  const handleEdit = (shipment) => {
    setEditingShipment(shipment);
    setFormData({
      customer_id: shipment.customer_id.toString(),
      origin_address: shipment.origin_address,
      destination_address: shipment.destination_address,
      S_type: shipment.S_type || 'Domestic',
      weight: shipment.weight.toString(),
      status: shipment.status || 'pending',
      vehicle_id: shipment.vehicle_id ? shipment.vehicle_id.toString() : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      try {
        await deleteShipment({ variables: { id } });
        refetch();
      } catch (err) {
        alert('Error deleting shipment: ' + err.message);
      }
    }
  };

  const handleViewDetail = (shipment) => {
    setSelectedShipment(shipment);
    setShowDetailModal(true);
  };

  const handleViewTracking = (shipmentId) => {
    navigate(`/tracking?shipment=${shipmentId}`);
  };

  // Filter shipments
  const filteredShipments = data?.shipments?.filter((shipment) => {
    const matchesSearch = 
      shipment.shipment_id.toString().includes(searchTerm) ||
      shipment.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.origin_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.vehicle?.license_plate?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || shipment.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || shipment.S_type?.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange mb-4"></div>
          <p className="text-gray-600">Loading shipments...</p>
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in transit':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'domestic':
        return 'bg-orange/10 text-orange border-orange/30';
      case 'international':
        return 'bg-purple/10 text-purple-600 border-purple/30';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Shipments</h2>
          <p className="text-gray-600">Track and manage all shipments</p>
        </div>
        <button
          onClick={() => {
            setEditingShipment(null);
            setFormData({
              customer_id: '',
              origin_address: '',
              destination_address: '',
              S_type: 'Domestic',
              weight: '',
              status: 'pending',
              vehicle_id: '',
            });
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-orange to-[#E8A01F] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center space-x-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Create Shipment</span>
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search shipments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="domestic">Domestic</option>
              <option value="international">International</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredShipments.length} of {data?.shipments?.length || 0} shipments
        </div>
      </div>

      {filteredShipments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No shipments found</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Click "Create Shipment" to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredShipments.map((shipment) => (
            <div
              key={shipment.shipment_id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-orange/50 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="bg-gradient-to-br from-orange/20 to-[#E8A01F]/20 p-4 rounded-xl group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6 text-orange" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange transition-colors">
                      Shipment #{shipment.shipment_id}
                    </h3>
                    <p className="text-gray-600 text-sm font-medium">
                      {shipment.customer?.name || `Customer ID: ${shipment.customer_id}`}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetail(shipment)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(shipment)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(shipment.shipment_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">From</p>
                    <p className="text-sm font-medium text-gray-800">{shipment.origin_address}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-orange mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">To</p>
                    <p className="text-sm font-medium text-gray-800">{shipment.destination_address}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Weight className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="text-sm font-semibold text-gray-800">{shipment.weight} kg</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Vehicle</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {shipment.vehicle?.license_plate || 'Not assigned'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(shipment.S_type)}`}>
                      {shipment.S_type || 'Domestic'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewTracking(shipment.shipment_id)}
                    className="flex items-center space-x-1 text-orange hover:text-orange/80 transition-colors text-sm font-medium"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Track</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedShipment && showDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Shipment Details #{selectedShipment.shipment_id}</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Customer Information */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Customer Information</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Name</p>
                    <p className="font-semibold text-gray-800">{selectedShipment.customer?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-800 flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedShipment.customer?.email || '-'}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Phone</p>
                    <p className="font-semibold text-gray-800 flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedShipment.customer?.phone || '-'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipment Information */}
              <div className="bg-gradient-to-br from-orange/10 to-[#E8A01F]/10 rounded-xl p-6 border-2 border-orange/20">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-orange" />
                  <span>Shipment Details</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedShipment.status)}`}>
                      {selectedShipment.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Type</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(selectedShipment.S_type)}`}>
                      {selectedShipment.S_type || 'Domestic'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Weight</p>
                    <p className="font-semibold text-gray-800">{selectedShipment.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Created Date</p>
                    <p className="font-semibold text-gray-800 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{selectedShipment.created_at || '-'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Information */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 mb-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span>Route Information</span>
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Origin</p>
                  <p className="font-semibold text-gray-800">{selectedShipment.origin_address}</p>
                </div>
                <div className="flex items-center justify-center py-2">
                  <div className="w-8 h-8 rounded-full bg-orange/20 flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-orange" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Destination</p>
                  <p className="font-semibold text-gray-800">{selectedShipment.destination_address}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            {selectedShipment.vehicle && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  <span>Assigned Vehicle</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">License Plate</p>
                    <p className="font-semibold text-gray-800">{selectedShipment.vehicle.license_plate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Type</p>
                    <p className="font-semibold text-gray-800">{selectedShipment.vehicle.V_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Capacity</p>
                    <p className="font-semibold text-gray-800">{selectedShipment.vehicle.capacity} kg</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => handleViewTracking(selectedShipment.shipment_id)}
                className="flex-1 bg-gradient-to-r from-orange to-[#E8A01F] text-white py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold flex items-center justify-center space-x-2"
              >
                <Navigation className="w-5 h-5" />
                <span>View Tracking</span>
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(selectedShipment);
                }}
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-all font-semibold flex items-center justify-center space-x-2"
              >
                <Edit className="w-5 h-5" />
                <span>Edit Shipment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingShipment ? 'Edit Shipment' : 'Create New Shipment'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingShipment(null);
                  setFormData({
                    customer_id: '',
                    origin_address: '',
                    destination_address: '',
                    S_type: 'Domestic',
                    weight: '',
                    status: 'pending',
                    vehicle_id: '',
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer</label>
                <select
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                >
                  <option value="">Select Customer</option>
                  {customersData?.customers?.map((customer) => (
                    <option key={customer.customer_id} value={customer.customer_id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Origin Address</label>
                <input
                  type="text"
                  required
                  value={formData.origin_address}
                  onChange={(e) => setFormData({ ...formData, origin_address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Destination Address</label>
                <input
                  type="text"
                  required
                  value={formData.destination_address}
                  onChange={(e) => setFormData({ ...formData, destination_address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select
                  value={formData.S_type}
                  onChange={(e) => setFormData({ ...formData, S_type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                >
                  <option value="Domestic">Domestic</option>
                  <option value="International">International</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="In Transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle (Optional)</label>
                <select
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                >
                  <option value="">Select Vehicle</option>
                  {vehiclesData?.vehicles?.filter(v => v.status === 'available' || v.vehicle_id.toString() === formData.vehicle_id).map((vehicle) => (
                    <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                      {vehicle.license_plate} ({vehicle.V_type}) - {vehicle.capacity}kg
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange to-[#E8A01F] text-white py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
                >
                  {editingShipment ? 'Update Shipment' : 'Create Shipment'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingShipment(null);
                    setFormData({
                      customer_id: '',
                      origin_address: '',
                      destination_address: '',
                      S_type: 'Domestic',
                      weight: '',
                      status: 'pending',
                      vehicle_id: '',
                    });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipments;
