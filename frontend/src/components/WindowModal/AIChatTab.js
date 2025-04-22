// AIChatTab.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/AIChatBot.css";

const API_URL = process.env.REACT_APP_API_URI;
const MAX_QUERIES = 20;
const TOAST_THRESHOLD = 5;
const TYPING_DELAY = 0; // ms per character

const AIChatBot = () => {
  const [chatStarted, setChatStarted] = useState(false);
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // {id, sender, text}
  const [followUpSuggestions, setFollowUpSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationMemory, setConversationMemory] = useState("");
  const [queriesSent, setQueriesSent] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [latestAIId, setLatestAIId] = useState(null);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const cancelRef = useRef(false);

  // --- Daily reset & restore ---
  useEffect(() => {
    try {
      const storedDate = localStorage.getItem("lastUpdated");
      const today = new Date().toISOString().slice(0, 10);
      if (storedDate !== today) {
        localStorage.setItem("queriesSent", "0");
        localStorage.setItem("conversationMemory", "");
        localStorage.setItem("lastUpdated", today);
        setQueriesSent(0);
        setConversationMemory("");
      } else {
        const sent = parseInt(localStorage.getItem("queriesSent") || "0", 10);
        setQueriesSent(isNaN(sent) ? 0 : sent);
        setConversationMemory(localStorage.getItem("conversationMemory") || "");
      }
    } catch {}
  }, []);

  // --- Auto‑scroll ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  // --- Toast logic ---
  useEffect(() => {
    setShowToast(
      queriesSent >= MAX_QUERIES - TOAST_THRESHOLD && queriesSent < MAX_QUERIES
    );
  }, [queriesSent]);

  // --- Stop generation handler ---
  const stopGenerating = () => {
    cancelRef.current = true;
    setLoading(false);
  };

  // add this at the top of your component file
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const sendQuery = async (userQuery) => {
    const trimmed = userQuery.trim();
    if (!trimmed) return;
    if (queriesSent >= MAX_QUERIES) {
      setErrorMsg(
        `You’ve reached your ${MAX_QUERIES}‑query/day limit. Try again tomorrow.`
      );
      return;
    }
    if (!chatStarted) setChatStarted(true);
    setErrorMsg("");
    setFollowUpSuggestions([]);
    cancelRef.current = false;

    // 1) Insert user bubble
    const userId = Date.now();
    setChatHistory((h) => [
      ...h,
      { id: userId, sender: "user", text: trimmed },
    ]);

    // 2) Insert AI bubble → "Thinking..."
    setLoading(true);
    const aiId = userId + 1;
    setChatHistory((h) => [
      ...h,
      { id: aiId, sender: "ai", text: "Thinking..." },
    ]);

    await delay(200); // let UI settle

    // 3) Fire the main chat API
    const askPromise = axios.post(`${API_URL}/ai/ask-chat`, {
      query: trimmed,
      conversationMemory,
    });

    // 4) Stage transitions
    await delay(200);
    if (!cancelRef.current) {
      setChatHistory((h) =>
        h.map((m) =>
          m.id === aiId ? { ...m, text: "Gathering Context..." } : m
        )
      );
    }
    await delay(200);

    try {
      // 5) Await the answer
      const { data } = await askPromise;
      if (cancelRef.current) throw new Error("cancelled");
      const answerText = data.answer || "";

      // 6) Immediately kick off follow‑ups
      const suggestPromise = axios.post(
        `${API_URL}/ai/suggestFollowUpQuestions`,
        { query: trimmed, response: answerText }
      );

      // 7) Show “Generating Response…”
      if (!cancelRef.current) {
        setChatHistory((h) =>
          h.map((m) =>
            m.id === aiId ? { ...m, text: "Generating Response..." } : m
          )
        );
      }
      await delay(200);

      // 8) Snapshot memory
      const memRes = await axios.post(`${API_URL}/ai/snapshotMemoryUpdate`, {
        previousMemory: conversationMemory,
        query: trimmed,
        response: answerText,
      });
      if (cancelRef.current) throw new Error("cancelled");
      const newMem = memRes.data.memory;
      setConversationMemory(newMem);
      localStorage.setItem("conversationMemory", newMem);

      // 9) Increment count
      const newCount = queriesSent + 1;
      setQueriesSent(newCount);
      localStorage.setItem("queriesSent", String(newCount));

      // 🔟 Typewriter reveal
      let built = "";
      for (let i = 0; i < answerText.length; i++) {
        if (cancelRef.current) break;
        built += answerText[i];
        setChatHistory((h) =>
          h.map((m) => (m.id === aiId ? { ...m, text: built } : m))
        );
        await delay(TYPING_DELAY);
      }

      // 1️⃣1️⃣ Mark latest AI bubble
      setLatestAIId(aiId);

      // 1️⃣2️⃣ Await and display follow‑ups immediately
      try {
        const followRes = await suggestPromise;
        if (!cancelRef.current) {
          setFollowUpSuggestions(followRes.data.suggestions || []);
        }
      } catch {
        /* ignore */
      }

      setLoading(false);
    } catch (err) {
      if (!cancelRef.current) console.error(err);
      setChatHistory((h) =>
        h.map((m) =>
          m.id === aiId
            ? {
                ...m,
                text: cancelRef.current
                  ? `${m.text} [Generation stopped]`
                  : "Sorry, something went wrong.",
              }
            : m
        )
      );
      setLoading(false);
    } finally {
      setQuery("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuery(query);
  };
  const handleSuggestionClick = (s) => sendQuery(s);

  // --- Bubble action handlers ---
  const handleCopy = (text) => navigator.clipboard.writeText(text);
  const handleEdit = (text) => {
    setQuery(text);
    inputRef.current?.focus();
  };
  const handleThumb = (up) => console.log(up ? "👍" : "👎");
  const handleReadAloud = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(u);
  };
  const handleRegenerate = (id) => {
    // find prior user message
    const idx = chatHistory.findIndex((m) => m.id === id);
    if (idx > 0 && chatHistory[idx - 1].sender === "user") {
      sendQuery(chatHistory[idx - 1].text);
    }
  };

  const starterQuestions = [
    "What are some highlights from my resume?",
    "Tell me about my Data Science internship at Byte Link Systems.",
    "What projects have I worked on recently?",
  ];

  return (
    <div className={chatStarted ? "chat-container" : "intro-container"}>
      {/* toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.25 }}
          >
            <span>
              You have {MAX_QUERIES - queriesSent} queries left today.
            </span>
            <button className="toast-close" onClick={() => setShowToast(false)}>
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!chatStarted ? (
        <div className="intro-card">
          <img
            src={`${process.env.PUBLIC_URL}/system-user.jpg`}
            alt="AI"
            className="avatar intro-avatar"
          />
          <h2 className="chat-title">Kartavya's AI Companion</h2>
          <p className="suggestion-header">Try asking:</p>
          <ul className="suggestions-list">
            {starterQuestions.map((q, i) => (
              <li
                key={i}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(q)}
              >
                {q}
              </li>
            ))}
          </ul>
          <form
            onSubmit={handleSubmit}
            className="input-form"
            style={{ position: "relative" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything..."
              className="query-input"
            />
            <button
              type="button"
              className="send-float-btn"
              onClick={() => (loading ? stopGenerating() : sendQuery(query))}
            >
              <i className={`fa ${loading ? "fa-stop" : "fa-arrow-up"}`} />
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="chat-messages">
            <div className="message-window">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  <img
                    src={`${process.env.PUBLIC_URL}/${
                      msg.sender === "ai" ? "system-user.jpg" : "user-icon.svg"
                    }`}
                    alt={msg.sender}
                    className={`avatar ${msg.sender}-avatar`}
                  />
                  <div className="bubble-container">
                    <div className="bubble">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                    <div
                      className={`actions ${msg.sender} ${
                        msg.id === latestAIId ? "always-show" : ""
                      }`}
                    >
                      {msg.sender === "user" ? (
                        <>
                          <i
                            className="fa fa-copy"
                            title="Copy"
                            onClick={() => handleCopy(msg.text)}
                          />
                          <i
                            className="fa fa-pencil"
                            title="Edit"
                            onClick={() => handleEdit(msg.text)}
                          />
                        </>
                      ) : (
                        <>
                          <i
                            className="fa fa-copy"
                            title="Copy"
                            onClick={() => handleCopy(msg.text)}
                          />
                          <i
                            className="fa fa-thumbs-up"
                            title="Like"
                            onClick={() => handleThumb(true)}
                          />
                          <i
                            className="fa fa-thumbs-down"
                            title="Dislike"
                            onClick={() => handleThumb(false)}
                          />
                          <i
                            className="fa fa-volume-up"
                            title="Read Aloud"
                            onClick={() => handleReadAloud(msg.text)}
                          />
                          <i
                            className="fa fa-sync"
                            title="Regenerate"
                            onClick={() => handleRegenerate(msg.id)}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {followUpSuggestions.length > 0 && (
                <div className="message followup-suggestions">
                  <div className="bubble suggestions-bubble">
                    Here are some follow‑up questions you can ask:
                    <div className="followups">
                      {followUpSuggestions.map((q, i) => (
                        <span
                          key={i}
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

              {errorMsg && <div className="error">{errorMsg}</div>}
              <div ref={chatEndRef} />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="input-form"
            style={{ position: "relative" }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask another question..."
              className="query-input"
              disabled={loading}
            />
            <button
              type="button"
              className="send-float-btn"
              onClick={() => (loading ? stopGenerating() : sendQuery(query))}
            >
              <i className={`send fa ${loading ? "fa-stop" : "fa-arrow-up"}`} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default AIChatBot;
