import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('page1');
  const [itemList, setItemList] = useState([]); //review list for search by game
  const [itemListSecond, setItemListSecond] = useState([]); //review list for search by ID
  //const [newItemName, setNewItemName] = useState('');

  const [newReviewGameName, setNewReviewGameName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState('');
  const [newReviewText, setNewReviewText] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  //usestate variable for the search review by reviewId
  const [searchTermId, setSearchTermId] = useState('');
  //usestate variable to check if the user has searched already or not, used for UI update
  const [searchedReviewId, setSearchedReviewId] = useState(0); //0 for no and 1 for yes

  // For the update item feature, we need to track the ID of the item being updated and the new review text
  const [updatedReviewGameName, setUpdatedReviewGameName] = useState('');
  const [updatedReview, setUpdatedReview] = useState('');
  const [updatedRating, setUpdatedRating] = useState('');

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


  //async helper method for getting the reviews by reviewId from the database
  const fetchItemsByReviewId = async (id) => {
    //clearing the return list incase there is any previous search results
    setItemListSecond([]);

    try {
      const response = await fetch(`http://localhost:8080/api/items/${id}`, {
        method: 'GET'
      });
      setSearchedReviewId(1); //setting searched to yes
      if (response.ok) {
        const data = await response.json();
        setItemListSecond(data);
      }
    } catch (error) {
      console.error('Error fetching items for search by ID:', error);
    }
  };


  const addItem = async () => {
    if (!newReviewGameName.trim() || !newReviewText.trim() || !newReviewRating.trim()) {
      alert('Please enter all review fields');
      return;
    }

    // POST for creating items
    try {
      const response = await fetch('http://localhost:8080/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gameName: newReviewGameName, review: newReviewText, rating: newReviewRating })
      });
      if (response.ok) {
        setNewReviewGameName('');
        setNewReviewText('');
        setNewReviewRating('');
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

  const updateItem = async (gameName) => {
    try {
      if (!updatedReview.trim() || !updatedRating.trim() || !updatedReviewGameName.trim()) {
        alert('Please enter the updated review text, rating, and game name');
        return;
      }

      if (isNaN(updatedRating) || updatedRating < 1 || updatedRating > 5) {
        alert('Rating must be a number between 1 and 5');
        return;
      }
      
      const response = await fetch(`http://localhost:8080/api/items/${gameName}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ review: updatedReview, rating: updatedRating })
      });

      if (response.ok) {
        console.log('Item updated successfully');
        // reset input fields and refresh item list
        setUpdatedReview('');
        setUpdatedRating('');
        setUpdatedReviewGameName('');
        fetchItems();
      }
      else {
        console.error('Error updating item');
        alert('Failed to update review. Please ensure the game name exists and try again.');
      }
    }
    catch (error) {
      console.error('Error updating item:', error);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  return (

    // Navigation bar code, which selects the displayed HTML for the specific page selected
    <div>
      <h1>CPS630 - Group 52 - Assignment 1</h1>

      <div className="navigation">
        <button 
          className={currentPage === 'page1' ? 'active' : ''} 
          onClick={() => setCurrentPage('page1')}
        >
          Review Manager
        </button>
        <button 
          className={currentPage === 'page2' ? 'active' : ''} 
          onClick={() => setCurrentPage('page2')}
        >
          Review Search
        </button>
        <button 
          className={currentPage === 'page3' ? 'active' : ''} 
          onClick={() => setCurrentPage('page3')}
        >
          About
        </button>
      </div>

      {/* First HTML route for the Manage Reviews, which has GET POST and DELETE requests */}
      {currentPage === 'page1' && (
        <div className="page">
          <h2>Manage Reviews</h2>
          <p>Manage reviews with GET, POST, and DELETE requests</p>

          {/* User input element where the user can input their review and submit it using a button */}
          <div className="input-section">
            <input 
              type="text" 
              value={newReviewGameName} 
              onChange={(e) => setNewReviewGameName(e.target.value)} 
              placeholder="Enter game name"
            />
            <input 
              type="text" 
              value={newReviewText} 
              onChange={(e) => setNewReviewText(e.target.value)} 
              placeholder="Enter review text"
            />
            <input 
              type="number" 
              value={newReviewRating} 
              onChange={(e) => setNewReviewRating(e.target.value)} 
              placeholder="Enter rating (1-5)"
            />
            <button onClick={addItem}>Add Review (POST)</button>
          </div>

          {/* Displaying the list of reviews in the JSON object */}
          <div className="items-container">
            <h3>Reviews ({itemList.length})</h3>
            {itemList.length === 0 ? (
              <p className="no-items">No items yet. Add one above!</p>
            ) : (
              <ul>
                {itemList.map(item => (
                  <li key={item._id}>
                    <span>{item.gameName} | {item.review} | Rating: {item.rating}/5</span>
                    <button onClick={() => deleteItem(item._id)}>Delete (DELETE)</button>
                  </li>
                ))}
              </ul>
            )}
            <div className="input-section">
              <input type="text" placeholder="Game to update" value={updatedReviewGameName} onChange={(e) => setUpdatedReviewGameName(e.target.value)} />
              <input type="text" placeholder="Updated review" value={updatedReview} onChange={(e) => setUpdatedReview(e.target.value)} />
              <input type="number" placeholder="Updated Rating" value={updatedRating} onChange={(e) => setUpdatedRating(e.target.value)} />
              <button onClick={() => updateItem(updatedReviewGameName)}>Update Review (PUT)</button>
            </div>
          </div>
        </div>
      )}

      {/* Second HTML route for the Review Search by game and by Id, GET requests */}
      {currentPage === 'page2' && (
        <div className="page">
          <h2>Review Search by Game</h2>
          <p>Search for reviews using the GET multiple items request</p>

          <div className="input-section">
            {/* On-change search feature */}
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search for a review by Game..."
            />
            <button onClick={() => fetchItems()}>Search (GET)</button>
          </div>

          {/* Search div */}
          <div className="items-container">
            <h3>Search Results ({itemList.filter(item => 
              item.gameName.toLowerCase().includes(searchTerm.toLowerCase())
            ).length})</h3>
            {itemList.filter(item => 
              item.gameName.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 ? (
              <p className="no-items">
                {searchTerm ? 'No reviews found matching your search.' : 'Enter a search term to find reviews.'}
              </p>
            ) : (
              <ul>
                {itemList
                  .filter(item => item.gameName.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(item => (
                    <li key={item._id}>
                      <span>{item.gameName} | {item.review} | Rating: {item.rating}/5</span>
                      <span className="item-id">ID: {item._id}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>


          {/* Review search by the reviewId provided by the user */}
          <h2>Review Search by ID</h2>
          <p>Search for reviews using the GET an item request</p>
          <div className="input-section">
            {/* On-change search feature */}
            <input 
              type="text"
              value={searchTermId}
              onChange={(e) => {
                setSearchTermId(e.target.value);
                //setting searched useState variable to no if input is empty 
                if(e.target.value.trim() === ""){
                  setSearchedReviewId(0);
                }
              }}
              placeholder="Search for a review by its ID..."
            />
            <button 
              onClick={() => {
                //not allowing a request if nothing or spaces are entered
                if(!searchTermId.trim()){
                  setItemListSecond([]); //clearing the output if the search term is blank or just spaces
                  return;
                };  
                //if given a correct input calling the async helper function after setting to lowercase
                fetchItemsByReviewId(searchTermId.toLowerCase());          
              }}
            >
              Search (GET)
            </button>
          </div>


          {/* Search results div for the search by reviewId */}
          <div className="items-container">
            <h3>Search Results</h3>
            {itemListSecond.length === 0 ? (
              <p className="no-items">
                {searchedReviewId ? 'No reviews found matching your search.' : 'Enter a search term to find reviews.'}
              </p>
            ) : (
              <ul>
                {itemListSecond.map(item => (
                    <li key={item._id}>
                      <span>{item.gameName} | {item.review} | Rating: {item.rating}/5</span>
                      <span className="item-id">ID: {item._id}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>

        </div>
      )}


      {/* Third HTML route, for the about page */}
      {currentPage === 'page3' && (
        <div className="page">
          {/* Several HTML objects formatted to show various information about the site */}
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
