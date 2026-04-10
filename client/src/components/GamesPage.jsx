import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function GamesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [games, setGames] = useState([]); //variable to hold all the games from API
  const [loadedCount, setLoadedCount] = useState(0); //variable for number of games currently displayed
  const [isLoading, setIsLoading] = useState(false); //semaphore to prevent duplicate batch requests
  const [batchSize, setBatchSize] = useState(0); //variable to hold the current games per batch to be loaded
  const sentinelRef = useRef(null); //component reference that triggers batch load when it is in view

  //getting all games to start in games variable
  useEffect(() => {
    fetch('http://localhost:8080/api/games')
      .then(res => res.json())
      .then(data => setGames(data))
      .catch(err => console.error('Error fetching games:', err));
  }, []);

  //calculating the dynamic batch size based on viewport height at first load
  useEffect(() => {
    const calculateBatchSize = () => {
      const viewportHeight = window.innerHeight;
      const cardHeight = 350; //approximate height with spacing
      
      //load ~2 viewheights worth of games per batch, minimum 10
      const calculated = Math.max(10, Math.ceil((viewportHeight * 2) / cardHeight),  //keeping minimum 10 games
      );
      
      setBatchSize(calculated); //updating the batch size for the games to be loaded each time
      setLoadedCount(calculated); //adding the amount calculated to current loaded total
    };

    calculateBatchSize(); //calling the above function 

    window.addEventListener('resize', calculateBatchSize);  //rerunning the calculation of the batch if the viewport changes size
    
    return () => window.removeEventListener('resize', calculateBatchSize); //removing the listener when the component unloads (changing route)
  }, []); 


  //reset loaded count when search term changes or when the viewport changes size
  useEffect(() => {
    setLoadedCount(batchSize);
  }, [searchTerm, batchSize]);

  //applying the filter to the whole games array to keep it dynamic
  const filteredGames = searchTerm.trim() === ''
    ? games   //if no search then display all
    : games.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()));  //display only those that meet the searchterm

  //only render games up to loadedCount (lazy rendering)
  const displayedGames = filteredGames.slice(0, loadedCount);

  //monitoring the intersection observer
  //this runs whenever the loaded amount changes, either by the change in the viewport, search condition, or scrolling past sentinel
  useEffect(() => {
    //using the browser API intersectionObserver to see when the user scrolls past the sentinel
    const observer = new IntersectionObserver(
      (entries) => {
        //triggering the loading of new games when the sentinel becomes visible
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          loadedCount < filteredGames.length
        ) {
          setIsLoading(true);
          // Adding a small delay to not make it instantly load the next batch
          setTimeout(() => {
            // Add next batch, but don't exceed total filtered games
            setLoadedCount((prev) => Math.min(prev + batchSize, filteredGames.length));
            setIsLoading(false);
          }, 100);
        }
      },
      { threshold: 0.1 }
    );


    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      //stopping the observer once the sentinel element unloads
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [loadedCount, filteredGames.length, isLoading, batchSize]);

  return (
    <div className="page">
      <h2>Explore Games</h2>
      <p>Browse through our collection of games.</p>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search for a game..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="games-grid">
        {filteredGames.length === 0 ? (
          <p className="no-items">No games found matching "{searchTerm}"</p>
        ) : (
          //render only the games currently loaded (displayedGames only)
          displayedGames.map((item) => (
            //Each card here has a link to the game page (GameDetailsPage component) it references
            <Link to={`/games/${item.igdbId}`} key={item._id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="game-card">
              {item.coverUrl && (
                <img 
                  src={item.coverUrl} 
                  alt={`${item.name} cover`} 
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
                />
              )}
              <div className="game-header">
                <h3 style={{ marginTop: '10px' }}>{item.name}</h3>
                {item.rating && (
                  <span className={`rating-badge rate-${Math.round(item.rating / 20) || '0'}`}>
                    {Math.round(item.rating / 20) || '0'}/5
                  </span>
                )}
              </div>
              
              <div className="game-body">
                <p className="summary-snippet" style={{ fontSize: '0.9em', color: '#666' }}>
                  {item.summary ? `${item.summary.substring(0, 100)}...` : 'No summary available.'}
                </p>
              </div>

              <div className="game-footer">
                <small>Released: {item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : 'Unknown'}</small>
              </div>
            </div>
            </Link>
          ))
        )}
      </div>

      {/* Sentinel element, when scrolled into view it triggers loading next batch */}
      <div ref={sentinelRef} style={{ height: '20px', margin: '20px 0' }} />

      {/* Loading indicator which shows when the next batch is still loading and there is still games left to load */}
      {isLoading && loadedCount < filteredGames.length && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: '#999' }}>Loading more games...</p>
        </div>
      )}
    </div>
  );
}

export default GamesPage;