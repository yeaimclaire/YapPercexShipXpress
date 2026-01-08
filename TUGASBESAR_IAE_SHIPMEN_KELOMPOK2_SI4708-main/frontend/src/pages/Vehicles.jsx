import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import { Plus, Truck, Gauge, AlertCircle, Edit, Trash2, X } from 'lucide-react';

const GET_VEHICLES = gql`
  query {
    vehicles {
      vehicle_id
      V_type
      license_plate
      capacity
      status
      created_at
    }
  }
`;

const CREATE_VEHICLE = gql`
  mutation CreateVehicle(
    $V_type: String!
    $license_plate: String!
    $capacity: Float!
    $status: String!
  ) {
    createVehicle(
      V_type: $V_type
      license_plate: $license_plate
      capacity: $capacity
      status: $status
    ) {
      vehicle_id
      license_plate
      status
    }
  }
`;

const UPDATE_VEHICLE = gql`
  mutation UpdateVehicle(
    $id: ID!
    $V_type: String
    $license_plate: String
    $capacity: Float
    $status: String
  ) {
    updateVehicle(
      id: $id
      V_type: $V_type
      license_plate: $license_plate
      capacity: $capacity
      status: $status
    ) {
      vehicle_id
      license_plate
      status
    }
  }
`;

const DELETE_VEHICLE = gql`
  mutation DeleteVehicle($id: ID!) {
    deleteVehicle(id: $id)
  }
`;

const Vehicles = () => {
  const { loading, error, data, refetch } = useQuery(GET_VEHICLES);
  const [createVehicle] = useMutation(CREATE_VEHICLE);
  const [updateVehicle] = useMutation(UPDATE_VEHICLE);
  const [deleteVehicle] = useMutation(DELETE_VEHICLE);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    V_type: 'Truck',
    license_plate: '',
    capacity: '',
    status: 'available',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await updateVehicle({
          variables: {
            id: editingVehicle.vehicle_id,
            ...formData,
            capacity: formData.capacity ? parseFloat(formData.capacity) : undefined,
          },
        });
      } else {
        await createVehicle({
          variables: {
            ...formData,
            capacity: parseFloat(formData.capacity),
          },
        });
      }
      setShowModal(false);
      setEditingVehicle(null);
      setFormData({ V_type: 'Truck', license_plate: '', capacity: '', status: 'available' });
      refetch();
    } catch (err) {
      alert(`Error ${editingVehicle ? 'updating' : 'creating'} vehicle: ` + err.message);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      V_type: vehicle.V_type,
      license_plate: vehicle.license_plate,
      capacity: vehicle.capacity.toString(),
      status: vehicle.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle({ variables: { id } });
        refetch();
      } catch (err) {
        alert('Error deleting vehicle: ' + err.message);
      }
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error.message}</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in_use':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Vehicles</h2>
          <p className="text-gray-600">Manage your vehicle fleet</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-orange to-[#E8A01F] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center space-x-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Add Vehicle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.vehicles?.map((vehicle) => (
          <div
            key={vehicle.vehicle_id}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-orange/50 transform hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-orange/20 to-[#E8A01F]/20 p-4 rounded-xl group-hover:scale-110 transition-transform">
                  <Truck className="w-6 h-6 text-orange" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange transition-colors">{vehicle.license_plate}</h3>
                  <p className="text-gray-600 text-sm font-medium">{vehicle.V_type}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Capacity</span>
                <div className="flex items-center space-x-1">
                  <Gauge className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-800">{vehicle.capacity} kg</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status}
                </span>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform scale-100 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingVehicle(null);
                  setFormData({ V_type: 'Truck', license_plate: '', capacity: '', status: 'available' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.V_type}
                  onChange={(e) => setFormData({ ...formData, V_type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                >
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                <input
                  type="text"
                  required
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                >
                  <option value="available">Available</option>
                  <option value="in_use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange to-[#E8A01F] text-white py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
                >
                  {editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingVehicle(null);
                    setFormData({ V_type: 'Truck', license_plate: '', capacity: '', status: 'available' });
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

export default Vehicles;

