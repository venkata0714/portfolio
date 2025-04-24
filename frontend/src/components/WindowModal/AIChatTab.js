// AIChatTab.js
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useSpeechInput } from "../../hooks/useSpeechInput";
import axios from "axios";
import { useSpring, animated } from "@react-spring/web";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { zoomIn } from "../../services/variants";
import { motion } from "framer-motion";
import "../../styles/AIChatBot.css";

const API_URL = process.env.REACT_APP_API_URI;
const MAX_QUERIES = 20;
const TOAST_THRESHOLD = 5;
const TYPING_DELAY = 0; // ms per character

const AIChatBot = ({ scrolled }) => {
  const [containerHeight, setContainerHeight] = useState("auto");
  const [chatStarted, setChatStarted] = useState(false);
  const [hasSavedChat, setHasSavedChat] = useState(false);
  const [query, setQuery] = useState("");
  const [interimQuery, setInterimQuery] = useState("");
  const { listening, start, stop } = useSpeechInput({
    onResult: (transcript, isFinal) => {
      setQuery(transcript);
      if (!isFinal) setInterimQuery(transcript);
      else setInterimQuery("");
    },
  });
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

  useLayoutEffect(() => {
    const updateHeight = () => {
      // grab each element by its class]
      let navH = document.querySelector(".navbar")?.offsetHeight ?? 0;
      if (!scrolled) {
        navH += 13;
      }
      const headH = document.querySelector(".header-bar")?.offsetHeight ?? 0;
      const titleH = document.querySelector(".title-bar")?.offsetHeight ?? 0;
      const buffer = 3; // extra gap

      // raw remaining space
      let remaining = window.innerHeight - (navH + headH + titleH + buffer);

      // clamp so we never go below 200px
      if (remaining < 200) remaining = 200;

      setContainerHeight(`${remaining}px`);
    };

    // measure once
    updateHeight();
    // re-measure on resize
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [scrolled]);

  // useEffect(() => {
  //   const updateScale = () => {
  //     const chatContainer = document.querySelector(".chat-container");
  //     const introContainer = document.querySelector(".intro-container");
  //     if (!chatContainer || !introContainer) return;
  //     const screenHeight = window.innerHeight;
  //     const screenWidth = window.innerWidth;
  //     let scaleValue = 1;
  //     if (screenHeight < 700 && screenWidth > 576) {
  //       scaleValue = screenHeight / 700;
  //     }
  //     chatContainer.style.zoom = `${scaleValue}`;
  //     introContainer.style.zoom = `${scaleValue}`;
  //   };

  //   updateScale();
  //   window.addEventListener("resize", updateScale);
  //   return () => window.removeEventListener("resize", updateScale);
  // }, []);

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
    "What skills have your developed from your experiences?",
    "Tell me about your full stack development experiences and projects journey.",
    "What are your top skills, what is your proficiency and how did you acquire them?",
  ];

  return (
    <div
      className={chatStarted ? "chat-container" : "intro-container"}
      style={{ height: containerHeight }}
    >
      {/* toast */}
      {showToast && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.25 }}
        >
          <span>You have {MAX_QUERIES - queriesSent} queries left today.</span>
          <button className="toast-close" onClick={() => setShowToast(false)}>
            ×
          </button>
        </motion.div>
      )}

      {chatStarted && (
        <div className="chat-header">
          <i
            className="fa fa-sync"
            title="Restart Chat"
            onClick={() => {
              setChatStarted(false);
              setChatHistory([]);
              setConversationMemory("");
              localStorage.removeItem("conversationHistory");
              localStorage.removeItem("conversationMemory");
            }}
          />
          <h2 className="chat-title proficient">Kartavya's AI Companion</h2>
        </div>
      )}

      {!chatStarted ? (
        <div className="intro-card">
          {/* If we have a saved chat, ask the user what they want: */}
          {hasSavedChat ? (
            <motion.div
              className="continue-prompt"
              initial={{ opacity: 0, scale: 1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3, ease: "easeInOut" }}
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
            variants={zoomIn(0)}
            style={{
              width: "fit-content",
              height: "auto",
              justifySelf: "center",
              display: "flex",
              marginBottom: "20px",
            }}
            initial="hidden"
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.3}
            dragTransition={{
              bounceStiffness: 250,
              bounceDamping: 15,
            }}
            whileTap={{ scale: 1.1 }}
            whileInView={"show"}
          >
            <animated.img
              src={`${process.env.PUBLIC_URL}/system-user.jpg`}
              alt="Profile"
              className={`profile-picture img-responsive img-circle${frames[frameIndex]}`}
              draggable="false"
              style={{
                boxShadow,
                transform: isHovering
                  ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1.03, 1.03, 1.03)`
                  : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
                transition: "transform 0.1s ease-out",
                border: "4px solid #edeeef",
                height: "200px",
                width: "200px",
                filter:
                  "grayscale(0%) brightness(0.9) contrast(1) saturate(0.6) hue-rotate(-30deg)",
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
            initial={{ opacity: 0, scale: 1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="chat-title proficient"
          >
            Kartavya's AI Companion
          </motion.h2>
          <motion.h4
            initial={{ opacity: 0, scale: 1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="chat-subtitle"
          >
            Meet my AI Companion: He knows all about my journey and loves to
            share.
          </motion.h4>
          <motion.p
            initial={{ opacity: 0, scale: 1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="suggestion-header"
          >
            Try asking:
          </motion.p>
          <ul className="suggestions-list">
            {starterQuestions.map((q, i) => (
              <motion.li
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.3, ease: "easeInOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
            initial={{ opacity: 0, scale: 1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            onSubmit={handleSubmit}
            className="input-form glass"
            style={{ position: "relative" }}
          >
            <motion.div
              className="mic-btn-container"
              whileInView={listening ? { scale: 1.2 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <button
                type="button"
                className={`mic-btn glass ${listening ? "active" : ""}`}
                onMouseDown={start}
                onMouseUp={stop}
                onTouchStart={start}
                onTouchEnd={stop}
                aria-label={listening ? "Release to stop" : "Hold to talk"}
              >
                <i className={`fa fa-microphone${listening ? "" : "-slash"}`} />
              </button>
            </motion.div>
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
          </motion.form>
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
            <motion.div
              className="mic-btn-container"
              whileInView={listening ? { scale: 1.2 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <button
                type="button"
                className={`mic-btn ${listening ? "active" : ""}`}
                onMouseDown={start}
                onMouseUp={stop}
                onTouchStart={start}
                onTouchEnd={stop}
                aria-label={listening ? "Release to stop" : "Hold to talk"}
              >
                <i className={`fa fa-microphone${listening ? "" : "-slash"}`} />
              </button>
            </motion.div>
            <input
              ref={inputRef}
              type="text"
              value={listening ? interimQuery : query}
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
