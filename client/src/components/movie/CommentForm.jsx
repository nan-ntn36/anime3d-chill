import React, { useState } from 'react';
import useAuthStore from '@/store/authStore';
import { Link } from 'react-router-dom';

const CommentForm = ({ onSubmit, isSubmitting, placeholder = 'Viết bình luận...', autoFocus = false }) => {
  const [content, setContent] = useState('');
  const { isAuthenticated, user } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || !isAuthenticated) return;
    
    onSubmit(content);
    setContent('');
  };

  if (!isAuthenticated) {
    return (
      <div className="comment-form__auth-prompt">
        <p className="comment-form__auth-text">Vui lòng đăng nhập để bình luận</p>
        <Link
          to="/dang-nhap"
          className="comment-form__auth-link"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <div className="comment-form__avatar-col">
        <div className="comment-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" />
          ) : (
            <span>{user?.username?.charAt(0) || 'U'}</span>
          )}
        </div>
      </div>
      <div className="comment-form__input-col">
        <textarea
          autoFocus={autoFocus}
          className="comment-form__textarea"
          rows="3"
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="comment-form__actions">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="comment-form__btn"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
