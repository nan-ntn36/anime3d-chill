import { useState } from 'react';
import { FiUser } from 'react-icons/fi';
import './CommentSection.css';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function CommentSection() {
  const [commentText, setCommentText] = useState('');
  const { isAuthenticated, user } = useAuthStore();
  const [comments, setComments] = useState([
    {
      id: 1,
      user: 'AnimeFan99',
      avatar: null,
      content: 'Phim này siêu hay luôn mọi người ơi!',
      timestamp: '2 giờ trước'
    },
    {
      id: 2,
      user: 'CàyXuyênĐêm',
      avatar: null,
      content: 'Animation mượt mà, cốt truyện bánh cuốn thực sự.',
      timestamp: '5 giờ trước'
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để bình luận!');
      return;
    }
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      user: user?.username || 'Thành viên mới',
      avatar: user?.avatar || null,
      content: commentText.trim(),
      timestamp: 'Vừa xong'
    };

    setComments([newComment, ...comments]);
    setCommentText('');
    toast.success('Đã đăng bình luận!');
  };

  return (
    <div className="comment-section">
      <h3 className="comment-section__title">Thảo luận từ Fan ({comments.length})</h3>
      
      <form className="comment-section__form" onSubmit={handleSubmit}>
        <div className="comment-section__input-wrapper">
          <div className="comment-section__avatar">
            {isAuthenticated && user?.avatar ? (
              <img src={user.avatar} alt={user.username} />
            ) : (
              <FiUser />
            )}
          </div>
          <textarea
            className="comment-section__textarea"
            placeholder={isAuthenticated ? "Nhập bình luận của bạn..." : "Vui lòng đăng nhập để bình luận..."}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows="3"
            disabled={!isAuthenticated}
          ></textarea>
        </div>
        <div className="comment-section__actions">
          <button type="submit" className="btn btn-primary" disabled={!isAuthenticated || !commentText.trim()}>
            Gửi Bình Luận
          </button>
        </div>
      </form>

      <div className="comment-section__list">
        {comments.map(c => (
          <div key={c.id} className="comment-card">
            <div className="comment-card__avatar">
              {c.avatar ? <img src={c.avatar} alt={c.user} /> : <FiUser />}
            </div>
            <div className="comment-card__content">
              <div className="comment-card__header">
                <span className="comment-card__user">{c.user}</span>
                <span className="comment-card__time">{c.timestamp}</span>
              </div>
              <p className="comment-card__text">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
