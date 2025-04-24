# Kartavya’s Portfolio Website + AI Companion

<p align="center">
  <img src="https://i.ibb.co/kVY2JjRS/Kartavya-Singh-Portfolio-Website-Thumbnail.png" alt="Portfolio Thumbnail" width="700"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Fastify-brightgreen?logo=node.js&logoColor=white" alt="Node.js/Fastify" />
  <img src="https://img.shields.io/badge/React-Hooks%20%26%20Framer%20Motion-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-success?logo=mongodb&logoColor=white" alt="MongoDB Atlas" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4-blueviolet?logo=openai&logoColor=white" alt="OpenAI GPT-4" />
</p>

## 🚀 About the Project

This repository contains the source code for my personal portfolio website, built with the **MERN stack**, now enhanced with a custom **AI Companion** chatbot. The site showcases my projects, experiences, involvements, and honors in a dynamic and interactive way. With the new AI feature, visitors can not only read about my work but also **ask questions and get answers** in real-time. The goal was to push the boundaries of a traditional portfolio by integrating conversational AI, making the user experience engaging and informative.

Originally, the portfolio was a classic MERN application: MongoDB for data, Express/Node.js for the backend API, and React for the frontend UI. In this extended version, the backend architecture has been upgraded and expanded to support AI capabilities (using Fastify for performance, additional routes, and an AI service layer), and the frontend includes a chatbot interface complete with voice input and interactive animations. The project reflects my passion for full-stack development and artificial intelligence, demonstrating how the two can be combined to create something truly unique.

## 🧠 AI Integration

The **AI Companion** is a conversational agent that lives on the portfolio site, capable of answering questions about my background as if you’re chatting with me. Here’s how it works under the hood:

- **Knowledge Base Aggregation:** On the backend, data from multiple sources (my portfolio content in MongoDB, my resume, and my GitHub repositories) is aggregated and kept up-to-date. This forms a rich knowledge base about my projects, work experience, education, skills, and more.
- **Semantic Vector Search:** The text from these sources is pre-processed into semantic embeddings (using OpenAI’s embedding API). These embeddings are stored and indexed (leveraging MongoDB Atlas Search’s kNN capabilities). When a user asks a question, the system converts the query into an embedding and performs a **vector similarity search** to find relevant pieces of information across the knowledge base.
- **GPT-4 Answer Generation:** Relevant context is then fed into an OpenAI GPT-4 model (via API) which generates a response in real-time. The AI has been prompt-engineered with a custom persona — it “speaks” in first person as Kartavya, with a friendly and knowledgeable tone. It uses the retrieved context to ground its answers, ensuring responses are factual and specific to my portfolio.
- **Conversation Memory:** The AI Companion maintains context over multiple interactions. It uses a rolling memory of the conversation (summarizing past Q&A exchanges) so that follow-up questions are answered with awareness of what’s already been discussed. This makes the chat feel coherent and continuous.
- **Voice and Interaction:** The frontend integrates Web Speech API for speech-to-text, allowing users to **talk** to the AI using their microphone. After the AI answers, the interface may also suggest a few follow-up questions to nudge the conversation, using another GPT-powered helper behind the scenes.

## ✨ Features

**Portfolio Website Features:**

- **Comprehensive Sections:** Showcases Projects, Work Experiences, Involvements, Honors, Skills, and more in a structured format.
- **Dynamic Content Management:** All portfolio data is stored in MongoDB and retrieved via RESTful APIs.
- **Responsive UI:** Built with React to ensure a seamless user experience on both desktop and mobile.
- **Smooth Animations:** Framer Motion and React Spring for polished transitions.

**AI Companion Features:**

- **Conversational Q&A:** Ask about my background, projects, or skills in natural language.
- **Context-Aware Dialog:** Maintains conversation context across multiple turns.
- **Voice Input Support:** Speak your questions using the microphone icon.
- **Suggested Questions:** AI offers follow-up prompts to guide the chat.
- **Real-time Feedback:** Shows status messages (“Gathering context…”, “Generating answer…”) and a typewriter reveal effect.

## 🛠 Tech Stack

**Frontend:**  
- React with Hooks & Framer Motion  
- Web Speech API for voice input  
- react-markdown & remark-gfm for rendering AI responses  

**Backend:**  
- Node.js & Fastify for high-performance APIs  
- MongoDB Atlas (with Atlas Search for vector similarity)  
- OpenAI GPT-4 & Embeddings API  
- pdf-parse for resume extraction  
- node-fetch for GitHub API integration  

**Deployment:**  
- Render.com for frontend & backend  
- MongoDB Atlas for database  
- Environment variables for configuration (`.env` in `/backend`)

## 📦 Installation and Setup
1. Clone the repository:
   git clone https://github.com/your-username/Kartavya-Portfolio-MERN.git
   cd Kartavya-Portfolio-MERN
2. Set up environment variables:
    In the backend folder, create a .env file and add:
        PORT=5000  
        MONGO_URI="<your MongoDB connection string>"  
        OPENAI_API_KEY="<your OpenAI API key>"  
        GITHUB_TOKEN="<your GitHub PAT (optional)>"  
3. Install dependencies for both backend and frontend:
    #### Backend
        cd backend
        npm install
    #### Frontend
        cd frontend
        npm install

### Running the Application

1. Start the backend server first: (it messes up the other way due to mongodb connection issue!)
    cd backend
    npm start
2. Start the frontend React app:
    cd ../frontend
    npm start
3. Visit http://localhost:3000 in your browser to view the application.

## 🤖 Future Improvements
- Text-to-Speech: Have the AI speak responses aloud.
- Expanded KB: Include blogs, papers, or other content sources.
- Adaptive Learning: Let the AI learn from user feedback.
- UI/UX Tweaks: Custom theming, transcript downloads, feedback buttons.

##### Thanks for exploring my portfolio and AI Companion! Feel free to reach out with feedback or questions. 🚀✨