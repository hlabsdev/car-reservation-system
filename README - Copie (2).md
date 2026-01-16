# 🚗 Système de Réservation de Véhicules - Togo Data Lab

Plateforme web full-stack de gestion des réservations de véhicules pour les missions professionnelles.

## 📋 Contexte

Le Togo Data Lab dispose d'un parc de véhicules mis à disposition des employés pour leurs déplacements professionnels. Ce système permet de :
- ✅ Réserver un véhicule pour une période donnée
- ✅ Éviter les conflits de réservation (chevauchements)
- ✅ Consulter l'historique de ses réservations
- ✅ Annuler une réservation si nécessaire

## 🏗️ Architecture & Choix Techniques

### Stack Technologique

**Backend:**
- **Django 5.0** + Django REST Framework
- **PostgreSQL 15** (base de données relationnelle)
- **JWT Authentication** (djangorestframework-simplejwt)

**Frontend:**
- **React 18** + TypeScript
- **Vite** (build tool moderne et rapide)
- **TailwindCSS** (styling utility-first)
- **Zustand** (state management léger)
- **React Router** (navigation)

**DevOps:**
- **Docker Compose** (orchestration locale)
- **PostgreSQL** conteneurisé

### Justification des Choix

#### Pourquoi Django ?
1. **Rapidité de développement** : ORM puissant, admin gratuit, migrations automatiques
2. **Sécurité native** : Protection CSRF, SQL injection, XSS out-of-the-box
3. **Transactions ACID** : Critique pour éviter les race conditions sur les réservations
4. **Écosystème mature** : DRF pour l'API REST, nombreuses libraries

#### Pourquoi React + TypeScript ?
1. **Composants réutilisables** : UI modulaire et maintenable
2. **Type safety** : TypeScript réduit les bugs en production
3. **Écosystème riche** : React Router, React Query, etc.
4. **Expérience utilisateur** : SPA fluide sans rechargement de page

#### Pourquoi PostgreSQL ?
1. **Transactions robustes** : ACID garantit la cohérence des réservations
2. **Contraintes de données** : Check constraints, foreign keys
3. **Performance** : Index B-Tree pour les requêtes de chevauchement
4. **Standard industriel** : Utilisé dans 99% des projets Django en production

### Architecture Backend
```
backend/
├── config/                 # Configuration Django
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

**Pattern utilisé :** Service Layer (inspiré DDD)
- **Modèles** : Données uniquement
- **Services** : Logique métier (validation, règles de gestion)
- **Views** : Orchestration HTTP (délègue au service)

**Pourquoi pas DDD complet ?**
- Domaine simple (3 entités : User, Car, Reservation)
- Temps limité (4 jours)
- Service layer = 80% des bénéfices du DDD avec 20% de la complexité

### Architecture Frontend
```
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
- Chaque feature = dossier autonome (service + composants + types)
- Réutilisabilité via `components/`
- Scalable : facile d'ajouter de nouvelles features

## 🎯 Fonctionnalités Implémentées

### ✅ Authentification
- [x] Inscription utilisateur
- [x] Connexion JWT
- [x] Refresh token automatique
- [x] Routes protégées
- [x] Profil utilisateur

### ✅ Gestion des Véhicules
- [x] Liste des véhicules disponibles
- [x] Filtre par disponibilité
- [x] Détails véhicule (marque, modèle, immatriculation)
- [x] Statuts (AVAILABLE, IN_USE, MAINTENANCE, UNAVAILABLE)

### ✅ Réservations
- [x] Création de réservation
- [x] **Validation anti-chevauchement (RÈGLE CRITIQUE)**
- [x] Validation dates (début < fin, pas dans le passé)
- [x] Historique des réservations
- [x] Annulation de réservation
- [x] Affichage conflit explicite

### ✅ Qualité Code
- [x] Tests unitaires backend (service layer)
- [x] Gestion d'erreurs explicite
- [x] Messages utilisateur clairs
- [x] Validation côté client ET serveur

