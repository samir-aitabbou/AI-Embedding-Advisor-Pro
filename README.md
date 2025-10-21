<!-- ![Demo Chatbot](./assets/demo.gif) -->

<p align="center">
  <img src="./assets/demo.gif" alt="Chatbot Demo" width="600"/>
</p>

#  AI Embedding Advisor Pro

**AI Embedding Advisor Pro** est une application web orientée utilisateur qui simplifie et optimise le choix du **modèle d’embeddings** (représentations vectorielles de texte) pour un projet NLP donné.  
Elle combine une **interface conviviale**, un **benchmark public MTEB** et une **intelligence artificielle** pour recommander les modèles les mieux adaptés à vos besoins : multilingue, performance, latence, longueur de texte, etc.

---

##  Objectif du projet

Les embeddings jouent un rôle central dans les applications NLP : recherche d’information, classification, clustering, reranking, similarité de texte (STS), etc.  
Cependant, le paysage des modèles est vaste, et le choix optimal dépend de nombreux critères (taille, dimension, multilinguisme, rapidité, précision).

Ce projet vise à :

- Permettre à un utilisateur de **décrire son besoin en langage naturel**.  
- Utiliser un **modèle IA** pour interpréter la demande.  
- Croiser cette interprétation avec les résultats du **benchmark MTEB**.  
- Générer un **Top 3 de modèles d’embeddings** justifiés et contextualisés.  
- Offrir une **interface claire et moderne** pour explorer et comparer les résultats.

---

##  Fonctionnalités principales

-  **Analyse automatique du besoin utilisateur**  
-  **Recommandation IA**  
-  **Benchmark intégré basé sur MTEB**  
-  **Affichage ergonomique et interactif (TailwindCSS)**  
-  **Projet front‑end pur** déployable sur GitHub Pages, Netlify ou Vercel  

---

##  Structure du projet

```
AI‑Embedding‑Advisor‑Pro/
│
├── src/                     # Fichiers sources
│   ├── index.html            # Structure principale de l’application
│   ├── style.css             # Styles personnalisés
│   └── main.js               # Logique principale (analyse IA et affichage)
│
├── benchmark_data.csv        # Données de benchmark (MTEB)
├── .env                      # (à créer) Contient la clé API Gemini
├── .env.example              # Modèle du fichier .env
├── .gitignore                # Exclut .env et fichiers temporaires
│
├── Dockerfile                # Image Docker pour déploiement
├── docker-compose.yml        # Orchestration du conteneur
├── docker-entrypoint.sh       # Injection dynamique de la clé API
├── run_docker.sh             # Script pour démarrer facilement
│
└── README.md                 # (Ce fichier)
```

---

##  Technologies utilisées

| Technologie | Description |
|--------------|--------------|
| **HTML5 / CSS3 / JavaScript** | Application front‑end légère |
| **TailwindCSS** | Framework CSS moderne et responsive |
| **Google Gemini 2.5 API** | Génération et analyse des recommandations |
| **MTEB Benchmark (Hugging Face)** | Données d’évaluation des modèles |
| **Docker & Docker Compose** | Conteneurisation et déploiement |
| **Nginx** | Serveur web embarqué dans l’image Docker |

---

##  Fonctionnement interne

1. L’utilisateur saisit une description et choisit un cas d’usage (retrieval, clustering, etc.).  
2. Le script charge `benchmark_data.csv` depuis GitHub.  
3. Les données et la description sont envoyées à **Gemini AI**.  
4. Gemini renvoie un **Top 3 structuré en JSON**.  
5. L’interface affiche les modèles recommandés avec :  
   - le **score** par tâche,  
   - les **paramètres techniques**,  
   - une **justification IA personnalisée**.

---

##  Gestion sécurisée de la clé API

Le projet utilise un mécanisme d’**injection via Docker** :  

1. `main.js` contient un placeholder :  
   ```js
   const apiKey = "GEMINI_API_KEY_PLACEHOLDER";
   ```
2. Le `Dockerfile` copie ce fichier en `main.js.template`.  
3. Le script `docker-entrypoint.sh` remplace le placeholder par la clé réelle du `.env`.  
4. L’application est servie via **Nginx** avec la clé intégrée dynamiquement.  

⚠️ **Avertissement :**  
Bien que cette méthode évite de stocker la clé en clair dans le code source, la clé reste accessible côté client.  
Pour un usage en production, créez un **backend sécurisé (Node, Python, etc.)** pour appeler l’API Gemini côté serveur.

---

##  Benchmark MTEB

Le **Massive Text Embedding Benchmark (MTEB)** est une référence mondiale pour l’évaluation de modèles d’embeddings.  
Il couvre plus de **50 ensembles de données multilingues** et **plusieurs centaines de modèles**, évalués sur :

- **Retrieval**
- **Classification**
- **Clustering**
- **Reranking**
- **Semantic Textual Similarity (STS)**

🔗 Leaderboard officiel : [https://huggingface.co/spaces/mteb/leaderboard](https://huggingface.co/spaces/mteb/leaderboard)  
📁 Données intégrées : `benchmark_data.csv` (chargé depuis GitHub).

---

##  Installation et exécution

###  Option 1 — Localement

```bash
git clone https://github.com/samir-aitabbou/AI-Embedding-Advisor-Pro.git
cd AI-Embedding-Advisor-Pro
open index.html
```

### 🐳 Option 2 — Avec Docker

```bash
./run_docker.sh
```

Ce script :
1. Arrête toute instance existante (`docker-compose down`)  
2. Reconstruit l’image (`docker-compose build`)  
3. Lance l’application (`docker-compose up -d`)  

Puis ouvrez : [http://localhost:8080](http://localhost:8080)

---

##  Exemple d’utilisation

**Description :**  
> “Je construis un chatbot multilingue pour un site e-commerce. Il doit répondre rapidement aux questions produits.”

**Cas d’usage :**  
> Retrieval  

**Résultat attendu :**
- Top 3 modèles recommandés  
- Scores et dimensions  
- Justifications contextualisées par Gemini  

---

##  Données de benchmark

Chargées depuis :  
```
https://raw.githubusercontent.com/samir-aitabbou/AI-Embedding-Advisor-Pro/refs/heads/master/benchmark_data.csv
```
Chaque ligne du CSV correspond à un modèle avec :
- ses scores par tâche (`Retrieval`, `Classification`, etc.)  
- ses spécifications (`Parameters`, `Dimensions`, `Multilingual`, etc.)

---

##  Auteur

**Samir Aitabbou**  
📧 [samir.aitabbou@gmail.com](mailto:samir.aitabbou@gmail.com)  
🌐 [GitHub – samir‑aitabbou](https://github.com/samir-aitabbou)

---

##  Licence

Distribué sous licence **MIT** — libre d’utilisation, de modification et de distribution.
