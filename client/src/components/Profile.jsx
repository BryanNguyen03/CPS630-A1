import { useState, useEffect } from 'react';

function Profile() {
  const [itemList, setItemList] = useState([]);
  const [selectedReviewId, setSelectedReviewId] = useState('');
  const [updatedReview, setUpdatedReview] = useState('');
  const [updatedRating, setUpdatedRating] = useState('');

  const token = localStorage.getItem('authToken');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  const fetchUserReviews = async () => {
    if (!userId || !token) return;
    try {
      const response = await fetch(`http://localhost:8080/api/items/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setItemList(data);
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    }
  };

  useEffect(() => {
    fetchUserReviews();
  }, []);

  const deleteItem = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchUserReviews();
      } else {
        console.error('Error deleting item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const updateItem = async () => {
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
      const response = await fetch(`http://localhost:8080/api/items/review/${selectedReviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
        fetchUserReviews();
      } else {
        alert('Failed to update review. Please try again.');
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  return (
    <div className="page">
      <h2>My Reviews</h2>
      <p>View and manage your reviews</p>

      <div className="items-container">
        <h3>Reviews ({itemList.length})</h3>
        {itemList.length === 0 ? (
          <p className="no-items">You haven't written any reviews yet.</p>
        ) : (
          <ul>
            {itemList.map(item => (
              <li key={item._id}>
                <span>
                  {item.gameName} (ID: {item.igdbId}) | {item.review} | Rating: {item.rating}/5
                </span>
                <button onClick={() => deleteItem(item._id)}>Delete</button>
              </li>
            ))}
          </ul>
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
    </div>
  );
}

export default Profile;