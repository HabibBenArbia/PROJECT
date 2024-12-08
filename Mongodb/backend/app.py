from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime


# Initialisation de l'application Flask
app = Flask(__name__)

# CORS configuré pour accepter les requêtes de n'importe quelle origine
CORS(app)

# Connexion à MongoDB (vérifiez que le service "mongo" correspond au nom dans Docker)
client = MongoClient("mongodb://mongo:27017/")  # Assurez-vous que 'mongo' est bien le nom du service Docker
db = client["mediathequeprojet"]

# Définition des collections
abonnés_collection = db["abonnés"]
documents_collection = db["documents"]
emprunts_collection = db["emprunts"]

# Helper function to serialize MongoDB ObjectId to string
def serialize_id(data):
    """Serialize ObjectId fields in a MongoDB document."""
    if "_id" in data:
        data["_id"] = str(data["_id"])
    return data

# ============================
# Route de base pour tester le serveur
# ============================
@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Hello from Flask!"})

# ============================
# Routes CRUD pour Abonnés
@app.route('/abonnés', methods=['GET', 'POST'])
def abonnés():
    if request.method == 'GET':
        abonnés = list(abonnés_collection.find({}, {"nom": 1, "prenom": 1, "adresse": 1, "date_inscription": 1}))  # Limiter les champs renvoyés
        abonnés = [serialize_id(abonné) for abonné in abonnés]
        return jsonify(abonnés), 200

    elif request.method == 'POST':
        data = request.json
        required_fields = ["nom", "prenom"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Ajouter le champ date_inscription avec la date et l'heure actuelles
        data['date_inscription'] = datetime.now().strftime('%d/%m/%Y')

        # Insérer l'abonné dans la base de données
        result = abonnés_collection.insert_one(data)

        # Récupérer l'ID de l'abonné inséré et le sérialiser
        new_abonné = abonnés_collection.find_one({"_id": result.inserted_id})
        new_abonné = serialize_id(new_abonné)

        # Retourner une réponse valide après l'insertion
        return jsonify({"message": "Abonné ajouté avec succès", "data": new_abonné}), 201


@app.route('/abonnés/<id>', methods=['GET', 'PUT', 'DELETE'])
def abonné_operations(id):
    try:
        obj_id = ObjectId(id)
    except:
        return jsonify({"error": "Invalid ID format"}), 400

    if request.method == 'GET':
        abonné = abonnés_collection.find_one({"_id": obj_id})
        if not abonné:
            return jsonify({"error": "Abonné introuvable"}), 404
        return jsonify(serialize_id(abonné)), 200

    elif request.method == 'PUT':
        data = request.json
        result = abonnés_collection.update_one({"_id": obj_id}, {"$set": data})
        if result.matched_count == 0:
            return jsonify({"error": "Abonné introuvable"}), 404
        return jsonify({"message": "Abonné mis à jour avec succès!"}), 200

    elif request.method == 'DELETE':
        result = abonnés_collection.delete_one({"_id": obj_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Abonné introuvable"}), 404
        return jsonify({"message": "Abonné supprimé avec succès!"}), 200

# ============================
# Routes CRUD pour Documents
# ============================
@app.route('/documents', methods=['GET', 'POST'])
def documents():
    if request.method == 'GET':
        documents = list(documents_collection.find({}, {"title": 1, "author": 1, "category": 1, "annee": 1}))
        documents = [serialize_id(document) for document in documents]
        return jsonify(documents), 200

    elif request.method == 'POST':
        data = request.json
        required_fields = ["title", "author", "category" , "annee"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        documents_collection.insert_one(data)
        return jsonify({"message": "Document ajouté avec succès!"}), 201

@app.route('/documents/<id>', methods=['GET', 'PUT', 'DELETE'])
def document_operations(id):
    try:
        obj_id = ObjectId(id)
    except:
        return jsonify({"error": "Invalid ID format"}), 400

    if request.method == 'GET':
        document = documents_collection.find_one({"_id": obj_id})
        if not document:
            return jsonify({"error": "Document introuvable"}), 404
        return jsonify(serialize_id(document)), 200

    elif request.method == 'PUT':
        data = request.json
        result = documents_collection.update_one({"_id": obj_id}, {"$set": data})
        if result.matched_count == 0:
            return jsonify({"error": "Document introuvable"}), 404
        return jsonify({"message": "Document mis à jour avec succès!"}), 200

    elif request.method == 'DELETE':
        result = documents_collection.delete_one({"_id": obj_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Document introuvable"}), 404
        return jsonify({"message": "Document supprimé avec succès!"}), 200

# ============================
# Routes CRUD pour Emprunts
# ============================
@app.route('/emprunts', methods=['GET', 'POST'])
def emprunts():
    if request.method == 'GET':
        # Modifié pour récupérer les nouveaux champs
        emprunts = list(emprunts_collection.find({}, {"abonnee": 1, "document": 1, "date_emprunt": 1, "date_retour": 1}))
        emprunts = [serialize_id(emprunt) for emprunt in emprunts]
        return jsonify(emprunts), 200

    elif request.method == 'POST':
        data = request.json
        required_fields = ["abonnee", "document", "date_emprunt", "date_retour"]  # Champs renommés
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Insertion avec les nouveaux champs
        emprunts_collection.insert_one(data)
        return jsonify({"message": "Emprunt ajouté avec succès!"}), 201


@app.route('/emprunts/<id>', methods=['GET', 'PUT', 'DELETE'])
def emprunt_operations(id):
    try:
        # Vérification et conversion de l'ID MongoDB
        obj_id = ObjectId(id)
    except Exception as e:
        return jsonify({"error": "Invalid ID format"}), 400

    if request.method == 'GET':
        emprunt = emprunts_collection.find_one({"_id": obj_id})
        if not emprunt:
            return jsonify({"error": "Emprunt introuvable"}), 404
        return jsonify(serialize_id(emprunt)), 200

    elif request.method == 'PUT':
        data = request.json
        if not data:
            return jsonify({"error": "No data provided for update"}), 400

        # Assurez-vous de mettre à jour uniquement les champs nécessaires
        # Par exemple, nous pouvons mettre à jour abonnee, document, date_emprunt, etc.
        update_data = {}
        if 'abonnee' in data:  # Mise à jour du champ 'abonne_id' vers 'abonnee'
            update_data['abonnee'] = data['abonnee']
        if 'document' in data:  # Mise à jour du champ 'document_id' vers 'document'
            update_data['document'] = data['document']
        if 'date_emprunt' in data:
            update_data['date_emprunt'] = data['date_emprunt']

        if not update_data:
            return jsonify({"error": "No valid fields to update"}), 400

        result = emprunts_collection.update_one({"_id": obj_id}, {"$set": update_data})
        if result.matched_count == 0:
            return jsonify({"error": "Emprunt introuvable"}), 404
        return jsonify({"message": "Emprunt mis à jour avec succès!"}), 200

    elif request.method == 'DELETE':
        result = emprunts_collection.delete_one({"_id": obj_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Emprunt introuvable"}), 404
        return jsonify({"message": "Emprunt supprimé avec succès!"}), 200
    
# ============================

@app.route('/delete_today', methods=['GET', 'DELETE'])
def delete_emprunts_today():
    try:
        # Obtenir la date d'aujourd'hui au format YYYY-MM-DD
        today = datetime.today().strftime('%Y-%m-%d')  # Format 'YYYY-MM-DD'

        # Journaliser la date pour déboguer
        print(f"Today's date for matching: {today}")

        # Trouver et supprimer tous les emprunts avec `date_retour` égal à la date d'aujourd'hui
        result = emprunts_collection.delete_many({"date_retour": today})

        if result.deleted_count > 0:
            return jsonify({
                "message": f"{result.deleted_count} emprunts supprimés avec succès!",
                "deleted_count": result.deleted_count
            }), 200
        else:
            return jsonify({
                "message": "Aucun emprunt trouvé avec la date de retour d'aujourd'hui.",
                "deleted_count": 0
            }), 404
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return jsonify({
            "error": "Erreur lors de la suppression des emprunts.",
            "details": str(e)
        }), 500



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)