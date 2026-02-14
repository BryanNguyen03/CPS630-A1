# CPS630-A1

## Overview
This web application is an initial prototype of our planned video game review site. The platform is planned to allow users to share reviews, see other users' reviews, and on a comprehensive selection of games.
We currently have simple GET, POST, and DELETE operations for some test reviews that we have created, which is more geared towards testing and admin functionality.

### Planned Features
- Add per game views and metadata from IGDB
- UI and functionality (similar to Steam/Metacritic)
- Consolidating `server` and `client` in favour of Next.js or similar framework
- Using Typescript for better type safety
- Using MongoDB for database
- Using Tailwind CSS for styling
- User accounts and authentication (if time allows)

## Prerequisites
- git or use the zip
- Node.js (v22 or later)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/BryanNguyen03/CPS630-A1.git
cd CPS630-A1
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

## Running the Application

### Start the Server

In the `server` directory:

```bash
node server.js
```

The server will run on **http://localhost:8080**

### Start the Client

In the `client` directory:

```bash
npm run dev
```

The client will run on **http://localhost:5173**

## Scripts

### Client

- `npm run dev` - Start development server

### Server

- `node server.js` - Start the Express server

## API Endpoints

- `GET /api/items` - Retrieve all items
- `POST /api/items` - Add a new item

## Usage Instructions

### Review Manager page
- Allows the user to add new reviews using the 'Add Review (POST)' button and add it to the database
- User can view existing reviews and any newly added reviews
- User can delete reviews by using the 'Delete (DELETE)' button next to each review to remove buttons from the database

### Review Search page
- Allows the user to look up any reviews (GET) containing the search criteria
- Button will also initiate search (GET)
- Search will activate on keypress

### About page
- Contains basic information about the site and technologies used

## Reflection

Within this project we have many files for both the client side react project and the server side Node.js and Express project. We have created our simple REST API in the server folder. The 'server.js' file contains both the API/request code and the static JSON object which we used to store the reviews. The client folder contains the frontend React code which we created using a Vite initalization command. The three HTML pages we have combined into one file 'App.jsx', where we have used only vanilla HTML tags/elements. We have created the project this way to ensure future extensibility, and ease of refactoring. The HTML pages we have created in the 'App.jsx' allow the user to utilize GET, POST, and DELETE operations with the backend server.

During this project the group had learned the neccesary technologies and best practices for creating the funtionality we have. We faced some difficulties at first trying to get our separate environments working, however it was resolved quickly. After this the project moved forward easily. We were able to communicate effectively, collaboated efficiently via GitHub, and completed our tasks early. Going forward our group is also considering modernizing the stack for even better extensibility.