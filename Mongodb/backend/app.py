from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId

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
# ============================
@app.route('/abonnés', methods=['GET', 'POST'])
def abonnés():
    if request.method == 'GET':
        abonnés = list(abonnés_collection.find({}, {"nom": 1, "prenom": 1, "adresse": 1}))  # Limiter les champs renvoyés
        abonnés = [serialize_id(abonné) for abonné in abonnés]
        return jsonify(abonnés), 200

    elif request.method == 'POST':
        data = request.json
        required_fields = ["nom", "prenom"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        abonnés_collection.insert_one(data)
        return jsonify({"message": "Abonné ajouté avec succès!"}), 201

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
        documents = list(documents_collection.find({}, {"title": 1, "author": 1, "category": 1}))
        documents = [serialize_id(document) for document in documents]
        return jsonify(documents), 200

    elif request.method == 'POST':
        data = request.json
        required_fields = ["title", "author", "category"]
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
        emprunts = list(emprunts_collection.find({}, {"abonne_id": 1, "document_id": 1, "date_emprunt": 1}))
        emprunts = [serialize_id(emprunt) for emprunt in emprunts]
        return jsonify(emprunts), 200

    elif request.method == 'POST':
        data = request.json
        required_fields = ["abonne_id", "document_id", "date_emprunt"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        emprunts_collection.insert_one(data)
        return jsonify({"message": "Emprunt ajouté avec succès!"}), 201

@app.route('/emprunts/<id>', methods=['GET', 'PUT', 'DELETE'])
def emprunt_operations(id):
    try:
        obj_id = ObjectId(id)
    except:
        return jsonify({"error": "Invalid ID format"}), 400

    if request.method == 'GET':
        emprunt = emprunts_collection.find_one({"_id": obj_id})
        if not emprunt:
            return jsonify({"error": "Emprunt introuvable"}), 404
        return jsonify(serialize_id(emprunt)), 200

    elif request.method == 'PUT':
        data = request.json
        result = emprunts_collection.update_one({"_id": obj_id}, {"$set": data})
        if result.matched_count == 0:
            return jsonify({"error": "Emprunt introuvable"}), 404
        return jsonify({"message": "Emprunt mis à jour avec succès!"}), 200

    elif request.method == 'DELETE':
        result = emprunts_collection.delete_one({"_id": obj_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Emprunt introuvable"}), 404
        return jsonify({"message": "Emprunt supprimé avec succès!"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)