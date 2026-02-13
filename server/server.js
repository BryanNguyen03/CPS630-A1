const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

const PORT = 8080;

app.use(cors());
app.use(express.json());


//simple list of reviews to demo the idea
//Eventually this list will be dynamic and stored separately
//Several more fields will also be present
let item_list = [
    {id: 1, name:"Review for Fifa 25: 4/5 | Enjoyed playing proclubs, however didn't like the fifa points"},
    {id: 2, name: "Review for Valorant: 4/5 | Always rage, always come back"},
    {id: 3, name: "Review for Call of Duty: 2/5 | Same game as last year"},
    {id: 4, name:"Review for Minecraft: 5/5 | Can't go wrong with Minecraft"},
    {id: 5, name: "Review for Fortnite: 1/5 | Too many sweats"},
    {id: 6, name: "Review for League of Legends: 5/5 | Spent too much lifespan"}
]

app.get('/api/items', (req, res) => {
    // 200 OK status
    res.status(200).json(item_list);
});

app.post('/api/items', (req, res) => {
    const {name} = req.body;

    if (!name) {
        // 400 Bad Request status
        return res.status(400).json({ error: "Name is required" });
    }

    const newItem = {
        id: Date.now(), // temporary unique ID based on timestamp
        name
    }

    item_list.push(newItem);

    // 201 created status
    res.status(201).json(newItem);
});

app.delete('/api/items/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const index = item_list.findIndex(item => item.id === id);

    if (index !== -1) {
        item_list.splice(index, 1); // Find the item by ID and remove it from the list

        // 200 OK status
        res.status(200).json({ message: "Item deleted successfully" });
    } else { // index === -1, item not found
        // 404 Not Found status
        res.status(404).json({ error: "Item not found" });
    }
});

console.log('__dirname: ' + __dirname);
app.listen(PORT, () => { console.log("Server started on port " + PORT); });
