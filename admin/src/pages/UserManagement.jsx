/**
 * UserManagement — CoreUI-style user table
 */

import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { HiMagnifyingGlass, HiPencil, HiTrash, HiCheck, HiXMark } from 'react-icons/hi2';
import { useAdminUsers, useUpdateUser, useDeleteUser } from '@hooks/useAdmin';
import toast from 'react-hot-toast';
import './UserManagement.css';

export default function UserManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const params = useMemo(() => ({
    page, limit: 15,
    ...(search && { search }),
    ...(roleFilter && { role: roleFilter }),
  }), [page, search, roleFilter]);

  const { data, isLoading, error } = useAdminUsers(params);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }, [searchInput]);

  const handleUpdateUser = useCallback(async (id, updateData) => {
    try {
      await updateUser.mutateAsync({ id, data: updateData });
      toast.success('Cập nhật thành công');
      setEditingUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật');
    }
  }, [updateUser]);

  const handleDeleteUser = useCallback(async (id) => {
    try {
      await deleteUser.mutateAsync(id);
      toast.success('Đã xóa người dùng');
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi xóa user');
    }
  }, [deleteUser]);

  const users = data?.users ?? [];
  const meta = data?.meta ?? {};

  return (
    <>
      <Helmet><title>Users — Admin</title></Helmet>

      {/* Filters */}
      <div className="card um-filters-card">
        <div className="card-body um-filters">
          <form className="um-search" onSubmit={handleSearchSubmit}>
            <HiMagnifyingGlass className="um-search__icon" />
            <input type="text" className="input" placeholder="Tìm username hoặc email..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </form>
          <select className="input um-role-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {meta.totalItems !== undefined && (
            <span className="um-total">{meta.totalItems} users</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">Danh sách người dùng</div>
        <div className="table-wrap">
          <table className="table um-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}></th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Đăng nhập cuối</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16 }} /></td>)}</tr>
                ))
              ) : error ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Không thể tải dữ liệu</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Không có users</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={!user.isActive ? 'row-inactive' : ''}>
                    <td>
                      <div className="user-avatar-sm">
                        {user.avatar ? <img src={user.avatar} alt="" /> : <span>{user.username?.charAt(0).toUpperCase()}</span>}
                        <span className={`status-dot ${user.isActive ? 'online' : 'offline'}`} />
                      </div>
                    </td>
                    <td>
                      <div className="user-cell">
                        <strong>{user.username}</strong>
                        <small>Registered: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</small>
                      </div>
                    </td>
                    <td className="text-muted">{user.email}</td>
                    <td>
                      {editingUser === user.id ? (
                        <select className="input" style={{ width: 90, padding: '2px 6px', fontSize: '0.75rem' }} defaultValue={user.role} onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}>
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span className={`badge badge-${user.role === 'admin' ? 'warning' : 'info'}`}>{user.role}</span>
                      )}
                    </td>
                    <td>
                      <button className={`status-btn ${user.isActive ? 'active' : 'inactive'}`} onClick={() => handleUpdateUser(user.id, { isActive: !user.isActive })}>
                        {user.isActive ? <><HiCheck size={12} /> Active</> : <><HiXMark size={12} /> Inactive</>}
                      </button>
                    </td>
                    <td className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td>
                      <div className="action-group">
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingUser(editingUser === user.id ? null : user.id)} title="Edit"><HiPencil size={14} /></button>
                        {confirmDelete === user.id ? (
                          <>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user.id)} disabled={deleteUser.isPending}>Xóa</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(null)}>Hủy</button>
                          </>
                        ) : (
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(user.id)} title="Delete"><HiTrash size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="card-footer um-pagination">
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Trước</button>
            <span className="um-page-info">Trang {meta.page} / {meta.totalPages}</span>
            <button className="btn btn-ghost btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Sau →</button>
          </div>
        )}
      </div>
    </>
  );
}
