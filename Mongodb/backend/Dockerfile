# Utilisation de l'image officielle Python comme base
FROM python:3.9-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers requirements.txt dans le conteneur
COPY requirements.txt /app/

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste des fichiers de l'application dans le conteneur
COPY . /app/

# Exposer le port sur lequel Flask va fonctionner
EXPOSE 5000

# Commande pour démarrer l'application Flask
CMD ["python3", "app.py"]
