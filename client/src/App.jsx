import { useState, useEffect } from 'react'
import './App.css'
import NavBar from './components/NavBar'
import ManageReviewsPage from './components/ManageReviewsPage'
import ReviewSearchPage from './components/ReviewSearchPage'
import AboutPage from './components/AboutPage'
import RegisterPage from './components/RegisterPage'
import LoginPage from './components/LoginPage'

// App component where all of our upper level components are located, these include the nav bar and 3 pages
function App() {
  const [currentPage, setCurrentPage] = useState('page1');
  const [itemList, setItemList] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/items');
      if (response.ok) {
        const data = await response.json();
        setItemList(data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken('');
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div>
      <h1>ReviewLog</h1>
      <NavBar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        token={token}
        onLogout={handleLogout}
      />
      {currentPage === 'page1' && (
        token ? (
          <ManageReviewsPage itemList={itemList} onRefresh={fetchItems} />
        ) : (
          <p>Please log in to manage reviews.</p>
        )
      )}
      {currentPage === 'page2' && (
        <ReviewSearchPage itemList={itemList} onRefresh={fetchItems} />
      )}
      {currentPage === 'page3' && <AboutPage />}
      {currentPage === 'register' && <RegisterPage />}
      {currentPage === 'login' && (
        <LoginPage
        // Pass a callback to update the token in App.js when login is successful
          onLoginSuccess={(newToken) => {
            setToken(newToken);
            setCurrentPage('page1'); // Display review manager if logged in successfully
          }}
        />
      )}
    </div>
  )
}

export default App
