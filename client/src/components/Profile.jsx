import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Chat from './Chat';
import ReviewList from './ReviewList';

const socketServerUrl = 'http://localhost:8080';
const activeChatPartnerStorageKey = 'activeChatPartnerUsername';

const decodeUsernameParam = (value) => {
  if (!value) {
    return '';
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

function Profile({ currentUser, token }) {
  const { username: usernameParam } = useParams();

  const [itemList, setItemList] = useState([]);
  const [selectedReviewId, setSelectedReviewId] = useState('');
  const [updatedReview, setUpdatedReview] = useState('');
  const [updatedRating, setUpdatedRating] = useState('');
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [chatPartnerUsername, setChatPartnerUsername] = useState('');
  const authToken = token || localStorage.getItem('authToken') || '';
  const authUsername = currentUser?.username || localStorage.getItem('authUsername') || '';
  const viewedUsername = decodeUsernameParam(usernameParam) || authUsername;
  const isOwnProfile = Boolean(authUsername && viewedUsername && authUsername === viewedUsername);
  const activeChatUsername = isOwnProfile ? chatPartnerUsername : viewedUsername;

  const fetchProfileReviews = useCallback(async () => {
    if (!viewedUsername) {
      setItemList([]);
      return;
    }

    setIsLoadingReviews(true);
    try {
      const response = await fetch(`${socketServerUrl}/api/items`);
      if (!response.ok) {
        throw new Error(`Failed to load reviews for ${viewedUsername}`);
      }

      const data = await response.json();
      const filteredReviews = data
        .filter((item) => item.userName === viewedUsername)
        .reverse();

      setItemList(filteredReviews);
    } catch (error) {
      console.error('Error fetching profile reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [viewedUsername]);

  useEffect(() => {
    fetchProfileReviews();
    setSelectedReviewId('');
    setUpdatedReview('');
    setUpdatedRating('');
  }, [fetchProfileReviews]);

  useEffect(() => {
    let isCancelled = false;

    const setPartnerIfActive = (username) => {
      if (!isCancelled) {
        setChatPartnerUsername(username || '');
      }
    };

    if (!viewedUsername) {
      setPartnerIfActive('');
      return () => {
        isCancelled = true;
      };
    }

    if (!isOwnProfile) {
      setPartnerIfActive(viewedUsername);
      if (authUsername && viewedUsername !== authUsername) {
        localStorage.setItem(activeChatPartnerStorageKey, viewedUsername);
      }
      return () => {
        isCancelled = true;
      };
    }

    const storedPartner = localStorage.getItem(activeChatPartnerStorageKey) || '';
    if (storedPartner && storedPartner !== authUsername) {
      setPartnerIfActive(storedPartner);
      return () => {
        isCancelled = true;
      };
    }

    const resolveDefaultPartner = async () => {
      if (!authUsername) {
        setPartnerIfActive('');
        return;
      }

      try {
        const response = await fetch(`${socketServerUrl}/api/users`);
        if (!response.ok) {
          throw new Error('Failed to load users for chat partner resolution');
        }

        const users = await response.json();
        const fallbackPartner =
          users
            .map((user) => user.username)
            .find((username) => Boolean(username) && username !== authUsername) || '';

        setPartnerIfActive(fallbackPartner);
        if (fallbackPartner) {
          localStorage.setItem(activeChatPartnerStorageKey, fallbackPartner);
        }
      } catch (error) {
        console.error('Error resolving default chat partner:', error);
        setPartnerIfActive('');
      }
    };

    resolveDefaultPartner();

    return () => {
      isCancelled = true;
    };
  }, [authUsername, isOwnProfile, viewedUsername]);

  const deleteItem = async (id) => {
    if (!isOwnProfile || !authToken) {
      return;
    }

    try {
      const response = await fetch(`${socketServerUrl}/api/items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        fetchProfileReviews();
      } else {
        console.error('Error deleting review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const updateItem = async () => {
    if (!isOwnProfile || !authToken) {
      return;
    }
    if (!selectedReviewId) {
      alert('Please select a review to update');
      return;
    }
    if (!updatedReview.trim() && !updatedRating) {
      alert('Please enter at least one field to update');
      return;
    }
    if (updatedRating && (isNaN(updatedRating) || updatedRating < 1 || updatedRating > 5)) {
      alert('Rating must be a number between 1 and 5');
      return;
    }

    try {
      const response = await fetch(`${socketServerUrl}/api/items/review/${selectedReviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ...(updatedReview.trim() && { review: updatedReview }),
          ...(updatedRating && { rating: Number(updatedRating) })
        })
      });

      if (response.ok) {
        setUpdatedReview('');
        setUpdatedRating('');
        setSelectedReviewId('');
        fetchProfileReviews();
      } else {
        alert('Failed to update review. Please try again.');
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  if (!viewedUsername) {
    return (
      <div className="page">
        <h2>Profile</h2>
        <p>
          <Link to="/login">Log in</Link> to access your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>{isOwnProfile ? 'My Profile' : `${viewedUsername}'s Profile`}</h2>
      <p>
        {isOwnProfile
          ? `View and manage your reviews, and browse your chats${activeChatUsername ? ` with ${activeChatUsername}` : ''}.`
          : `Read ${viewedUsername}'s reviews and chat here.`}
      </p>

      <div className="items-container">
        <h3>Reviews ({itemList.length})</h3>
        {isLoadingReviews ? (
          <p className="no-items">Loading reviews...</p>
        ) : isOwnProfile ? (
          itemList.length === 0 ? (
            <p className="no-items">You haven't written any reviews yet.</p>
          ) : (
            <ul>
              {itemList.map((item) => (
                <li key={item._id}>
                  <span>
                    {item.gameName} (ID: {item.igdbId}) | {item.review} | Rating: {item.rating}/5
                  </span>
                  <button onClick={() => deleteItem(item._id)}>Delete</button>
                </li>
              ))}
            </ul>
          )
        ) : (
          <ReviewList
            reviews={itemList}
            linkMode="game"
            showUserName={false}
            emptyMessage="This user has not posted any reviews yet."
          />
        )}

        {itemList.length > 0 && (
            <div className="input-section">
              <h4>Update a Review</h4>
              <select
                value={selectedReviewId}
                onChange={(e) => setSelectedReviewId(e.target.value)}
              >
                <option value="">-- Select a review to update --</option>
                {itemList.map(item => (
                  <option key={item._id} value={item._id}>
                    {item.gameName} — "{item.review.slice(0, 40)}{item.review.length > 40 ? '...' : ''}"
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Updated review text"
                value={updatedReview}
                onChange={(e) => setUpdatedReview(e.target.value)}
              />
              <input
                type="number"
                placeholder="Updated Rating (1-5)"
                min={1}
                max={5}
                value={updatedRating}
                onChange={(e) => setUpdatedRating(e.target.value)}
              />
              <button onClick={updateItem}>Update Review</button>
            </div>
          )}
      </div>

      <Chat
        viewedUsername={activeChatUsername}
        authUsername={authUsername}
        authToken={authToken}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
}

export default Profile;