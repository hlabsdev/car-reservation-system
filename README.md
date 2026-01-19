# Application de gestion des réservations de véhicules

## **Test technique – Togo Data Lab**

## 1. Contexte

Cette application web permet la gestion des réservations de véhicules mis à disposition des employés d’une organisation pour leurs missions professionnelles.

L’objectif principal est d’éviter les conflits d’usage, les indisponibilités non anticipées et, surtout, les **chevauchements de réservations pour un même véhicule**, tout en garantissant la sécurité des accès et l’intégrité des données.

Ce projet a été réalisé dans le cadre du **test technique de recrutement du Togo Data Lab**, avec un focus particulier sur la clarté de l’architecture, la robustesse des règles métier et la maintenabilité du code.

---

## 2. Stack technique

**Backend:**

* **Django 6.0** + Django REST Framework
* **PostgreSQL 15** (base de données relationnelle)
* **JWT Authentication** (djangorestframework-simplejwt)

**Frontend:**

* **React 19** + TypeScript
* **Vite** (build tool moderne et rapide)
* **Gestionnaire de paquets frontend** : `pnpm`
* **TailwindCSS** (styling utility-first)
* **Zustand** (state management léger)
* **React Router** (navigation)

**DevOps:**

* **Docker Compose** (orchestration locale)mais optionel
* **Base de Donnees** SQLite (Par défaut), PostgreSQL (conteneurisé, optionel)

### Justification des Choix

#### Pourquoi Django ?

1. **Rapidité de développement** : ORM puissant, admin gratuit, migrations automatiques
2. **Sécurité native** : Protection CSRF, SQL injection, XSS out-of-the-box
3. **Transactions ACID** : Critique pour éviter les race conditions sur les réservations
4. **Écosystème mature** : DRF pour l'API REST, nombreuses libraries

#### Pourquoi React + TypeScript ?

1. **Composants réutilisables** : UI modulaire et maintenable
2. **Type safety** : TypeScript réduit les bugs en production
3. **Écosystème riche** : React Router, etc.
4. **Expérience utilisateur** : SPA fluide sans rechargement de page

#### Pourquoi PostgreSQL (Optionel) ?

1. **Transactions robustes** : ACID garantit la cohérence des réservations
2. **Contraintes de données** : Check constraints, foreign keys
3. **Performance** : Index B-Tree pour les requêtes de chevauchement
4. **Standard industriel** : Utilisé dans 99% des projets Django en production

---

## 3. Architecture de l’application

L’application suit une **architecture en trois couches**, conformément aux bonnes pratiques et inspire (Tres partiellement) du DDD.

### 3.1. Architecture Backend

```bash
backend/
├── config/                # Configuration Django
├── apps/
│   ├── users/             # Gestion utilisateurs
│   ├── cars/              # CRUD véhicules
│   └── reservations/      # Logique réservations
│       ├── models.py      # Modèles de données
│       ├── serializers.py # Validation & sérialisation
│       ├── views.py       # API endpoints
│       ├── services.py    # ⭐ LOGIQUE MÉTIER CRITIQUE
│       └── tests.py       # Tests unitaires
```

**Pattern utilisé :** Service Layer (inspiré de DDD)

* **Modèles** : Données uniquement
* **Services** : Logique métier (validation, règles de gestion)
* **Views** : Orchestration HTTP (délègue au service)

**Pourquoi pas un DDD complet ?**

* Domaine simple (3 entités : User, Car, Reservation)
* Temps limité (4 jours)
* Service layer = 80% des bénéfices du DDD avec 20% de la complexité

#### 3.1.1. Couche de présentation

* API REST exposée via Django REST Framework
* Interface utilisateur React consommant l’API

#### 3.1.2. Couche applicative

* Implémentée via un **service layer** (`services.py`)
* Centralise l’ensemble des règles métier et cas d’usage
* Aucune logique métier critique dans les vues ou les serializers

#### 3.1.3. Couche de données

* Modèles Django
* ORM pour la persistance
* Transactions (`transaction.atomic`) utilisées pour garantir l’intégrité des données

### 3.2 Architecture Frontend

```bash
frontend/src/
├── features/           # Modules métier
│   ├── auth/          # Authentification
│   ├── cars/          # Véhicules
│   └── reservations/  # Réservations
├── components/        # Composants partagés
├── utils/            # Utilitaires (API client)
└── types/            # Types TypeScript
```

**Pattern :** Feature-first organization

* Chaque feature = dossier autonome (service + composants + types)
* Réutilisabilité via `components/`
* Scalable : facile d'ajouter de nouvelles features

---

## 4. Fonctionnalités Implémentées

### ✅ Authentification

* [x] Inscription utilisateur
* [x] Connexion JWT
* [x] Refresh token automatique
* [x] Routes protégées
* [x] Profil utilisateur

### ✅ Gestion des Véhicules

* [x] Liste des véhicules disponibles
* [x] Filtre par disponibilité
* [x] Détails véhicule (marque, modèle, immatriculation)
* [x] Statuts (AVAILABLE, IN_USE, MAINTENANCE, UNAVAILABLE)

### ✅ Réservations

* [x] Création de réservation
* [x] **Validation anti-chevauchement** (RÈGLE CRITIQUE)
* [x] Validation dates (début < fin, pas dans le passé)
* [x] Historique des réservations
* [x] Annulation de réservation
* [x] Affichage conflit explicite

### ✅ Qualité Code

