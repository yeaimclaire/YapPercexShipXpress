import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, MapPin, X } from 'lucide-react';

const GET_CUSTOMERS = gql`
  query {
    customers {
      customer_id
      name
      email
      phone
      address
      C_type
      created_at
    }
  }
`;

const CREATE_CUSTOMER = gql`
  mutation CreateCustomer(
    $name: String!
    $email: String!
    $phone: String!
    $address: String!
    $C_type: String!
  ) {
    createCustomer(
      name: $name
      email: $email
      phone: $phone
      address: $address
      C_type: $C_type
    ) {
      customer_id
      name
      email
    }
  }
`;

const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer(
    $id: ID!
    $name: String
    $email: String
    $phone: String
    $address: String
    $C_type: String
  ) {
    updateCustomer(
      id: $id
      name: $name
      email: $email
      phone: $phone
      address: $address
      C_type: $C_type
    ) {
      customer_id
      name
      email
    }
  }
`;

const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id)
  }
`;

const Customers = () => {
  const { loading, error, data, refetch } = useQuery(GET_CUSTOMERS);
  const [createCustomer] = useMutation(CREATE_CUSTOMER);
  const [updateCustomer] = useMutation(UPDATE_CUSTOMER);
  const [deleteCustomer] = useMutation(DELETE_CUSTOMER);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    C_type: 'Individual',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer({
          variables: {
            id: editingCustomer.customer_id,
            ...formData,
          },
        });
      } else {
        await createCustomer({ variables: formData });
      }
      setShowModal(false);
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', address: '', C_type: 'Individual' });
      refetch();
    } catch (err) {
      alert(`Error ${editingCustomer ? 'updating' : 'creating'} customer: ` + err.message);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      C_type: customer.C_type,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer({ variables: { id } });
        refetch();
      } catch (err) {
        alert('Error deleting customer: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
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
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Customers</h2>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setFormData({ name: '', email: '', phone: '', address: '', C_type: 'Individual' });
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-orange to-[#E8A01F] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center space-x-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Add Customer</span>
        </button>
      </div>

      {data?.customers?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No customers yet</p>
          <p className="text-gray-500 text-sm mt-2">Click "Add Customer" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.customers?.map((customer) => (
            <div
              key={customer.customer_id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-orange/50 transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange transition-colors">
                    {customer.name}
                  </h3>
                  <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-orange/10 to-[#E8A01F]/10 text-orange rounded-full text-xs font-semibold border border-orange/20">
                    {customer.C_type}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.customer_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3 text-gray-600 hover:text-gray-800 transition-colors">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{customer.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 hover:text-gray-800 transition-colors">
                  <div className="bg-green-50 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">{customer.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 hover:text-gray-800 transition-colors">
                  <div className="bg-purple-50 p-2 rounded-lg">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium">{customer.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform scale-100 animate-scaleIn border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCustomer(null);
                  setFormData({ name: '', email: '', phone: '', address: '', C_type: 'Individual' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select
                  value={formData.C_type}
                  onChange={(e) => setFormData({ ...formData, C_type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                >
                  <option value="Individual">Individual</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange to-[#E8A01F] text-white py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
                >
                  {editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCustomer(null);
                    setFormData({ name: '', email: '', phone: '', address: '', C_type: 'Individual' });
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

export default Customers;
