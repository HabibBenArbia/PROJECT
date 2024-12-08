import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"; // Icons for actions
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap"; // Importer les composants de Bootstrap
import Select from "react-select";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [emprunts, setEmprunts] = useState([]); // Liste des emprunts
  const [abonnes, setAbonnes] = useState([]); // Liste des abonnés
  const [searchTerm, setSearchTerm] = useState(""); // Term de recherche
  const [showModal, setShowModal] = useState(false); // Modal state
  const [currentDocument, setCurrentDocument] = useState(null); // Document en édition
  const [newDocument, setNewDocument] = useState({ title: "", author: "", category: "", annee: "" }); // Formulaire document
  const [empruntData, setEmpruntData] = useState({
    abonnee: "",
    document: "",
    date_emprunt: "",
    date_retour: "",
  }); // Données d'emprunt
  const [showEmpruntModal, setShowEmpruntModal] = useState(false); // Modal de l'emprunt

  useEffect(() => {
    fetchDocuments();
    fetchEmprunts();
    fetchAbonnes();
  }, []);

  // Récupérer les documents
  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents :", error);
    }
  };

  // Récupérer les emprunts
  const fetchEmprunts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/emprunts`);
      setEmprunts(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des emprunts :", error);
    }
  };

  // Récupérer les abonnés
  const fetchAbonnes = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/abonnés`);
      setAbonnes(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des abonnés :", error);
    }
  };

  // Gérer l'ajout d'un emprunt
  const handleEmprunt = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/emprunts`, empruntData);
      fetchEmprunts(); // Recharger les emprunts
      setShowEmpruntModal(false); // Fermer le modal après emprunt
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'emprunt :", error);
    }
  };

  // Supprimer un document
  const deleteDocument = async (id) => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?");
    if (confirmed) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/documents/${id}`);
        fetchDocuments(); // Recharger la liste après suppression
      } catch (error) {
        console.error("Erreur lors de la suppression du document :", error);
      }
    }
  };

  // Ouvrir le modal pour l'ajout ou la modification d'un document
  const handleEdit = (document) => {
    setCurrentDocument(document);
    setNewDocument({ title: document.title, author: document.author, category: document.category, annee: document.annee });
    setShowModal(true);
  };

  // Gérer le changement de champs du formulaire (ajout/modification)
  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewDocument((prevDocument) => ({
      ...prevDocument,
      [name]: value,
    }));
  };

  // Sauvegarder un document (ajouter ou modifier)
  const handleSaveDocument = async (event) => {
    event.preventDefault();
    if (currentDocument) {
      try {
        await axios.put(`${process.env.REACT_APP_API_URL}/documents/${currentDocument._id}`, newDocument);
        fetchDocuments(); // Recharger les documents après modification
      } catch (error) {
        console.error("Erreur lors de la mise à jour du document :", error);
      }
    } else {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/documents`, newDocument);
        fetchDocuments(); // Recharger les documents après ajout
      } catch (error) {
        console.error("Erreur lors de l'ajout du document :", error);
      }
    }
    setShowModal(false);
  };

  const abonneeOptions = abonnes.map((abonne) => ({
    value: abonne._id,
    label: `${abonne.nom} ${abonne.prenom}`,
  }));

  // Filtrer les documents en fonction du terme de recherche
  const filteredDocuments = documents.filter((document) =>
    document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    document.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    document.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    document.annee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Vérifier si un document est emprunté
  const isDocumentEmprunte = (titre) => {
    return emprunts.some((emprunt) => emprunt.document === titre);
  };

  const abonnesOptions = abonnes.map((abonne) => ({
    value: abonne._id,
    label: `${abonne.nom} ${abonne.prenom}`,
  }));

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Liste des Documents</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Rechercher un document"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchBar}
      />

      <button style={styles.addButton} onClick={() => setShowModal(true)}>
        <FaPlus style={styles.icon} /> Ajouter un document
      </button>

      {filteredDocuments.length > 0 ? (
        <ul style={styles.list}>
          {filteredDocuments.map((document, index) => (
            <li key={index} style={styles.listItem}>
              <div style={styles.documentInfo}>
                <strong>Titre :</strong> {document.title} <br />
                <strong>Auteur :</strong> {document.author} <br />
                <strong>Catégorie :</strong> {document.category}<br />
                <strong>Annee :</strong> {document.annee}
              </div>

              {/* Afficher ou non le bouton Emprunter */}
              <div style={styles.actions}>
                {isDocumentEmprunte(document.title) ? (
                  <button style={styles.indisponibleButton}>Indisponible</button>
                ) : (
                  <button
                    style={styles.empruntButton}
                    onClick={() => {
                      setEmpruntData({ ...empruntData, document: document.title });
                      setShowEmpruntModal(true); // Ouvrir le modal d'emprunt
                    }}
                  >
                    Emprunter
                  </button>
                )}
                <button
                  style={styles.editButton}
                  onClick={() => handleEdit(document)}
                >
                  <FaEdit style={styles.actionIcon} /> Modifier
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => deleteDocument(document._id)}
                >
                  <FaTrash style={styles.actionIcon} /> Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.noDocuments}>Aucun document trouvé.</p>
      )}

      {/* Modal pour emprunter un document */}
      <Modal show={showEmpruntModal} onHide={() => setShowEmpruntModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Emprunter un Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEmprunt}>
          <Form.Group controlId="abonne">
       
      <Form.Label>Abonné</Form.Label>
      <Select
        value={
          abonnesOptions.find((option) => option.value === empruntData.abonnee) || null
        }
        onChange={(selectedOption) =>
          setEmpruntData({ ...empruntData, abonnee: selectedOption.value })
        }
        options={abonnesOptions}
        placeholder="Sélectionnez un abonné"
        required
      />
    </Form.Group>

            <Form.Group controlId="dateEmprunt">
              <Form.Label>Date d'Emprunt</Form.Label>
              <Form.Control
                type="date"
                value={empruntData.date_emprunt}
                onChange={(e) => setEmpruntData({ ...empruntData, date_emprunt: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group controlId="dateRetour">
              <Form.Label>Date de Retour</Form.Label>
              <Form.Control
                type="date"
                value={empruntData.date_retour}
                onChange={(e) => setEmpruntData({ ...empruntData, date_retour: e.target.value })}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary">
              Emprunter
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal pour ajouter/modifier un document */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentDocument ? "Modifier un Document" : "Ajouter un Document"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveDocument}>
            <Form.Group controlId="title">
              <Form.Label>Titre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Titre"
                name="title"
                value={newDocument.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="author">
              <Form.Label>Auteur</Form.Label>
              <Form.Control
                type="text"
                placeholder="Auteur"
                name="author"
                value={newDocument.author}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="category">
              <Form.Label>Catégorie</Form.Label>
              <Form.Control
                as="select"
                name="category"
                value={newDocument.category}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionnez une catégorie</option>
                <option value="Livre">Livre</option>
                <option value="Magazine">Magazine</option>
                <option value="Article">Article</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="annee">
              <Form.Label>Annee</Form.Label>
              <Form.Control
                type="number"
                placeholder="Annee"
                name="annee"
                value={newDocument.annee}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" style={styles.submitButton}>
              {currentDocument ? "Mettre à jour le Document" : "Ajouter le Document"}
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
  searchBar: {
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
    borderRadius: '5px',
    border: '1px solid #ccc',
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
  documentInfo: {
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
  noDocuments: {
    fontSize: '18px',
    color: '#7f8c8d',
    marginTop: '20px',
  },
  submitButton: {
    marginTop: '20px',
  },
  unavailable: {
    color: "red",
    fontWeight: "bold",
  },
  empruntButton: {
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "6px 12px",
    cursor: "pointer",
  },
  indisponibleButton: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "6px 12px",
    cursor: "not-allowed",
  },
};

export default Documents;
