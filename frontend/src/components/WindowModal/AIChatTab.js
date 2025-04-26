// AIChatTab.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSpeechInput } from "../../hooks/useSpeechInput";
import axios from "axios";
import { useSpring, animated } from "@react-spring/web";
import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
import { scale, zoomIn } from "../../services/variants";
import { motion } from "framer-motion";
import "../../styles/AIChatBot.css";

const API_URL = process.env.REACT_APP_API_URI;
const MAX_QUERIES = 20;
const TOAST_THRESHOLD = 5;
const TYPING_DELAY = 0; // ms per character

const AIChatBot = ({ scrolled, initialQuery }) => {
  const [chatStarted, setChatStarted] = useState(false);
  const [hasSavedChat, setHasSavedChat] = useState(false);
  const [query, setQuery] = useState("");
  const [spoken, setSpoken] = useState(false);
  const [interimQuery, setInterimQuery] = useState("");
  const { listening, supported, permission, start, stop } = useSpeechInput({
    onResult: (transcript, isFinal) => {
      if (isFinal) {
        setSpoken(true);
        // append final transcript onto existing query
        setQuery((q) => q + transcript);
        setInterimQuery("");
      } else {
        setInterimQuery(transcript);
      }
    },
  });
  const micDisabled = !supported || permission === "denied";

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

  // when the tab first mounts (or if initialQuery changes), fire the query
  const didAutoSend = useRef(false);

  // --- Daily reset & restore ---
  useEffect(() => {
    try {
      const storedDate = localStorage.getItem("lastUpdated");
      const today = new Date().toISOString().slice(0, 10);
      if (storedDate !== today) {
        localStorage.setItem("queriesSent", "0");
        localStorage.setItem("conversationMemory", "");
        localStorage.removeItem("conversationHistory");
        localStorage.setItem("lastUpdated", today);
        setChatStarted(false);
        setChatHistory([]);
        setQueriesSent(0);
        setConversationMemory("");
      } else {
        const sent = parseInt(localStorage.getItem("queriesSent") || "0", 10);
        setQueriesSent(isNaN(sent) ? 0 : sent);
        setConversationMemory(localStorage.getItem("conversationMemory") || "");
        const saved = localStorage.getItem("conversationHistory");
        setHasSavedChat(!!(saved && JSON.parse(saved).length));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("conversationHistory", JSON.stringify(chatHistory));
    } else {
      // localStorage.removeItem("conversationHistory");
    }
  }, [chatHistory]);

  // --- Load reactive avatar ---
  const [clicked, setClicked] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const clickCount = useRef(0); // Use useRef to keep track of click count across renders
  const [key, setKey] = useState(0); // State to reset the animation on click
  const [frameIndex, setFrameIndex] = useState(0); // Track current frame index
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const frames = ["", " frame1", " frame2", " frame3"]; // Define frame styles
  const handleProfileClick = () => {
    setFrameIndex((prevIndex) => (prevIndex + 1) % frames.length); // Cycle frames
  };

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 10;
    const y = (clientY - (rect.top + rect.height / 2)) / 10;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const { boxShadow } = useSpring({
    boxShadow: clicked
      ? "0px 15px 30px rgba(0, 0, 0, 0.3)"
      : "0px 8px 15px rgba(0, 0, 0, 0.1)",
    config: { duration: 100, tension: 300, friction: 10 },
    onRest: () => setClicked(false),
  });

  const handleClick = () => {
    if (isCooldown) return; // Prevent clicks during cooldown

    setClicked(true); // Trigger animation
    clickCount.current += 1;

    if (clickCount.current >= 5) {
      setIsCooldown(true);
      clickCount.current = 0; // Reset click count after reaching the limit

      // End cooldown after 2 seconds
      setTimeout(() => {
        setIsCooldown(false);
      }, 1000);
    }
  };

  // Effect to reset click count if no further clicks are registered within 5 seconds
  useEffect(() => {
    if (clickCount.current > 0 && !isCooldown) {
      const resetTimeout = setTimeout(() => {
        clickCount.current = 0;
      }, 5000);

      return () => clearTimeout(resetTimeout); // Clean up timeout
    }
  }, [isCooldown]);

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
  const delay = useCallback(
    (ms) => new Promise((res) => setTimeout(res, ms)),
    []
  );

  // memoize sendQuery so its identity only changes when its inputs change
  const sendQuery = useCallback(
    async (userQuery) => {
      setQuery("");
      setInterimQuery("");
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

      // 0) Insert user bubble
      const userId = Date.now();
      setChatHistory((h) => [
        ...h,
        { id: userId, sender: "user", text: trimmed },
      ]);

      // 1) Insert AI bubble → "Thinking..."
      setLoading(true);
      const aiId = userId + 1;
      setChatHistory((h) => [
        ...h,
        { id: aiId, sender: "ai", text: "Thinking..." },
      ]);
      // 1) get optimized query
      const { data: optRes } = await axios.post(
        `${API_URL}/ai/optimize-query`,
        { query: trimmed, conversationMemory }
      );
      const optimized = optRes.optimizedQuery || trimmed;
      console.log(optimized);
      await delay(300); // let UI settle

      if (!cancelRef.current) {
        setChatHistory((h) =>
          h.map((m) =>
            m.id === aiId ? { ...m, text: "Gathering Context..." } : m
          )
        );
      }
      // 3) Fire the main chat API
      const askPromise = axios.post(`${API_URL}/ai/ask-chat`, {
        query: optimized,
        conversationMemory,
      });
      // 4) Stage transitions
      await delay(300);

      try {
        // 7) Show “Generating Response…”
        if (!cancelRef.current) {
          setChatHistory((h) =>
            h.map((m) =>
              m.id === aiId ? { ...m, text: "Generating Response..." } : m
            )
          );
        }
        // 5) Await the answer
        const { data } = await askPromise;
        if (cancelRef.current) throw new Error("cancelled");
        const answerText = data.answer || "";
        await delay(300);

        // 6) Immediately kick off follow‑ups
        const suggestPromise = axios.post(
          `${API_URL}/ai/suggestFollowUpQuestions`,
          {
            query: optimized,
            response: answerText,
            conversationMemory: conversationMemory,
          }
        );

        // 8) Snapshot memory
        const memRes = await axios.post(`${API_URL}/ai/snapshotMemoryUpdate`, {
          previousMemory: conversationMemory,
          query: optimized,
          response: answerText,
        });
        if (cancelRef.current) throw new Error("cancelled");
        // 7) Show “Updating Conversation Memory & Formatting Response…”
        if (!cancelRef.current) {
          setChatHistory((h) =>
            h.map((m) =>
              m.id === aiId
                ? { ...m, text: "Updating Conversation Memory…" }
                : m
            )
          );
        }
        const newMem = memRes.data.memory;
        setConversationMemory(newMem);
        localStorage.setItem("conversationMemory", newMem);
        await delay(300);

        // 9) Increment count
        const newCount = queriesSent + 1;
        setQueriesSent(newCount);
        localStorage.setItem("queriesSent", String(newCount));

        // 🔟 Typewriter reveal, two letters at a time
        let built = "";
        for (let i = 0; i < answerText.length; i += 3) {
          if (cancelRef.current) break;

          // take 2 chars (or whatever remains)
          built += answerText.slice(i, i + 3);

          // capture the current snapshot
          const textToShow = built;

          // now this callback only ever references textToShow, which is
          // a fresh const on each iteration
          setChatHistory((h) =>
            h.map((m) => (m.id === aiId ? { ...m, text: textToShow } : m))
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
    },
    [chatStarted, conversationMemory, delay, queriesSent]
  );

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

  useEffect(() => {
    if (initialQuery && !didAutoSend.current) {
      didAutoSend.current = true;
      sendQuery(initialQuery);
    }
  }, [initialQuery, sendQuery]);

  const starterQuestions = [
    "What skills have your developed from your experiences?",
    "Tell me about your full stack development experiences and projects journey.",
    "What are your top skills, what is your proficiency and how did you acquire them?",
  ];

  return (
    <div className={chatStarted ? "chat-container" : "intro-container"}>
      {/* toast */}
      {showToast && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          whileHover={{
            scale: 1.01,
            transition: { delay: 0 },
          }}
          whileTap={{
            scale: 0.99,
            transition: { delay: 0 },
          }}
          transition={{ duration: 0.25 }}
        >
          <span>You have {MAX_QUERIES - queriesSent} queries left today.</span>
          <motion.button
            whileHover={{
              scale: 1.05,
              transition: { delay: 0 },
              color: "lightcoral",
            }}
            whileTap={{
              scale: 0.95,
              transition: { delay: 0 },
            }}
            className="toast-close"
            onClick={() => setShowToast(false)}
          >
            ×
          </motion.button>
        </motion.div>
      )}

      {chatStarted && (
        <motion.div
          className="chat-header"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "ease", duration: 0.2 }}
        >
          <motion.i
            className="fa fa-sync"
            title="Restart Chat"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "ease" }}
            whileHover={{
              scale: 1.1,
              transition: { delay: 0 },
            }}
            whileTap={{
              scale: 0.9,
              transition: { delay: 0 },
            }}
            onClick={() => {
              setChatStarted(false);
              setChatHistory([]);
              setHasSavedChat(false);
              setConversationMemory("");
              localStorage.removeItem("conversationHistory");
              localStorage.removeItem("conversationMemory");
            }}
          />
          <h2 className="chat-title proficient">Kartavya's AI Companion</h2>
        </motion.div>
      )}

      {!chatStarted ? (
        <div className="intro-card">
          {/* If we have a saved chat, ask the user what they want: */}
          {hasSavedChat ? (
            <motion.div
              className="continue-prompt"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "ease", scale: { delay: 0 } }}
              whileHover={{
                scale: 1.05,
                transition: { delay: 0 },
              }}
              whileTap={{
                scale: 0.95,
                transition: { delay: 0 },
              }}
            >
              <button
                className="btn-continue"
                onClick={() => {
                  // load the saved chat
                  const saved = JSON.parse(
                    localStorage.getItem("conversationHistory") || "[]"
                  );
                  setChatHistory(saved);
                  setConversationMemory(
                    localStorage.getItem("conversationMemory") || ""
                  );
                  setQueriesSent(
                    parseInt(localStorage.getItem("queriesSent") || "0", 10)
                  );
                  setChatStarted(true);
                }}
              >
                Continue from previous chat{" "}
                <i className="fa fa-arrow-right" aria-hidden="true" />
              </button>
            </motion.div>
          ) : null}
          <motion.div
            className={`profile-picture-container`}
            variants={zoomIn(0.6)}
            style={{
              width: "fit-content",
              height: "auto",
              justifySelf: "center",
              display: "flex",
              marginBottom: "20px",
            }}
            initial="hidden"
            animate="show"
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.3}
            dragTransition={{
              bounceStiffness: 250,
              bounceDamping: 15,
            }}
            transition={{ scale: { delay: 0, type: "easeInOut" } }}
            whileTap={{
              scale: 1.1,
              transition: { delay: 0, type: "spring" },
            }}
          >
            <animated.img
              src={`${process.env.PUBLIC_URL}/system-user.jpg`}
              alt="Profile"
              className={` img-responsive img-circle${frames[frameIndex]}`}
              draggable="false"
              style={{
                boxShadow,
                transform: isHovering
                  ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1.03, 1.03, 1.03)`
                  : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
                transition: "transform 0.1s ease-out",
              }}
              // onHover={{ border: "4px solid #fcbc1d !important" }}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => {
                handleClick();
                handleProfileClick();
              }}
            />
          </motion.div>
          {/* <img
            src={`${process.env.PUBLIC_URL}/system-user.jpg`}
            alt="AI"
            className="avatar intro-avatar"
          /> */}
          <motion.h2
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "ease" }}
            className="chat-title proficient"
          >
            Kartavya's AI Companion
          </motion.h2>
          <motion.h4
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: "ease" }}
            className="chat-subtitle"
          >
            Meet my AI Companion: He knows all about my journey and loves to
            share.
          </motion.h4>
          <motion.p
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, type: "ease" }}
            className="suggestion-header"
          >
            Try asking:
          </motion.p>
          <ul className="suggestions-list">
            {starterQuestions.map((q, i) => (
              <motion.li
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 1 + 0.1 * i,
                  type: "ease",
                  scale: { delay: 0, type: "easeInOut" },
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { delay: 0, type: "ease" },
                }}
                whileTap={{
                  scale: 0.95,
                  transition: { delay: 0, type: "ease" },
                }}
                key={i}
                className="suggestion-item"
                onClick={() => {
                  handleSuggestionClick(q);
                  setChatStarted(true);
                  localStorage.setItem(
                    "conversationHistory",
                    JSON.stringify([])
                  );
                  localStorage.setItem("conversationMemory", "");
                }}
              >
                {q}
              </motion.li>
            ))}
          </ul>
          <motion.form
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, scale: { delay: 0, type: "ease" } }}
            whileHover={{
              scale: 1.1,
              transition: { delay: 0, type: "easeInOut" },
            }}
            whileTap={{
              scale: 1.075,
              transition: { delay: 0, type: "easeInOut" },
            }}
            onSubmit={handleSubmit}
            className="input-form glass"
            style={{ position: "relative", background: "#343a40" }}
          >
            <motion.div
              className="mic-btn-container"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.3}
              dragTransition={{
                bounceStiffness: 250,
                bounceDamping: 15,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <button
                type="button"
                className={`mic-btn glass ${listening ? "active" : ""}`}
                // onMouseDown={start}
                // onMouseUp={stop}
                // onTouchStart={start}
                // onTouchEnd={stop}
                onClick={() => (listening ? stop() : start())}
                aria-label={listening ? "Click to stop" : "Click to talk"}
                disabled={loading || micDisabled}
              >
                <i className={`fa fa-microphone${listening ? "" : "-slash"}`} />
              </button>
            </motion.div>
            <input
              ref={inputRef}
              type="text"
              value={listening ? interimQuery : query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`${
                loading
                  ? "Generating Response..."
                  : listening
                  ? "Listening... Please ask!"
                  : "Ask any question about me!"
              }`}
              onKeyDown={(e) => {
                // Enter=send, Shift+Enter=newline
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              className="query-input"
              disabled={loading}
            />
            <motion.button
              type="button"
              className="send-float-btn"
              animate={{ translateY: "-50%" }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.3}
              dragTransition={{
                bounceStiffness: 250,
                bounceDamping: 15,
              }}
              whileHover={{
                scale: 1.1,
                translateY: "-50%",
                transition: { delay: 0 },
              }}
              whileTap={{
                scale: 0.9,
                translateY: "-50%",
                transition: { delay: 0 },
              }}
              onClick={() => (loading ? stopGenerating() : sendQuery(query))}
            >
              <motion.i
                drag="false"
                className={`fa ${loading ? "fa-stop" : "fa-arrow-up"}`}
              />
            </motion.button>
          </motion.form>
        </div>
      ) : (
        <>
          <div className="chat-messages">
            <div className="message-window">
              {chatHistory.map((msg, id) => (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ scale: { delay: 0, type: "spring" } }}
                  key={msg.id}
                  className={`message ${msg.sender}`}
                >
                  <motion.img
                    src={`${process.env.PUBLIC_URL}/${
                      msg.sender === "ai" ? "system-user.jpg" : "user-icon.svg"
                    }`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: msg.sender === "ai" ? 0.5 : 0.3,
                      type: "ease",
                      scale: { delay: 0, type: "ease" },
                    }}
                    whileHover={{
                      scale: 1.05,
                      transition: { delay: 0 },
                    }}
                    whileTap={{
                      scale: 0.95,
                      transition: { delay: 0 },
                    }}
                    alt={msg.sender}
                    className={`avatar ${msg.sender}-avatar`}
                  />
                  <motion.div
                    className="bubble-container"
                    initial={{
                      opacity: 0,
                      x: msg.sender === "ai" ? -40 : 40,
                      y: 10,
                      scale: 0.8,
                    }}
                    animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    transition={{
                      delay: msg.sender === "ai" ? 0.55 : 0.35,
                      type: "easeInOut",
                      duration: 0.2,
                      scale: { delay: 0, type: "ease" },
                    }}
                  >
                    <div className="bubble">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    <div
                      className={`actions ${
                        msg.sender === "ai" ? "ai" : "user"
                      } ${msg.id === latestAIId ? "always-show" : ""}`}
                      initial={
                        msg.id === latestAIId ? { opacity: 1 } : { opacity: 0 }
                      }
                      animate={
                        msg.id === latestAIId ? { opacity: 1 } : { opacity: 0 }
                      }
                    >
                      {msg.sender === "user" ? (
                        <>
                          <motion.i
                            className="fa fa-copy"
                            title="Copy"
                            onClick={() => handleCopy(msg.text)}
                            style={{ display: "inline-block" }}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.05, type: "ease" }}
                            whileHover={{
                              scale: 1.1,
                              transition: { type: "ease", delay: 0 },
                            }}
                            whileTap={{
                              scale: 0.9,
                              transition: { type: "ease", delay: 0 },
                            }}
                          />
                          <motion.i
                            className="fa fa-pencil"
                            title="Edit"
                            onClick={() => handleEdit(msg.text)}
                            style={{ display: "inline-block" }}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, type: "ease" }}
                            whileHover={{
                              scale: 1.1,
                              transition: { type: "ease", delay: 0 },
                            }}
                            whileTap={{
                              scale: 0.9,
                              transition: { type: "ease", delay: 0 },
                            }}
                          />
                        </>
                      ) : (
                        <>
                          {[
                            "copy",
                            "thumbs-up",
                            "thumbs-down",
                            "volume-up",
                            "sync",
                          ].map((icon, id) => (
                            <motion.i
                              key={icon}
                              className={`fa fa-${icon}`}
                              title={icon}
                              onClick={() => {
                                if (icon === "copy") handleCopy(msg.text);
                                if (icon === "thumbs-up") handleThumb(true);
                                if (icon === "thumbs-down") handleThumb(false);
                                if (icon === "volume-up")
                                  handleReadAloud(msg.text);
                                if (icon === "sync") handleRegenerate(msg.id);
                              }}
                              style={{ display: "inline-block" }}
                              initial={{ opacity: 0, scale: 0 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              exit={{
                                opacity: 0,
                                transition: {
                                  delay: 0,
                                  type: "ease",
                                },
                              }}
                              transition={{ delay: 0.25 - 0.05 * id }}
                              whileHover={{
                                scale: 1.1,
                                transition: { type: "ease", delay: 0 },
                              }}
                              whileTap={{
                                scale: 0.9,
                                transition: { type: "ease", delay: 0 },
                              }}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              ))}

              {followUpSuggestions.length > 0 && (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ scale: { delay: 0, type: "spring" } }}
                  className="message followup-suggestions"
                >
                  <motion.div
                    className="bubble suggestions-bubble"
                    initial={{ opacity: 0, scale: 0.8, x: 40, y: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    transition={{
                      delay: 0.35,
                      type: "easeInOut",
                      duration: 0.2,
                      scale: { delay: 0, type: "ease" },
                    }}
                  >
                    Here are some follow-up questions you can ask:
                    <div className="followups">
                      {followUpSuggestions.map((q, i) => (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: 0.1 + 0.1 * i,
                            scale: { delay: 0, type: "ease" },
                          }}
                          viewport={{ once: true }}
                          whileHover={{
                            scale: 1.01,
                            transition: { delay: 0 },
                          }}
                          whileTap={{
                            scale: 0.99,
                            transition: { delay: 0 },
                          }}
                          key={i}
                          className="suggestion-chip"
                          onClick={() => handleSuggestionClick(q)}
                        >
                          {q}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                  <img
                    src={`${process.env.PUBLIC_URL}/user-icon.svg`}
                    alt="You"
                    className="avatar user-avatar-followup"
                  />
                </motion.div>
              )}

              {errorMsg && <div className="error">{errorMsg}</div>}
              <div ref={chatEndRef} />
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, scale: { delay: 0, type: "ease" } }}
            whileHover={{
              scale: 1.01,
              transition: { delay: 0, type: "easeInOut" },
            }}
            whileTap={{ scale: 1, transition: { delay: 0, type: "easeInOut" } }}
            onSubmit={handleSubmit}
            className="input-form glass"
            style={{ position: "relative", background: "#343a40" }}
            disabled={loading}
          >
            <motion.div
              className="mic-btn-container"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.3}
              dragTransition={{
                bounceStiffness: 250,
                bounceDamping: 15,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <button
                type="button"
                className={`mic-btn ${listening ? "active" : ""}`}
                // onMouseDown={start}
                // onMouseUp={stop}
                // onTouchStart={start}
                // onTouchEnd={stop}
                onClick={() => (listening ? stop() : start())}
                aria-label={listening ? "Click to stop" : "Click to talk"}
                disabled={loading || micDisabled}
              >
                <i className={`fa fa-microphone${listening ? "" : "-slash"}`} />
              </button>
            </motion.div>
            <input
              ref={inputRef}
              type="text"
              value={listening ? interimQuery : query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`${
                loading
                  ? "Generating Response..."
                  : listening
                  ? "Listening your Question, Please Speak!"
                  : "Ask another question!"
              }`}
              className="query-input"
              disabled={loading}
            />
            <motion.button
              type="button"
              className="send-float-btn"
              animate={{ translateY: "-50%" }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.3}
              dragTransition={{
                bounceStiffness: 250,
                bounceDamping: 15,
              }}
              whileHover={{
                scale: 1.1,
                translateY: "-50%",
                transition: { delay: 0 },
              }}
              whileTap={{
                scale: 0.9,
                translateY: "-50%",
                transition: { delay: 0 },
              }}
              onClick={() => (loading ? stopGenerating() : sendQuery(query))}
            >
              <motion.i
                drag="false"
                className={`fa ${loading ? "fa-stop" : "fa-arrow-up"}`}
              />
            </motion.button>
          </motion.form>
        </>
      )}
    </div>
  );
};

export default AIChatBot;
