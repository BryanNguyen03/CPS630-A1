import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [itemList, setItemList] = useState([]);
  const [newItemName, setNewItemName] = useState('');

  // Get all items from server
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

  // Add a new item to the server
  const addItem = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newItemName })
      });
      if (response.ok) {
        fetchItems(); // Refresh the list after adding an item
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  }

  // Delete an item
  const deleteItem = async (id) => {
    const response = await fetch(`http://localhost:8080/api/items/${id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      fetchItems(); // Refresh the list after deleting an item
    } else {
      console.error('Error deleting item');
    }
  }

  // Fetch items when component mounts
  useEffect(() => {
    fetchItems();
  }, []);


  return (
    <div>
      <h1>CPS630 - Group 52 - Assignment 1</h1>

      <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Enter item name" />
      <button onClick={addItem}>Add Item</button>

      <ul>
        {itemList.map(item => (
          <li key={item.id}>
            {item.name}
            <button onClick={() => deleteItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
