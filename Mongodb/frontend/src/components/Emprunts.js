import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"; // Icons for actions
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap"; // Import Bootstrap components
import Select from "react-select"; // Import react-select for select inputs

function Emprunts() {
  const [emprunts, setEmprunts] = useState([]);
  const [filteredEmprunts, setFilteredEmprunts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [currentEmprunt, setCurrentEmprunt] = useState(null); // Current emprunt (for editing)
  const [newEmprunt, setNewEmprunt] = useState({ abonnee: "", document: "", date_emprunt: "" }); // Form data
  const [abonnes, setAbonnes] = useState([]); // List of abonnes
  const [documents, setDocuments] = useState([]); // List of documents

  useEffect(() => {
    fetchEmprunts();
    fetchAbonnes();
    fetchDocuments();
  }, []);

  // Fetch emprunts data
  const fetchEmprunts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/emprunts`);
      setEmprunts(response.data);
      setFilteredEmprunts(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des emprunts :", error);
    }
  };

  // Fetch abonnes data
  const fetchAbonnes = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/abonnés`);
      setAbonnes(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des abonnés :", error);
    }
  };

  // Fetch documents data
  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents :", error);
    }
  };

  // Delete an emprunt
  const deleteEmprunt = async (id) => {
   
    
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet emprunts ?");
    if (confirmed) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/emprunts/${id}`);
        fetchEmprunts(); // Recharger la liste après suppression
      } catch (error) {
        console.error("Erreur lors de la suppression du document :", error);
      }
     
    };
  };
 

  // Handle adding or updating an emprunt
  const handleAddEmprunt = async (event) => {
    event.preventDefault();
    const apiUrl = currentEmprunt
      ? `${process.env.REACT_APP_API_URL}/emprunts/${currentEmprunt._id}`
      : `${process.env.REACT_APP_API_URL}/emprunts`;

    try {
      if (currentEmprunt) {
        await axios.put(apiUrl, newEmprunt);
      } else {
        await axios.post(apiUrl, newEmprunt);
      }
      fetchEmprunts(); // Reload emprunts list
      setShowModal(false); // Close modal
      setNewEmprunt({ abonnee: "", document: "", date_emprunt: "" }); // Reset form data
      setCurrentEmprunt(null); // Reset current emprunt
    } catch (error) {
      console.error("Erreur lors de l'ajout ou modification de l'emprunt :", error);
    }
  };

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewEmprunt({ ...newEmprunt, [name]: value });
  };

  // Handle select input changes
  const handleSelectChange = (name, selectedOption) => {
    setNewEmprunt({ ...newEmprunt, [name]: selectedOption ? selectedOption.value : "" });
  };

  // Filter emprunts based on search term
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    const filtered = emprunts.filter((emprunt) => {
      const abonnee = abonnes.find((a) => a._id === emprunt.abonnee);
      const document = documents.find((d) => d._id === emprunt.document);
      return (
        (abonnee && `${abonnee.nom} ${abonnee.prenom}`.toLowerCase().includes(event.target.value.toLowerCase())) ||
        (document && document.title.toLowerCase().includes(event.target.value.toLowerCase()))
      );
    });
    setFilteredEmprunts(filtered);
  };

  // Filter out documents already used in emprunts
  const usedDocuments = emprunts.map((emprunt) => emprunt.document);
  const availableDocuments = documents.filter((document) => !usedDocuments.includes(document._id));

  // Format options for react-select
  const abonneeOptions = abonnes.map((abonne) => ({
    value: abonne._id,
    label: `${abonne.nom} ${abonne.prenom}`,
  }));

  const documentOptions = availableDocuments.map((document) => ({
    value: document._id,
    label: document.title,
  }));

  // Handle editing an emprunt
  const handleEdit = (emprunt) => {
    setCurrentEmprunt(emprunt);
    setNewEmprunt({
      abonnee: emprunt.abonnee,
      document: emprunt.document,
      date_emprunt: emprunt.date_emprunt,
    });
    setShowModal(true); // Open modal for editing
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Liste des Emprunts</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Rechercher un emprunt..."
        value={searchTerm}
        onChange={handleSearch}
        style={styles.searchBar}
      />

      <button style={styles.addButton} onClick={() => setShowModal(true)}>
        <FaPlus style={styles.icon} /> {currentEmprunt ? "Modifier l'Emprunt" : "Ajouter un emprunt"}
      </button>

      {filteredEmprunts.length > 0 ? (
        <ul style={styles.list}>
          {filteredEmprunts.map((emprunt) => {
            const abonnee = abonnes.find((a) => a._id === emprunt.abonnee);
            const document = documents.find((d) => d._id === emprunt.document);
            return (
              <li key={emprunt._id} style={styles.listItem}>
                <div style={styles.empruntInfo}>
                  <strong>Abonné :</strong> {abonnee ? `${abonnee.nom} ${abonnee.prenom}` : "Nom de l'abonné indisponible"} <br />
                  <strong>Document :</strong> {document ? document.title : "Document non disponible"} <br />
                  <strong>Date d'Emprunt :</strong> {new Date(emprunt.date_emprunt).toLocaleDateString()} <br />
                </div>
                <div style={styles.actions}>
                  <button style={styles.editButton} onClick={() => handleEdit(emprunt)}>
                    <FaEdit style={styles.actionIcon} /> Modifier
                  </button>
                  <button style={styles.deleteButton} onClick={() => deleteEmprunt(emprunt._id)}>
                    <FaTrash style={styles.actionIcon} /> Supprimer
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p style={styles.noEmprunts}>Aucun emprunt trouvé.</p>
      )}

      {/* Modal for adding or editing an emprunt */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentEmprunt ? "Modifier un Emprunt" : "Ajouter un Emprunt"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddEmprunt}>
            <Form.Group controlId="abonnee">
              <Form.Label>Abonné</Form.Label>
              <Select
                options={abonneeOptions}
                value={abonneeOptions.find((option) => option.value === newEmprunt.abonnee)}
                onChange={(selectedOption) => handleSelectChange("abonnee", selectedOption)}
                placeholder="Sélectionner un abonné"
                required
              />
            </Form.Group>

            <Form.Group controlId="document">
              <Form.Label>Document</Form.Label>
              <Select
                options={documentOptions}
                value={documentOptions.find((option) => option.value === newEmprunt.document)}
                onChange={(selectedOption) => handleSelectChange("document", selectedOption)}
                placeholder="Sélectionner un document"
                required
              />
            </Form.Group>
            <Form.Group controlId="date_emprunt">
              <Form.Label>Date d'Emprunt</Form.Label>
              <Form.Control
                type="date"
                name="date_emprunt"
                value={newEmprunt.date_emprunt}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" style={styles.submitButton}>
              {currentEmprunt ? "Mettre à jour l'Emprunt" : "Ajouter l'Emprunt"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "50px auto",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  },
  heading: {
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "30px",
    color: "#2c3e50",
  },
  searchBar: {
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  addButton: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#000000",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "30px",
    transition: "background-color 0.3s ease",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  icon: {
    marginRight: "8px",
  },
  list: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
  },
  listItem: {
    backgroundColor: "#f9f9f9",
    margin: "15px 0",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "left",
  },
  empruntInfo: {
    flex: 1,
    fontSize: "15px",
    color: "#34495e",
    marginRight: "15px",
  },
  actions: {
    display: "flex",
    gap: "15px",
  },
  editButton: {
    backgroundColor: "#000000",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    transition: "background-color 0.3s ease",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    transition: "background-color 0.3s ease",
  },
  actionIcon: {
    marginRight: "8px",
  },
  noEmprunts: {
    fontSize: "16px",
    color: "#7f8c8d",
    textAlign: "center",
  },
  submitButton: {
    width: "100%",
  },
};

export default Emprunts;
