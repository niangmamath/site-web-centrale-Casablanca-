# Centrale Quanta - Site Web & Plateforme Communautaire

[![Node.js CI](https://github.com/niangmamath/site-web-centrale-Casablanca-/actions/workflows/node.js.yml/badge.svg)](https://github.com/niangmamath/site-web-centrale-Casablanca-/actions/workflows/node.js.yml)

## 1. Introduction

Ce dépôt contient le code source complet du site web de **Centrale Quanta**, une initiative étudiante visant à explorer, démystifier et promouvoir l'informatique quantique. Le projet est construit sur une stack robuste et classique : **Node.js** et **Express.js** pour le back-end, avec un rendu des vues côté serveur via le moteur de template **EJS**.

L'objectif est de fournir une plateforme centralisée pour notre communauté, offrant des ressources éducatives, des actualités sur nos événements, et une vitrine pour nos projets.

> **Notre Mission :** Rendre la science et l'informatique quantiques accessibles à tous. Nous organisons des ateliers, des projets et des conférences pour construire une communauté d'innovateurs.

## 2. Fonctionnalités

*   **Gestion de Contenu Dynamique :** Un back-office complet permet aux administrateurs de gérer l'ensemble du contenu du site.
*   **Blog :** Publication d'articles, de tutoriels et d'actualités sur le quantique.
*   **Événements :** Annonce et gestion des ateliers, séminaires et conférences.
*   **Gestion des Membres :** Présentation des membres de l'équipe avec profils détaillés.
*   **Hébergement d'Images :** Intégration avec Cloudinary pour un hébergement et une diffusion optimisés des médias.
*   **Design Moderne :** Interface responsive construite avec le framework CSS **Tailwind CSS**.

## 3. Stack Technique

*   **Back-end :** Node.js, Express.js
*   **Front-end :** EJS (Embedded JavaScript templates), Tailwind CSS
*   **Base de Données :** Conçu pour fonctionner avec MongoDB et Mongoose (ODM).
*   **Hébergement d'Images :** Cloudinary
*   **Dépendances Clés :** `express`, `mongoose`, `ejs`, `cloudinary`, `multer`

## 4. Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre machine :
*   [Node.js](https://nodejs.org/en/) (v14 ou supérieure)
*   [npm](https://www.npmjs.com/) (généralement inclus avec Node.js)
*   Une base de données MongoDB (locale ou via un service comme MongoDB Atlas)
*   Un compte Cloudinary pour la gestion des images.

## 5. Installation et Lancement

Suivez ces étapes pour mettre en place un environnement de développement local.

**1. Cloner le dépôt :**
```bash
git clone https://github.com/niangmamath/site-web-centrale-Casablanca-.git
cd site-web-centrale-Casablanca-
```

**2. Installer les dépendances :**
```bash
npm install
```

**3. Configurer les variables d'environnement :**
Créez un fichier `.env` à la racine du projet en vous basant sur le modèle ci-dessous. Remplacez les valeurs par vos propres clés et informations de connexion.

```env
# Configuration du Port
PORT=3000

# Connexion à la base de données MongoDB
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"

# Clés de l'API Cloudinary
CLOUDINARY_CLOUD_NAME="votre_nom_de_cloud"
CLOUDINARY_API_KEY="votre_api_key"
CLOUDINARY_API_SECRET="votre_api_secret"

```

**4. Lancer le serveur de développement :**
```bash
npm start
```

Le serveur sera alors accessible à l'adresse `http://localhost:3000`.

## 6. Structure du Projet

Le projet suit une architecture MVC (Modèle-Vue-Contrôleur) classique pour une meilleure organisation et maintenabilité.

```
.
├── app.js              # Point d'entrée principal de l'application
├── package.json        # Dépendances et scripts du projet
├── .env                # Fichier pour les variables d'environnement (à créer)
├── config/             # Fichiers de configuration (ex: connexion Cloudinary)
│   └── cloudinary.js
├── models/             # Schémas de données Mongoose (Modèles)
│   ├── event.js
│   ├── member.js
│   └── post.js
├── public/             # Fichiers statiques (CSS, JS client, images)
│   ├── main.js
│   └── styles.css
├── routes/             # Définitions des routes (Contrôleurs)
│   ├── admin.js
│   ├── events.js
│   └── index.js
└── views/              # Fichiers de template EJS (Vues)
    ├── admin/
    ├── partials/
    └── index.ejs
```

## 7. Panel d'Administration

Le site inclut une section d'administration pour la gestion du contenu.

*   **Accès :** `http://localhost:3000/admin`
*   **Fonctionnalités :** CRUD (Créer, Lire, Mettre à jour, Supprimer) pour les articles de blog, les événements, les membres et les sections du site.

*(Note : La logique d'authentification pour le panel d'administration est une prochaine étape de développement.)*

## 8. Contribuer

Les contributions sont les bienvenues ! Pour contribuer, veuillez suivre les étapes suivantes :
1.  Fork le projet.
2.  Créez une nouvelle branche (`git checkout -b feature/nom-de-la-feature`).
3.  Faites vos modifications.
4.  Committez vos changements (`git commit -m 'Ajout de la fonctionnalité X'`).
5.  Push vers la branche (`git push origin feature/nom-de-la-feature`).
6.  Ouvrez une Pull Request.

---
Ce projet a été initialisé avec passion par l'équipe de Centrale Quanta.
