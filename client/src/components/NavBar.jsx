import { useNavigate, useLocation } from 'react-router-dom'

// Simple navigation bar for the webpage, allows routing to the three pages/views
function NavBar({ token, onLogout, currentUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navigation">


      {token && (
        <button
          className={isActive('/MyProfile') ? 'active' : ''}
          onClick={() => navigate('/MyProfile')}
        >
          My Profile
        </button>
      )}

    
    <button
        className={isActive('/') ? 'active' : ''}
        onClick={() => navigate('/')}
      >
        Games
      </button>

      <button
        className={isActive('/search') ? 'active' : ''}
        onClick={() => navigate('/search')}
      >
        Review Search
      </button>
      <button
        className={isActive('/community') ? 'active' : ''}
        onClick={() => navigate('/community')}
      >
        Community
      </button>
      <button
        className={isActive('/about') ? 'active' : ''}
        onClick={() => navigate('/about')}
      >
        About
      </button>

      {token ? (
        <>
          <span className='nav-user' style={{ color: 'white', padding: '0 10px' }}>
            Hi, {currentUser?.username}
          </span>
          <button
            className="logout-btn"
            onClick={handleLogout}
            style={{ backgroundColor: '#ff4444', color: 'white' }}
          >
            Logout
          </button>
        </>
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
