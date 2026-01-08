import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import { Plus, UserCircle, Phone, CreditCard, Edit, Trash2, X, Upload } from 'lucide-react';

const GET_DRIVERS = gql`
  query {
    drivers {
      driver_id
      name_driver
      phone_driver
      license_driver
      vehicle_id
      profile_photo
      created_at
    }
  }
`;

const CREATE_DRIVER = gql`
  mutation CreateDriver(
    $name_driver: String!
    $phone_driver: String!
    $license_driver: String!
    $vehicle_id: ID
    $profile_photo: String
  ) {
    createDriver(
      name_driver: $name_driver
      phone_driver: $phone_driver
      license_driver: $license_driver
      vehicle_id: $vehicle_id
      profile_photo: $profile_photo
    ) {
      driver_id
      name_driver
      profile_photo
    }
  }
`;

const UPDATE_DRIVER = gql`
  mutation UpdateDriver(
    $id: ID!
    $name_driver: String
    $phone_driver: String
    $license_driver: String
    $vehicle_id: ID
    $profile_photo: String
  ) {
    updateDriver(
      id: $id
      name_driver: $name_driver
      phone_driver: $phone_driver
      license_driver: $license_driver
      vehicle_id: $vehicle_id
      profile_photo: $profile_photo
    ) {
      driver_id
      name_driver
      profile_photo
    }
  }
`;

const DELETE_DRIVER = gql`
  mutation DeleteDriver($id: ID!) {
    deleteDriver(id: $id)
  }
`;

const Drivers = () => {
  const { loading, error, data, refetch } = useQuery(GET_DRIVERS);
  const [createDriver] = useMutation(CREATE_DRIVER);
  const [updateDriver] = useMutation(UPDATE_DRIVER);
  const [deleteDriver] = useMutation(DELETE_DRIVER);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name_driver: '',
    phone_driver: '',
    license_driver: '',
    vehicle_id: '',
    profile_photo: '',
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData({ ...formData, profile_photo: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await updateDriver({
          variables: {
            id: editingDriver.driver_id,
            ...formData,
            vehicle_id: formData.vehicle_id || null,
          },
        });
      } else {
        await createDriver({
          variables: {
            ...formData,
            vehicle_id: formData.vehicle_id || null,
          },
        });
      }
      setShowModal(false);
      setEditingDriver(null);
      setFormData({ name_driver: '', phone_driver: '', license_driver: '', vehicle_id: '', profile_photo: '' });
      setImagePreview(null);
      refetch();
    } catch (err) {
      alert(`Error ${editingDriver ? 'updating' : 'creating'} driver: ` + err.message);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name_driver: driver.name_driver,
      phone_driver: driver.phone_driver,
      license_driver: driver.license_driver,
      vehicle_id: driver.vehicle_id ? driver.vehicle_id.toString() : '',
      profile_photo: driver.profile_photo || '',
    });
    setImagePreview(driver.profile_photo || null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await deleteDriver({ variables: { id } });
        refetch();
      } catch (err) {
        alert('Error deleting driver: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange mb-4"></div>
          <p className="text-gray-600">Loading drivers...</p>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Drivers</h2>
          <p className="text-gray-600">Manage your driver team</p>
        </div>
        <button
          onClick={() => {
            setEditingDriver(null);
            setFormData({ name_driver: '', phone_driver: '', license_driver: '', vehicle_id: '', profile_photo: '' });
            setImagePreview(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-orange to-[#E8A01F] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center space-x-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Add Driver</span>
        </button>
      </div>

      {data?.drivers?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <UserCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No drivers yet</p>
          <p className="text-gray-500 text-sm mt-2">Click "Add Driver" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.drivers?.map((driver) => (
            <div
              key={driver.driver_id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-orange/50 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative">
                    <img
                      src={driver.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name_driver)}&background=FAB12F&color=fff&size=200`}
                      alt={driver.name_driver}
                      className="w-16 h-16 rounded-full object-cover border-4 border-orange/20 group-hover:border-orange transition-all shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange transition-colors">{driver.name_driver}</h3>
                    <p className="text-gray-600 text-sm font-medium">ID: {driver.driver_id}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(driver)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(driver.driver_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <div className="bg-green-50 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">{driver.phone_driver}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{driver.license_driver}</span>
                </div>
                {driver.vehicle_id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Vehicle ID: {driver.vehicle_id}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingDriver(null);
                  setImagePreview(null);
                  setFormData({ name_driver: '', phone_driver: '', license_driver: '', vehicle_id: '', profile_photo: '' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Photo</label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-4 border-orange/20"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange/20 to-[#E8A01F]/20 flex items-center justify-center border-4 border-orange/20">
                        <UserCircle className="w-10 h-10 text-orange" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange transition-all flex items-center justify-center space-x-2 text-gray-600 hover:text-orange">
                        <Upload className="w-5 h-5" />
                        <span className="text-sm font-medium">Upload Photo</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (max 2MB)</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name_driver}
                  onChange={(e) => setFormData({ ...formData, name_driver: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone_driver}
                  onChange={(e) => setFormData({ ...formData, phone_driver: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">License Number</label>
                <input
                  type="text"
                  required
                  value={formData.license_driver}
                  onChange={(e) => setFormData({ ...formData, license_driver: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle ID (Optional)</label>
                <input
                  type="text"
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange to-[#E8A01F] text-white py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
                >
                  {editingDriver ? 'Update Driver' : 'Create Driver'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDriver(null);
                    setImagePreview(null);
                    setFormData({ name_driver: '', phone_driver: '', license_driver: '', vehicle_id: '', profile_photo: '' });
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

export default Drivers;
