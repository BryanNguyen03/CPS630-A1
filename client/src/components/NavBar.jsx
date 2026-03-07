// Simple navigation bar for the webpage, allows routing to the three pages/views
function NavBar({ currentPage, onNavigate }) {
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
    </div>
  );
}

export default NavBar;
