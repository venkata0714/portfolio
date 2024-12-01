import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { zoomIn } from "../../services/variants";
import { styled } from "@stitches/react";
import { fetchProjects } from "../../services/projectService";
import "../../styles/ProjectsListView.css";

function ProjectsListView() {
  const parentRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [cardStates, setCardStates] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    async function getProjects() {
      try {
        const data = await fetchProjects();
        setProjects(data.reverse());
        // Initialize card states for each project
        setCardStates(
          data.map(() => ({
            mousePosition: { x: 0, y: 0 },
            isHovering: false,
          }))
        );
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }
    getProjects();
  }, []);

  useEffect(() => {
    const container = parentRef.current; // Reference to the project-container

    if (!container) return;

    const handleScrollToTop = ([entry]) => {
      if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
        // If the container is not in view from the top direction
        container.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    };

    const observer = new IntersectionObserver(handleScrollToTop, {
      root: null, // Observe relative to the viewport
      threshold: 0, // Trigge
    });

    observer.observe(container);

    return () => {
      if (container) observer.unobserve(container); // Clean up observer
    };
  }, []);

  const scrollToCard = (clickedIndex) => {
    const container = parentRef.current;
    const cards = document.querySelectorAll(".project-card");

    if (container && cards.length > 0) {
      // First scroll to the top
      container.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      // After reaching the top, scroll down to the clicked card
      setTimeout(() => {
        const spacing = window.innerWidth <= 768 ? 45 : 60;

        let scrollOffset = 0;

        for (let i = 0; i < clickedIndex; i++) {
          const cardHeight = cards[i]?.getBoundingClientRect().height || 100; // Fallback for card height
          scrollOffset += cardHeight + (i < clickedIndex ? spacing : 0);
        }

        container.scrollTo({
          top: window.innerWidth <= 768 ? 52 + scrollOffset : scrollOffset, // Adjust based on container's offset
          behavior: "smooth",
        });
      }, 5); // Add a delay (500ms) to ensure the first scroll completes
    }
  };

  const calculateMarginBottom = (index, totalCards) => {
    if (index !== totalCards - 1) return "20px"; // No margin for non-last cards

    const cardHeight =
      document.querySelector(".project-card")?.getBoundingClientRect().height ||
      100; // Default height fallback

    const screenFactor = window.innerWidth <= 768 ? 5 : 20; // Dynamic spacing based on screen size
    const marginBottom =
      window.innerHeight - (98 + index * screenFactor + cardHeight);

    return `${Math.max(marginBottom, 20)}px`; // Ensure marginBottom is not negative
  };

  const handleMouseMove = (event, index) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 15;
    const y = (clientY - (rect.top + rect.height / 2)) / 15;

    setCardStates((prevStates) =>
      prevStates.map((state, i) =>
        i === index
          ? {
              ...state,
              mousePosition: { x, y },
            }
          : state
      )
    );
  };

  const handleMouseEnter = (index) => {
    setHoveredCard(index);
    setCardStates((prevStates) =>
      prevStates.map((state, i) =>
        i === index
          ? {
              ...state,
              isHovering: true,
            }
          : state
      )
    );
  };

  const handleMouseLeave = (index) => {
    setHoveredCard(null);
    setCardStates((prevStates) =>
      prevStates.map((state, i) =>
        i === index
          ? {
              ...state,
              isHovering: false,
              mousePosition: { x: 0, y: 0 },
            }
          : state
      )
    );
  };

  const totalCards = projects.length;

  return (
    <div ref={parentRef} className="project-container">
      {/* Project Cards */}
      {projects.map((project, index) => {
        const { mousePosition, isHovering } = cardStates[index] || {
          mousePosition: { x: 0, y: 0 },
          isHovering: false,
        };
        const topOffset = 48 + index * (window.innerWidth <= 768 ? 5 : 20);
        return (
          <motion.div
            key={index}
            className={`project-card`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.2 }}
            onMouseMove={(event) => handleMouseMove(event, index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
            onClick={() => scrollToCard(index)}
            style={{
              top: `${topOffset}px`,
              // top: `${90 + index * 20}px`,
              marginBottom: calculateMarginBottom(index, totalCards),
              transform: isHovering
                ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
                : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
              transition: "transform 0.1s ease-out",
            }}
          >
            {hoveredCard === index && (
              <div className="hover-tooltip">{project.projectTitle}</div>
            )}
            {/* Project Content */}
            <div className="project-info" id={project.projectLink}>
              <div className="project-header">
                {project.projectSubTitle && (
                  <span>{project.projectSubTitle} | </span>
                )}
                <span>{project.projectTimeline}</span>
              </div>
              <a
                className="project-title"
                href={`#${project.projectLink}`}
                onClick={(e) => {
                  e.preventDefault(); // Prevent default anchor behavior
                  scrollToCard(index);
                }}
              >
                {project.projectTitle}
              </a>
              <hr />
              <p className="project-tagline">{project.projectTagline}</p>
              <motion.div
                className="learn-button-motioned"
                variants={zoomIn(1)}
                initial="hidden"
                animate="show"
                drag
                dragConstraints={{
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
                dragElastic={0.3}
                dragTransition={{
                  bounceStiffness: 250,
                  bounceDamping: 15,
                }}
              >
                <StyledButton
                  onClick={(e) => {
                    e.preventDefault();
                    // handleLearnMore(index);
                  }}
                >
                  <ButtonShadow />
                  <ButtonEdge />
                  <ButtonLabel>Learn More →</ButtonLabel>
                </StyledButton>
              </motion.div>
            </div>

            {/* Project Image */}
            <div
              className="project-image"
              style={{
                backgroundImage: `url(${project.projectImages[0]})`,
              }}
            ></div>
          </motion.div>
        );
      })}
      {/* 
          {showModal && selectedProject && (
            <motion.div
              className="project-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            ></motion.div>
          )} */}
    </div>
  );
}

export default ProjectsListView;

// Styled Components for Button
const ButtonPart = styled("span", {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  borderRadius: 8,
});

const ButtonShadow = styled(ButtonPart, {
  background: "hsl(0deg 0% 0% / 0.1)",
  transform: "translateY(2px)",
  transition: "transform 250ms ease-out",
});

const ButtonEdge = styled(ButtonPart, {
  background: `linear-gradient(
        to left,
        hsl(0deg 0% 69%) 0%,
        hsl(0deg 0% 85%) 8%,
        hsl(0deg 0% 85%) 92%,
        hsl(0deg 0% 69%) 100%
      )`,
});

const ButtonLabel = styled("span", {
  fontFamily: "Montserrat",
  fontSize: "14px",
  display: "block",
  position: "relative",
  borderRadius: 5,
  color: "#212529",
  padding: "1rem 1.5rem",
  background: "#f8f9fa",
  transform: "translateY(-4px)",
  width: "100%",
  userSelect: "none",
  transition:
    "transform 250ms ease-out, background-color 0.3s ease, color 0.3s ease",

  "&:hover": {
    backgroundColor: "#fcbc1d",
    color: "#212529",
    transform: "scale(1.05)",
  },
});

const StyledButton = styled("button", {
  border: "none",
  fontWeight: 600,
  width: "fit-content",
  cursor: "pointer",
  background: "transparent",
  position: "relative",
  padding: 0,
  transition: "filter 250ms ease-out",

  "&:hover": {
    filter: "brightness(110%)",

    [`& ${ButtonLabel}`]: {
      transform: "translateY(-8px)",
    },

    [`& ${ButtonShadow}`]: {
      transform: "translateY(6px)",
    },
  },

  "&:active": {
    [`& ${ButtonLabel}`]: {
      transform: "translateY(-2px)",
      transition: "transform 34ms",
    },

    [`& ${ButtonShadow}`]: {
      transform: "translateY(1px)",
      transition: "transform 34ms",
    },
  },
});
