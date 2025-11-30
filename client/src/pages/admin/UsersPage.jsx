import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Ban, Trash2 } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        onConfirm: () => { },
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/users', {
                credentials: 'include',
            });
            const data = await response.json();
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    const openModal = (config) => {
        setModalConfig({ ...config, isOpen: true });
    };

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    const handleToggleBan = (id, currentStatus) => {
        openModal({
            type: currentStatus ? 'info' : 'warning',
            title: currentStatus ? 'Unban User' : 'Ban User',
            message: `Are you sure you want to ${currentStatus ? 'unban' : 'ban'} this user? ${currentStatus ? 'They will regain access to the platform.' : 'They will lose access to their account.'}`,
            confirmText: currentStatus ? 'Unban User' : 'Ban User',
            onConfirm: async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/admin/users/${id}/ban`, {
                        method: 'PUT',
                        credentials: 'include',
                    });
                    if (response.ok) {
                        fetchUsers();
                        closeModal();
                    } else {
                        const data = await response.json();
                        alert(data.msg || 'Failed to update user status');
                    }
                } catch (error) {
                    console.error('Error updating user status:', error);
                }
            }
        });
    };

    const handleDelete = (id) => {
        openModal({
            type: 'danger',
            title: 'Delete User',
            message: 'Are you sure you want to delete this user? This action cannot be undone and all user data will be permanently removed.',
            confirmText: 'Delete User',
            onConfirm: async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                    });
                    if (response.ok) {
                        fetchUsers();
                        closeModal();
                    } else {
                        const data = await response.json();
                        alert(data.msg || 'Failed to delete user');
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                }
            }
        });
    };

    const filteredUsers = users
        .filter(user => !user.isAdmin) // Filter out admins
        .filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (loading) {
        return <div className="text-gray-500 font-body">Loading users...</div>;
    }

    return (
        <div className="space-y-6 font-body">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-aero-text mb-2 font-heading">Users</h1>
                    <p className="text-gray-500">Manage your users ({filteredUsers.length} total)</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-11 pr-4 py-3 bg-aero-surface border border-gray-200 rounded-lg text-aero-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-aero-primary transition-all shadow-sm"
                    />
                </div>
                <select
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    className="px-4 py-3 bg-aero-surface border border-gray-200 rounded-lg text-aero-text focus:outline-none focus:ring-2 focus:ring-aero-primary transition-all shadow-sm"
                >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-aero-surface rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-aero-text font-medium">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.isBanned
                                                ? 'bg-red-50 text-red-700 border border-red-200'
                                                : 'bg-green-50 text-green-700 border border-green-200'
                                                }`}>
                                                {user.isBanned ? 'Banned' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.isBanned
                                                ? 'bg-red-50 text-red-700 border border-red-200'
                                                : 'bg-green-50 text-green-700 border border-green-200'
                                                }`}>
                                                {user.isBanned ? 'Banned' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleBan(user._id, user.isBanned)}
                                                    className={`p-2 rounded-lg transition-colors ${user.isBanned
                                                        ? 'hover:bg-green-50 text-green-600'
                                                        : 'hover:bg-red-50 text-red-600'
                                                        }`}
                                                    title={user.isBanned ? "Unban User" : "Ban User"}
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-red-600"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-gray-500">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 bg-aero-surface hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 border border-gray-200"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                            <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`px-4 py-2 rounded-lg transition-all duration-200 ${currentPage === pageNumber
                                    ? 'bg-aero-primary text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-aero-surface hover:bg-gray-100 text-gray-600 border border-gray-200'
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-aero-surface hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 border border-gray-200"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
            />
        </div>
    );
};

export default UsersPage;
