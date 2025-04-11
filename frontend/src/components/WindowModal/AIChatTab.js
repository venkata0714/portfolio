import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URI;

const AIChatTab = () => {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // This ref will be used to auto-scroll the chat container to the bottom
  const chatContainerRef = useRef(null);

  // Scroll to the latest message every time chatHistory changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // Add user query to chat history with a unique id
    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmedQuery,
    };
    setChatHistory((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Make the API call to your backend (adjust endpoint as needed)
      const response = await axios.post(`${API_URL}/ai/ask-chat`, {
        query: trimmedQuery,
      });
      const aiMessage = {
        id: Date.now() + 1, // Ensure a unique id
        sender: "ai",
        text: response.data.answer,
      };
      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error processing query:", error);
      const errorMsg = {
        id: Date.now() + 2,
        sender: "ai",
        text: "Sorry, there was an error processing your query.",
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
    <div style={styles.container}>
      <div ref={chatContainerRef} style={styles.chatBox}>
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.message,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "user" ? "#007bff" : "#343a40",
              color: "#fff",
            }}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div
            style={{
              ...styles.message,
              alignSelf: "flex-start",
              backgroundColor: "#343a40",
            }}
          >
            Loading...
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me something..."
          style={styles.input}
          disabled={loading}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#212529",
    padding: "20px",
  },
  chatBox: {
    width: "100%",
    maxWidth: "600px",
    height: "60vh",
    backgroundColor: "#495057",
    borderRadius: "8px",
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
  },
  message: {
    maxWidth: "80%",
    padding: "10px 15px",
    borderRadius: "20px",
    marginBottom: "10px",
    wordBreak: "break-word",
  },
  form: {
    width: "100%",
    maxWidth: "600px",
    display: "flex",
  },
  input: {
    flex: 1,
    padding: "10px 15px",
    borderRadius: "20px 0 0 20px",
    border: "none",
    outline: "none",
    fontSize: "1rem",
  },
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "0 20px 20px 0",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
  },
};

export default AIChatTab;
