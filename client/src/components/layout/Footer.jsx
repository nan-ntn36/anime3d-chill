import { FiGithub, FiHeart } from 'react-icons/fi';
import './Footer.css';

/**
 * Footer — Copyright + disclaimer
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__brand">
          <span className="footer__logo text-gradient">Anime3D-Chill</span>
          <p className="footer__desc">
            Website xem phim anime miễn phí với giao diện 3D hiện đại.
          </p>
        </div>

        <div className="footer__links">
          <a href="https://github.com/nan-ntn36/anime3d-chill" target="_blank" rel="noopener noreferrer">
            <FiGithub /> GitHub
          </a>
        </div>

        <div className="footer__bottom">
          <p>
            © {new Date().getFullYear()} Anime3D-Chill. Made with <FiHeart className="footer__heart" /> 
          </p>
          <p className="footer__disclaimer">
            Nội dung phim được cung cấp bởi bên thứ ba. Chúng tôi không lưu trữ bất kỳ nội dung nào.
          </p>
        </div>
      </div>
    </footer>
  );
}
