import React from "react";
import { motion } from "framer-motion";
import { fadeIn, zoomIn, staggerContainer } from "../../services/variants";
import "../../styles/ProjectTab.css";
import github from "../../assets/img/icons/github.png";
import youtube from "../../assets/img/icons/youtube.png";
import devpost from "../../assets/img/icons/devpost.png";
import web from "../../assets/img/icons/web.png";
import ImagesCarousel from "./ImageCarousel"; // Import ImageCarousel component

const YearInReviewTab = ({ data }) => {
  const renderLogos = (urls) => {
    if (!urls) return null; // Check if URLs exist

    return Object.entries(urls).map(([key, value]) => {
      const iconName = getIconForLink(value);
      return (
        <motion.a
          key={key}
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            initialDelay: 0.5 + 0.2 * key,
            type: "spring",
          }}
          whileHover={{
            scale: 1.1,
            rotate: 360,
          }}
          whileTap={{
            scale: 0.9,
            rotate: 0,
          }}
        >
          <img
            src={`${iconName}`}
            alt={`${iconName} logo`}
            className="project-window-logo"
          />
        </motion.a>
      );
    });
  };

  const getIconForLink = (link) => {
    if (link.includes("github")) return github;
    if (link.includes("youtube") || link.includes("youtu")) return youtube;
    if (link.includes("devpost")) return devpost;
    return web;
  };

  return (
    <>
      <motion.div className="project-window-tab-container">
        {/* Images Section */}
        {data.yearInReviewImages && (
          <div className="project-image-container">
            <ImagesCarousel
              data={data.yearInReviewImages} // Repeat images 9 times
              title={data.yearInReviewTitle || "Year In Review"}
            />
          </div>
        )}

        <motion.div
          className="project-window-content"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0, type: "spring" }}
        >
          {data.yearInReviewTitle && (
            <motion.h2 className="project-window-title">
              {data.yearInReviewTitle}
            </motion.h2>
          )}

          {data.yearInReviewSubTitle && (
            <motion.h3
              className="project-window-subtitle"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0, type: "spring" }}
            >
              {data.yearInReviewSubTitle}
            </motion.h3>
          )}

          {data.yearInReviewTimeline && (
            <motion.h4
              className="project-window-timeline"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0, type: "spring" }}
            >
              {data.yearInReviewTimeline}
            </motion.h4>
          )}

          {data.yearInReviewTagline && (
            <motion.h4
              className="project-window-tagline"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.3}
              dragTransition={{
                bounceStiffness: 250,
                bounceDamping: 15,
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{
                scale: 0.98,
                boxsizing: "border-box",
                outline: "1px solid limegreen !important",
              }}
              transition={{ delay: 0, type: "spring" }}
            >
              {data.yearInReviewTagline}
            </motion.h4>
          )}

          {data.yearInReviewURLs.length > 0 && (
            <motion.div
              className="project-window-urls"
              initial={{ opacity: 0, scale: 0 }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.3}
              dragTransition={{
                bounceStiffness: 250,
                bounceDamping: 15,
              }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ delay: 0, type: "spring" }}
            >
              {renderLogos(data.yearInReviewURLs)}
            </motion.div>
          )}

          {data.yearInReviewParagraphs &&
            data.yearInReviewParagraphs.length > 0 && (
              <motion.div
                className="project-window-paragraphs glass"
                variants={staggerContainer(0.2, 0.1)}
              >
                {data.yearInReviewParagraphs.map((para, index) => (
                  <motion.p
                    key={index}
                    className="project-window-paragraph"
                    variants={fadeIn("up", 20, index * 0.1)}
                  >
                    {para}
                  </motion.p>
                ))}
              </motion.div>
            )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default YearInReviewTab;
