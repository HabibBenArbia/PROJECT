import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu";
import Abonnes from "./components/Abonnes";
import Documents from "./components/Documents";
import Emprunts from "./components/Emprunts";

// Composant pour la page d'accueil
const Home = () => {
  return <h1>Bienvenue à la Médiathèque</h1>;
};

const App = () => {
  return (
    <Router>
      <Menu />
      <div className="container mt-4">
        <Routes>
          <Route path="/abonnes" element={<Abonnes />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/emprunts" element={<Emprunts />} />
          <Route path="/" element={<Home />} /> {/* Remplacé le h1 par un composant */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