## 🔐 Règle Métier Critique : Anti-Chevauchement

**Problème :** Éviter qu'un même véhicule soit réservé sur des périodes qui se chevauchent.

**Solution implémentée :**
```python
# backend/reservations/services.py
def check_reservation_overlap(car_id, start_date, end_date, exclude_id=None):
    """
    Détecte un chevauchement si pour deux périodes A et B:
    (start_A < end_B) AND (end_A > start_B)
    
    Exemples:
    - Réservation A: 10h-12h | Réservation B: 11h-13h → CONFLIT ❌
    - Réservation A: 10h-12h | Réservation B: 12h-14h → OK ✅
    """
    overlapping = Reservation.objects.filter(
        car_id=car_id,
        status__in=['CONFIRMED', 'PENDING']
    ).filter(
        Q(start_date__lt=end_date) & Q(end_date__gt=start_date)
    )
    
    if exclude_id:
        overlapping = overlapping.exclude(id=exclude_id)
    
    if overlapping.exists():
        raise ValidationError("Conflit de réservation détecté")
```

**Tests implémentés :**
- ✅ Réservation valide (pas de conflit)
- ✅ Conflit exact (mêmes dates)
- ✅ Conflit partiel (chevauchement début/fin)
- ✅ Réservations consécutives (pas de conflit si fin A = début B)
- ✅ Véhicule indisponible (statut MAINTENANCE)
- ✅ Date dans le passé (rejet)

**Protection race condition :**
```python
@transaction.atomic
def create_reservation(*args):
    car = Car.objects.select_for_update().get(id=car_id)
    # Lock pessimiste → évite double booking simultané
```

## 🚀 Installation & Lancement

### Prérequis
- Docker & Docker Compose
- Git

### Lancement (3 commandes)

```bash
# 1. Cloner le repo
git clone <votre-repo-url>
cd car-reservation-system

# 2. Lancer avec Docker Compose
docker-compose up --build

# 3. Initialiser les données (dans un nouveau terminal)
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py seed_data
```

**Accès :**
- Frontend : http://localhost:5173
- Backend API : http://localhost:8000
- Admin Django : http://localhost:8000/admin

### Comptes de Test

**Admin :**
- Username : `admin`
- Password : `admin123`

**Utilisateurs :**
- `kofi / test123`
- `ama / test123`
- `kwame / test123`

## 🧪 Tests

```bash
# Tests backend
docker-compose exec backend python manage.py test

# Tests avec coverage
docker-compose exec backend python manage.py test --verbosity=2
```

**Résultat attendu :**
```
Ran 7 tests in 0.234s
OK
```

## 📁 Structure Complète

```
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

## 🎨 Screenshots

*(Optionnel : ajouter 2-3 screenshots si temps disponible)*

## 🔮 Améliorations Futures

Si plus de temps, voici ce qui serait ajouté :

**Backend :**
- [ ] Notifications email (réservation confirmée/annulée)
- [ ] Système de validation admin (workflow approbation)
- [ ] Export Excel des réservations
- [ ] API pagination et filtres avancés
- [ ] Logs d'audit (qui a modifié quoi)

**Frontend :**
- [ ] Calendrier visuel des réservations
- [ ] Recherche/filtres avancés
- [ ] Dashboard analytics (stats véhicules)
- [ ] Mode dark
- [ ] PWA (offline-first)

**DevOps :**
- [ ] CI/CD (GitHub Actions)
- [ ] Déploiement production (AWS/Heroku)
- [ ] Monitoring (Sentry)
- [ ] Tests E2E (Playwright)

## 👨‍💻 Auteur

**GOLO Komi Kekeli Hermann**
Candidat Stagiaire Développeur Full-Stack - Togo Data Lab

---

**Note technique :** Ce projet a été réalisé en quatre (4) jours avec un focus sur la qualité du code, la testabilité et l'expérience utilisateur plutôt que sur la quantité de features.
```