* [x] Centralisation de la logique métier dans une couche dédiée
* [x] Tests unitaires backend (service layer) ciblés sur les règles critiques
* [x] Gestion d'erreurs explicite
* [x] Messages utilisateur clairs
* [x] Validation côté client ET serveur
* [x] Utilisation de transactions pour éviter les incohérences
* [x] Application exécutable localement avec des instructions claires

---

## 5. Règles métier principales

* Un véhicule ne peut pas être réservé sur des périodes qui se chevauchent
* La date de début d’une réservation doit être antérieure à la date de fin
* Les réservations dans le passé sont rejetées.
* Toute création ou modification de réservation est validée de manière atomique
* Les erreurs métier sont retournées avec des messages explicites

La règle de non-chevauchement est implémentée dans la couche applicative et testée unitairement.

---

## 6. Sécurité

* Authentification obligatoire via JWT
* Accès restreint aux ressources en fonction de l’utilisateur connecté
* Un utilisateur ne peut consulter que ses propres réservations
* Validation systématique des données côté backend

---

## 7. Tests

Des **tests unitaires ciblés** sont implémentés au niveau de la couche applicative afin de valider les règles métier critiques, notamment :

* création de réservation valide
* détection de chevauchements (exact et partiel)
* réservations consécutives autorisées
* rejet des dates invalides ou passées

---

## 8. Lancement du projet en local

**Preparation:**

* Git installée et bien configure

```bash
# 1. Cloner le repo
git clone https://github.com/hlabsdev/car-reservation-system.git
cd car-reservation-system

# 2. Installer pnpm globalement de facon propre
corepack enable && corepack prepare pnpm@latest --activate

#Ou avec npm si ca ne fonctionne pas

npm install -g pnpm
```

### 8.1. Lancement Manuel Sans tracas 
>Noter que le fichier `settings.py` est par defaut config pour le lancement manuel. Pou le lancement avec docker veuillez hange la partie `DATABASE` dans les settings.

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Migrations
python manage.py migrate
python manage.py seed_data
python manage.py runserver


# Créer un superuser (optionnel)
python manage.py createsuperuser
```

**Frontend:**

```bash
cd frontend
pnpm install
pnpm dev
```

**Tests:**

```bash
# Tests backend
python manage.py  test

# Tests avec détails
python manage.py test --verbosity=2
```

### 8.2. Lancement Avec Docker

**Prérequis:**

* Docker 20.10+
* Docker Compose 2.0+

**Lancement (3 commandes) :**

```bash
# 1. Mettre a jour le fichier `backend/config/settngs.py` et passer de ca...:

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': os.getenv('DB_NAME', 'car_reservation'),
#         'USER': os.getenv('DB_USER', 'postgres'),
#         'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
#         'HOST': os.getenv('DB_HOST', 'localhost'),
#         'PORT': os.getenv('DB_PORT', '5432'),
#     }
# }
```

```bash
# ====== A ca... (commenter la db sqlite et decommenter la db postgres) ======:

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'car_reservation'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# 2. Créer le fichier .env
cp .env.example .env

# 3. Build et lancer
docker-compose up --build

# [OPTIONNELS - COMMANDES DEJA PREXECUTEES AU LANCER DES DOCKER CONTAINER]
# 4. Initialiser les données (premier lancement uniquement, normalement eja fait dans la commande docker up. Mais la refaire si besoin)
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py seed_data

# 5. Créer un superuser (optionnel)
docker-compose exec backend python manage.py createsuperuser
```

**Accès :**

* Frontend : <http://localhost:5173>
* Backend API : <http://localhost:8000>
* Admin Django : <http://localhost:8000/admin>

### 8.3. Comptes de Test

**Admin :**

* Username : `admin`
* Password : `admin123`

**Utilisateurs :**

* `kofi / test123`
* `ama / test123`
* `kwame / test123`

---

## 9. 📁 Structure Complète

```bash
car-reservation-system/
├── backend/
│   ├── config/              # Settings Django
│   ├── apps/
│   │   ├── users/
│   │   ├── cars/
│   │   └── reservations/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   ├── components/
│   │   ├── utils/
│   │   └── types/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 10. Limites et améliorations possibles

Si plus de temps, voici ce qui serait ajouté :

**Backend :**

* [ ] Gestion avancée des rôles (administrateur, gestionnaire, utilisateur)
* [ ] Système de validation admin (workflow approbation)
* [ ] Notifications email (réservation confirmée/annulée)
* [ ] Export Excel des réservations
* [ ] API pagination et filtres avancés
* [ ] Logs d'audit (qui a modifié quoi)

**Frontend :**

* [ ] Interface de planification visuelle (calendrier)
* [ ] Calendrier visuel des réservations
* [ ] Recherche/filtres avancés
* [ ] Dashboard analytics (stats véhicules)
* [ ] Mode dark
* [ ] PWA (offline-first)

**DevOps :**

* [ ] CI/CD (GitHub Actions)
* [ ] Déploiement production (AWS/Heroku)
* [ ] Monitoring (Sentry)
* [ ] Tests E2E (Playwright)

---

## 11. Auteur

**GOLO Komi Kekeli Hermann** - ***Togo Data Lab***

---
**Note technique :** Ce projet a été réalisé dans un délai de quatre (4) jours avec un focus sur la qualité du code, la testabilité et l'expérience utilisateur (Comme demande dans les instructions) plutôt que sur la quantité de features.
