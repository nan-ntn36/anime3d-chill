/**
 * UserManagement — Quản lý users (Admin CMS)
 */

import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiArrowLeft, HiMagnifyingGlass, HiPencil, HiTrash, HiCheck, HiXMark } from 'react-icons/hi2';
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
    <div className="user-management">
      <Helmet><title>Quản Lý Users — Admin CMS</title></Helmet>

      <div className="um-header">
        <div className="um-header__left">
          <Link to="/" className="btn btn-ghost btn-sm"><HiArrowLeft /> Dashboard</Link>
          <h1>Quản Lý Users</h1>
          {meta.totalItems !== undefined && <span className="um-count">{meta.totalItems} users</span>}
        </div>
      </div>

      <div className="um-filters">
        <form className="um-search" onSubmit={handleSearchSubmit}>
          <HiMagnifyingGlass className="um-search__icon" />
          <input type="text" placeholder="Tìm theo username hoặc email..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="input" />
        </form>
        <select className="input um-role-filter" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">Tất cả roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {isLoading ? (
        <div className="um-table-wrap">
          <table className="um-table">
            <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Trạng thái</th><th>Đăng nhập cuối</th><th>Hành động</th></tr></thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(7)].map((_, j) => (<td key={j}><div className="skeleton" style={{ height: 18, borderRadius: 4 }} /></td>))}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : error ? (
        <div className="um-empty"><p>Không thể tải danh sách users</p><button className="btn btn-primary" onClick={() => window.location.reload()}>Thử lại</button></div>
      ) : users.length === 0 ? (
        <div className="um-empty"><p>Không tìm thấy user nào</p></div>
      ) : (
        <div className="um-table-wrap">
          <table className="um-table">
            <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Trạng thái</th><th>Đăng nhập cuối</th><th>Hành động</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={!user.isActive ? 'row-inactive' : ''}>
                  <td className="cell-id">{user.id}</td>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.avatar ? <img src={user.avatar} alt={user.username} /> : <span>{user.username?.charAt(0).toUpperCase()}</span>}
                      </div>
                      <span className="user-name">{user.username}</span>
                    </div>
                  </td>
                  <td className="cell-email">{user.email}</td>
                  <td>
                    {editingUser === user.id ? (
                      <select className="input input-mini" defaultValue={user.role} onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span className={`role-badge role-badge--${user.role}`}>{user.role}</span>
                    )}
                  </td>
                  <td>
                    <button className={`status-toggle ${user.isActive ? 'active' : 'inactive'}`} onClick={() => handleUpdateUser(user.id, { isActive: !user.isActive })} title={user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                      {user.isActive ? <><HiCheck size={14} /> Active</> : <><HiXMark size={14} /> Inactive</>}
                    </button>
                  </td>
                  <td className="cell-date">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="cell-actions">
                    <button className="btn-icon" onClick={() => setEditingUser(editingUser === user.id ? null : user.id)} title="Sửa role"><HiPencil size={16} /></button>
                    {confirmDelete === user.id ? (
                      <div className="confirm-delete">
                        <button className="btn btn-sm" style={{ background: 'var(--color-error)', color:'#fff' }} onClick={() => handleDeleteUser(user.id)} disabled={deleteUser.isPending}>Xác nhận</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(null)}>Hủy</button>
                      </div>
                    ) : (
                      <button className="btn-icon btn-icon--danger" onClick={() => setConfirmDelete(user.id)} title="Xóa user"><HiTrash size={16} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="um-pagination">
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Trước</button>
          <span className="um-page-info">Trang {meta.page} / {meta.totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Sau →</button>
        </div>
      )}
    </div>
  );
}
