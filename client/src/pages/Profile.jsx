import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiUser, FiMail, FiPhone, FiCamera, FiLock, FiEdit2, FiShoppingBag, FiDollarSign, FiPackage, FiSave, FiX, FiHome } from 'react-icons/fi';

// ✅ Seller Address Form Component (Inline)
const SellerAddressForm = () => {
  const [address, setAddress] = useState({
    fullName: '', mobile: '', addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', landmark: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const states = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
    'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
    'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
    'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
    'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
    'Delhi','Jammu & Kashmir','Ladakh'
  ];

  useEffect(() => { fetchSellerAddress(); }, []);

  const fetchSellerAddress = async () => {
    try {
      const res = await api.get('/users/profile');
      if (res.data.user?.sellerAddress?.pincode) {
        setAddress(res.data.user.sellerAddress);
      }
    } catch (err) {
      console.error('Failed to fetch profile');
    }
  };

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!address.fullName || !address.mobile || !address.addressLine1 || 
        !address.city || !address.state || !address.pincode) {
      alert('Please fill all required fields!');
      return;
    }
    if (address.pincode.length !== 6) {
      alert('Please enter valid 6-digit pincode!');
      return;
    }

    try {
      setIsSaving(true);
      await api.put('/users/seller-address', { sellerAddress: address });
      setSaved(true);
      alert('✅ Seller address saved! Shiprocket will now pick up orders from this address.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-xl">
          <FiHome className="text-orange-600" size={24} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Seller Pickup Address</h2>
          <p className="text-sm text-gray-500">Shiprocket will pickup books from this address</p>
        </div>
        {saved && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            ✅ Saved
          </span>
        )}
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg mb-6">
        <p className="text-sm font-bold text-amber-800">⚠️ Important:</p>
        <p className="text-sm text-amber-700 mt-1">
          This address is <strong>PRIVATE</strong> - buyers will never see it.
          Only Shiprocket uses it for pickup scheduling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
          <input name="fullName" value={address.fullName} onChange={handleChange}
            placeholder="Your full name"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile *</label>
          <input name="mobile" value={address.mobile} onChange={handleChange}
            placeholder="10-digit mobile" maxLength={10}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Address Line 1 *</label>
          <input name="addressLine1" value={address.addressLine1} onChange={handleChange}
            placeholder="House No, Street, Area"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Address Line 2 (Optional)</label>
          <input name="addressLine2" value={address.addressLine2} onChange={handleChange}
            placeholder="Apartment, Colony"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
          <input name="city" value={address.city} onChange={handleChange} placeholder="City"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode *</label>
          <input name="pincode" value={address.pincode} onChange={handleChange}
            placeholder="6-digit pincode" maxLength={6}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">State *</label>
          <select name="state" value={address.state} onChange={handleChange}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors">
            <option value="">Select State</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Landmark (Optional)</label>
          <input name="landmark" value={address.landmark} onChange={handleChange}
            placeholder="Near temple, school"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <button onClick={handleSave} disabled={isSaving}
        className="mt-4 w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50">
        {isSaving ? '⏳ Saving...' : '💾 Save Pickup Address'}
      </button>

      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-bold text-gray-700 mb-2">🚀 How Shiprocket Pickup Works:</p>
        <div className="space-y-1 text-xs text-gray-600">
          <p>1️⃣ Buyer places order</p>
          <p>2️⃣ You receive email notification</p>
          <p>3️⃣ You click "Confirm Order" in My Sales</p>
          <p>4️⃣ Shiprocket schedules pickup from <strong>this address</strong></p>
          <p>5️⃣ Delivery boy picks up book from you</p>
          <p>6️⃣ Book delivered to buyer 📦</p>
        </div>
      </div>
    </div>
  );
};

// ✅ Main Profile Component
const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', mobile: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff&size=200';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users/profile');
      if (response.data.success) {
        setUser(response.data.user);
        setFormData({
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          mobile: response.data.user.mobile
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/users/profile', formData);
      if (response.data.success) {
        setUser(response.data.user);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      const response = await api.post('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setChangingPassword(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      setUploading(true);
      const response = await api.post('/users/upload-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setUser(response.data.user);
        setMessage({ type: 'success', text: 'Profile picture updated!' });
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload picture' });
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Failed to load profile</h2>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="relative inline-block mb-6">
                <img src={getImageUrl(user.profilePicture)} alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <FiCamera size={20} />
                  <input type="file" accept="image/*" onChange={handleProfilePictureUpload}
                    className="hidden" disabled={uploading}
                  />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.firstName} {user.lastName}</h2>
              <p className="text-gray-600 mb-6">{user.email}</p>

              {stats && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <FiShoppingBag className="text-blue-600 mx-auto mb-2" size={24} />
                    <p className="text-2xl font-bold text-gray-900">{stats.purchaseCount}</p>
                    <p className="text-sm text-gray-600">Purchases</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <FiDollarSign className="text-green-600 mx-auto mb-2" size={24} />
                    <p className="text-2xl font-bold text-gray-900">{stats.salesCount}</p>
                    <p className="text-sm text-gray-600">Sales</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <FiPackage className="text-purple-600 mx-auto mb-2" size={24} />
                    <p className="text-2xl font-bold text-gray-900">{stats.listedBooksCount}</p>
                    <p className="text-sm text-gray-600">Listed</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <FiDollarSign className="text-yellow-600 mx-auto mb-2" size={24} />
                    <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button onClick={() => navigate('/orders')}
                  className="w-full px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                  View Orders
                </button>
                <button onClick={() => navigate('/my-books')}
                  className="w-full px-4 py-3 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition-colors">
                  My Books
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                    <FiEdit2 size={18} /> Edit
                  </button>
                ) : (
                  <button onClick={() => { setIsEditing(false); setFormData({ firstName: user.firstName, lastName: user.lastName, email: user.email, mobile: user.mobile }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    <FiX size={18} /> Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="inline mr-2" /> First Name
                    </label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                      disabled={!isEditing} required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="inline mr-2" /> Last Name
                    </label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                      disabled={!isEditing} required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMail className="inline mr-2" /> Email Address
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    disabled={!isEditing} required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiPhone className="inline mr-2" /> Mobile Number
                  </label>
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange}
                    disabled={!isEditing} required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {isEditing && (
                  <button type="submit"
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                    <FiSave size={20} /> Save Changes
                  </button>
                )}
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                {!changingPassword && (
                  <button onClick={() => setChangingPassword(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition-colors">
                    <FiLock size={18} /> Change
                  </button>
                )}
              </div>

              {changingPassword ? (
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required
                    />
                  </div>

                  <div className="flex gap-4">
                    <button type="submit"
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all">
                      Update Password
                    </button>
                    <button type="button"
                      onClick={() => { setChangingPassword(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                      className="px-6 py-4 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-gray-600">Keep your account secure by using a strong password and changing it regularly.</p>
              )}
            </div>

            {/* ✅ Seller Address Form - NEW */}
            <SellerAddressForm />

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;