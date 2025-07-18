import React from "react";
import { motion } from "framer-motion";
import { zoomIn } from "../../services/variants";
import "../../styles/ProjectPage.css";

const projects = [
  {
    title: "CI/CD Pipeline for Streamlit Fake News Detection Application",
    timeline: "Jan 2025 - Apr 2025",
    description:
      "Automated CI/CD with GitHub Actions to build, push, and deploy a containerized Streamlit app to AWS ECS Fargate. Integrated Docker, ECR, secure secrets, and scalable infrastructure.",
    tools: ["GitHub Actions", "Docker", "AWS ECS Fargate", "Amazon ECR", "CloudFormation"],
    image: "https://picsum.photos/seed/fakenews/800/600",
    github: "https://github.com/venkata0714/fake-news-app",
  },
  {
    title: "WordPress Hosting on AWS (3-Tier Architecture)",
    timeline: "Jan 2025",
    description:
      "Designed a secure, scalable WordPress deployment on AWS with VPC, EC2 Auto Scaling, RDS, and EFS, automating infrastructure using Launch Templates and CloudFormation.",
    tools: ["EC2", "SSM", "Parameter Store", "RDS", "EFS", "CloudFormation"],
    image: "https://picsum.photos/seed/wordpress/800/600",
    github: "", // no GitHub link
  },
  {
    title: "AWS Site-to-Site VPN Simulation",
    timeline: "Dec 2024",
    description:
      "Simulated on-premise using pfSense on AWS, established Site-to-Site VPN, configured static routes, propagation, and firewall rules for bidirectional connectivity.",
    tools: ["VPC", "Customer Gateway", "Virtual Private Gateway", "pfSense", "CloudFormation"],
    image: "https://picsum.photos/seed/vpn/800/600",
    github: "https://github.com/venkata0714/Network-Routing-Simulation",
  },
  {
    title: "Serverless Reminder Notification System (PetCuddleOTron)",
    timeline: "Nov 2024",
    description:
      "Built serverless notification system using AWS Lambda, API Gateway, SES, SNS, S3, and Step Functions for email/SMS reminders with secure IAM role management.",
    tools: ["Lambda", "API Gateway", "SES", "SNS", "S3", "CloudFormation"],
    image: "https://picsum.photos/seed/serverless/800/600",
    github: "", // no GitHub link
  },
  {
    title: "Intelligent Navigation and Obstacle Avoidance for Autonomous Systems",
    timeline: "Jan 2025 - Present",
    description:
      "Developed robot navigation system using OpenCV, Q-learning, PID control, and Deep RL for real-time obstacle avoidance and improved energy efficiency.",
    tools: ["OpenCV", "Q-learning", "PID", "Deep RL"],
    image: "https://picsum.photos/seed/navigation/800/600",
    github: "https://github.com/venkata0714/Intelligent_Navigation_and_Obstacle_Avoidance_for_Autonomous_Systems",
  },
  {
    title: "Privacy-Preserving Voting with zk-SNARKs",
    timeline: "Aug 2024 - Dec 2024",
    description:
      "Implemented zk-SNARKs with Groth16 over BN254 curves to enable confidential voting on blockchain, developing smart contracts and full-stack UI for secure submissions.",
    tools: ["Python", "Groth16", "BN254", "Blockchain", "Smart Contracts"],
    image: "https://picsum.photos/seed/zkproof/800/600",
    github: "https://github.com/venkata0714/Implementation-and-Application-of-Zero-Knowledge-Proof-Systems-zk-SNARKs-in-Decentralized-Networks",
  },
];

function ProjectPage() {
  return (
    <motion.section
      className="project-container"
      id="projects"
      variants={zoomIn(0)}
      initial="hidden"
      whileInView="show"
      exit="hidden"
      viewport={{ once: true }}
    >
      <motion.h2 className="project-heading">Projects</motion.h2>
      <div className="projects-grid">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            className="project-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring" }}
          >
            <div className="project-info">
              <p className="project-timeline">{project.timeline}</p>
              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>
              <div className="project-tools">
                {project.tools.map((tool, idx) => (
                  <span key={idx} className="project-tool">
                    {tool}
                  </span>
                ))}
              </div>
              {project.github && (
                <a
                  className="github-link"
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub →
                </a>
              )}
            </div>
            <div
              className="project-image"
              style={{
                backgroundImage: `url(${project.image})`,
              }}
            ></div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default ProjectPage;
