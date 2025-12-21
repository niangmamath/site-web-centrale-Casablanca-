# Centrale Quanta - Site Web & Plateforme de Gestion

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![Node.js](https://img.shields.io/badge/Node.js-14.x-green.svg)](https://nodejs.org/) [![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg)](https://expressjs.com/) [![MongoDB](https://img.shields.io/badge/MongoDB-4.x-lightgreen.svg)](https://www.mongodb.com/) [![EJS](https://img.shields.io/badge/EJS-Embedded-red.svg)](https://ejs.co/)

> **Notre Mission :** Rendre la science et l'informatique quantiques accessibles à tous. Nous organisons des ateliers, des projets et des conférences pour construire une communauté d'innovateurs.

## 2. Fonctionnalités

*   **Gestion de Contenu Dynamique :** Un back-office complet permet aux administrateurs de gérer l'ensemble du contenu du site.
*   **Blog :** Publication d'articles, de tutoriels et d'actualités sur le quantique.
*   **Événements :** Annonce et gestion des ateliers, séminaires et conférences.
*   **Gestion des Membres :** Présentation des membres de l'équipe avec profils détaillés.
*   **Hébergement d'Images :** Intégration avec Cloudinary pour un hébergement et une diffusion optimisés des médias.
*   **Design Moderne :** Interface responsive construite avec le framework CSS **Tailwind CSS**.
*   **SEO Optimisé :** Génération de sitemap, balises meta dynamiques pour un meilleur référencement.

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
Créez un fichier `.env` à la racine du projet et ajoutez les variables suivantes :
```
MONGO_URI=mongodb://localhost:27017/centrale_quanta
CLOUDINARY_CLOUD_NAME=votre_nom_de_cloud
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
TINYMCE_API_KEY=votre_cle_api_tinymce
```

**4. Lancer le serveur de développement :**
```bash
npm start
```

Le site sera accessible à l'adresse `http://localhost:3000`.

## 6. Structure du Projet

Le projet adopte une architecture Modèle-Vue-Contrôleur (MVC) pour une séparation claire des préoccupations.

```
.
├── config/             # Fichiers de configuration (Cloudinary, DB)
├── controllers/        # Logique métier des routes (contrôleurs)
│   └── adminController.js # Contrôleur CRUD générique pour l'admin
├── models/             # Modèles de données Mongoose (schémas)
├── public/             # Fichiers statiques (CSS, images, JS client)
├── routes/             # Définition des routes Express
│   ├── admin/          # Routes spécifiques au panel d'administration
│   └── index.js        # Routes publiques du site
├── utils/              # Fonctions utilitaires (ex: asyncHandler)
├── views/              # Templates EJS (vues)
│   ├── admin/          # Vues du panel d'administration
│   ├── partials/       # Fragments de vues réutilisables (header, footer)
│   └── ...             # Vues des pages publiques
├── .env                # Variables d'environnement (non versionné)
├── app.js              # Point d'entrée principal de l'application
└── package.json        # Dépendances et scripts du projet
```

## 7. Modèles de Données

Les données de l'application sont structurées à l'aide des modèles Mongoose suivants :

*   **`Post`** (`models/post.js`): Représente un article de blog.
    *   `title`: Titre de l'article.
    *   `content`: Contenu de l'article (HTML).
    *   `author`: Auteur de l'article.
    *   `imageUrl`: URL de l'image de couverture.
    *   `likes`: Nombre de "j'aime".
    *   `comments`: Tableau de commentaires imbriqués.
*   **`Event`** (`models/event.js`): Représente un événement.
    *   `title`, `description`, `date`, `location`, `speaker`, `imageUrl`.
*   **`Member`** (`models/member.js`): Représente un membre de l'équipe.
    *   `name`, `role`, `bio`, `imageUrl`, `linkedinUrl`.
*   **`Message`** (`models/message.js`): Représente un message envoyé via le formulaire de contact.
    *   `name`, `email`, `message`, `read`.
*   **`Section`** (`models/section.js`): Représente une section de contenu éditable sur les pages.
    *   `page`, `identifier`, `content`.


## 8. Panel d'Administration

*   **Accès :** `http://localhost:3000/admin`
*   **Fonctionnalités :** CRUD (Créer, Lire, Mettre à jour, Supprimer) pour les articles de blog, les événements, et les membres. Gestion des messages de contact.

*(Note : La logique d'authentification pour le panel d'administration est une prochaine étape de développement.)*

## 9. Déploiement

Ce projet est conçu pour être déployé sur des plateformes supportant Node.js (Heroku, AWS, Digital Ocean, etc.).

1.  Assurez-vous que vos variables d'environnement (`MONGO_URI`, `CLOUDINARY_*`) sont configurées sur la plateforme d'hébergement.
2.  Utilisez le script `npm start` pour lancer l'application en production.

## 10. Contribuer

Les contributions sont les bienvenues ! Pour contribuer, veuillez suivre les étapes suivantes :
1.  Fork le projet.
2.  Créez une nouvelle branche (`git checkout -b feature/nom-de-la-feature`).
3.  Faites vos modifications.
4.  Committez vos changements (`git commit -m 'Ajout de la fonctionnalité X'`).
5.  Push vers la branche (`git push origin feature/nom-de-la-feature`).
6.  Ouvrez une Pull Request.

---
Ce projet a été initialisé avec passion par l'équipe de Centrale Quanta.
