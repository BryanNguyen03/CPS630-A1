import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import NavBar from './components/NavBar'
import Profile from './components/Profile'
import ReviewSearchPage from './components/ReviewSearchPage'
import AboutPage from './components/AboutPage'
import RegisterPage from './components/RegisterPage'
import LoginPage from './components/LoginPage'
import GamesPage from './components/GamesPage'
import GameDetailsPage from './components/GameDetailsPage'
import CommunityPage from './components/CommunityPage'
import Toast from './components/Toast'

//protected route component
function ProtectedRoute({ children, token }) {
  if (!token) {
    return (
      <div className="page-shell">
        <p className="empty-state">Please log in to manage reviews.</p>
      </div>
    );
  }
  return children;
}

function LegacyUserProfileRedirect() {
  const { username } = useParams();
  return <Navigate to={`/user/${encodeURIComponent(username || '')}`} replace />;
}

//App component where all of our upper level components are located
function App() {
  const [itemList, setItemList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [currentUser, setCurrentUser] = useState({ username: localStorage.getItem('authUsername') || '' });
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');   //storing the JWT locally on the client side
  const [toast, setToast] = useState(null);

  //handler function to show the toast
  const showToast = useCallback((message, type = 'success') => {
    if (!message) {
      return;
    }

    setToast({ id: Date.now(), message, type });
  }, []);

  //handler function to fetch users from the database
  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/items');  //GET
      if (response.ok) {
        const data = await response.json();
        setItemList(data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  //handler function for logout, removes the current JWT and shows a toast notification
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUsername');
    setToken('');
    setCurrentUser({ username: '' });
    showToast('Logged out successfully.', 'success');
  };


  //handler function for successful login, sets the JWT and gives the toast notification
  const handleLoginSuccess = ({ token: newToken, username }) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUsername', username);
    setToken(newToken);
    setCurrentUser({ username });
    showToast('Login successful.', 'success');
  };

  //handler function to update the current userlist array if there has been a successful registration
  //function is passed to the RegisterPage component
  const handleRegistrationUserListUpdate = async () => {
    try {
      const usersResponse = await fetch('http://localhost:8080/api/users');  //GET
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUserList(usersData);
      }
    } catch (error) {
      console.error('Error loading new user list data:', error);
    }
  };


  //useEffect for toast notification popup, whenever there is a new toast
  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setToast(null);
    }, 2800);

    return () => clearTimeout(timeoutId);
  }, [toast]);


  //Use effect for loading data at first render []
  useEffect(() => {
    let isActive = true;

    const loadInitialData = async () => {
      try {
        const [itemsResponse, usersResponse] = await Promise.all([
          fetch('http://localhost:8080/api/items'),
          fetch('http://localhost:8080/api/users')
        ]);

        if (itemsResponse.ok && isActive) {
          const itemsData = await itemsResponse.json();
          setItemList(itemsData);
        }

        if (usersResponse.ok && isActive) {
          const usersData = await usersResponse.json();
          setUserList(usersData);
        }
      } catch (error) {
        console.error('Error loading initial app data:', error);
      }
    };

    loadInitialData();

    return () => {
      isActive = false;
    };
  }, []);


  //Main elements for the site, including the main routes
  // Pass fetchItems to review-mutation pages so ratings stay synchronized across routes.
  return (
    <div className="app-shell">
      <h1 className="app-title">ReviewLog</h1>
      <NavBar
        token={token}
        onLogout={handleLogout}
        currentUser={currentUser}
      />
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
      <Routes>
        <Route
          path="/MyProfile"
          element={
            <ProtectedRoute token={token}>
              <Profile token={token} currentUser={currentUser} showToast={showToast} onReviewsRefresh={fetchItems} />
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
          element={<GameDetailsPage token={token} currentUser={currentUser} showToast={showToast} onReviewsRefresh={fetchItems} />}
        />
  
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} showToast={showToast} />}
        />
        <Route
          path="/register"
          element={<RegisterPage onRegistrationSuccess={handleRegistrationUserListUpdate} showToast={showToast} />}
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
          element={<Profile token={token} currentUser={currentUser} showToast={showToast} onReviewsRefresh={fetchItems} />}
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
