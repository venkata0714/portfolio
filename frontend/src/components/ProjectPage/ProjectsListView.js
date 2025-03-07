import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCrown } from "react-icons/fa";
import { zoomIn } from "../../services/variants";
import { styled } from "@stitches/react";
import { fetchProjects } from "../../services/projectService";
import "../../styles/ProjectsListView.css";

function ProjectsListView({ addTab, isBatterySavingOn, showFeatured }) {
  const parentRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [cardStates, setCardStates] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  // State to track animation completion and force layout recalculations
  const [layoutTrigger, setLayoutTrigger] = useState(0);

  // New state variables for dynamic positioning
  const [baseTopOffset, setBaseTopOffset] = useState(0);
  const [offsetSpacing, setOffsetSpacing] = useState(0);
  const [lastCardMargin, setLastCardMargin] = useState(20);

  // A helper function to scroll to a section by ID
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    const offset = 52; // Adjust based on your navbar height
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - offset;
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    async function getProjects() {
      try {
        const data = await fetchProjects();
        // if (showFeatured) {
        //   const featuredProjects = data.filter((project) => project.featured);
        //   setProjects(featuredProjects.reverse());
        //   setProjects(data.reverse());
        // } else {
        //   setProjects(data.reverse());
        // }
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
  }, [showFeatured]);

  useEffect(() => {
    // Auto-scroll container to top if it scrolls upward out of view
    const container = parentRef.current;
    if (!container) return;
    const handleScrollToTop = ([entry]) => {
      if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
        container.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    const observer = new IntersectionObserver(handleScrollToTop, {
      root: null,
      threshold: 0,
    });
    observer.observe(container);
    return () => {
      if (container) observer.unobserve(container);
    };
  }, []);

  useEffect(() => {
    // Trigger layout recalculation on window resize
    const handleResize = () => setLayoutTrigger((prev) => prev + 1);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Calculate dynamic positioning so that cards are evenly spaced
    // and the last card fits perfectly within the container.
    // This runs when projects load, when animations complete, on battery-saving mode change, or on layoutTrigger.
    if (projects.length > 0) {
      const container = parentRef.current;
      if (container) {
        const containerHeight = container.clientHeight || window.innerHeight;
        const cards = container.querySelectorAll(".project-card");
        if (cards.length > 0) {
          // Use the last card's height as reference
          const lastCard = cards[cards.length - 1];
          const lastCardHeight = lastCard.getBoundingClientRect().height || 100;
          const marginB = 20; // minimum margin at the bottom of the last card
          // Base offset: a percentage of container height to leave at the top
          const baseOffset =
            containerHeight * (window.innerWidth <= 768 ? 0.05 : 0.1);
          let spacing = 0;
          if (projects.length > 1) {
            spacing =
              (containerHeight - baseOffset - lastCardHeight - marginB) /
              (projects.length - 1);
          }
          if (spacing < 0) spacing = 0;
          setBaseTopOffset(baseOffset);
          setOffsetSpacing(spacing);
          // Calculate remaining space to be used as bottom margin for the last card
          let remainingSpace =
            containerHeight -
            (baseOffset + (projects.length - 1) * spacing + lastCardHeight);
          if (remainingSpace < marginB) remainingSpace = marginB;
          setLastCardMargin(remainingSpace);
        }
      }
    }
  }, [projects, isBatterySavingOn, layoutTrigger]);

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
        const spacing = offsetSpacing;

        let scrollOffset = 0;

        for (let i = 0; i < clickedIndex; i++) {
          const cardHeight = cards[i]?.getBoundingClientRect().height || 100; // Fallback for card height
          scrollOffset += cardHeight + (i < clickedIndex ? spacing : 0);
        }

        container.scrollTo({
          top: window.innerWidth <= 768 ? 52 + scrollOffset : scrollOffset, // Adjust based on container's offset
          behavior: "smooth",
        });
        // const targetOffset = baseTopOffset + clickedIndex * offsetSpacing;
        // container.scrollTo({ top: targetOffset, behavior: "smooth" });
      }, 5); // A small delay so the first scroll completes
    }
  };

  const handleMouseMove = (event, index) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 15;
    const y = (clientY - (rect.top + rect.height / 2)) / 15;
    setCardStates((prevStates) =>
      prevStates.map((state, i) =>
        i === index ? { ...state, mousePosition: { x, y } } : state
      )
    );
  };

  const handleMouseEnter = (index) => {
    setHoveredCard(index);
    setCardStates((prevStates) =>
      prevStates.map((state, i) =>
        i === index ? { ...state, isHovering: true } : state
      )
    );
  };

  const handleMouseLeave = (index) => {
    setHoveredCard(null);
    setCardStates((prevStates) =>
      prevStates.map((state, i) =>
        i === index
          ? { ...state, isHovering: false, mousePosition: { x: 0, y: 0 } }
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
        // Use the computed baseTopOffset and offsetSpacing for dynamic positioning
        const topOffset = baseTopOffset + index * offsetSpacing;
        return (
          <motion.div
            key={`project-${project.projectTitle}-${index}`}
            className="project-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0, type: "spring" }}
            onMouseMove={(event) => handleMouseMove(event, index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
            onClick={() => {
              scrollToCard(index);
              scrollToSection("projects");
            }}
            style={{
              top: `${topOffset}px`,
              // For cards except the last one, we don't need extra bottom margin.
              // For the last card, use the calculated remaining space.
              marginBottom:
                index === totalCards - 1 ? `${lastCardMargin}px` : "0px",
              transform: isBatterySavingOn
                ? ``
                : isHovering
                ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
                : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
              transition: isBatterySavingOn ? {} : "transform 0.1s ease-out",
            }}
            viewport={{ amount: "50%", once: true }}
          >
            {hoveredCard === index && (
              <div className="hover-tooltip">{project.projectTitle}</div>
            )}
            {/* {project.featured && <FaCrown className="featured-tag" />} */}
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
                  e.preventDefault();
                  scrollToCard(index);
                }}
              >
                {project.projectTitle}
              </a>
              <hr />
              <p className="project-tagline">{project.projectTagline}</p>
              <motion.div
                className="learn-button-motioned"
                onClick={() => addTab("Project", project)}
                variants={zoomIn(1)}
                initial="hidden"
                animate="show"
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.3}
                dragTransition={{ bounceStiffness: 250, bounceDamping: 15 }}
              >
                <StyledButton
                  onClick={(e) => {
                    e.preventDefault();
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
              key={`project-image-${project.projectTitle}-${index}`}
              style={{
                backgroundImage: `url(${project.projectImages[0]})`,
              }}
            ></div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default ProjectsListView;

// StyledButton component and sub-components (for button styling)
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
