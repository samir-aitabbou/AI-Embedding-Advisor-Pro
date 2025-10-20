# 🧠 AI Embedding Advisor Pro

**AI Embedding Advisor Pro** est une application web interactive qui utilise l’intelligence artificielle pour recommander les **meilleurs modèles d’embeddings** (représentations vectorielles de texte) en fonction des besoins spécifiques d’un projet NLP (Natural Language Processing).  
L’outil croise les besoins de l’utilisateur (objectifs, contraintes, cas d’usage) avec un **benchmark de modèles d’embeddings** pour proposer un **top 3 personnalisé**.

---

## 🚀 Fonctionnalités principales

- 🔍 **Analyse automatique du besoin** : l’utilisateur décrit son projet et choisit un cas d’usage (retrieval, classification, clustering, etc.).
- 🤖 **Recommandation IA** : l’application interroge un modèle **Google Gemini 2.5 Flash** pour générer des recommandations sur mesure.
- 📊 **Benchmark intégré** : les résultats sont basés sur un **fichier CSV** de benchmark public hébergé sur GitHub.
- 🧩 **Affichage dynamique et ergonomique** : les résultats sont présentés sous forme de **cartes interactives** avec scores, spécifications et justifications.
- 🎨 **Interface moderne** : design responsive construit avec **TailwindCSS** et **animations fluides** (fade-in, hover, loader).

---

## 🏗️ Structure du projet

```
AI-Embedding-Advisor-Pro/
│
├── index.html           # Page principale de l’application
├── benchmark_data.csv   # Données de benchmark chargées depuis GitHub
├── README.md            # Ce fichier
└── assets/              # (optionnel) Dossier pour icônes, polices, etc.
```

---

## ⚙️ Technologies utilisées

| Technologie | Description |
|--------------|--------------|
| **HTML5 / CSS3 / JS** | Application entièrement front-end |
| **TailwindCSS** | Framework CSS utilitaire pour le design réactif |
| **Google Gemini API** | Modèle de langage utilisé pour l’analyse et la génération des recommandations |
| **GitHub Raw CSV** | Source de données du benchmark des modèles |
| **Google Fonts (Inter)** | Police moderne et lisible |

---

## 🧩 Fonctionnement

1. **Saisie du besoin**  
   L’utilisateur décrit son projet et choisit un cas d’usage principal (Retrieval, Classification, Clustering, Reranking, STS).

2. **Chargement du benchmark**  
   Le script charge le fichier `benchmark_data.csv` depuis GitHub via `fetch()`.

3. **Appel au modèle Gemini**  
   Le prompt système et la description utilisateur sont envoyés à l’API :
   ```
   https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent
   ```
   avec un schéma JSON défini pour garantir une réponse structurée.

4. **Affichage des recommandations**  
   Le top 3 est affiché avec :
   - Le **nom du modèle**
   - Son **score sur la tâche choisie**
   - Ses **spécifications techniques**
   - Une **justification détaillée**

---

## 🧰 Installation et exécution

### Option 1 — Localement
1. Clone le dépôt :
   ```bash
   git clone https://github.com/samir-aitabbou/AI-Embedding-Advisor-Pro.git
   cd AI-Embedding-Advisor-Pro
   ```

2. Ouvre simplement le fichier :
   ```bash
   open index.html
   ```
   ou fais un double-clic dessus (aucun serveur requis).

---

### Option 2 — Hébergement en ligne
Tu peux déployer le projet gratuitement sur :
- [GitHub Pages](https://pages.github.com)
- [Netlify](https://www.netlify.com)
- [Vercel](https://vercel.com)

---

## 🔑 Configuration API

Le script utilise l’API **Google Gemini** avec une clé d’API définie dans le code :

```js
const apiKey = "AIzaSyBl3jseHBrqSSrv1FP6spyBm0PqMnV6ihQ";
```

> ⚠️ **Important :** pour un usage en production, il est fortement recommandé de :
> - Créer ta propre clé API Google AI Studio  
> - La stocker côté serveur (et non en clair dans le code client)
> - Configurer un proxy ou backend intermédiaire pour sécuriser les appels

---

## 📈 Données de benchmark

Le benchmark est chargé depuis un fichier CSV hébergé sur GitHub :
```js
https://raw.githubusercontent.com/samir-aitabbou/AI-Embedding-Advisor-Pro/refs/heads/master/benchmark_data.csv
```

Chaque ligne du CSV correspond à un modèle avec ses performances sur plusieurs tâches (`Retrieval`, `Classification`, `Clustering`, etc.), ainsi que ses caractéristiques (`Parameters`, `Dimensions`, `Multilingual`, `Max_Tokens`, ...).

---

## 💡 Exemple d’utilisation

**Description :**
> “Je construis un chatbot pour un site e-commerce multilingue. Il doit répondre rapidement aux questions sur les produits.”

**Cas d’usage :**
> Retrieval

**Résultat attendu :**
- **Top 3** modèles d’embeddings recommandés
- Scores, paramètres et dimensions
- Justifications détaillées adaptées au contexte multilingue

---

## 🧑‍💻 Auteur

👤 **Samir Aitabbou**  
📧 [samir.aitabbou@gmail.com](mailto:samir.aitabbou@gmail.com)  
🌐 [GitHub - samir-aitabbou](https://github.com/samir-aitabbou)

---

## 📜 Licence

Ce projet est distribué sous licence **MIT** — libre de l’utiliser, le modifier et le distribuer.
