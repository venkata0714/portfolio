import React from 'react';
import { styled } from '@stitches/react';
import '../styles/ContactPage.css';
import ContactBG from '../assets/img/contact-bg.png';

function ContactPage() {
  return (
    <section id="contact" className="contact-page">
      <div className="contact-container">
        <div className="contact-info">
          <h2>Contact Me</h2>
          <p>
            <strong>Email:</strong> singhk6@mail.uc.edu || kartavya.singh17@yahoo.com
          </p>
          <p>
            <strong>Phone:</strong> 513-837-7683
          </p>
          <p>...or use the following form</p>
        </div>
        <form className="contact-form">
          <input type="text" placeholder="Your Name *" required />
          <input type="email" placeholder="Your Email *" required />
          <input type="tel" placeholder="Your Phone" />
          <textarea placeholder="Your Message *" required></textarea>
          <StyledButton type="submit">
            <ButtonShadow />
            <ButtonEdge />
            <ButtonLabel>Send Message</ButtonLabel>
          </StyledButton>
        </form>
      </div>
    </section>
  );
}

export default ContactPage;

// Styled Components for Button
const ButtonPart = styled('span', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  borderRadius: 8,
});

const ButtonShadow = styled(ButtonPart, {
  background: 'hsl(0deg 0% 0% / 0.1)',
  transform: 'translateY(2px)',
  transition: 'transform 250ms ease-out',
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

const ButtonLabel = styled('span', {
  fontFamily: 'Montserrat',
  fontSize: '18px',
  display: 'block',
  position: 'relative',
  borderRadius: 5,
  color: '#212529',
  padding: '1.25rem 2.5rem',
  background: '#f8f9fa',
  transform: 'translateY(-4px)',
  width: '100%',
  userSelect: 'none',
  transition: 'transform 250ms ease-out, background-color 0.3s ease, color 0.3s ease',

  '&:hover': {
    backgroundColor: '#fcbc1d',
    color: '#FFFFFF',
    transform: 'scale(1.05)',
  },
});

const StyledButton = styled('button', {
  border: 'none',
  fontWeight: 600,
  cursor: 'pointer',
  background: 'transparent',
  position: 'relative',
  padding: 0,
  transition: 'filter 250ms ease-out',

  '&:hover': {
    filter: 'brightness(110%)',

    [`& ${ButtonLabel}`]: {
      transform: 'translateY(-6px)',
    },

    [`& ${ButtonShadow}`]: {
      transform: 'translateY(4px)',
    },
  },

  '&:active': {
    [`& ${ButtonLabel}`]: {
      transform: 'translateY(-2px)',
      transition: 'transform 34ms',
    },

    [`& ${ButtonShadow}`]: {
      transform: 'translateY(1px)',
      transition: 'transform 34ms',
    },
  },
});
