import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import { Plus, MapPin, Clock, Package, X, User, Phone, Mail, Box, Barcode, Truck, Navigation, Edit, Trash2 } from 'lucide-react';
import TrackingMap from '../components/TrackingMap';

const GET_TRACKING_UPDATES = gql`
  query {
    trackingUpdates {
      tracking_id
      shipment_id
      location
      status
      recipient_name
      recipient_phone
      recipient_address
      item_name
      barcode
      updated_at
      shipment {
        shipment_id
        origin_address
        destination_address
        weight
        S_type
        status
        customer {
          customer_id
          name
          email
          phone
          address
        }
      }
    }
  }
`;

const CREATE_TRACKING_UPDATE = gql`
  mutation CreateTrackingUpdate(
    $shipment_id: ID!
    $location: String!
    $status: String!
    $recipient_name: String
    $recipient_phone: String
    $recipient_address: String
    $item_name: String
    $barcode: String
  ) {
    createTrackingUpdate(
      shipment_id: $shipment_id
      location: $location
      status: $status
      recipient_name: $recipient_name
      recipient_phone: $recipient_phone
      recipient_address: $recipient_address
      item_name: $item_name
      barcode: $barcode
    ) {
      tracking_id
      location
      status
      recipient_name
      recipient_phone
      recipient_address
      item_name
      barcode
      updated_at
    }
  }
`;

const UPDATE_TRACKING_UPDATE = gql`
  mutation UpdateTrackingUpdate(
    $id: ID!
    $location: String
    $status: String
    $recipient_name: String
    $recipient_phone: String
    $recipient_address: String
    $item_name: String
    $barcode: String
  ) {
    updateTrackingUpdate(
      id: $id
      location: $location
      status: $status
      recipient_name: $recipient_name
      recipient_phone: $recipient_phone
      recipient_address: $recipient_address
      item_name: $item_name
      barcode: $barcode
    ) {
      tracking_id
      location
      status
      recipient_name
      recipient_phone
      recipient_address
      item_name
      barcode
      updated_at
    }
  }
`;

const DELETE_TRACKING_UPDATE = gql`
  mutation DeleteTrackingUpdate($id: ID!) {
    deleteTrackingUpdate(id: $id)
  }
`;

