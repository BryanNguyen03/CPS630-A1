import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import ManageReviewsPage from './components/ManageReviewsPage'
import ReviewSearchPage from './components/ReviewSearchPage'
import AboutPage from './components/AboutPage'
import RegisterPage from './components/RegisterPage'
import LoginPage from './components/LoginPage'
import GamesPage from './components/GamesPage'
import GameDetailsPage from './components/GameDetailsPage'
import UserPage from './components/UserPage'

// Protected route component
function ProtectedRoute({ children, token }) {
  if (!token) {
    return <p>Please log in to manage reviews.</p>;
  }
  return children;
}

// App component where all of our upper level components are located, these include the nav bar and 3 pages
function App() {
  const [itemList, setItemList] = useState([]);



  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState({ username: localStorage.getItem('authUsername') || '' });
  
  

  const [token, setToken] = useState(localStorage.getItem('authToken') || '');   //storing the JWT locally on the client side

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

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users');
      if (response.ok) {
        const data = await response.json();
        setUserList(data);
        if (!selectedUser && data.length > 0) {
          setSelectedUser(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUsername');
    setToken('');
    setCurrentUser({ username: '' });
  };

  const handleLoginSuccess = ({ token: newToken, username }) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUsername', username);
    setToken(newToken);
    setCurrentUser({ username });
  };

  useEffect(() => {
    fetchItems();
    fetchUsers();
  }, []);

  return (
    <div>
      <h1>ReviewLog</h1>
      <NavBar
        token={token}
        onLogout={handleLogout}
      />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute token={token}>
              <ManageReviewsPage itemList={itemList} onRefresh={fetchItems} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={<ReviewSearchPage itemList={itemList} onRefresh={fetchItems} />}
        />
        <Route
          path="/about"
          element={<AboutPage />}
        />

        <Route path="/games" element={<GamesPage itemList={itemList} />} />

        <Route
          path="/games/:id"
          element={<GameDetailsPage />}
        />
  
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/register"
          element={<RegisterPage />}
        />
        <Route
          path="/user"
          element={
            <UserPage
              currentUser={currentUser}
              selectedUser={selectedUser}
              users={userList}
              onSelectedUserChange={setSelectedUser}
              token={token}
              itemList={itemList}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
