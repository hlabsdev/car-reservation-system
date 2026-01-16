# Application de gestion des réservations de véhicules

## 1. Contexte

Cette application web permet la gestion des réservations de véhicules mis à disposition des employés d’une organisation.

Elle vise à éviter les conflits d’usage, les indisponibilités non anticipées et les chevauchements de réservations, tout
en garantissant la sécurité des accès et l’intégrité des données.

Ce projet a été réalisé dans le cadre du test technique de recruitment pour Togo Data Lab, en s’alignant sur les normes
de développement logiciel et
d’architecture reconnus comme bonnes pratiques.
---

## 2. Stack technique

- Backend : Python - Django + Django REST Framework
- Frontend : React (Vite, `pnpm` comme pacquage manager)
- Base de données : PostgreSQL (ou SQLite pour exécution locale)
- Authentification : JWT
- Conteneurisation : Docker (optionnelle mais fournie)
- Logiciels : 100 % open-source

---

## 3. Architecture de l’application

L’application respecte une architecture en **trois couches** :

### 3.1 Couche de présentation

- API REST exposée via Django REST Framework
- Composants React pour l’interface utilisateur

### 3.2 Couche applicative

- Implémentée via une *service layer* (`services.py`)
- Contient l’ensemble des règles métier et des cas d’usage
- Aucune logique métier critique dans les vues ou les serializers

### 3.3 Couche de données

- Modèles Django
- Gestion de la persistance via l’ORM
- Transactions (`transaction.atomic`) utilisées pour garantir l’intégrité des données

---

## 4. Règles métier principales

- Un véhicule ne peut pas être réservé sur des périodes qui se chevauchent
- Toute création de réservation est validée de manière atomique
- Les réservations invalides sont rejetées avec des messages explicites

---

## 5. Sécurité

- Authentification obligatoire pour accéder aux fonctionnalités
- Contrôle des accès par utilisateur
- Protection contre les accès non autorisés aux ressources
- Validation des données côté backend

---

## 6. Tests

Des tests unitaires ciblés sont implémentés pour valider les règles métier critiques, notamment la prévention des
conflits de réservation.
---

## 7. Lancement du projet en local

### Backend

```bash

cd backend

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
````

### Frontend

```bash

cd frontend

npm install

npm run dev
```
---

 ## 8. Fonctionnalités implémentées

### Authentification et accès

- Authentification des utilisateurs via un mécanisme sécurisé (JWT)
- Accès restreint aux fonctionnalités de l’application aux utilisateurs authentifiés
- Gestion de session côté frontend

### Gestion des véhicules

- Consultation de la liste des véhicules disponibles
- Accès aux informations principales d’un véhicule (identifiant, caractéristiques, statut)
- Les véhicules constituent une ressource centrale du système de réservation

### Gestion des réservations
- Création de réservations de véhicules sur une période donnée
- Vérification systématique de la validité des dates (date de début antérieure à la date de fin)
- Empêchement strict des réservations sur des périodes qui se chevauchent pour un même véhicule
- Validation atomique des réservations afin de garantir l’intégrité des données

### Règles métier critiques

- Centralisation de la logique métier dans une couche applicative dédiée (`services.py`)
- Détection des conflits de réservation basée sur le chevauchement des intervalles de dates
- Rejet explicite des demandes de réservation invalides avec des messages d’erreur clairs

### API Backend

- API REST construite avec Django REST Framework
- Endpoints dédiés pour l’authentification, les véhicules et les réservations
- Séparation claire entre la couche de présentation (API) et la logique métier

### Qualité et robustesse

- Utilisation de transactions pour prévenir les incohérences en cas d’accès concurrents
- Tests unitaires ciblés couvrant les règles métier critiques liées aux réservations
- Application exécutable localement avec des instructions de lancement documentées

---

## 9. Limites et améliorations possibles

* Gestion avancée des rôles (admin, gestionnaire, utilisateur)

* Interface de planification visuelle

* Notifications de réservation

* Tests automatisés plus exhaustifs

* Déploiement continu



