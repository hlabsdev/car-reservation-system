# Application de gestion des réservations de véhicules

**Test technique – Togo Data Lab**

## 1. Contexte

Cette application web permet la gestion des réservations de véhicules mis à disposition des employés d’une organisation pour leurs missions professionnelles.

L’objectif principal est d’éviter les conflits d’usage, les indisponibilités non anticipées et, surtout, les **chevauchements de réservations pour un même véhicule**, tout en garantissant la sécurité des accès et l’intégrité des données.

Ce projet a été réalisé dans le cadre du **test technique de recrutement du Togo Data Lab**, avec un focus particulier sur la clarté de l’architecture, la robustesse des règles métier et la maintenabilité du code.

---

## 2. Stack technique

* **Backend** : Python – Django & Django REST Framework
* **Frontend** : React (Vite, TypeScript)
* **Gestionnaire de paquets frontend** : `pnpm`
* **Base de données** : SQLite (par défaut) ou PostgreSQL
* **Authentification** : JWT (djangorestframework-simplejwt)
* **Conteneurisation** : Docker (optionnelle)
* **Dépendances** : 100 % open-source

---

## 3. Architecture de l’application

L’application suit une **architecture en trois couches**, conformément aux bonnes pratiques recommandées.

### 3.1 Couche de présentation

* API REST exposée via Django REST Framework
* Interface utilisateur React consommant l’API

### 3.2 Couche applicative

* Implémentée via un **service layer** (`services.py`)
* Centralise l’ensemble des règles métier et cas d’usage
* Aucune logique métier critique dans les vues ou les serializers

### 3.3 Couche de données

* Modèles Django
* ORM pour la persistance
* Transactions (`transaction.atomic`) utilisées pour garantir l’intégrité des données

---

## 4. Règles métier principales

* Un véhicule ne peut pas être réservé sur des périodes qui se chevauchent
* La date de début d’une réservation doit être antérieure à la date de fin
* Les réservations dans le passé sont rejetées.
* Toute création ou modification de réservation est validée de manière atomique
* Les erreurs métier sont retournées avec des messages explicites

La règle de non-chevauchement est implémentée dans la couche applicative et testée unitairement.

---

## 5. Sécurité

* Authentification obligatoire via JWT
* Accès restreint aux ressources en fonction de l’utilisateur connecté
* Un utilisateur ne peut consulter que ses propres réservations
* Validation systématique des données côté backend

---

## 6. Tests

Des **tests unitaires ciblés** sont implémentés au niveau de la couche applicative afin de valider les règles métier critiques, notamment :

* création de réservation valide
* détection de chevauchements (exact et partiel)
* réservations consécutives autorisées
* rejet des dates invalides ou passées

---

## 7. Lancement du projet en local

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

---

## 8. Fonctionnalités implémentées

### Authentification

* Connexion des utilisateurs via JWT
* Protection des routes côté frontend
* Gestion de session côté client

### Gestion des véhicules

* Consultation de la liste des véhicules
* Affichage des informations principales (marque, modèle, statut)

### Gestion des réservations

* Création de réservations sur une période donnée
* Validation stricte des dates
* Empêchement des chevauchements de réservations
* Consultation de l’historique des réservations de l’utilisateur connecté

### Qualité et robustesse

* Centralisation de la logique métier dans une couche dédiée
* Utilisation de transactions pour éviter les incohérences
* Tests unitaires ciblés sur les règles critiques
* Application exécutable localement avec des instructions claires

---

## 9. Limites et améliorations possibles

* Gestion avancée des rôles (administrateur, gestionnaire, utilisateur)
* Interface de planification visuelle (calendrier)
* Notifications de réservation
* Tests automatisés plus exhaustifs
* Mise en place d’un pipeline CI/CD

---

## 10. Auteur

**GOLO Komi Kekeli Hermann**
Candidat – Stagiaire Développeur Full-Stack
**Togo Data Lab**