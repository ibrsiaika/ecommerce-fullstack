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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
          <p className="text-gray-600">Please try logging in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Avatar Section */}
              <div className="md:col-span-1">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-16 h-16 text-indigo-600" />
                    )}
                  </div>
                  <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-700">
                    Change Avatar
                  </button>
                </div>
              </div>

              {/* Profile Form */}
              <div className="md:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    {!user.isEmailVerified && (
                      <p className="mt-1 text-sm text-amber-600">
                        Email not verified. <button className="underline">Resend verification</button>
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Created At */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Member Since
                    </label>
                    <div className="mt-1 flex items-center">
                      <FiCalendar className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-4">
                    <div>
                      {isEditing ? (
                        <div className="space-x-2">
                          <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <FiSave className="w-4 h-4 mr-2" />
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Edit Profile
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FiLock className="w-4 h-4 mr-2" />
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Account Actions</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;