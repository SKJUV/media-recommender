# Guide de Contribution - Média-Recommender V2.0

Merci de votre intérêt pour contribuer au projet **Média-Recommender V2.0** ! Ce document définit les directives et conventions pour maintenir une qualité de code irréprochable.

---

## 🛠️ Code de Conduite

Nous nous engageons à offrir un environnement accueillant et bienveillant pour tous les contributeurs, quel que soit leur niveau d'expérience.

---

## 🚀 Comment Contribuer ?

### 1. Reporter un Bug ou Proposer une Fonctionnalité
- Vérifiez d'abord si une issue équivalente existe déjà sur GitHub.
- Créez une nouvelle **Issue** détaillée avec :
  - La description claire du problème ou de la fonctionnalité demandée.
  - Les étapes pour reproduire le comportement (si bug).
  - La configuration environnementale (Navigateur, OS, version de Node.js).

### 2. Workflow de Pull Request (PR)

1. **Forkez** le dépôt et créez votre branche de fonctionnalité depuis `main` :
   ```bash
   git checkout -b feat/ma-super-feature
   ```
2. **Respectez les standards de code** (TypeScript strict, linting eslint) :
   ```bash
   npm run lint
   ```
3. **Faites des commits atomiques** suivant les conventions Conventional Commits :
   - `feat(scraper): ajout du scraper SensCritique`
   - `fix(ui): correction de l'alignement des cartes dans le chat`
   - `docs(readme): ajout des schémas d'architecture`
4. **Assurez-vous que le projet compile sans erreur** :
   ```bash
   npm run build
   ```
5. **Soumettez votre PR** avec une description claire de vos modifications.

---

## 🏗️ Conventions de Développement

- **NoDB Constraint** : Le serveur ne doit stocker aucune base de données permanente ni consigner d'adresses IP d'utilisateurs.
- **Polite Scraping** : Tout nouveau scraper doit obligatoirement utiliser l'utilitaire `politeFetch` et respecter la temporisation minimale de 500ms entre les requêtes.
- **Glassmorphism UI** : Conservez l'esthétique sombre glassmorphism définie dans `src/app/globals.css`.

---

## 💬 Des questions ?

Rejoignez la section des Discussions du dépôt ou ouvrez une issue ! Merci encore pour votre contribution.
