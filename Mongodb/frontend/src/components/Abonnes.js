import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"; // Icons for actions
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap"; // Import Bootstrap components

function Abonnes() {
  const [abonnes, setAbonnes] = useState([]); // State to store the list of subscribers
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility
  const [newAbonne, setNewAbonne] = useState({ nom: "", prenom: "", adresse: "" }); // Form data for adding a subscriber
  const [currentAbonne, setCurrentAbonne] = useState(null); // For editing a subscriber
  const [searchQuery, setSearchQuery] = useState(""); // State for the search query

  // Fetch the list of subscribers when the component is mounted
  useEffect(() => {
    fetchAbonnes();
  }, []);

  // Fetch subscribers from the API
  const fetchAbonnes = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/abonnés`);
      setAbonnes(response.data); // Update state with the list of subscribers
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    }
  };

  // Delete a subscriber
  const deleteAbonne = async (id) => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet document ?");
    if (confirmed) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/abonnés/${id}`);
        fetchAbonnes(); // Recharger la liste après suppression
      } catch (error) {
        console.error("Erreur lors de la suppression du document :", error);
      }
    }
  };

  // Handle editing a subscriber
  const handleEdit = (abonne) => {
    setCurrentAbonne(abonne); // Save the current subscriber for editing
    setNewAbonne({ nom: abonne.nom, prenom: abonne.prenom, adresse: abonne.adresse }); // Fill the form with current values
    setShowModal(true); // Show the modal
  };

  // Add or update a subscriber
  const handleAddAbonne = async (event) => {
    event.preventDefault(); // Empêcher le rechargement de la page
  
    const apiUrl = currentAbonne
      ? `${process.env.REACT_APP_API_URL}/abonnés/${currentAbonne._id}` // Mise à jour si l'abonné existe
      : `${process.env.REACT_APP_API_URL}/abonnés`; // Ajouter si aucun abonné n'est sélectionné
  
    try {
      if (currentAbonne) {
        // Mettre à jour l'abonné existant
        await axios.put(apiUrl, newAbonne);
      } else {
        // Ajouter un nouvel abonné
        await axios.post(apiUrl, newAbonne);
      }
  
      fetchAbonnes(); // Recharger la liste des abonnés
      setShowModal(false); // Fermer le modal
      setNewAbonne({ nom: "", prenom: "", adresse: "" }); // Réinitialiser le formulaire
      setCurrentAbonne(null); // Réinitialiser l'abonné actuel
    } catch (error) {
      console.error("Erreur lors de l'ajout ou de la mise à jour de l'abonné :", error);
    }
  };

  // Handle changes in form fields
  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewAbonne({ ...newAbonne, [name]: value });
  };

  // Handle search query change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filtered abonnés based on search query
  const filteredAbonnes = abonnes.filter((abonne) =>
    abonne.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    abonne.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    abonne.adresse.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Liste des Abonnés</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Rechercher par nom, prénom ou adresse"
        value={searchQuery}
        onChange={handleSearchChange}
        style={styles.searchInput}
      />

      <button style={styles.addButton} onClick={() => setShowModal(true)}>
        <FaPlus style={styles.icon} /> {currentAbonne ? "Modifier l'Abonné" : "Ajouter un abonné"}
      </button>

      {filteredAbonnes.length > 0 ? (
        <ul style={styles.list}>
          {filteredAbonnes.map((abonne) => (
            <li key={abonne._id} style={styles.listItem}>
              <div style={styles.abonneInfo}>
                <strong>Nom :</strong> {abonne.nom} <br />
                <strong>Prénom :</strong> {abonne.prenom} <br />
                <strong>Adresse :</strong> {abonne.adresse} <br />
                <strong>Date d'inscription :</strong> 
                {new Date(abonne.date_inscription).toLocaleDateString("fr-FR")} <br /> {/* Format the date */}
              </div>
              <div style={styles.actions}>
                <button
                  style={styles.editButton}
                  onClick={() => handleEdit(abonne)}
                >
                  <FaEdit style={styles.actionIcon} /> Modifier
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => deleteAbonne(abonne._id)}
                >
                  <FaTrash style={styles.actionIcon} /> Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.noAbonnes}>Aucun abonné trouvé.</p>
      )}

      {/* Modal for adding or editing a subscriber */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentAbonne ? "Modifier un Abonné" : "Ajouter un Abonné"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddAbonne}>
            <Form.Group controlId="nom">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nom"
                name="nom"
                value={newAbonne.nom}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="prenom">
              <Form.Label>Prénom</Form.Label>
              <Form.Control
                type="text"
                placeholder="Prénom"
                name="prenom"
                value={newAbonne.prenom}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="adresse">
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                type="text"
                placeholder="Adresse"
                name="adresse"
                value={newAbonne.adresse}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" style={styles.submitButton}>
              {currentAbonne ? "Mettre à jour" : "Ajouter"}
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
  searchInput: {
    width: '100%',
    padding: '12px',
    marginBottom: '30px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '16px',
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
  abonneInfo: {
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
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  actionIcon: {
    marginRight: '5px',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  noAbonnes: {
    color: '#34495e',
    fontSize: '18px',
  },
};

export default Abonnes;
