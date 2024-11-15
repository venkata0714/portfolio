import React, { useState, useRef } from "react";
import { styled, keyframes } from "@stitches/react";
import emailjs from "emailjs-com";
import "../styles/ContactPage.css";

function ContactPage() {
  const form = useRef();
  const [isSent, setIsSent] = useState(null); // null for no status, true for success, false for error

  const sendEmail = (e) => {
    e.preventDefault();

    setTimeout(() => {
      emailjs
        .sendForm(
          process.env.REACT_APP_EMAILJS_SERVICE_ID,
          process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
          form.current,
          process.env.REACT_APP_EMAILJS_USER_ID
        )
        .then(
          (result) => {
            console.log(result.text);
            setIsSent(true); // Set success status
            setTimeout(() => setIsSent(null), 3000); // Reset status after 2 seconds
          },
          (error) => {
            console.log(error.text);
            setIsSent(false); // Set error status
            setTimeout(() => setIsSent(null), 3000); // Reset status after 2 seconds
          }
        );

      e.target.reset(); // Clear the form fields after submission
    }, 200);

    e.target.reset();
  };

  return (
    <section id="contact" className="contact-page">
      <div className="contact-container">
        <div className="contact-div">
          <h2 className="section-header">Contact Me</h2>
          <h5 className="contact-info">
            Email:{" "}
            <a href="mailto:singhk6@mail.uc.edu" className="lead">
              singhk6@mail.uc.edu
            </a>{" "}
            ||{" "}
            <a href="mailto:kartavya.singh17@yahoo.com" className="lead">
              kartavya.singh17@yahoo.com
            </a>
          </h5>
          <h5 className="contact-info">
            Phone:{" "}
            <a href="tel:5138377683" className="lead">
              513-837-7683
            </a>
          </h5>
          <br />
          <h5 className="form-subheading">
            ...or feel free to get in touch with me by filling the form.
          </h5>
        </div>
        <div className="contact-form-container">
          <form ref={form} onSubmit={sendEmail} className="contact-form">
            <div className="input-group">
              <input
                type="text"
                name="from_name"
                placeholder="Your Name *"
                required
              />
              <input
                type="email"
                name="from_email"
                placeholder="Your Email *"
                required
              />
              <input type="tel" name="from_phone" placeholder="Your Phone" />
            </div>
            <div className="textarea-group">
              <textarea
                name="message"
                placeholder="Your Message *"
                required
              ></textarea>
            </div>
            <div className="button-group">
              <StyledButton type="submit">
                <ButtonShadow />
                <ButtonEdge />
                <ButtonLabel isSent={isSent}>
                  {isSent === true
                    ? "Message Sent ☑"
                    : isSent === false
                    ? "Failed to Send ☒"
                    : "Send Message"}
                </ButtonLabel>
              </StyledButton>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactPage;

const fillGreen = keyframes({
  "0%": { backgroundColor: "#fcbc1d", color: "#212529" }, // Initial yellow color
  "100%": { backgroundColor: "#28a745", color: "#FFFFFF" }, // Success green with white text
});

const fillRed = keyframes({
  "0%": { backgroundColor: "#fcbc1d", color: "#212529" }, // Initial yellow color
  "100%": { backgroundColor: "#dc3545", color: "#FFFFFF" }, // Error red with white text
});

// Styled Components for Button Parts
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

// Label inside the button, with conditional background based on isSent state
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

  // Conditional animation based on isSent state
  variants: {
    isSent: {
      true: {
        animation: `${fillGreen}  1.5s ease-in-out forwards`, // Apply green fill on success
      },
      false: {
        animation: `${fillRed}  1.5s ease-in-out forwards`, // Apply red fill on error
      },
    },
  },

  "&:hover": {
    backgroundColor: "#fcbc1d",
    color: "#FFFFFF",
    transform: "scale(1.05)",
  },
});

// Main Styled Button
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

export { StyledButton, ButtonLabel, ButtonShadow, ButtonEdge };
