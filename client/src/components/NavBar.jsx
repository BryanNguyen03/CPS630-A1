//Navbar component
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
  const getTabClasses = (path) => [
    'nav-tab',
    isActive(path) ? 'nav-tab-active' : 'nav-tab-idle'
  ].join(' ');

  return (
    <nav className="nav-shell">
      {token && (
        <button
          className={getTabClasses('/MyProfile')}
          onClick={() => navigate('/MyProfile')}
        >
          My Profile
        </button>
      )}

      <button
        className={getTabClasses('/')}
        onClick={() => navigate('/')}
      >
        Games
      </button>

      <button
        className={getTabClasses('/search')}
        onClick={() => navigate('/search')}
      >
        Review Search
      </button>

      <button
        className={getTabClasses('/community')}
        onClick={() => navigate('/community')}
      >
        Community
      </button>

      <button
        className={getTabClasses('/about')}
        onClick={() => navigate('/about')}
      >
        About
      </button>

      {token ? (
        <>
          <span className="ml-auto rounded-lg border border-edge bg-bg-800 px-3 py-2 text-sm text-text-muted">
            Hi, {currentUser?.username}
          </span>
          <button
            className="btn-danger"
            onClick={handleLogout}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <button
            className={getTabClasses('/login')}
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className={getTabClasses('/register')}
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </>
      )}
    </nav>
  );
}

export default NavBar;
