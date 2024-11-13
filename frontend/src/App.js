import React from "react";
import "./App.css";
import NavBar from "./components/NavBar";
import HomePage from "./components/HomePage";
import AboutPage from "./components/AboutPage";
import SkillPage from "./components/SkillPage";
import ExperiencePage from "./components/ExperiencePage";
import ProjectPage from "./components/ProjectPage";
import ContactPage from "./components/ContactPage";

function App() {
  return (
    <div className="App">
      <NavBar />
      <HomePage />
      <AboutPage />
      <SkillPage />
      <ProjectPage />
      <ExperiencePage />
      <ContactPage />
    </div>
  );
}

export default App;
