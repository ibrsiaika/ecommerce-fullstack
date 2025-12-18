import React, { useState } from 'react';

interface SellerApplication {
  _id: string;
  sellerName: string;
  email: string;
  storeName: string;
  storeCategory: string;
  businessLicense: string;
  taxId: string;
  bankDetails: string;
  appliedDate: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  documents: {
    idDocument: string;
    businessLicense: string;
    taxCertificate: string;
  };
  notes?: string;
  reviewedBy?: string;
  reviewedDate?: string;
}

type FilterStatus = 'all' | 'pending' | 'reviewing' | 'approved' | 'rejected';

const AdminVerificationWorkflow: React.FC = () => {
  const [sellers, setSellers] = useState<SellerApplication[]>([
    {
      _id: '1',
      sellerName: 'John Doe',
      email: 'john@example.com',
      storeName: 'Premium Electronics',
      storeCategory: 'Electronics',
      businessLicense: 'BL-2025-001',
      taxId: 'TX-001234567',
      bankDetails: '****1234',
      appliedDate: '2025-01-15',
      status: 'pending',
      documents: {
        idDocument: 'https://picsum.photos/400x300',
        businessLicense: 'https://picsum.photos/400x300',
        taxCertificate: 'https://picsum.photos/400x300',
      },
    },
    {
      _id: '2',
      sellerName: 'Jane Smith',
      email: 'jane@example.com',
      storeName: 'Fashion Hub',
      storeCategory: 'Fashion',
      businessLicense: 'BL-2025-002',
      taxId: 'TX-002345678',
      bankDetails: '****5678',
      appliedDate: '2025-01-10',
      status: 'reviewing',
      documents: {
        idDocument: 'https://picsum.photos/400x300',
        businessLicense: 'https://picsum.photos/400x300',
        taxCertificate: 'https://picsum.photos/400x300',
      },
    },
    {
      _id: '3',
      sellerName: 'Bob Wilson',
      email: 'bob@example.com',
      storeName: 'Home Decor Store',
      storeCategory: 'Home & Garden',
      businessLicense: 'BL-2025-003',
      taxId: 'TX-003456789',
      bankDetails: '****9012',
      appliedDate: '2025-01-01',
      status: 'approved',
      documents: {
        idDocument: 'https://picsum.photos/400x300',
        businessLicense: 'https://picsum.photos/400x300',
        taxCertificate: 'https://picsum.photos/400x300',
      },
      reviewedBy: 'Admin User',
      reviewedDate: '2025-01-05',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedSeller, setSelectedSeller] = useState<SellerApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const filteredSellers =
    filterStatus === 'all'
      ? sellers
      : sellers.filter((s) => s.status === filterStatus);

  const getStatusColor = (status: SellerApplication['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = (sellerId: string) => {
    setSellers(
      sellers.map((s) =>
        s._id === sellerId
          ? {
              ...s,
              status: 'approved',
              reviewedBy: 'Current Admin',
              reviewedDate: new Date().toISOString().split('T')[0],
              notes: adminNotes,
            }
          : s
      )
    );
    setSelectedSeller(null);
    setAdminNotes('');
  };

  const handleReject = (sellerId: string) => {
    setSellers(
      sellers.map((s) =>
        s._id === sellerId
          ? {
              ...s,
              status: 'rejected',
              reviewedBy: 'Current Admin',
              reviewedDate: new Date().toISOString().split('T')[0],
              notes: rejectionReason,
            }
          : s
      )
    );
    setSelectedSeller(null);
    setRejectionReason('');
  };

  const handleMarkReviewing = (sellerId: string) => {
    setSellers(
      sellers.map((s) =>
        s._id === sellerId ? { ...s, status: 'reviewing' } : s
      )
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Seller Verification Workflow</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Pending Review</p>
            <p className="text-3xl font-bold text-orange-600">
              {sellers.filter((s) => s.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Under Review</p>
            <p className="text-3xl font-bold text-yellow-600">
              {sellers.filter((s) => s.status === 'reviewing').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Approved</p>
            <p className="text-3xl font-bold text-green-600">
              {sellers.filter((s) => s.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Rejected</p>
            <p className="text-3xl font-bold text-red-600">
              {sellers.filter((s) => s.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['all', 'pending', 'reviewing', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {filteredSellers.map((seller) => (
                <div
                  key={seller._id}
                  onClick={() => setSelectedSeller(seller)}
                  className={`bg-white p-6 rounded-lg shadow cursor-pointer transition-all hover:shadow-lg ${
                    selectedSeller?._id === seller._id ? 'ring-2 ring-blue-600' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{seller.sellerName}</h3>
                      <p className="text-gray-600">{seller.storeName}</p>
                      <p className="text-sm text-gray-500">{seller.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(seller.status)}`}>
                      {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Business License</p>
                      <p className="font-medium text-gray-900">{seller.businessLicense}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tax ID</p>
                      <p className="font-medium text-gray-900">{seller.taxId}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Applied Date</p>
                      <p className="font-medium text-gray-900">{formatDate(seller.appliedDate)}</p>
                    </div>
                  </div>

                  {seller.reviewedDate && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        Reviewed by {seller.reviewedBy} on {formatDate(seller.reviewedDate)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          {selectedSeller && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {selectedSeller.sellerName} - Verification
                </h2>

                {/* Documents Section */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Documents</h3>
                  <div className="space-y-2">
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-2">ID Document</p>
                      <img
                        src={selectedSeller.documents.idDocument}
                        alt="ID"
                        className="w-full rounded"
                      />
                    </div>
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-2">Business License</p>
                      <img
                        src={selectedSeller.documents.businessLicense}
                        alt="License"
                        className="w-full rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                {selectedSeller.status !== 'approved' && selectedSeller.status !== 'rejected' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      rows={3}
                      placeholder="Add notes about this seller..."
                    />
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedSeller.status !== 'approved' && selectedSeller.status !== 'rejected' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                      rows={3}
                      placeholder="Explain why the application is being rejected..."
                    />
                  </div>
                )}

                {/* Action Buttons */}
                {selectedSeller.status === 'pending' && (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleMarkReviewing(selectedSeller._id)}
                      className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
                    >
                      Mark as Reviewing
                    </button>
                  </div>
                )}

                {selectedSeller.status === 'reviewing' && (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleApprove(selectedSeller._id)}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedSeller._id)}
                      className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}

                {selectedSeller.status === 'approved' && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-800 font-semibold">✓ Approved</p>
                    {selectedSeller.reviewedDate && (
                      <p className="text-sm text-green-700 mt-1">
                        Verified on {formatDate(selectedSeller.reviewedDate)}
                      </p>
                    )}
                    {selectedSeller.notes && (
                      <p className="text-sm text-green-700 mt-2">{selectedSeller.notes}</p>
                    )}
                  </div>
                )}

                {selectedSeller.status === 'rejected' && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-800 font-semibold">✕ Rejected</p>
                    {selectedSeller.reviewedDate && (
                      <p className="text-sm text-red-700 mt-1">
                        Rejected on {formatDate(selectedSeller.reviewedDate)}
                      </p>
                    )}
                    {selectedSeller.notes && (
                      <p className="text-sm text-red-700 mt-2 bg-white p-2 rounded">
                        Reason: {selectedSeller.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVerificationWorkflow;
