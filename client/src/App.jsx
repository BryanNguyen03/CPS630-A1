import { useState, useEffect } from 'react'
import './App.css'
import NavBar from './components/NavBar'
import ManageReviewsPage from './components/ManageReviewsPage'
import ReviewSearchPage from './components/ReviewSearchPage'
import AboutPage from './components/AboutPage'

// App component where all of our upper level components are located, these include the nav bar and 3 pages
function App() {
  const [currentPage, setCurrentPage] = useState('page1');
  const [itemList, setItemList] = useState([]);

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

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div>
      <h1>ReviewLog</h1>
      <NavBar currentPage={currentPage} onNavigate={setCurrentPage} />
      {currentPage === 'page1' && (
        <ManageReviewsPage itemList={itemList} onRefresh={fetchItems} />
      )}
      {currentPage === 'page2' && (
        <ReviewSearchPage itemList={itemList} onRefresh={fetchItems} />
      )}
      {currentPage === 'page3' && <AboutPage />}
    </div>
  )
}

export default App
