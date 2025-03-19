import React, { useState, useEffect, useRef } from "react";
import "../../styles/FeedTab.css";

const FEEDS_PER_PAGE = 5;
const PREVIEW_LIMIT = 250;

const FeedTab = () => {
  const [feeds, setFeeds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedFeeds, setExpandedFeeds] = useState({});
  const [globalExpanded, setGlobalExpanded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const response = await fetch("/api/getFeeds");
        if (response.ok) {
          const data = await response.json();
          setFeeds(
            data.sort(
              (a, b) => new Date(b.feedCreatedAt) - new Date(a.feedCreatedAt)
            )
          );
        } else {
          console.error("Failed to fetch feeds");
        }
      } catch (error) {
        console.error("Error fetching feeds:", error);
      }
    };
    fetchFeeds();
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(feeds.length / FEEDS_PER_PAGE);
    if (currentPage === totalPages) {
      setGlobalExpanded(feeds.length % FEEDS_PER_PAGE <= 3);
    } else {
      setGlobalExpanded(false);
    }
  }, [currentPage, feeds]);

  const toggleReadMore = (feedId) => {
    setExpandedFeeds((prev) => ({ ...prev, [feedId]: !prev[feedId] }));
  };

  const handleGlobalLoadMore = () => setGlobalExpanded(true);

  const handlePageChange = (page) => {
    if (!globalExpanded && page > currentPage) return;
    setCurrentPage(page);
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const totalPages = Math.ceil(feeds.length / FEEDS_PER_PAGE);
  const currentFeeds = feeds.slice(
    (currentPage - 1) * FEEDS_PER_PAGE,
    currentPage * FEEDS_PER_PAGE
  );

  const getImageURL = (feedImageURL) => {
    if (!feedImageURL) return "";
    if (typeof feedImageURL === "string") return feedImageURL;
    return feedImageURL.data.startsWith("data:")
      ? feedImageURL.data
      : `data:${feedImageURL.contentType};base64,${feedImageURL.data}`;
  };

  return (
    <div className="feed-tab" ref={containerRef}>
      <h1 className="feed-warning">Under Construction!</h1>
      <h1 className="feed-tab-title">Kartavya's Feed</h1>
      <p className="feed-tab-description">
        Welcome to your personalized Feed Tab, follow the latest updates and
        transformative moments.
      </p>

      <div className="feed-items">
        {(globalExpanded ? currentFeeds : currentFeeds.slice(0, 3)).map(
          (feed) => (
            <div key={feed._id.$oid} className="feed-item glass">
              {feed.feedImageURL && (
                <div
                  className="feed-item-image"
                  style={{
                    backgroundImage: `url(${getImageURL(feed.feedImageURL)})`,
                  }}
                />
              )}
              <div className="feed-item-container">
                <h2 className="feed-item-title">
                  {feed.feedLinks && feed.feedLinks.length > 0 ? (
                    <div className="feed-item-links">
                      {feed.feedLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          className="feed-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {feed.feedTitle}
                        </a>
                      ))}
                    </div>
                  ) : (
                    feed.feedTitle
                  )}
                </h2>

                {feed.feedCategory && feed.feedCategory.length > 0 && (
                  <div className="feed-item-categories">
                    {feed.feedCategory.map((cat, idx) => (
                      <span key={idx} className="feed-category">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                <div className="feed-item-content">
                  {!expandedFeeds[feed._id] ? (
                    <>
                      {feed.feedContent.join(" ").length > PREVIEW_LIMIT ? (
                        <>
                          {feed.feedContent.join(" ").slice(0, PREVIEW_LIMIT)}
                          ...
                          <button
                            className="read-more-btn"
                            onClick={() => toggleReadMore(feed._id)}
                          >
                            Read More ▼
                          </button>
                        </>
                      ) : (
                        feed.feedContent.join(" ")
                      )}
                    </>
                  ) : (
                    feed.feedContent.join(" ")
                  )}
                </div>

                <span className="feed-timestamp">
                  {feed.feedCreatedAt &&
                    new Date(feed.feedCreatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          )
        )}
      </div>

      {!globalExpanded && currentFeeds.length > 3 && (
        <button className="load-more-btn" onClick={handleGlobalLoadMore}>
          Load More &gt;&gt;&gt;
        </button>
      )}

      <div className="pagination">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i + 1}
            className={`page-btn ${i + 1 === currentPage ? "active" : ""}`}
            disabled={!globalExpanded && i + 1 > currentPage}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeedTab;
