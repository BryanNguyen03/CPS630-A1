import { useState } from 'react';

function ManageReviewsPage({ itemList, onRefresh }) {
  const [newReviewGameName, setNewReviewGameName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState('');
  const [newReviewText, setNewReviewText] = useState('');

  const [updatedReviewGameName, setUpdatedReviewGameName] = useState('');
  const [updatedReview, setUpdatedReview] = useState('');
  const [updatedRating, setUpdatedRating] = useState('');

  const addItem = async () => {
    if (!newReviewGameName.trim() || !newReviewText.trim() || !newReviewRating.trim()) {
      alert('Please enter all review fields');
      return;
    }

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
        onRefresh();
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/items/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        onRefresh();
      } else {
        console.error('Error deleting item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

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
        setUpdatedReview('');
        setUpdatedRating('');
        setUpdatedReviewGameName('');
        onRefresh();
      }
      else {
        console.error('Error updating item');
        alert('Failed to update review. Please ensure the game name exists and try again.');
      }
    }
    catch (error) {
      console.error('Error updating item:', error);
    }
  };

  return (
    <div className="page">
      <h2>Manage Reviews</h2>
      <p>Manage reviews with GET, POST, and DELETE requests</p>

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
  );
}

export default ManageReviewsPage;
