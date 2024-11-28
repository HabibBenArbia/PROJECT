import React, { useState, useEffect } from "react";

import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"; // Icons for actions
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap"; // Importer les composants de Bootstrap

function Emprunts() {
  const [emprunts, setEmprunts] = useState([]);
  const [showModal, setShowModal] = useState(false); // État pour gérer l'affichage du modal
  const [currentEmprunt, setCurrentEmprunt] = useState(null); // Emprunt actuel (pour l'édition)
  const [newEmprunt, setNewEmprunt] = useState({ abonne_id: "", document_id: "", date_emprunt: "" }); // Données du formulaire
 
  useEffect(() => {
    fetchEmprunts();
  }, []);

  // Récupérer la liste des emprunts
  const fetchEmprunts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/emprunts`);
      setEmprunts(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des emprunts :", error);
    }
  };

  // Supprimer un emprunt
  const deleteEmprunt = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/emprunts/${id}`);
      fetchEmprunts(); // Recharger la liste après suppression
    } catch (error) {
      console.error("Erreur lors de la suppression de l'emprunt :", error);
    }
  };

  // Gérer l'ajout ou la mise à jour d'un emprunt
  const handleSaveEmprunt = async (event) => {
    event.preventDefault();
    try {
      if (currentEmprunt) {
        // Si nous avons un emprunt à modifier
        await axios.put(`${process.env.REACT_APP_API_URL}/emprunts/${currentEmprunt._id}`, newEmprunt);
        setCurrentEmprunt(null);
      } else {
        // Sinon, nous ajoutons un nouvel emprunt
        await axios.post(`${process.env.REACT_APP_API_URL}/emprunts`, newEmprunt);
      }
      fetchEmprunts(); // Recharger la liste des emprunts
      setShowModal(false); // Fermer le modal
      setNewEmprunt({ abonne_id: "", document_id: "", date_emprunt: "" }); // Réinitialiser le formulaire
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'emprunt :", error);
    }
  };

  // Gérer les changements dans les champs du formulaire
  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewEmprunt({ ...newEmprunt, [name]: value });
  };

  // Ouvrir le modal pour l'édition d'un emprunt
  const handleEdit = (emprunt) => {
    setCurrentEmprunt(emprunt);
    setNewEmprunt({ abonne_id: emprunt.abonne_id, document_id: emprunt.document_id, date_emprunt: emprunt.date_emprunt });
    setShowModal(true);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Liste des Emprunts</h2>

      <button style={styles.addButton} onClick={() => setShowModal(true)}>
        <FaPlus style={styles.icon} /> Ajouter un emprunt
      </button>

      {emprunts.length > 0 ? (
        <ul style={styles.list}>
          {emprunts.map((emprunt, index) => (
            <li key={index} style={styles.listItem}>
              <div style={styles.empruntInfo}>
                <strong>Abonné ID :</strong> {emprunt.abonne_id} <br />
                <strong>Document ID :</strong> {emprunt.document_id} <br />
                <strong>Date d'emprunt :</strong> {emprunt.date_emprunt}
              </div>
              <div style={styles.actions}>
                <button
                  style={styles.editButton}
                  onClick={() => handleEdit(emprunt)}
                >
                  <FaEdit style={styles.actionIcon} /> Modifier
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => deleteEmprunt(emprunt._id)}
                >
                  <FaTrash style={styles.actionIcon} /> Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.noEmprunts}>Aucun emprunt trouvé.</p>
      )}

      {/* Modal pour ajouter/modifier un emprunt */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentEmprunt ? "Modifier un Emprunt" : "Ajouter un Emprunt"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveEmprunt}>
            <Form.Group controlId="abonne_id">
              <Form.Label>ID Abonné</Form.Label>
              <Form.Control
                type="text"
                placeholder="ID de l'abonné"
                name="abonne_id"
                value={newEmprunt.abonne_id}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="document_id">
              <Form.Label>ID Document</Form.Label>
              <Form.Control
                type="text"
                placeholder="ID du document"
                name="document_id"
                value={newEmprunt.document_id}
                onChange={handleChange}
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

            <Button variant="primary" type="submit" style={styles.submitButton}>
              {currentEmprunt ? "Mettre à jour" : "Ajouter"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '50px auto',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  },
  heading: {
    fontSize: '26px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#2c3e50',
  },
  addButton: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#000000',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '30px',
    transition: 'background-color 0.3s ease',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  icon: {
    marginRight: '8px',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    backgroundColor: '#f9f9f9',
    margin: '15px 0',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left',
  },
  empruntInfo: {
    flex: 1,
    fontSize: '15px',
    color: '#34495e',
    marginRight: '15px',
  },
  actions: {
    display: 'flex',
    gap: '15px',
  },
  editButton: {
    backgroundColor: '#000000',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.3s ease',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.3s ease',
  },
  actionIcon: {
    marginRight: '8px',
  },
  noEmprunts: {
    fontSize: '18px',
    color: '#7f8c8d',
    marginTop: '20px',
  },
  submitButton: {
    marginTop: '20px',
  },
};

export default Emprunts;
