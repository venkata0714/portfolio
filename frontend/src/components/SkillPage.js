import { React, Container, Row, Col } from "react";
import "../styles/SkillPage.css";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 992 },
    items: 5,
  },
  desktop: {
    breakpoint: { max: 992, min: 768 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 768, min: 576 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 576, min: 0 },
    items: 1,
  },
};

function SkillPage() {
  return (
    <section className="skill-container" id="skills">
      <div className="skill-div">
        {/* <Container>
          <Row>
            <Col>
              <div className="skill-box">
                <h2>Skills</h2>
                <p>Here are my Skills</p>
                <Carousel
                  responsive={responsive}
                  infinite={true}
                  className="skill-slider"
                >
                  <div className="item"></div>
                </Carousel>
              </div>
            </Col>
          </Row>
        </Container> */}
      </div>
    </section>
  );
}

export default SkillPage;
