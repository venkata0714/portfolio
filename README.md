# Kartavya Portfolio - MERN

A full-stack MERN application designed to showcase Kartavya's portfolio of projects, experiences, involvements, and honors. This project uses MongoDB for data storage, Express and Node.js for server-side functionality, and React for the dynamic, user-friendly frontend.

## Technologies Used

- **MongoDB**: Stores and organizes portfolio data, including projects, experiences, and more.
- **Express**: Handles backend routing and API endpoint creation for seamless data retrieval.
- **React**: Powers the frontend to deliver interactive, responsive, and dynamic web pages.
- **Node.js**: Serves as the runtime environment for the server and manages backend processes.

## Project Structure

- **backend**: Contains the Express server, API routes, and database connection logic.
  - `models`: MongoDB models for structured data storage.
  - `controllers`: Business logic for handling data operations.
  - `routes`: API routes for data requests from the frontend.
  - `config`: Database configuration.
  
- **frontend**: The React application that displays the portfolio data.
  - `components`: Reusable UI components to display projects, experiences, and more.
  - `services`: Functions to interact with backend APIs.
  
## Features

- **Portfolio Management**: Displays categorized portfolio sections (projects, experiences, involvements, honors).
- **Dynamic Data Retrieval**: Fetches and updates data from MongoDB in real-time through RESTful APIs.
- **Responsive UI**: Built with React to ensure a seamless user experience on both desktop and mobile.

## Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) (or local MongoDB setup)

### Installation

1. Clone the repository:
   git clone https://github.com/your-username/Kartavya-Portfolio-MERN.git
   cd Kartavya-Portfolio-MERN
2. Set up environment variables:
    In the backend folder, create a .env file and add:
        PORT=5000
        MONGO_URI="my-mongodb uri"
3. Install dependencies for both backend and frontend:
    #### Backend
        cd backend
        npm install
    #### Frontend
        cd ../frontend
        npm install

### Running the Application

1. Start the backend server first: (it messes up the other way due to mongodb connection issue!)
    cd backend
    npm start
2. Start the frontend React app:
    cd ../frontend
    npm start
3. Visit http://localhost:3000 in your browser to view the application.


