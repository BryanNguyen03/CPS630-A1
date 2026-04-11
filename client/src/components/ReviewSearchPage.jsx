//component for the review search page which allows the user to see all reviews by game search or review id search
import { useState } from 'react';
import { getRatingBadgeClasses } from '../utils/ratingStyles';

function ReviewSearchPage({ itemList, onRefresh }) {

  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermId, setSearchTermId] = useState('');
  const [searchedReviewId, setSearchedReviewId] = useState(0);
  const [itemListSecond, setItemListSecond] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  //limiting the amount of reviews rendered in the window for search by game
  const RESULTS_PER_PAGE = 4;

  //filtering by gamename
  const gameSearchResults = itemList.filter((item) =>
    item.gameName && item.gameName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //determining the total amount of window pages based on the amount of reviews given by the search filter
  const totalPages = Math.ceil(gameSearchResults.length / RESULTS_PER_PAGE);
  const paginatedResults = gameSearchResults.slice(
    currentPage * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE + RESULTS_PER_PAGE
  );

  //handler function for search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset to first page on new search
  };


  //search by ID fetch request
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
    <div className="page-shell">
      <div className="space-y-1">
        <h2 className="page-title">Review Search by Game</h2>
        <p className="page-subtitle">Search for reviews using the GET multiple items request.</p>
      </div>

      <div className="panel space-y-4">
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            type="text"
            className="input-field"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search for a review by Game..."
          />
          <button className="btn-primary md:w-auto" onClick={() => { onRefresh(); setCurrentPage(0); }}>Search (GET)</button>
        </div>

        <h3 className="text-lg">Search Results ({gameSearchResults.length})</h3>

        {gameSearchResults.length === 0 ? (
          <p className="empty-state">
            {searchTerm ? 'No reviews found matching your search.' : 'Enter a search term to find reviews.'}
          </p>
        ) : (
          <>
            {/* showing the reviews reslting from the game name search, in a paginated format */}
            <div className="space-y-3">
              {paginatedResults.map((item) => (
                <article key={item._id} className="card space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <strong className="text-base text-text-primary">{item.gameName}</strong>
                    <span className={getRatingBadgeClasses(item.rating)}>
                      {item.rating}/5
                    </span>
                  </div>
                  <p className="text-sm text-text-muted">"{item.review}"</p>
                  <p className="font-mono text-xs text-text-muted">Review ID: {item._id}</p>
                </article>
              ))}
            </div>

            {/* controls for the paginated review display */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  className="btn-primary md:w-auto"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  ← Previous
                </button>
                <span className="text-sm text-text-muted">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  className="btn-primary md:w-auto"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* display for the search review by review ID */}
      <div className="panel space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl">Review Search by ID</h2>
          <p className="page-subtitle">Search for reviews using the GET an item request.</p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row">
          <input
            type="text"
            className="input-field"
            value={searchTermId}
            onChange={(e) => {
              setSearchTermId(e.target.value);
              if (e.target.value.trim() === '') {
                setSearchedReviewId(0);
              }
            }}
            placeholder="Search for a review by its ID..."
          />
          <button
            className="btn-primary md:w-auto"
            onClick={() => {
              if (!searchTermId.trim()) {
                setItemListSecond([]);
                return;
              }
              fetchItemsByReviewId(searchTermId.toLowerCase());
            }}
          >
            Search (GET)
          </button>
        </div>

        <h3 className="text-lg">Search Results</h3>

        {itemListSecond.length === 0 ? (
          <p className="empty-state">
            {searchedReviewId ? 'No reviews found matching your search.' : 'Enter a search term to find reviews.'}
          </p>
        ) : (
          <div className="space-y-3">
            {itemListSecond.map(item => (
              <article key={item._id} className="card space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <strong className="text-base text-text-primary">{item.gameName}</strong>
                  <span className={getRatingBadgeClasses(item.rating)}>
                    {item.rating}/5
                  </span>
                </div>
                <p className="text-sm text-text-muted">"{item.review}"</p>
                <p className="font-mono text-xs text-text-muted">Review ID: {item._id}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewSearchPage;