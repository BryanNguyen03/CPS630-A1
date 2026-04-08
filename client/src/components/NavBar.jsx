import { useNavigate, useLocation } from 'react-router-dom'

// Simple navigation bar for the webpage, allows routing to the three pages/views
function NavBar({ token, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navigation">
      <button
        className={isActive('/') ? 'active' : ''}
        onClick={() => navigate('/')}
      >
        Review Manager
      </button>
      <button
        className={isActive('/search') ? 'active' : ''}
        onClick={() => navigate('/search')}
      >
        Review Search
      </button>
      <button
        className={isActive('/about') ? 'active' : ''}
        onClick={() => navigate('/about')}
      >
        About
      </button>

      {token ? (
        <button
          className="logout-btn"
          onClick={handleLogout}
          style={{ backgroundColor: '#ff4444', color: 'white' }}
        >
          Logout
        </button>
      ) : (
        <>
          <button
            className={isActive('/login') ? 'active' : ''}
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className={isActive('/register') ? 'active' : ''}
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </>
      )}
    </div>
  );
}

export default NavBar;
