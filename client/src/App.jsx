import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import Profile from './components/Profile'
import ReviewSearchPage from './components/ReviewSearchPage'
import AboutPage from './components/AboutPage'
import RegisterPage from './components/RegisterPage'
import LoginPage from './components/LoginPage'
import GamesPage from './components/GamesPage'
import GameDetailsPage from './components/GameDetailsPage'
import CommunityPage from './components/CommunityPage'

// Protected route component
function ProtectedRoute({ children, token }) {
  if (!token) {
    return <p>Please log in to manage reviews.</p>;
  }
  return children;
}

function LegacyUserProfileRedirect() {
  const { username } = useParams();
  return <Navigate to={`/user/${encodeURIComponent(username || '')}`} replace />;
}

// App component where all of our upper level components are located, these include the nav bar and 3 pages
function App() {
  const [itemList, setItemList] = useState([]);



  const [userList, setUserList] = useState([]);
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
        currentUser={currentUser}
      />
      <Routes>
        <Route
          path="/MyProfile"
          element={
            <ProtectedRoute token={token}>
              <Profile token={token} currentUser={currentUser} />
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

        <Route path="/" element={<GamesPage itemList={itemList} />} />

        <Route
          path="/games/:id"
          element={<GameDetailsPage token={token} currentUser={currentUser} />}
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
          path="/community"
          element={
            <CommunityPage
              currentUser={currentUser}
              users={userList}
            />
          }
        />
        <Route
          path="/user/:username"
          element={<Profile token={token} currentUser={currentUser} />}
        />
        <Route
          path="/users/:username"
          element={<LegacyUserProfileRedirect />}
        />
        <Route path="/user" element={<Navigate to="/community" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
