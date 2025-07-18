import React from "react";
import { motion } from "framer-motion";
import { fadeIn } from "../../services/variants";
import "../../styles/SkillSection.css";

const SkillSection = ({ skills, title, subtitle, isBatterySavingOn }) => {
  return (
    <motion.div className="skill-column">
      <motion.p
        className="skill-paragraph"
        variants={isBatterySavingOn ? {} : fadeIn("right", 200, 0)}
        initial="hidden"
        whileInView="show"
        exit="hidden"
      >
        {title}
      </motion.p>
      {subtitle && (
        <motion.p
          className="skill-subtitle"
          variants={isBatterySavingOn ? {} : fadeIn("right", 200, 0)}
          initial="hidden"
          whileInView="show"
          exit="hidden"
        >
          {subtitle}
        </motion.p>
      )}
      <div className="skill-items">
        {skills.map((skill, index) => (
          <motion.div
            key={index}
            className="skill-item"
            variants={isBatterySavingOn ? {} : fadeIn("up", 100, index * 0.1)}
            initial="hidden"
            whileInView="show"
            exit="hidden"
          >
            <img className="skill-icon" src={skill.logo} alt={skill.name} />
            <span className="skill-name">{skill.name}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SkillSection;
