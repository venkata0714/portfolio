import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "../../styles/AIChatBot.css";

const API_URL = process.env.REACT_APP_API_URI;

const AIChatBot = () => {
  // Chat state
  const [chatStarted, setChatStarted] = useState(false);
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // {id, sender, text}
  const [followUpSuggestions, setFollowUpSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationMemory, setConversationMemory] = useState("");
  const [queriesSent, setQueriesSent] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const chatEndRef = useRef(null);

  // On mount: initialize localStorage metadata (conversationMemory, queriesSent, lastUpdated)
  useEffect(() => {
    try {
      const storedDate = localStorage.getItem("lastUpdated");
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      if (!storedDate || storedDate !== today) {
        // New day or first run – reset counters and memory
        localStorage.setItem("queriesSent", "0");
        localStorage.setItem("conversationMemory", "");
        localStorage.setItem("lastUpdated", today);
        setQueriesSent(0);
        setConversationMemory("");
      } else {
        // Same day – load existing values
        const sent = parseInt(localStorage.getItem("queriesSent") || "0", 10);
        const memory = localStorage.getItem("conversationMemory") || "";
        setQueriesSent(isNaN(sent) ? 0 : sent);
        setConversationMemory(memory || "");
      }
    } catch (e) {
      console.warn("LocalStorage not available, using session state only.");
    }
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, loading]);

  // Helper: send a query (from user input or suggestion)
  const sendQuery = async (userQuery) => {
    const trimmedQuery = userQuery.trim();
    if (!trimmedQuery) return;
    // Enforce daily query limit
    if (queriesSent >= 20) {
      setErrorMsg(
        "You have reached the 20 query/day limit. Please try again tomorrow."
      );
      return;
    }
    // Transition to chat mode on first query
    if (!chatStarted) setChatStarted(true);

    // Clear any old error and suggestions, and add user message to chat
    setErrorMsg("");
    setFollowUpSuggestions([]);
    const userMessage = {
      id: Date.now(), // unique ID
      sender: "user",
      text: trimmedQuery,
    };
    setChatHistory((prev) => [...prev, userMessage]);

    // Prepare for AI response with loading phases
    setLoading(true);
    const loadingId = Date.now() + 1;
    setChatHistory((prev) => [
      ...prev,
      { id: loadingId, sender: "ai", text: "Thinking..." },
    ]);

    // Show progressive loading phases
    setTimeout(() => {
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === loadingId ? { ...msg, text: "Gathering Context..." } : msg
        )
      );
    }, 800);
    setTimeout(() => {
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? { ...msg, text: "Generating Response..." }
            : msg
        )
      );
    }, 1600);

    try {
      // Call backend API with query and current conversation memory (if any)
      const response = await axios.post(`${API_URL}/ai/ask-chat`, {
        query: trimmedQuery,
        conversationMemory,
      });
      const answerText = response.data.answer;
      // Replace loading message with final AI answer
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === loadingId ? { ...msg, text: answerText } : msg
        )
      );
      setLoading(false);

      // Update queries count and conversation memory (snapshot summary)
      const newCount = queriesSent + 1;
      setQueriesSent(newCount);
      try {
        localStorage.setItem("queriesSent", String(newCount));
      } catch {}

      // Request updated conversation memory from backend
      const memRes = await axios.post(`${API_URL}/ai/snapshotMemoryUpdate`, {
        previousMemory: conversationMemory,
        query: trimmedQuery,
        response: answerText,
      });
      const updatedMemory = memRes.data.memory;
      setConversationMemory(updatedMemory);
      try {
        localStorage.setItem("conversationMemory", updatedMemory);
      } catch {}

      // Get follow-up question suggestions from backend
      const followRes = await axios.post(
        `${API_URL}/ai/suggestFollowUpQuestions`,
        {
          query: trimmedQuery,
          response: answerText,
        }
      );
      if (followRes.data.suggestions) {
        setFollowUpSuggestions(followRes.data.suggestions);
      }
    } catch (error) {
      console.error("Error processing query:", error);
      // Replace loading message with an error response
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                text: "Sorry, there was an error processing your query.",
              }
            : msg
        )
      );
      setLoading(false);
    } finally {
      setQuery("");
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuery(query);
  };

  // Handle clicking a suggestion
  const handleSuggestionClick = (suggestion) => {
    sendQuery(suggestion);
  };

  // Starter questions related to user's context (database, GitHub, resume)
  const starterQuestions = [
    "What are some highlights from my resume?",
    "Tell me about my Data Science internship at Byte Link Systems.",
    "What projects have I worked on recently?",
  ];

  return (
    <div className={chatStarted ? "chat-container" : "intro-container"}>
      {!chatStarted ? (
        /* Intro Card UI */
        <div className="intro-card">
          <img
            src={`${process.env.PUBLIC_URL}/system-user.jpg`}
            alt="AI Avatar"
            className="avatar intro-avatar"
          />
          <h2 className="chat-title">Kartavya's AI Companion</h2>
          <p className="suggestion-header">Try asking:</p>
          <ul className="suggestions-list">
            {starterQuestions.map((q, idx) => (
              <li
                key={idx}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(q)}
              >
                {q}
              </li>
            ))}
          </ul>
          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything..."
              className="query-input"
              disabled={loading}
            />
            <button type="submit" className="send-button" disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      ) : (
        /* Full Chat UI */
        <>
          <div className="chat-messages">
            <div className="message-window">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  {/* Avatar */}
                  {msg.sender === "ai" ? (
                    <img
                      src={`${process.env.PUBLIC_URL}/system-user.jpg`}
                      alt="AI"
                      className="avatar ai-avatar"
                    />
                  ) : (
                    <img
                      src={`${process.env.PUBLIC_URL}/user-icon.svg`}
                      alt="You"
                      className="avatar user-avatar"
                    />
                  )}
                  {/* Message text with markdown support */}
                  <div className="bubble">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Syntax highlighting for code blocks
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {/* Follow-up suggestions under the last answer */}
              {followUpSuggestions.length > 0 && (
                <div className="message followup-suggestions">
                  <div className="bubble suggestions-bubble">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      Here are some follow-up questions you can ask:
                    </ReactMarkdown>
                    <div className="followups">
                      {followUpSuggestions.map((q, idx) => (
                        <span
                          key={idx}
                          className="suggestion-chip"
                          onClick={() => handleSuggestionClick(q)}
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                  <img
                    src={`${process.env.PUBLIC_URL}/user-icon.svg`}
                    alt="You"
                    className="avatar user-avatar-followup"
                  />
                </div>
              )}
              {/* If loading, the last message text is already showing the loading phase */}
              {errorMsg && <div className="error">{errorMsg}</div>}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input at bottom */}
          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask another question..."
              className="query-input"
              disabled={loading}
            />
            <button type="submit" className="send-button" disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default AIChatBot;
