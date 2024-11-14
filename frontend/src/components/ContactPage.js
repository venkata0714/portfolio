import { React, useState, useRef } from "react";
import { styled } from "@stitches/react";
import emailjs from "emailjs-com";
import "../styles/ContactPage.css";

function ContactPage() {
  const form = useRef(); // Reference for the form
  const [isSent, setIsSent] = useState(false); // Optional: state to track if the email was sent

  const sendEmail = (e) => {
    e.preventDefault(); // Prevents the default form submission behavior

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
          setIsSent(true); // Optional: Update state to show success message
        },
        (error) => {
          console.log(error.text);
        }
      );

    e.target.reset(); // Clear the form fields after submission
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
                <ButtonLabel>Send Message</ButtonLabel>
              </StyledButton>
            </div>
          </form>
          {isSent && <p>Your message has been sent!</p>}{" "}
          {/* Optional success message */}
        </div>
      </div>
    </section>
  );
}

export default ContactPage;

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
    color: "#FFFFFF",
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
