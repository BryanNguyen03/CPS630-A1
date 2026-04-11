//Component for the main games page, where the games from the API are displayed
import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import GameRatingBadge from './GameRatingBadge';
import { buildReviewStatsByGameId } from '../utils/reviewRatingStats';

function GamesPage({ itemList = [] }) {
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

  //applying the filter to the whole games array to keep it dynamic
  const filteredGames = searchTerm.trim() === ''
    ? games   //if no search then display all
    : games.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()));  //display only those that meet the searchterm

  //only render games up to loadedCount (lazy rendering)
  const displayedGames = filteredGames.slice(0, loadedCount);

  // Aggregate user review stats per game so ratings match GameDetailsPage.
  const reviewStatsByGameId = useMemo(() => buildReviewStatsByGameId(itemList), [itemList]);

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


    const currentSentinel = sentinelRef.current;

    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      //stopping the observer once the sentinel element unloads
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [loadedCount, filteredGames.length, isLoading, batchSize]);

  return (
    <div className="page-shell">
      <div className="space-y-1">
        <h2 className="page-title">Explore Games</h2>
        <p className="page-subtitle">Browse through our collection of games.</p>
      </div>

      <div className="panel">
        <input
          type="text"
          placeholder="Search for a game..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setLoadedCount(batchSize);
          }}
          className="input-field"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredGames.length === 0 ? (
          <p className="empty-state md:col-span-2 xl:col-span-3">No games found matching "{searchTerm}"</p>
        ) : (
          //render only the games currently loaded (displayedGames only)
          displayedGames.map((item) => {
            // Keep card rating output synchronized with GameDetailsPage averages.
            const gameReviewStats = reviewStatsByGameId.get(Number(item.igdbId));
            const averageUserRating = gameReviewStats?.averageRating ?? null;
            const averageUserRatingDisplay = gameReviewStats?.averageDisplayValue ?? null;

            return (
              //Each card here has a link to the game page (GameDetailsPage component) it references
              <Link to={`/games/${item.igdbId}`} key={item._id} className="block no-underline">
                <article className="card card-hover flex h-full flex-col gap-3">
                  {item.coverUrl && (
                    <img
                      src={item.coverUrl}
                      alt={`${item.name} cover`}
                      className="h-40 w-full rounded-lg object-cover"
                    />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-text-primary">{item.name}</h3>
                    {averageUserRating !== null && (
                      <GameRatingBadge
                        rating={averageUserRating}
                        displayValue={averageUserRatingDisplay}
                        reviewCount={gameReviewStats.reviewCount}
                      />
                    )}
                  </div>

                  <p className="text-sm text-text-muted">
                    {item.summary ? `${item.summary.substring(0, 100)}...` : 'No summary available.'}
                  </p>

                  <p className="mt-auto text-xs uppercase tracking-wide text-text-muted">
                    Released: {item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : 'Unknown'}
                  </p>
                </article>
              </Link>
            );
          })
        )}
      </div>

      {/* Sentinel element, when scrolled into view it triggers loading next batch */}
      <div ref={sentinelRef} className="my-4 h-5" />

      {/* Loading indicator which shows when the next batch is still loading and there is still games left to load */}
      {isLoading && loadedCount < filteredGames.length && (
        <div className="py-4 text-center text-sm text-text-muted">
          <p>Loading more games...</p>
        </div>
      )}
    </div>
  );
}

export default GamesPage;