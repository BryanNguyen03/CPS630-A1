// Simple navigation bar for the webpage, allows routing to the three pages/views
function NavBar({ currentPage, onNavigate, token, onLogout }) {
  return (
    <div className="navigation">
      <button
        className={currentPage === 'page1' ? 'active' : ''}
        onClick={() => onNavigate('page1')}
      >
        Review Manager
      </button>
      <button
        className={currentPage === 'page2' ? 'active' : ''}
        onClick={() => onNavigate('page2')}
      >
        Review Search
      </button>
      <button
        className={currentPage === 'page3' ? 'active' : ''}
        onClick={() => onNavigate('page3')}
      >
        About
      </button>

      {token ? (
        <button
          className="logout-btn"
          onClick={onLogout}
          style={{ backgroundColor: '#ff4444', color: 'white' }}
        >
          Logout
        </button>
      ) : (
        <>
          <button
            className={currentPage === 'login' ? 'active' : ''}
            onClick={() => onNavigate('login')}
          >
            Login
          </button>
          <button
            className={currentPage === 'register' ? 'active' : ''}
            onClick={() => onNavigate('register')}
          >
            Register
          </button>
        </>
      )}
    </div>
  );
}

export default NavBar;
