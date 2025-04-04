import React, { useState } from "react";
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URI}`;

const AIChatTab = () => {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Append user's query to chat history
    setChatHistory((prev) => [...prev, { sender: "user", text: query }]);
    console.log("User Query:", query);

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/ask-ai`, { query });
      const answer = response.data.answer;
      // Append AI's response to chat history
      setChatHistory((prev) => [...prev, { sender: "ai", text: answer }]);
    } catch (error) {
      console.error("Error processing query:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, there was an error processing your query.",
        },
      ]);
    }
    setLoading(false);
    setQuery("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        {chatHistory.map((msg, index) => (
          <div
            key={index}
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
        />
        <button type="submit" style={styles.button}>
          Send
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
