import React, { useState } from 'react';
import { FiMessageSquare, FiMoreVertical, FiTrash2, FiEdit2 } from 'react-icons/fi';
import useAuthStore from '@/store/authStore';
import CommentForm from './CommentForm';

const CommentItem = ({ comment, onReply, onEdit, onDelete }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Check quyền
  const isOwner = user?.id === comment.userId;
  const isAdmin = user?.role === 'admin';
  const canModify = isOwner || isAdmin;
  const authorName = comment.user?.username || 'Ẩn danh';
  const authorRole = comment.user?.role || 'user';

  const timeAgo = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d) ? '' : d.toLocaleDateString();
  };

  return (
    <div className="comment-item">
      <div className="comment-item__box">
        {/* Avatar */}
        <div className="comment-avatar">
          {comment.user?.avatar ? (
            <img src={comment.user.avatar} alt="avatar" />
          ) : (
            <span>{authorName.charAt(0)}</span>
          )}
        </div>

        {/* Content Box */}
        <div className="comment-item__content">
          {/* Header */}
          <div className="comment-item__header">
            <div className="comment-item__author">
              <span className={`comment-item__name ${authorRole === 'admin' ? 'comment-item__name--admin' : ''}`}>
                {authorName}
              </span>
              {authorRole === 'admin' && (
                <span className="comment-item__badge">Admin</span>
              )}
              <span className="comment-item__time">{timeAgo(comment.createdAt)}</span>
            </div>

            {/* Actions Menu */}
            {canModify && (
              <div className="comment-item__menu">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="comment-item__btn-menu"
                >
                  <FiMoreVertical size={16} />
                </button>
                {showMenu && (
                  <div className="comment-item__dropdown">
                    {isOwner && (
                      <button
                        className="comment-item__dropdown-btn"
                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                      >
                        <FiEdit2 size={14} /> Sửa
                      </button>
                    )}
                    <button
                      className="comment-item__dropdown-btn comment-item__dropdown-btn--delete"
                      onClick={() => { onDelete(comment.id); setShowMenu(false); }}
                    >
                      <FiTrash2 size={14} /> Xóa
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Body */}
          {isEditing ? (
            <div className="comment-item__edit-box" onClick={(e) => e.stopPropagation()}>
              <CommentForm
                autoFocus
                onSubmit={(content) => {
                  onEdit(comment.id, content);
                  setIsEditing(false);
                }}
                isSubmitting={false}
              />
              <button 
                className="comment-item__btn-cancel"
                onClick={() => setIsEditing(false)}
              >
                Hủy sửa
              </button>
            </div>
          ) : (
            <p className="comment-item__text">
              {comment.content}
            </p>
          )}

          {/* Footer Actions */}
          <div className="comment-item__footer">
            <button
              onClick={() => isAuthenticated ? setIsReplying(!isReplying) : alert('Vui lòng đăng nhập để trả lời')}
              className="comment-item__btn-reply"
            >
              <FiMessageSquare size={14} /> Phản hồi
            </button>
          </div>

          {/* Reply form */}
          {isReplying && (
            <div className="comment-item__reply-form">
              <CommentForm
                placeholder={`Trả lời ${authorName}...`}
                onSubmit={(content) => {
                  onReply(content, comment.id); // Parent ID là comment này
                  setIsReplying(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Render Sub Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-item__replies">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
