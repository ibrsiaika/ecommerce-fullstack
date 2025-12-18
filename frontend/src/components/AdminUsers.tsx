import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const AdminUsers: React.FC = () => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || user.role !== 'admin') return;

      try {
        const response = await fetch('/api/users', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          setUsers(result.data || []);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch users');
        }
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const response = await fetch(`/api/users/${updatedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isActive: updatedUser.isActive
        })
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(users.map(u => u._id === updatedUser._id ? result.data : u));
        setShowEditModal(false);
        setEditingUser(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update user');
      }
    } catch (err) {
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black"></div>
          </div>
          <p className="text-xl text-gray-600 font-semibold">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container py-16">
          <div className="p-6 rounded-xl bg-red-50 border-2 border-red-200">
            <p className="text-red-700 font-semibold text-lg">⚠️ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-16 lg:py-20">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3">👥 User Management</h1>
              <p className="text-xl text-gray-600">Manage user accounts and roles</p>
            </div>
            <div className="surface rounded-xl p-6 border border-gray-200">
              <p className="text-sm text-gray-600 font-semibold uppercase tracking-widest mb-2">Total Users</p>
              <p className="text-4xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="surface rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-widest text-gray-700">User</th>
                  <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-widest text-gray-700">Role</th>
                  <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-widest text-gray-700">Status</th>
                  <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-widest text-gray-700">Joined</th>
                  <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-widest text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((userItem) => (
                  <tr key={userItem._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-8 py-6">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{userItem.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{userItem.email}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex px-4 py-2 rounded-full font-bold text-sm ${
                        userItem.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : userItem.role === 'seller'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {userItem.role === 'admin' ? '👑' : userItem.role === 'seller' ? '🏪' : '👤'} {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex px-4 py-2 rounded-full font-bold text-sm ${
                        userItem.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {userItem.isActive ? '✓ Active' : '✕ Inactive'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-gray-900 font-semibold">{formatDate(userItem.createdAt)}</td>
                    <td className="px-8 py-6 space-x-3 flex">
                      <button
                        onClick={() => handleEditUser(userItem)}
                        className="btn btn-outline text-sm px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                      >
                        ✎ Edit
                      </button>
                      {userItem._id !== user.id && (
                        <button
                          onClick={() => handleDeleteUser(userItem._id)}
                          className="btn text-sm px-4 py-2 rounded-lg font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="surface rounded-2xl border border-gray-200 w-full max-w-md p-10 shadow-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">✎ Edit User</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editingUser) {
                    handleUpdateUser(editingUser);
                  }
                }}
              >
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">Name</label>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 text-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">Email</label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 text-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 text-lg"
                    >
                      <option value="user">👤 User</option>
                      <option value="seller">🏪 Seller</option>
                      <option value="admin">👑 Admin</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <input
                      type="checkbox"
                      id="active"
                      checked={editingUser.isActive}
                      onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <label htmlFor="active" className="font-bold text-gray-900 cursor-pointer flex-1">
                      Active Account
                    </label>
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    className="btn btn-outline flex-1 py-3 rounded-lg font-bold text-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1 py-3 rounded-lg font-bold text-lg transition-all hover:shadow-lg"
                  >
                    ✓ Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;