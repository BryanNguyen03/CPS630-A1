import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('page1');
  const [itemList, setItemList] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const addItem = async () => {
    if (!newItemName.trim()) {
      alert('Please enter an item name');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newItemName })
      });
      if (response.ok) {
        setNewItemName('');
        fetchItems();
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  }

  const deleteItem = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/items/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchItems();
      } else {
        console.error('Error deleting item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div>
      <h1>CPS630 - Group 52 - Assignment 1</h1>

      <div className="navigation">
        <button 
          className={currentPage === 'page1' ? 'active' : ''} 
          onClick={() => setCurrentPage('page1')}
        >
          Item Manager
        </button>
        <button 
          className={currentPage === 'page2' ? 'active' : ''} 
          onClick={() => setCurrentPage('page2')}
        >
          Item Search
        </button>
        <button 
          className={currentPage === 'page3' ? 'active' : ''} 
          onClick={() => setCurrentPage('page3')}
        >
          About
        </button>
      </div>

      {currentPage === 'page1' && (
        <div className="page">
          <h2>Item Manager</h2>
          <p>Manage your items with GET, POST, and DELETE requests</p>

          <div className="input-section">
            <input 
              type="text" 
              value={newItemName} 
              onChange={(e) => setNewItemName(e.target.value)} 
              placeholder="Enter item name"
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
            <button onClick={addItem}>Add Item (POST)</button>
          </div>

          <div className="items-container">
            <h3>Current Items ({itemList.length})</h3>
            {itemList.length === 0 ? (
              <p className="no-items">No items yet. Add one above!</p>
            ) : (
              <ul>
                {itemList.map(item => (
                  <li key={item.id}>
                    <span>{item.name}</span>
                    <button onClick={() => deleteItem(item.id)}>Delete (DELETE)</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {currentPage === 'page2' && (
        <div className="page">
          <h2>Item Search</h2>
          <p>Search for items using the GET request</p>

          <div className="input-section">
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search for an item..."
            />
            <button onClick={() => fetchItems()}>Search (GET)</button>
          </div>

          <div className="items-container">
            <h3>Search Results ({itemList.filter(item => 
              item.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).length})</h3>
            {itemList.filter(item => 
              item.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 ? (
              <p className="no-items">
                {searchTerm ? 'No items found matching your search.' : 'Enter a search term to find items.'}
              </p>
            ) : (
              <ul>
                {itemList
                  .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(item => (
                    <li key={item.id}>
                      <span>{item.name}</span>
                      <span className="item-id">ID: {item.id}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {currentPage === 'page3' && (
        <div className="page">
          <h2>About This Application</h2>
          
          <section>
            <h3>Project Overview</h3>
            <p>
              This is Assignment 1 for CPS630 - Web Applications Development. 
              The application demonstrates a full-stack web application using React for the frontend 
              and Node.js with Express for the backend.
            </p>
          </section>

          <section>
            <h3>Features</h3>
            <ul>
              <li><strong>GET Request:</strong> Retrieves all items from the server</li>
              <li><strong>POST Request:</strong> Sends new item data to create items on the server</li>
              <li><strong>DELETE Request:</strong> Removes items from the server by ID</li>
              <li><strong>Item Search:</strong> Search and filter items using GET request</li>
              <li><strong>Multi-page Navigation:</strong> Three different web pages to navigate between</li>
            </ul>
          </section>

          <section>
            <h3>Technology Stack</h3>
            <div className="tech-grid">
              <div>
                <h4>Frontend</h4>
                <ul>
                  <li>React 19</li>
                  <li>Vite</li>
                  <li>CSS3</li>
                </ul>
              </div>
              <div>
                <h4>Backend</h4>
                <ul>
                  <li>Node.js</li>
                  <li>Express.js</li>
                  <li>CORS</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3>Server Information</h3>
            <p><strong>Backend URL:</strong> http://localhost:8080</p>
            <p><strong>API Base Path:</strong> /api/items</p>
            <p><strong>Methods:</strong> GET, POST, DELETE</p>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
