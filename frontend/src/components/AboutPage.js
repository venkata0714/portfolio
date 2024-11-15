import React from "react";
import { styled } from "@stitches/react";
import "../styles/AboutPage.css";
import AboutImg from "../assets/img/Kartavya-Profile-Photo.jpg";
import Resume from "../assets/Singh_Kartavya_Resume2024.pdf";

function AboutPage() {
  return (
    <section className="about-section-container" id="about">
      <div className="about-div glass">
        <h2 className="section-title">ABOUT ME</h2>
        <h3 className="section-subtitle">Who I Am & What I Do</h3>
        <div className="about-container container grid">
          <img src={AboutImg} className="about-image" alt="Profile" />
          <div className="about-data">
            <div className="about-info grid">
              <div className="about-box">
                <i className="bx bxs-hourglass about-icon"></i>
                <h3 className="about-title">Coding Hours</h3>
                <span className="about-subtitle">900+ Hours</span>
              </div>
              <div className="about-box">
                <i className="bx bx-trophy about-icon"></i>
                <h3 className="about-title">Completed</h3>
                <span className="about-subtitle">42+ Projects</span>
              </div>
              <div className="about-box">
                <i className="bx bx-support about-icon"></i>
                <h3 className="about-title">LeetCode</h3>
                <span className="about-subtitle">246+ Solutions</span>
              </div>
            </div>
            <div className="about-box">
              <p className="about-description">
                I'm Kartavya Singh, a Computer Science student at the University
                of Cincinnati, passionate about creating impactful solutions
                with AI and experienced in Full Stack Development. My journey is
                driven by curiosity and a commitment to continuous learning
                through hackathons, personal projects, and real-world
                applications.
              </p>
            </div>

            <a href={Resume} download className="download-cv">
              <StyledButton>
                <ButtonShadow />
                <ButtonEdge />
                <ButtonLabel>Download Resume</ButtonLabel>
              </StyledButton>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutPage;

// Styled Components for Custom Button
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
      transform: "translateY(-6px)",
    },

    [`& ${ButtonShadow}`]: {
      transform: "translateY(4px)",
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
