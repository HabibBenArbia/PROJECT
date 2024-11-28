from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId

# Initialisation de l'application Flask
app = Flask(__name__)

# CORS configuré pour accepter les requêtes de n'importe quelle origine
CORS(app)

# Connexion à MongoDB
client = MongoClient("mongodb://mongo:27017/")  # Assurez-vous que 'mongo' est bien le nom du service Docker
db = client["mediathequeprojet"]

# Définition des collections
abonnés_collection = db["abonnés"]
documents_collection = db["documents"]
emprunts_collection = db["emprunts"]

# Helper function to serialize MongoDB ObjectId to string
def serialize_id(data):
    if "_id" in data:
        data["_id"] = str(data["_id"])  # Convertir l'ObjectId en string
    return data

# ============================
# Route de base pour tester le serveur
# ============================
@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Hello from Flask!"})

# ============================
# Routes CRUD pour Abonnés
# ============================
@app.route('/abonnés', methods=['GET', 'POST'])
def abonnés():
    if request.method == 'GET':
        abonnés = list(abonnés_collection.find({}, {"_id": 1, "nom": 1, "prenom": 1, "adresse": 1}))  # Limiter les champs renvoyés
        return jsonify([serialize_id(abonné) for abonné in abonnés]), 200
    elif request.method == 'POST':
        data = request.json
        required_fields = ["nom", "prenom", "email"]  # Vérification des champs requis
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        abonnés_collection.insert_one(data)
        return jsonify({"message": "Abonné added successfully"}), 201

@app.route('/abonnés/<id>', methods=['GET', 'PUT', 'DELETE'])
def abonné_operations(id):
    if request.method == 'GET':
        abonné = abonnés_collection.find_one({"_id": ObjectId(id)})
        if not abonné:
            return jsonify({"error": "Abonné not found"}), 404
        return jsonify(serialize_id(abonné)), 200
    elif request.method == 'PUT':
        data = request.json
        result = abonnés_collection.update_one({"_id": ObjectId(id)}, {"$set": data})
        if result.matched_count == 0:
            return jsonify({"error": "Abonné not found"}), 404
        return jsonify({"message": "Abonné updated successfully"}), 200
    elif request.method == 'DELETE':
        result = abonnés_collection.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Abonné not found"}), 404
        return jsonify({"message": "Abonné deleted successfully"}), 200

# ============================
# Routes CRUD pour Documents
# ============================
@app.route('/documents', methods=['GET', 'POST'])
def documents():
    if request.method == 'GET':
        documents = list(documents_collection.find({}, {"_id": 1, "title": 1, "author": 1, "category": 1}))  # Limiter les champs
        return jsonify([serialize_id(document) for document in documents]), 200
    elif request.method == 'POST':
        data = request.json
        required_fields = ["title", "author", "category"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        documents_collection.insert_one(data)
        return jsonify({"message": "Document added successfully"}), 201

@app.route('/documents/<id>', methods=['GET', 'PUT', 'DELETE'])
def document_operations(id):
    if request.method == 'GET':
        document = documents_collection.find_one({"_id": ObjectId(id)})
        if not document:
            return jsonify({"error": "Document not found"}), 404
        return jsonify(serialize_id(document)), 200
    elif request.method == 'PUT':
        data = request.json
        result = documents_collection.update_one({"_id": ObjectId(id)}, {"$set": data})
        if result.matched_count == 0:
            return jsonify({"error": "Document not found"}), 404
        return jsonify({"message": "Document updated successfully"}), 200
    elif request.method == 'DELETE':
        result = documents_collection.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Document not found"}), 404
        return jsonify({"message": "Document deleted successfully"}), 200

# ============================
# Routes CRUD pour Emprunts
# ============================
@app.route('/emprunts', methods=['GET', 'POST'])
def emprunts():
    if request.method == 'GET':
        emprunts = list(emprunts_collection.find({}, {"_id": 1, "abonne_id": 1, "document_id": 1, "date_emprunt": 1}))  # Limiter les champs
        return jsonify([serialize_id(emprunt) for emprunt in emprunts]), 200
    elif request.method == 'POST':
        data = request.json
        required_fields = ["abonne_id", "document_id", "date_emprunt"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        emprunts_collection.insert_one(data)
        return jsonify({"message": "Emprunt added successfully"}), 201

@app.route('/emprunts/<id>', methods=['GET', 'PUT', 'DELETE'])
def emprunt_operations(id):
    if request.method == 'GET':
        emprunt = emprunts_collection.find_one({"_id": ObjectId(id)})
        if not emprunt:
            return jsonify({"error": "Emprunt not found"}), 404
        return jsonify(serialize_id(emprunt)), 200
    elif request.method == 'PUT':
        data = request.json
        result = emprunts_collection.update_one({"_id": ObjectId(id)}, {"$set": data})
        if result.matched_count == 0:
            return jsonify({"error": "Emprunt not found"}), 404
        return jsonify({"message": "Emprunt updated successfully"}), 200
    elif request.method == 'DELETE':
        result = emprunts_collection.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Emprunt not found"}), 404
        return jsonify({"message": "Emprunt deleted successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)  # Démarre le serveur sur le port 5000
