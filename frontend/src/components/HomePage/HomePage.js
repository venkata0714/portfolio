import React, { useState, useEffect, useRef } from "react";
import { styled } from "@stitches/react";
import { TypeAnimation } from "react-type-animation";
// import { Parallax } from "react-parallax";
import { useSpring, animated } from "@react-spring/web";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { zoomIn } from "../../services/variants";
import "../../styles/HomePage.css";
import ProfilePhoto from "../../assets/img/media/Kartavya.jpg";

function HomePage({ isBatterySavingOn, scrolled }) {
  const [clicked, setClicked] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const clickCount = useRef(0); // Use useRef to keep track of click count across renders
  const [key, setKey] = useState(0); // State to reset the animation on click
  const [frameIndex, setFrameIndex] = useState(0); // Track current frame index
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const frames = ["", " frame1", " frame2", " frame3"]; // Define frame styles
  const HomeBGRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: HomeBGRef,
    offset: ["start start", "end start"],
    axis: "y",
    smooth: true,
  });
  const blur = useTransform(scrollYProgress, [0, 1], [2, 5]);
  // useEffect(() => {
  //   if (!scrolled) {
  //     blur.set(0);
  //   }
  // }, [scrolled, blur, scrollYProgress]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.6]);
  const opacity = useTransform(scrollYProgress, [0.25, 1], [0.85, 1]);

  // Local state to hold formatted blur string
  const [filterStyle, setFilterStyle] = useState("blur(0px)");

  // Subscribe to changes on the blur motion value
  useEffect(() => {
    const unsubscribe = blur.onChange((latest) => {
      // If you want to set blur to 0 when the value is below a threshold:
      const value = latest <= 2.3 ? 0 : latest;
      setFilterStyle(`blur(${value}px)`);
    });
    return unsubscribe;
  }, [blur]);

  const handleProfileClick = () => {
    setFrameIndex((prevIndex) => (prevIndex + 1) % frames.length); // Cycle frames
  };

  const keywords = [
    "Developing with Curiosity and Expertise | Always Learning & Innovating",
    "Innovating AI-Powered Solutions | Experienced Full Stack Developer",
  ];

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

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    const offset = 52; // Adjust based on your navbar height
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
      duration: 10000,
    });
  };

  return (
    <AnimatePresence>
      <div>
        <motion.div
          className="homepage-bg"
          key={scrollYProgress}
          ref={HomeBGRef}
          style={
            isBatterySavingOn
              ? {}
              : {
                  opacity,
                  scale,
                  // filter: `blur(${scrolled ? blur.current : 0}px)`,
                  filter: filterStyle,
                  zIndex: -1,
                }
          }
        />
        <section className="homepage-container" id="home">
          <div className="container">
            <div className="home-row">
              <motion.div
                className={`profile-picture-container`}
                variants={isBatterySavingOn ? {} : zoomIn(0)}
                initial="hidden"
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.3}
                dragTransition={{
                  bounceStiffness: 250,
                  bounceDamping: 15,
                }}
                whileTap={isBatterySavingOn ? {} : { scale: 1.1 }}
                whileInView={"show"}
              >
                <animated.img
                  src={ProfilePhoto}
                  alt="Profile"
                  className={`profile-picture img-responsive img-circle${frames[frameIndex]}`}
                  draggable="false"
                  style={{
                    boxShadow,
                    transform: isBatterySavingOn
                      ? {}
                      : isHovering
                      ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1.03, 1.03, 1.03)`
                      : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
                    transition: "transform 0.1s ease-out",
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => {
                    handleClick();
                    handleProfileClick();
                  }}
                />
              </motion.div>
            </div>
            <div className="home-row">
              <motion.h1
                className="name"
                variants={isBatterySavingOn ? {} : zoomIn(0)}
                initial="hidden"
                animate="show"
              >
                Kartavya Singh
              </motion.h1>

              {/* Changing Text Animation */}
              <motion.div
                className="changing-text-container"
                onClick={() => setKey((prevKey) => prevKey + 1)}
                variants={isBatterySavingOn ? {} : zoomIn(0)}
                initial="hidden"
                animate="show"
              >
                <em>
                  <span className="changing-text">
                    <TypeAnimation
                      key={key} // Forces the component to re-render on click
                      className="changing-text-animation"
                      sequence={[
                        1500,
                        ...keywords.map((text) => [text, 3000]), // Typing each keyword with a pause
                        keywords[keywords.length - 1], // Ensures the last phrase displays permanently
                      ].flat()}
                      speed={{ type: "keyStrokeDelayInMs", value: 17 }} // Fast typing
                      deletionSpeed={{ type: "keyStrokeDelayInMs", value: 8 }}
                      // delay={1000}
                      repeat={0} // No repeat
                      cursor={true}
                    />
                  </span>
                </em>
              </motion.div>

              {/* Styled "Enter Portfolio" Button */}
              <motion.div
                className="enter-button-motioned"
                variants={isBatterySavingOn ? {} : zoomIn(0)}
                initial="hidden"
                animate="show"
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.3}
                dragTransition={{
                  bounceStiffness: 250,
                  bounceDamping: 15,
                }}
              >
                <StyledButton
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("about");
                  }}
                >
                  <ButtonShadow />
                  <ButtonEdge />
                  <ButtonLabel>Enter Portfolio</ButtonLabel>
                </StyledButton>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </AnimatePresence>
  );
}

export default HomePage;

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
  fontSize: "18px",
  display: "block",
  position: "relative",
  borderRadius: 5,
  color: "#212529",
  padding: "1.25rem 2.5rem",
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
