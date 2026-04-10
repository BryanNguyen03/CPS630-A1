import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Chat from './Chat';
import ReviewEditModal from './ReviewEditModal';
import ReviewList from './ReviewList';

const socketServerUrl = 'http://localhost:8080';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const authToken = token || localStorage.getItem('authToken') || '';
  const authUsername = currentUser?.username || localStorage.getItem('authUsername') || '';
  const viewedUsername = decodeUsernameParam(usernameParam) || authUsername;
  const isOwnProfile = Boolean(authUsername && viewedUsername && authUsername === viewedUsername);
  const canManageReviews = Boolean(isOwnProfile && authToken);

  const RESULTS_PER_PAGE = isOwnProfile ? 4 : 2;

  const totalPages = Math.ceil(itemList.length / RESULTS_PER_PAGE);
  const paginatedItems = itemList.slice(
    currentPage * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE + RESULTS_PER_PAGE
  );
  const editingItem = itemList.find((item) => item._id === selectedReviewId) || null;

  const fetchProfileReviews = useCallback(async () => {
    setItemList([]);

    if (!viewedUsername) {
      setIsLoadingReviews(false);
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
      setCurrentPage(0);
    } catch (error) {
      console.error('Error fetching profile reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [viewedUsername]);

  useEffect(() => {
    fetchProfileReviews();
    setIsEditModalOpen(false);
    setSelectedReviewId('');
    setUpdatedReview('');
    setUpdatedRating('');
  }, [fetchProfileReviews]);

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedReviewId('');
    setUpdatedReview('');
    setUpdatedRating('');
  };

  const openEditModal = (item) => {
    setSelectedReviewId(item._id);
    setUpdatedReview(item.review || '');
    setUpdatedRating(item.rating ? String(item.rating) : '');
    setIsEditModalOpen(true);
  };

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
        closeEditModal();
        fetchProfileReviews();
      } else {
        alert('Failed to update review. Please try again.');
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const PaginationControls = () => (
    totalPages > 1 && (
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
    )
  );

  if (!viewedUsername) {
    return (
      <div className="page-shell">
        <h2 className="page-title">Profile</h2>
        <p className="page-subtitle">
          <Link to="/login">Log in</Link> to access your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {!isOwnProfile && (
        <Link to="/community" className="btn-secondary w-fit">
          &lt;- Back to Community
        </Link>
      )}

      <h2 className="page-title">{isOwnProfile ? 'My Profile' : `${viewedUsername}'s Profile`}</h2>
      <p className="page-subtitle">
        {isOwnProfile
          ? canManageReviews
            ? 'View and manage your reviews, and chat with anyone on your profile page.'
            : 'View your reviews and chat with anyone on your profile page. Log in to manage your reviews.'
          : `Read ${viewedUsername}'s reviews and chat here.`}
      </p>

      <div className="panel space-y-4">
        <h3 className="text-xl">Reviews ({itemList.length})</h3>
        {isLoadingReviews ? (
          <p className="empty-state">Loading reviews...</p>
        ) : isOwnProfile ? (
          itemList.length === 0 ? (
            <p className="empty-state">You haven't written any reviews yet.</p>
          ) : (
            <>
              <ul className="space-y-2">
                {paginatedItems.map((item) => (
                  <li
                    key={item._id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-edge bg-bg-800/50 p-3"
                  >
                    <span className="text-sm text-text-muted">
                      {item.gameName} (ID: {item.igdbId}) | {item.review} | Rating: {item.rating}/5
                    </span>
                    {canManageReviews && (
                      <div className="flex items-center gap-2">
                        <button className="btn-secondary w-fit" onClick={() => openEditModal(item)}>
                          Edit
                        </button>
                        <button className="btn-danger w-fit" onClick={() => deleteItem(item._id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <PaginationControls />
            </>
          )
        ) : (
          <>
            <ReviewList
              reviews={paginatedItems}
              linkMode="game"
              showUserName={false}
              emptyMessage="This user has not posted any reviews yet."
            />
            <PaginationControls />
          </>
        )}
      </div>

      {canManageReviews && (
        <ReviewEditModal
          isOpen={isEditModalOpen}
          gameName={editingItem?.gameName || ''}
          updatedReview={updatedReview}
          onUpdatedReviewChange={setUpdatedReview}
          updatedRating={updatedRating}
          onUpdatedRatingChange={setUpdatedRating}
          onClose={closeEditModal}
          onUpdateReview={updateItem}
        />
      )}

      <Chat
        viewedUsername={viewedUsername}
        authUsername={authUsername}
        authToken={authToken}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
}

export default Profile;