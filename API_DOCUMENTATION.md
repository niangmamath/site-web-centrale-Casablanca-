# Documentation de l'API - Centrale Quanta

Ce document détaille toutes les routes de l'API disponibles dans le projet, à la fois pour la partie publique du site et pour le panel d'administration.

## Table des Matières

1.  [Routes Publiques](#1-routes-publiques)
2.  [Routes d'Administration](#2-routes-dadministration)

---

## 1. Routes Publiques

Ces routes sont accessibles à tous les visiteurs du site.

### Pages Principales

*   **`GET /`**
    *   **Description :** Affiche la page d'accueil.
    *   **Vue :** `views/index.ejs`

*   **`GET /events`**
    *   **Description :** Affiche la page des événements.
    *   **Vue :** `views/events.ejs`

*   **`GET /team`**
    *   **Description :** Affiche la page de l'équipe.
    *   **Vue :** `views/team.ejs`

*   **`GET /team/:id`**
    *   **Description :** Affiche le profil détaillé d'un membre de l'équipe.
    *   **Vue :** `views/member-detail.ejs`

*   **`GET /contact`**
    *   **Description :** Affiche le formulaire de contact.
    *   **Vue :** `views/contact.ejs`

*   **`POST /contact`**
    *   **Description :** Traite la soumission du formulaire de contact.
    *   **Redirige :** Vers `/contact?status=success` ou `/contact?status=error`.

### Blog

*   **`GET /blog`**
    *   **Description :** Affiche la liste de tous les articles du blog.
    *   **Vue :** `views/blog.ejs`

*   **`GET /blog/:id`**
    *   **Description :** Affiche un article de blog spécifique.
    *   **Vue :** `views/post.ejs`

*   **`POST /blog/:id/like`**
    *   **Description :** Incrémente le compteur de "j'aime" d'un article.
    *   **Redirige :** Vers `/blog/:id`.

*   **`POST /blog/:id/comment`**
    *   **Description :** Ajoute un commentaire à un article.
    *   **Redirige :** Vers `/blog/:id`.

### Sitemap

*   **`GET /sitemap.xml`**
    *   **Description :** Génère et sert un sitemap dynamique pour le SEO.

---

## 2. Routes d'Administration

Ces routes sont préfixées par `/admin` et sont destinées à la gestion du contenu.

### Dashboard

*   **`GET /admin`**
    *   **Description :** Affiche le tableau de bord de l'administration avec des statistiques.
    *   **Vue :** `views/admin/dashboard.ejs`

### Gestion des Articles (Posts)

*   **`GET /admin/posts`** : Lister tous les articles.
*   **`GET /admin/posts/add`** : Afficher le formulaire d'ajout d'article.
*   **`POST /admin/posts/add`** : Créer un nouvel article.
*   **`GET /admin/posts/edit/:id`** : Afficher le formulaire de modification d'article.
*   **`PUT /admin/posts/edit/:id`** : Mettre à jour un article.
*   **`DELETE /admin/posts/delete/:id`** : Supprimer un article.

### Gestion des Événements (Events)

*   **`GET /admin/events`** : Lister tous les événements.
*   **`GET /admin/events/add`** : Afficher le formulaire d'ajout d'événement.
*   **`POST /admin/events/add`** : Créer un nouvel événement.
*   **`GET /admin/events/edit/:id`** : Afficher le formulaire de modification d'événement.
*   **`PUT /admin/events/edit/:id`** : Mettre à jour un événement.
*   **`DELETE /admin/events/delete/:id`** : Supprimer un événement.

### Gestion des Membres (Members)

*   **`GET /admin/members`** : Lister tous les membres.
*   **`GET /admin/members/add`** : Afficher le formulaire d'ajout de membre.
*   **`POST /admin/members/add`** : Créer un nouveau membre.
*   **`GET /admin/members/edit/:id`** : Afficher le formulaire de modification de membre.
*   **`PUT /admin/members/edit/:id`** : Mettre à jour un membre.
*   **`DELETE /admin/members/delete/:id`** : Supprimer un membre.

### Gestion des Messages

*   **`GET /admin/messages`**
    *   **Description :** Affiche tous les messages reçus via le formulaire de contact.
    *   **Vue :** `views/admin/messages/index.ejs`

*   **`POST /admin/messages/:id/toggle-read`**
    *   **Description :** Marque un message comme lu ou non lu.
    *   **Redirige :** Vers `/admin/messages`.
