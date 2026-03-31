import React, { useState } from 'react';
import { useComments } from '../../hooks/useComments';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import './CommentSection.css'; // <-- Import the newly created CSS

const CommentSection = ({ movieSlug }) => {
  const {
    comments,
    pagination,
    isLoading,
    isError,
    addComment,
    editComment,
    removeComment,
    isAdding
  } = useComments(movieSlug);

  const [visibleCount, setVisibleCount] = useState(5);

  const handleCreateOriginalComment = (content) => {
    addComment(content, null);
  };

  const handleReply = (content, parentId) => {
    addComment(content, parentId);
  };

  const handleEdit = (id, content) => {
    editComment(id, content);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá bình luận này?')) {
      removeComment(id);
    }
  };

  if (isError) {
    return (
      <div className="comment-section__empty">
        <p>Lỗi tải bình luận. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  // Lấy ra comments để render theo số lượng visibleCount
  const visibleComments = comments.slice(0, visibleCount);
  const totalComments = pagination?.totalItems || comments.length;

  return (
    <section className="comment-section">
      <div className="comment-section__header">
        <h3 className="comment-section__title">Bình luận</h3>
        <span className="comment-section__count">
          {totalComments}
        </span>
      </div>

      <CommentForm 
        onSubmit={handleCreateOriginalComment} 
        isSubmitting={isAdding} 
      />

      <div className="comment-section__list">
        {isLoading ? (
          <div className="comment-section__loading">
            <span>Đang tải bình luận...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="comment-section__empty">
            <p>Chưa có bình luận nào. Hãy là người đầu tiên nêu cảm nghĩ!</p>
          </div>
        ) : (
          <>
            {visibleComments.map((comment) => (
              <CommentItem 
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
            
            {visibleCount < comments.length && (
              <button 
                onClick={() => setVisibleCount(v => v + 5)}
                className="comment-section__load-more"
              >
                Xem thêm bình luận
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default CommentSection;
