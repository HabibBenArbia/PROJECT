import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"; // Icons for actions
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap"; // Importer les composants de Bootstrap

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [showModal, setShowModal] = useState(false); // État pour gérer l'affichage du modal
  const [currentDocument, setCurrentDocument] = useState(null); // Document actuel (pour l'édition)
  const [newDocument, setNewDocument] = useState({ title: "", author: "", category: "" }); // Données du formulaire

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Récupérer la liste des documents
  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents :", error);
    }
  };

  // Supprimer un document
  const deleteDocument = async (id) => {


    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet document ?");
  if (confirmed) {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/documents/${id}`);
      fetchDocuments(); // Recharger la liste après suppression
    } catch (error) {
      console.error("Erreur lors de la suppression du document :", error);
    }
   
  };  
  };

  // Gérer l'ajout ou la mise à jour d'un document
  const handleSaveDocument = async (event) => {
    event.preventDefault();
    try {
      if (currentDocument) {
        // Si nous avons un document à modifier
        await axios.put(`${process.env.REACT_APP_API_URL}/documents/${currentDocument._id}`, newDocument);
        setCurrentDocument(null);
      } else {
        // Sinon, nous ajoutons un nouveau document
        await axios.post(`${process.env.REACT_APP_API_URL}/documents`, newDocument);
      }
      fetchDocuments(); // Recharger la liste des documents
      setShowModal(false); // Fermer le modal
      setNewDocument({ title: "", author: "", category: "" }); // Réinitialiser le formulaire
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du document :", error);
    }
  };

  // Gérer les changements dans les champs du formulaire
  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewDocument({ ...newDocument, [name]: value });
  };

  // Ouvrir le modal pour l'édition d'un document
  const handleEdit = (document) => {
    setCurrentDocument(document);
    setNewDocument({ title: document.title, author: document.author, category: document.category });
    setShowModal(true);
  };

  // Filtrer les documents en fonction du terme de recherche
  const filteredDocuments = documents.filter((document) =>
    document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    document.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    document.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <strong>Catégorie :</strong> {document.category}
              </div>
              <div style={styles.actions}>
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
                <option value="CD">CD</option>
                <option value="DVD">DVD</option>
                <option value="AFFICHE">AFFICHE</option>
              </Form.Control>
            </Form.Group>

            <Button variant="primary" type="submit" style={styles.submitButton}>
              {currentDocument ? "Mettre à jour" : "Ajouter"}
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
};

export default Documents;
