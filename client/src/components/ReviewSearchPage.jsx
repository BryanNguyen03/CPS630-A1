import { useState } from 'react';

function ReviewSearchPage({ itemList, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermId, setSearchTermId] = useState('');
  const [searchedReviewId, setSearchedReviewId] = useState(0);
  const [itemListSecond, setItemListSecond] = useState([]);

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

  return (
    <div className="page">
      <h2>Review Search by Game</h2>
      <p>Search for reviews using the GET multiple items request</p>

      <div className="input-section">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a review by Game..."
        />
        <button onClick={() => onRefresh()}>Search (GET)</button>
      </div>

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
  );
}

export default ReviewSearchPage;
