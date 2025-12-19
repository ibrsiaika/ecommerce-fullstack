import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface Permission {
  resource: string;
  actions: string[];
}

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
}

const API_BASE = 'http://localhost:5000/api/admin';

const getAuthHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
  'Content-Type': 'application/json'
});

const AVAILABLE_RESOURCES = ['orders', 'products', 'users', 'sellers', 'payments', 'reports', 'settings', 'dashboard'];

const AVAILABLE_ACTIONS: Record<string, string[]> = {
  orders: ['view', 'create', 'edit', 'delete', 'export'],
  products: ['view', 'create', 'edit', 'delete', 'publish'],
  users: ['view', 'create', 'edit', 'delete', 'ban'],
  sellers: ['view', 'approve', 'edit', 'suspend', 'verify'],
  payments: ['view', 'process', 'refund', 'export', 'manage'],
  reports: ['view', 'create', 'export', 'schedule', 'delete'],
  settings: ['view', 'edit', 'configure', 'manage', 'export'],
  dashboard: ['view', 'customize', 'manage', 'export', 'configure']
};

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  
  const [newRoleData, setNewRoleData] = useState({
    name: '',
    description: '',
    permissions: [] as Permission[]
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/roles`, {
        method: 'GET',
        headers: getAuthHeader()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.status}`);
      }

      const data = await response.json();
      setRoles(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      console.error('Fetch roles error:', err);
      setError(err.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleData.name.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/roles`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(newRoleData)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to create role: ${response.status}`);
      }

      setNewRoleData({ name: '', description: '', permissions: [] });
      setShowAddRole(false);
      await fetchRoles();
    } catch (err: any) {
      console.error('Create role error:', err);
      setError(err.message || 'Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/roles/${editingRole._id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({
          name: editingRole.name,
          description: editingRole.description,
          permissions: editingRole.permissions
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to update role: ${response.status}`);
      }

      setEditingRole(null);
      await fetchRoles();
    } catch (err: any) {
      console.error('Update role error:', err);
      setError(err.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/roles/${roleId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to delete role: ${response.status}`);
      }

      await fetchRoles();
    } catch (err: any) {
      console.error('Delete role error:', err);
      setError(err.message || 'Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = () => {
    const newPermission: Permission = {
      resource: AVAILABLE_RESOURCES[0],
      actions: []
    };
    setNewRoleData({
      ...newRoleData,
      permissions: [...newRoleData.permissions, newPermission]
    });
  };

  const handleRemovePermission = (index: number) => {
    setNewRoleData({
      ...newRoleData,
      permissions: newRoleData.permissions.filter((_, i) => i !== index)
    });
  };

  const handleToggleAction = (permIndex: number, action: string) => {
    const updated = [...newRoleData.permissions];
    const actions = updated[permIndex].actions;
    
    if (actions.includes(action)) {
      updated[permIndex].actions = actions.filter(a => a !== action);
    } else {
      updated[permIndex].actions = [...actions, action];
    }
    
    setNewRoleData({ ...newRoleData, permissions: updated });
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading roles...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <FiX size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
        <button
          onClick={() => setShowAddRole(!showAddRole)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FiPlus size={18} />
          New Role
        </button>
      </div>

      {/* Add/Edit Role Form */}
      {(showAddRole || editingRole) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingRole ? 'Edit Role' : 'Create New Role'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <input
                type="text"
                value={editingRole?.name || newRoleData.name}
                onChange={(e) => {
                  if (editingRole) {
                    setEditingRole({ ...editingRole, name: e.target.value });
                  } else {
                    setNewRoleData({ ...newRoleData, name: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Manager, Editor, Reviewer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editingRole?.description || newRoleData.description}
                onChange={(e) => {
                  if (editingRole) {
                    setEditingRole({ ...editingRole, description: e.target.value });
                  } else {
                    setNewRoleData({ ...newRoleData, description: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Role description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="space-y-3">
                {(editingRole?.permissions || newRoleData.permissions).map((perm, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <select
                        value={perm.resource}
                        onChange={(e) => {
                          const updated = editingRole
                            ? { ...editingRole, permissions: [...editingRole.permissions] }
                            : { ...newRoleData, permissions: [...newRoleData.permissions] };
                          updated.permissions[idx].resource = e.target.value;
                          if (editingRole) {
                            setEditingRole(updated as Role);
                          } else {
                            setNewRoleData(updated);
                          }
                        }}
                        className="px-3 py-1 border border-gray-300 rounded text-sm font-medium bg-white"
                      >
                        {AVAILABLE_RESOURCES.map(r => (
                          <option key={r} value={r} className="capitalize">{r}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          if (editingRole) {
                            setEditingRole({
                              ...editingRole,
                              permissions: editingRole.permissions.filter((_, i) => i !== idx)
                            });
                          } else {
                            handleRemovePermission(idx);
                          }
                        }}
                        className="px-3 py-1 rounded text-sm bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>

                    {AVAILABLE_ACTIONS[perm.resource] && (
                      <div className="grid grid-cols-2 gap-2 pl-3 border-l-4 border-blue-500">
                        {AVAILABLE_ACTIONS[perm.resource].map(action => (
                          <label key={action} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={perm.actions.includes(action)}
                              onChange={() => {
                                if (editingRole) {
                                  const updated = { ...editingRole };
                                  const permission = updated.permissions[idx];
                                  if (permission.actions.includes(action)) {
                                    permission.actions = permission.actions.filter(a => a !== action);
                                  } else {
                                    permission.actions.push(action);
                                  }
                                  setEditingRole(updated);
                                } else {
                                  handleToggleAction(idx, action);
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-700 capitalize">{action}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    if (editingRole) {
                      setEditingRole({
                        ...editingRole,
                        permissions: [
                          ...editingRole.permissions,
                          { resource: AVAILABLE_RESOURCES[0], actions: [] }
                        ]
                      });
                    } else {
                      handleAddPermission();
                    }
                  }}
                  className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
                >
                  <FiPlus size={16} />
                  Add Permission
                </button>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => {
                  setEditingRole(null);
                  setShowAddRole(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingRole ? handleUpdateRole : handleCreateRole}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FiSave size={18} />
                {editingRole ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roles List */}
      <div className="space-y-3">
        {roles.map((role: Role) => (
          <div key={role._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4 flex-1">
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">{role.name}</h3>
                  <p className="text-sm text-gray-600">{role.permissions.length} permissions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!role.isSystem && (
                  <>
                    <button
                      onClick={() => setEditingRole(role)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setExpandedRole(expandedRole === role._id ? null : role._id)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  {expandedRole === role._id ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
              </div>
            </div>

            {expandedRole === role._id && (
              <div className="bg-gray-50 border-t border-gray-200 p-4">
                {role.description && <p className="text-sm text-gray-700 mb-3">{role.description}</p>}
                <div className="space-y-2">
                  {role.permissions.map((perm: Permission) => (
                    <div key={perm.resource} className="text-sm">
                      <span className="font-medium capitalize text-gray-900">{perm.resource}:</span>
                      <span className="text-gray-600 ml-2">
                        {perm.actions.map(action => (
                          <span key={action} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1 capitalize">
                            {action}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {roles.length === 0 && !showAddRole && !editingRole && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No roles found</p>
          <button
            onClick={() => setShowAddRole(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Role
          </button>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
