import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { getCurrentUser } from '../../store/slices/authSlice';
import { FiUser, FiMail, FiCalendar, FiSave, FiLock } from 'react-icons/fi';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (!user) {
      dispatch(getCurrentUser());
    } else {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    console.log('Update profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black"></div>
          </div>
          <p className="text-xl text-gray-600 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔐</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">User not found</h2>
          <p className="text-lg text-gray-600">Please try logging in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">Profile Settings</h1>
            <p className="text-xl text-gray-600">Manage your account information and preferences</p>
          </div>

          {/* Main Profile Card */}
          <div className="surface rounded-2xl p-12 shadow-lg border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* Avatar Section */}
              <div className="md:col-span-1">
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-40 h-40 rounded-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-20 h-20 text-gray-400" />
                    )}
                  </div>
                  <button className="mt-6 btn btn-outline py-2 px-6 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                    Change Avatar
                  </button>
                  <p className="text-xs text-gray-500 mt-3 text-center">JPG, PNG up to 5MB</p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="md:col-span-3">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-widest">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`input w-full py-3 px-4 rounded-xl border-2 ${isEditing ? 'border-gray-300 focus:border-black' : 'border-gray-200 bg-gray-50'}`}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-widest">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`input w-full py-3 px-4 rounded-xl border-2 ${isEditing ? 'border-gray-300 focus:border-black' : 'border-gray-200 bg-gray-50'}`}
                    />
                    {!user.isEmailVerified && (
                      <p className="mt-3 text-sm text-amber-600 font-semibold">
                        ⚠️ Email not verified. <button type="button" className="underline font-bold hover:text-amber-700">Resend verification</button>
                      </p>
                    )}
                  </div>

                  {/* Role Badge */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-widest">
                      Account Role
                    </label>
                    <div>
                      <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-bold bg-black text-white capitalize">
                        {user.role === 'admin' ? '👑 Admin' : user.role === 'seller' ? '🏪 Seller' : '👤 Customer'}
                      </span>
                    </div>
                  </div>

                  {/* Created At */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-widest">
                      Member Since
                    </label>
                    <div className="flex items-center gap-3 text-lg text-gray-900 font-semibold">
                      📅
                      <span>
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-8 border-t border-gray-200">
                    <div className="flex gap-4">
                      {isEditing ? (
                        <>
                          <button
                            type="submit"
                            className="btn btn-primary px-8 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-shadow"
                          >
                            ✓ Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-outline px-8 py-3 rounded-xl font-bold text-base hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="btn btn-primary px-8 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-shadow"
                        >
                          ✎ Edit Profile
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline px-8 py-3 rounded-xl font-bold text-base hover:bg-gray-50 transition-colors"
                    >
                      🔐 Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="surface rounded-2xl p-8 border border-red-200 bg-red-50">
            <h2 className="text-2xl font-bold text-red-900 mb-6">Danger Zone</h2>
            <p className="text-red-800 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="btn text-red-600 hover:text-red-700 font-bold text-base hover:bg-red-100 px-6 py-3 rounded-lg transition-colors">
              🗑️ Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;