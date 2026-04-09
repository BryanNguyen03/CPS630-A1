//Second HTML route for the Review Search by game and by Id, GET requests
import { useState } from 'react';

function ReviewSearchPage({ itemList, onRefresh }) {

  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermId, setSearchTermId] = useState('');
  const [searchedReviewId, setSearchedReviewId] = useState(0); //variable to accurately detect user input and provide appopriate UI responses
  const [itemListSecond, setItemListSecond] = useState([]); //variable to keep the response from the GET an item request

  // READ items via GET an item request
  const fetchItemsByReviewId = async (id) => {
    setItemListSecond([]);

    try {
      const response = await fetch(`http://localhost:8080/api/items/${id}`, {
        method: 'GET'
      });
      setSearchedReviewId(1);
      if (response.ok) {
        const data = await response.json();
        setItemListSecond(data);
      }
    } catch (error) {
      console.error('Error fetching items for search by ID:', error);
    }
  };


  // Page consists of two sets of a search and a output list
  return (
    <div className="page">
      <h2>Review Search by Game</h2>
      <p>Search for reviews using the GET multiple items request</p>

      {/* User input for the search by Game, GET multiple items request */}
      <div className="input-section">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a review by Game..."
        />
        <button onClick={() => onRefresh()}>Search (GET)</button>
      </div>
      
      {/* Div to display the items resulting from the GET multiple items request */}
      <div className="items-container">
        <h3>Search Results ({itemList.filter(item =>
          item.igdbId.toLowerCase().includes(searchTerm.toLowerCase())
        ).length})</h3>
        {itemList.filter(item =>
          item.igdbId.toLowerCase().includes(searchTerm.toLowerCase())
        ).length === 0 ? (
          <p className="no-items">
            {searchTerm ? 'No reviews found matching your search.' : 'Enter a search term to find reviews.'}
          </p>
        ) : (
          <ul>
            {/* Frontend dynamic search */}
            {itemList
              .filter(item => item.igdbId && item.igdbId.toString().includes(searchTerm.toLowerCase()))   
              .map(item => (
                <li key={item._id}>
                  <span>{item.igdbId} | {item.review} | Rating: {item.rating}/5</span>
                  <span className="item-id">ID: {item._id}</span>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* Review search by reviewId, this showcases the GET an item request */}
      <h2>Review Search by ID</h2>
      <p>Search for reviews using the GET an item request</p>
      <div className="input-section">
        <input
          type="text"
          value={searchTermId}
          onChange={(e) => {
            setSearchTermId(e.target.value);
            if(e.target.value.trim() === ""){
              setSearchedReviewId(0);
            }
          }}
          placeholder="Search for a review by its ID..."
        />
        <button
          onClick={() => {
            if(!searchTermId.trim()){
              setItemListSecond([]);
              return;
            };
            fetchItemsByReviewId(searchTermId.toLowerCase());
          }}
        >
          Search (GET)
        </button>
      </div>

      {/* Review display for the returned search result of the search by reviewId*/}
      <div className="items-container">
        <h3>Search Results</h3>
        {itemListSecond.length === 0 ? (
          <p className="no-items">
            {searchedReviewId ? 'No reviews found matching your search.' : 'Enter a search term to find reviews.'} {/*Dynamic UI responses in the text based on user input and search return*/}
          </p>
        ) : (
          <ul>
            {itemListSecond.map(item => (
                <li key={item._id}>
                  <span>{item.igdbId} | {item.review} | Rating: {item.rating}/5</span>
                  <span className="item-id">ID: {item._id}</span>
                </li>
              ))}
          </ul>
        )}
      </div>

    </div>
  );
}

export default ReviewSearchPage;
