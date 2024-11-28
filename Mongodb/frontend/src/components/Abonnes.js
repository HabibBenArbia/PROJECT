import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"; // Icons for actions
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap"; // Importer les composants de Bootstrap

function Abonnes() {
  const [abonnes, setAbonnes] = useState([]); // État pour stocker la liste des abonnés
  const [showModal, setShowModal] = useState(false); // État pour gérer l'affichage du modal
  const [newAbonne, setNewAbonne] = useState({ nom: "", prenom: "", adresse: "" }); // Données du formulaire d'ajout
  const [currentAbonne, setCurrentAbonne] = useState(null); // Pour l'édition d'un abonné

  // Fonction pour récupérer la liste des abonnés
  useEffect(() => {
    fetchAbonnes();
  }, []);

  // Récupérer les abonnés depuis l'API
  const fetchAbonnes = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/abonnés`);
      setAbonnes(response.data); // Mettre à jour l'état avec la liste des abonnés
    } catch (error) {
      console.error("Erreur lors de la récupération des abonnés :", error);
    }
  };

  // Supprimer un abonné
  const deleteAbonne = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/abonnés/${id}`);
      fetchAbonnes(); // Recharger la liste des abonnés après la suppression
    } catch (error) {
      console.error("Erreur lors de la suppression de l'abonné :", error);
    }
  };

  // Modifier un abonné
  const handleEdit = (abonne) => {
    setCurrentAbonne(abonne); // Sauvegarder l'abonné actuel pour modification
    setNewAbonne({ nom: abonne.nom, prenom: abonne.prenom, adresse: abonne.adresse}); // Remplir le formulaire avec les valeurs actuelles
    setShowModal(true); // Afficher le modal
  };

  // Ajouter ou modifier un abonné
  const handleAddAbonne = async (event) => {
    event.preventDefault();

    // Vérifier si l'abonné est en mode édition ou ajout
    const apiUrl = currentAbonne
      ? `${process.env.REACT_APP_API_URL}/abonnés/${currentAbonne._id}` // Si modification, utiliser l'ID
      : `${process.env.REACT_APP_API_URL}/abonnés`; // Sinon, ajout

    try {
      if (currentAbonne) {
        // Mise à jour de l'abonné
        await axios.put(apiUrl, newAbonne);
      } else {
        // Ajout de l'abonné
        await axios.post(apiUrl, newAbonne);
      }

      fetchAbonnes(); // Recharger la liste des abonnés
      setShowModal(false); // Fermer le modal
      setNewAbonne({ nom: "", prenom: "", adresse: ""}); // Réinitialiser le formulaire
      setCurrentAbonne(null); // Réinitialiser l'abonné actuel
    } catch (error) {
      console.error("Erreur lors de l'ajout ou modification de l'abonné :", error);
    }
  };

  // Gérer les changements dans les champs du formulaire
  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewAbonne({ ...newAbonne, [name]: value });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Liste des Abonnés</h2>

      <button style={styles.addButton} onClick={() => setShowModal(true)}>
        <FaPlus style={styles.icon} /> {currentAbonne ? "Modifier l'Abonné" : "Ajouter un abonné"}
      </button>

      {abonnes.length > 0 ? (
        <ul style={styles.list}>
          {abonnes.map((abonne) => (
            <li key={abonne._id} style={styles.listItem}>
              <div style={styles.abonneInfo}>
                <strong>Nom :</strong> {abonne.nom} <br />
                <strong>Prénom :</strong> {abonne.prenom} <br />
                <strong>Adresse :</strong> {abonne.adresse} <br />
              
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

      {/* Modal pour ajouter ou modifier un abonné */}
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