const Tracking = () => {
  const { loading, error, data, refetch } = useQuery(GET_TRACKING_UPDATES);
  const [createTrackingUpdate] = useMutation(CREATE_TRACKING_UPDATE);
  const [updateTrackingUpdate] = useMutation(UPDATE_TRACKING_UPDATE);
  const [deleteTrackingUpdate] = useMutation(DELETE_TRACKING_UPDATE);
  const [showModal, setShowModal] = useState(false);
  const [editingTracking, setEditingTracking] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [formData, setFormData] = useState({
    shipment_id: '',
    location: '',
    status: 'In Transit',
    recipient_name: '',
    recipient_phone: '',
    recipient_address: '',
    item_name: '',
    barcode: '',
  });
  const [selectedTracking, setSelectedTracking] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTracking) {
        await updateTrackingUpdate({
          variables: {
            id: editingTracking.tracking_id,
            ...formData,
            shipment_id: undefined, // Don't update shipment_id
          },
        });
      } else {
        await createTrackingUpdate({ variables: formData });
      }
      setShowModal(false);
      setEditingTracking(null);
      setFormData({ 
        shipment_id: '', 
        location: '', 
        status: 'In Transit',
        recipient_name: '',
        recipient_phone: '',
        recipient_address: '',
        item_name: '',
        barcode: '',
      });
      refetch();
    } catch (err) {
      alert(`Error ${editingTracking ? 'updating' : 'creating'} tracking update: ` + err.message);
    }
  };

  const handleEdit = (tracking) => {
    setEditingTracking(tracking);
    setFormData({
      shipment_id: tracking.shipment_id.toString(),
      location: tracking.location,
      status: tracking.status || 'In Transit',
      recipient_name: tracking.recipient_name || '',
      recipient_phone: tracking.recipient_phone || '',
      recipient_address: tracking.recipient_address || '',
      item_name: tracking.item_name || '',
      barcode: tracking.barcode || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tracking update?')) {
      try {
        await deleteTrackingUpdate({ variables: { id } });
        refetch();
      } catch (err) {
        alert('Error deleting tracking update: ' + err.message);
      }
    }
  };

  const generateBarcode = () => {
    const randomBarcode = 'SHIP' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setFormData({ ...formData, barcode: randomBarcode });
  };

  // Group tracking updates by shipment
  const trackingByShipment = {};
  data?.trackingUpdates?.forEach((update) => {
    if (!trackingByShipment[update.shipment_id]) {
      trackingByShipment[update.shipment_id] = [];
    }
    trackingByShipment[update.shipment_id].push(update);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange mb-4"></div>
          <p className="text-gray-600">Loading tracking data...</p>
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
      case 'in transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Real-Time Tracking</h2>
          <p className="text-gray-600">Monitor shipment locations in real-time with 4D visualization</p>
        </div>
        <button
          onClick={() => {
            setEditingTracking(null);
            setFormData({ 
              shipment_id: '', 
              location: '', 
              status: 'In Transit',
              recipient_name: '',
              recipient_phone: '',
              recipient_address: '',
              item_name: '',
              barcode: '',
            });
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-orange to-[#E8A01F] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center space-x-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Add Update</span>
        </button>
      </div>

      {/* Shipment Selection */}
      {Object.keys(trackingByShipment).length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Select Shipment to Track</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(trackingByShipment).map(([shipmentId, updates]) => {
              const firstUpdate = updates[0];
              return (
                <button
                  key={shipmentId}
                  onClick={() => setSelectedShipment({ shipment_id: shipmentId, updates, shipment: firstUpdate.shipment })}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedShipment?.shipment_id === shipmentId
                      ? 'border-orange bg-orange/10 shadow-lg'
                      : 'border-gray-200 hover:border-orange/50 hover:bg-cream'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-800">Shipment #{shipmentId}</span>
                    <Package className={`w-5 h-5 ${selectedShipment?.shipment_id === shipmentId ? 'text-orange' : 'text-gray-400'}`} />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {firstUpdate.shipment?.origin_address} → {firstUpdate.shipment?.destination_address}
                  </p>
                  <p className="text-xs text-gray-500">{updates.length} tracking points</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4D Tracking Visualization */}
      {selectedShipment && (
        <TrackingMap trackingUpdates={selectedShipment.updates} shipment={selectedShipment.shipment} />
      )}

      {/* All Tracking Updates List */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-orange" />
          <span>All Tracking Updates</span>
        </h3>
        {data?.trackingUpdates?.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No tracking updates yet</p>
            <p className="text-gray-500 text-sm mt-2">Click "Add Update" to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.trackingUpdates?.map((update) => (
              <div
                key={update.tracking_id}
                className="group bg-gradient-to-r from-white to-cream rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-orange/50 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => setSelectedTracking(update)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="bg-gradient-to-br from-orange/20 to-[#E8A01F]/20 p-4 rounded-xl group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-orange" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange transition-colors">
                        Shipment #{update.shipment_id}
                      </h3>
                      {update.recipient_name && (
                        <p className="text-gray-700 text-sm font-semibold mt-1 flex items-center space-x-2">
                          <User className="w-4 h-4 text-orange" />
                          <span>Penerima: {update.recipient_name}</span>
                        </p>
                      )}
                      {update.item_name && (
                        <p className="text-gray-600 text-sm font-medium mt-1 flex items-center space-x-2">
                          <Box className="w-4 h-4 text-gray-400" />
                          <span>{update.item_name}</span>
                        </p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        {update.shipment?.origin_address} → {update.shipment?.destination_address}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(update.status)}`}>
                    {update.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-semibold text-gray-800">{update.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Updated</p>
                      <p className="text-sm font-semibold text-gray-800">{update.updated_at}</p>
                    </div>
                  </div>
                  {update.barcode && (
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-50 p-2 rounded-lg">
                        <Barcode className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Barcode</p>
                        <p className="text-sm font-semibold text-gray-800 font-mono">{update.barcode}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Tracking Modal */}
      {selectedTracking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Detail Tracking - Shipment #{selectedTracking.shipment_id}</h3>
              <button
                onClick={() => {
                  setSelectedTracking(null);
                  setSelectedShipment(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Pengirim Section */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span>Informasi Pengirim</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Nama</p>
                    <p className="font-semibold text-gray-800">{selectedTracking.shipment?.customer?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-800 flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedTracking.shipment?.customer?.email || '-'}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Nomor Telepon</p>
                    <p className="font-semibold text-gray-800 flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedTracking.shipment?.customer?.phone || '-'}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Alamat Pengirim</p>
                    <p className="font-semibold text-gray-800 flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedTracking.shipment?.origin_address || '-'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Penerima Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5 text-green-600" />
                  <span>Informasi Penerima</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Nama Penerima</p>
                    <p className="font-semibold text-gray-800">{selectedTracking.recipient_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Nomor Telepon</p>
                    <p className="font-semibold text-gray-800 flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedTracking.recipient_phone || '-'}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Alamat Penerima</p>
                    <p className="font-semibold text-gray-800 flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedTracking.recipient_address || selectedTracking.shipment?.destination_address || '-'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informasi Barang */}
            <div className="bg-gradient-to-br from-orange/10 to-[#E8A01F]/10 rounded-xl p-6 border-2 border-orange/20 mb-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Box className="w-5 h-5 text-orange" />
                <span>Informasi Barang</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Nama Barang</p>
                  <p className="font-semibold text-gray-800">{selectedTracking.item_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Berat</p>
                  <p className="font-semibold text-gray-800">{selectedTracking.shipment?.weight || '-'} kg</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Jenis Pengiriman</p>
                  <p className="font-semibold text-gray-800">{selectedTracking.shipment?.S_type || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Barcode</p>
                  <div className="flex items-center space-x-2">
                    <Barcode className="w-5 h-5 text-gray-400" />
                    <p className="font-semibold text-gray-800 font-mono text-lg">{selectedTracking.barcode || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking 4D Visualization */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Navigation className="w-5 h-5 text-orange" />
                <span>Tracking 4D - Status Pengiriman</span>
              </h4>
              <TrackingMap 
                trackingUpdates={trackingByShipment[selectedTracking.shipment_id] || [selectedTracking]} 
                shipment={selectedTracking.shipment} 
              />
            </div>

            <button
              onClick={() => {
                setSelectedTracking(null);
                setSelectedShipment(null);
              }}
              className="w-full bg-gradient-to-r from-orange to-[#E8A01F] text-white py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingTracking ? 'Edit Tracking Update' : 'Add Tracking Update'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTracking(null);
                  setFormData({ 
                    shipment_id: '', 
                    location: '', 
                    status: 'In Transit',
                    recipient_name: '',
                    recipient_phone: '',
                    recipient_address: '',
                    item_name: '',
                    barcode: '',
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Shipment ID</label>
                <input
                  type="text"
                  required
                  disabled={!!editingTracking}
                  value={formData.shipment_id}
                  onChange={(e) => setFormData({ ...formData, shipment_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                  <option value="In Transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Informasi Penerima</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Penerima</label>
                    <input
                      type="text"
                      value={formData.recipient_name}
                      onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon Penerima</label>
                    <input
                      type="tel"
                      value={formData.recipient_phone}
                      onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Penerima</label>
                    <input
                      type="text"
                      value={formData.recipient_address}
                      onChange={(e) => setFormData({ ...formData, recipient_address: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Informasi Barang</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Barang</label>
                    <input
                      type="text"
                      value={formData.item_name}
                      onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Barcode</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        placeholder="Auto-generate atau input manual"
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={generateBarcode}
                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold whitespace-nowrap"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange to-[#E8A01F] text-white py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
                >
                  {editingTracking ? 'Update Tracking' : 'Create Update'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ 
                      shipment_id: '', 
                      location: '', 
                      status: 'In Transit',
                      recipient_name: '',
                      recipient_phone: '',
                      recipient_address: '',
                      item_name: '',
                      barcode: '',
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

export default Tracking;

