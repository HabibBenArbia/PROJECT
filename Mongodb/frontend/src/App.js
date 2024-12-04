import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu";
import Abonnes from "./components/Abonnes";
import Documents from "./components/Documents";
import Emprunts from "./components/Emprunts";
import Home from "./components/Home";



const App = () => {
  return (
    <Router>
      <Menu />
      <div className="container mt-4">
        <Routes>
          <Route path="/abonnes" element={<Abonnes />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/emprunts" element={<Emprunts />} />
          <Route path="/" element={<Home />} /> {  }
        </Routes>
      </div>
    </Router>
  );
};

export default App;
