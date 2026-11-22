# ENSO Dashboard – Frontend (El Niño / La Niña)

Application web **React** qui affiche les données de l'indice **ONI/RONI** (*Oceanic Niño Index*) fournies par l'[API ENSO](../README.md) : statistiques clés, courbes d'évolution, moyennes annuelles, répartition des phases, heatmap et tableau filtrable.

Les phases sont déterminées selon les seuils NOAA :

| Valeur de l'indice | Phase |
|---|---|
| ≥ +0,5 | 🔴 **El Niño** |
| ≤ −0,5 | 🔵 **La Niña** |
| entre −0,5 et +0,5 | ⚪ **Neutre** |

---

## Sommaire

1. [Aperçu des fonctionnalités](#aperçu-des-fonctionnalités)
2. [Stack technique](#stack-technique)
3. [Prérequis](#prérequis)
4. [Installation et lancement](#installation-et-lancement)
5. [Configuration](#configuration)
6. [Scripts npm](#scripts-npm)
7. [Contrat avec l'API](#contrat-avec-lapi)
8. [Structure du projet](#structure-du-projet)
9. [Composants](#composants)
10. [Thèmes](#thèmes)
11. [Qualité du code : ESLint, Husky, Commitlint](#qualité-du-code--eslint-husky-commitlint)
12. [Dépannage](#dépannage)

---

## Aperçu des fonctionnalités

| Bloc | Description |
|---|---|
| **Barre de navigation** | Titre de l'application et sélecteur de thème (6 thèmes daisyUI) |
| **Cartes de statistiques** | Dernière valeur, pic El Niño, creux La Niña, nombre de mois par phase |
| **Filtre de période** | Deux curseurs (début / fin) pour restreindre toutes les visualisations à une plage d'années |
| **Courbe d'évolution** | Graphique en aires (rouge au-dessus de 0, bleu en dessous), lignes de seuil à ±0,5 et zoom par `Brush` |
| **Moyennes annuelles** | Histogramme de l'anomalie moyenne par année, coloré selon la phase |
| **Répartition des phases** | Graphique en anneau (donut) El Niño / La Niña / Neutre en pourcentage |
| **Heatmap** | Tableau année × mois, avec une intensité de couleur proportionnelle à l'anomalie |
| **Tableau de données** | Filtre par année, cases à cocher par phase, pagination (12 lignes par page), badges de phase |

---

## Stack technique

- **React 19** et **Vite 8** (bundler et serveur de développement)
- **Tailwind CSS 4** avec le plugin `@tailwindcss/vite`
- **daisyUI 5** (composants UI et thèmes)
- **Recharts 3** (graphiques)
- **ESLint 10** (règles React Hooks et React Refresh)
- **Husky** et **Commitlint** (commits conventionnels)

---

## Prérequis

| Outil | Version |
|---|---|
| Node.js | **22.12 ou supérieur** (requis par Vite 8 et Commitlint 21) |
| npm | fourni avec Node.js |
| API ENSO | démarrée sur `http://127.0.0.1:3000` (voir le README du backend) |

---

## Installation et lancement

### 1. Démarrer le backend

Dans le projet de l'API :

```bash
docker compose up -d
npm install
npm run init     # création de la table + import des données NOAA
npm run start    # API sur http://localhost:3000
```

### 2. Installer et lancer le frontend

```bash
npm install
npm run dev
```

Vite affiche l'URL du serveur de développement, par défaut `http://localhost:5173`.

### 3. Build de production

```bash
npm run build      # génère le dossier dist/
npm run preview    # sert le build en local pour vérification
```

---

## Configuration

Les variables d'environnement sont lues par Vite (préfixe `VITE_` obligatoire). Crée un fichier `.env` à la racine du frontend :

```env
VITE_API_URL=http://127.0.0.1:3000/oni/all
```

| Variable | Rôle | Valeur par défaut |
|---|---|---|
| `VITE_API_URL` | URL complète de l'endpoint qui renvoie toutes les données ONI | `http://127.0.0.1:3000/oni/all` |

> Après toute modification du `.env`, redémarre `npm run dev`.

---

## Scripts npm

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement avec rechargement à chaud (HMR) |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualise le build de production |
| `npm run lint` | Analyse le code avec ESLint |
| `npm run prepare` | Installe les hooks Husky (exécuté automatiquement après `npm install`) |

---

## Contrat avec l'API

Le frontend appelle un seul endpoint : `GET /oni/all`.

Il attend un **tableau JSON** où chaque élément représente un mois :

```json
[
  { "year": 2023, "month": 7, "oni": 1.1 },
  { "year": 2023, "month": 8, "oni": 1.3 }
]
```

| Champ | Type | Description |
|---|---|---|
| `year` | nombre | Année |
| `month` | nombre (1 à 12) | Mois central de la saison de 3 mois |
| `oni` | nombre | Anomalie en °C |

Les valeurs sont converties en nombres (`+d.year`, `+d.month`, `+d.oni`) dans le hook `useEnsoData`, ce qui tolère les champs renvoyés sous forme de chaînes (cas fréquent des `NUMERIC` PostgreSQL).

En cas d'erreur réseau ou HTTP, l'erreur est affichée dans la console et l'application reçoit une liste vide, sans planter.

L'API doit autoriser le CORS (déjà activé dans `app.js` du backend avec `cors()`).

---

## Structure du projet

```
.
├── index.html                # point d'entrée HTML (thème "night" par défaut)
├── vite.config.js            # plugins React et Tailwind
├── eslint.config.js
├── commitlint.config.js
├── .env                      # VITE_API_URL
├── package.json
└── src/
    ├── main.jsx              # montage de l'application React
    ├── components/
    │   ├── Navbar.jsx
    │   ├── StatsRow.jsx
    │   ├── RangeFilter.jsx
    │   ├── EvolutionChart.jsx
    │   ├── AnnualChart.jsx
    │   ├── PhasePie.jsx
    │   ├── Heatmap.jsx
    │   └── DataTable.jsx
    ├── hooks/
    │   └── useEnsoData.js    # récupération des données depuis l'API
    └── lib/
        └── enso.js           # constantes, seuils, couleurs, helpers
```

> Adapte ce schéma si ton arborescence diffère (par exemple l'emplacement exact de `App.jsx`).

---

## Composants

### `useEnsoData` (hook)
Charge les données au montage, les convertit en nombres et expose `{ all, loading }`.

### `lib/enso.js` (utilitaires partagés)
- `THEMES`, `COLORS`, `LABEL`, `MONTHS` : constantes d'affichage
- `phase(v)` : renvoie `elnino`, `lanina` ou `neutre` selon les seuils ±0,5
- `monthLabel(d)` : formate un mois en `AAAA-MM`
- `heatColor(v)` : couleur de cellule de la heatmap, d'autant plus intense que la valeur est éloignée de 0 (plafonnée à 2,5)

### `Navbar`
Titre et menu déroulant de choix du thème (`theme`, `onTheme`).

### `StatsRow`
Calcule à partir des lignes filtrées la dernière valeur, le maximum (pic El Niño), le minimum (creux La Niña) et le décompte des mois par phase.

### `RangeFilter`
Deux curseurs (`min`, `max`, `from`, `to`) qui garantissent que le début ne dépasse jamais la fin.

### `EvolutionChart`
`AreaChart` empilé : la partie positive est rouge, la partie négative est bleue. Lignes de référence à +0,5 et −0,5, axe Y de −3 à +3, et `Brush` pour zoomer sur une période.

### `AnnualChart`
`BarChart` de la moyenne annuelle (arrondie à 2 décimales), chaque barre étant colorée selon sa phase, avec une ligne de référence à 0.

### `PhasePie`
Donut de la répartition des mois par phase, avec le pourcentage affiché sur chaque part et le nombre de mois dans l'infobulle.

### `Heatmap`
Tableau année × mois, trié de la plus récente à la plus ancienne. Le survol d'une cellule indique la phase.

### `DataTable`
Tableau zébré avec :
- recherche par année
- filtre par phase (cases à cocher)
- tri du plus récent au plus ancien
- pagination de 12 lignes, avec retour automatique à la page 1 quand les filtres changent

---

## Thèmes

Le thème par défaut est `night` (attribut `data-theme` sur la balise `<html>`). Le sélecteur de la barre de navigation propose :

`light` · `dark` · `cupcake` · `emerald` · `synthwave` · `night`

Pour en ajouter un, complète la liste `THEMES` dans `src/lib/enso.js` avec un thème supporté par daisyUI.

---

## Qualité du code : ESLint, Husky, Commitlint

- **ESLint** : `npm run lint` vérifie les fichiers `.js` et `.jsx` (règles recommandées, Hooks de React, React Refresh).
- **Husky** : les hooks Git sont installés automatiquement via le script `prepare`.
- **Commitlint** : les messages de commit doivent suivre la convention [Conventional Commits](https://www.conventionalcommits.org/fr/) :

```
feat: ajout du filtre par période
fix: correction de la couleur de la heatmap
docs: mise à jour du README
```

Types courants : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

---

## Dépannage

**Les graphiques sont vides, la console affiche `Erreur API`**
L'API n'est pas démarrée ou n'est pas joignable. Vérifie `curl http://127.0.0.1:3000/health` puis relance `npm run start` côté backend.

**Erreur CORS dans la console du navigateur**
Le backend doit appeler `app.use(cors())` (c'est le cas dans `app.js`). Vérifie aussi que l'URL du frontend n'est pas bloquée par un proxy.

**Les données sont vides alors que l'API répond**
La table est peut-être vide : lance `npm run init` côté backend. Vérifie aussi que la réponse contient bien les champs `year`, `month` et `oni`.

**Ma modification du `.env` n'est pas prise en compte**
Redémarre `npm run dev` : Vite ne relit les variables qu'au démarrage.

**`Unsupported engine` ou erreur de version de Node**
Utilise Node 22.12 ou supérieur (`node -v`).

**Les commits sont refusés**
Le message ne respecte pas la convention Conventional Commits. Exemple valide : `feat: ajout de la heatmap`.

---

## Source des données

Indice produit par la [NOAA Climate Prediction Center](https://www.cpc.ncep.noaa.gov/data/indices/RONI.ascii.txt) et servi par l'API ENSO.
