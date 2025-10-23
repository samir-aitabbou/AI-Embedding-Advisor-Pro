let benchmarkCsvData = "";

async function loadBenchmarkCsv() {
    const csvUrl = "https://raw.githubusercontent.com/samir-aitabbou/AI-Embedding-Advisor-Pro/refs/heads/master/benchmark_data.csv";

    const response = await fetch(csvUrl);
    if (!response.ok) {
        throw new Error("Impossible de charger les données du benchmark.");
    }

    benchmarkCsvData = await response.text();
    console.log("✅ Benchmark chargé depuis GitHub !");
}


const USE_CASE_COLUMNS = ['Retrieval', 'Classification', 'Clustering', 'Reranking', 'STS'];

document.addEventListener('DOMContentLoaded', async () => {
    const useCaseSelect = document.getElementById('useCase');
    USE_CASE_COLUMNS.forEach(useCase => {
        const option = document.createElement('option');
        option.value = useCase;
        option.textContent = useCase;
        useCaseSelect.appendChild(option);
    });

    try {
        await loadBenchmarkCsv(); // Chargement du fichier CSV au démarrage
        console.log("Benchmark CSV chargé !");
    } catch (err) {
        console.error("Erreur de chargement du benchmark:", err);
        alert("Erreur : impossible de charger les données du benchmark.");
    }

    document.getElementById('analyzeBtn').addEventListener('click', handleAnalysis);
});


async function handleAnalysis() {
    const description = document.getElementById('dataDescription').value;
    const useCase = document.getElementById('useCase').value;

    if (description.trim() === '') {
        alert("Veuillez décrire votre projet pour obtenir une recommandation pertinente.");
        return;
    }

    const ui = {
        btn: document.getElementById('analyzeBtn'),
        btnText: document.getElementById('btn-text'),
        btnLoader: document.getElementById('btn-loader'),
        placeholder: document.getElementById('placeholder'),
        loading: document.getElementById('loading'),
        error: document.getElementById('error'),
        errorMessage: document.getElementById('error-message'),
        resultsContent: document.getElementById('results-content'),
    };

    ui.btn.disabled = true;
    ui.btnText.classList.add('hidden');
    ui.btnLoader.classList.remove('hidden');
    ui.placeholder.classList.add('hidden');
    ui.resultsContent.classList.add('hidden');
    ui.error.classList.add('hidden');
    ui.loading.classList.remove('hidden');
    
    try {
        const recommendations = await getLlmRecommendations(description, useCase);
        displayResults(recommendations, useCase); // La fonction displayResults gérera l'affichage
        ui.resultsContent.classList.remove('hidden');
    } catch (err) {
        console.error("Error during LLM analysis:", err);
        ui.errorMessage.textContent = err.message || "Une erreur inconnue est survenue.";
        ui.error.classList.remove('hidden');
    } finally {
        ui.loading.classList.add('hidden');
        ui.btn.disabled = false;
        ui.btnText.classList.remove('hidden');
        ui.btnLoader.classList.add('hidden');
    }
}



async function getLlmRecommendations(description, useCase) {
    const apiKey = "GEMINI_API_KEY_PLACEHOLDER"; // Note: N'exposez jamais de clés API en production côté client.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    // --- MODIFICATION 1 : PROMPT ---
// Dans getLlmRecommendations, remplacez UNIQUEMENT cette variable :

    const systemPrompt = `
You are an expert AI/ML engineer specializing in embedding models. 
Your **primary and most important task** is to analyze the user's 'Project Description' for relevance before doing anything else.

**RELEVANCE CHECK (DO THIS FIRST):**
1.  Read ONLY the 'Project Description' provided by the user.
2.  Determine if it is a genuine request for embedding model recommendations (e.g., it mentions chatbots, semantic search, RAG, classification, document processing, code, etc.).
3.  If the description is **NOT** a genuine request (e.g., "salut", "comment ça va?", "quelle est la date de naissance de Messi?", "écris-moi un poème", or any simple greeting or unrelated question), you **MUST** follow the 'Off-Topic' instructions.

**JSON RESPONSE LOGIC (STRICT):**

* **If Off-Topic (based on your RELEVANCE CHECK):**
    * You **MUST** set "is_off_topic": true.
    * You **MUST** set "off_topic_message" to this exact string: "Je suis spécialisé uniquement dans la recommandation de modèles d'embedding en fonction des données de benchmark et de la description de votre projet. Veuillez me fournir ces informations pour une analyse."
    * You **MUST** set "recommendations": [] (an empty array).
    * **Do NOT** analyze the benchmark data. Do NOT try to find models. Your job stops here.

* **If On-Topic (based on your RELEVANCE CHECK):**
    * You **MUST** set "is_off_topic": false.
    * You **MUST** set "off_topic_message": null.
    * **THEN, AND ONLY THEN,** you may proceed to analyze the provided benchmark data.
    * Cross-reference the user's needs (description, 'Main Task') with the benchmark to find the top 3 models.
    * Populate the "recommendations" array with your top 3 findings, including justification and specs.
    * Prioritize the 'Main Task' score but adjust ranking based on constraints mentioned in the description (multilingual, document length, real-time, etc.).

Your response MUST always be a valid JSON object following the schema.
`;

    const userPrompt = `Here is the benchmark data (subset of top models) in CSV format:\n--- BENCHMARK DATA ---\n${benchmarkCsvData}\n--- END BENCHMARK DATA ---\n\nUser request:\n- Main Task: "${useCase}"\n- Project Description: "${description}"\n\nProvide top 3 recommendations in the specified JSON format if applicable.`;

    // --- MODIFICATION 2 : SCHÉMA DE RÉPONSE ---
    const responseSchema = {
        "type": "OBJECT",
        "properties": {
            "is_off_topic": {
                "type": "BOOLEAN",
                "description": "Set to true if the user's request is unrelated to embedding models."
            },
            "off_topic_message": {
                "type": "STRING",
                "description": "The refusal message to show if is_off_topic is true. (Optional)"
            },
            "recommendations": {
                "type": "ARRAY",
                "description": "An array of the top 3 recommended embedding models. (Should be null or empty if is_off_topic is true)",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "rank": { "type": "NUMBER" },
                        "model_name": { "type": "STRING" },
                        "score_for_task": { "type": "NUMBER" },
                        "justification": { "type": "STRING" },
                        "key_specs": {
                            "type": "OBJECT",
                            "properties": {
                                "Max_Tokens": { "type": "STRING" },
                                "Parameters": { "type": "STRING" },
                                "Dimensions": { "type": "STRING" }
                            }
                        }
                    }
                }
            }
        },
        "required": ["is_off_topic"] // Seul ce champ est maintenant requis
    };

    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json", responseSchema: responseSchema, temperature: 0.2 },
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    // --- MODIFICATION 3 : GESTION DE LA RÉPONSE ---

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const result = await response.json();

    // Vérification de sécurité pour la réponse de l'API
    if (!result.candidates || !result.candidates[0].content || !result.candidates[0].content.parts[0].text) {
        console.error("Réponse invalide ou malformée de l'API Gemini:", result);
        throw new Error("Réponse invalide de l'API LLM.");
    }
    
    const jsonText = result.candidates[0].content.parts[0].text.trim();
    let parsedResponse;

    try {
        parsedResponse = JSON.parse(jsonText);
    } catch (e) {
        console.error("Erreur de parsing du JSON retourné:", jsonText);
        throw new Error("Le LLM a retourné un JSON invalide.");
    }
    
    // 1. Vérifier si la requête était hors sujet
    if (parsedResponse.is_off_topic === true) {
        // C'est hors sujet. Nous retournons un objet "recommandation" spécial
        // que la fonction displayResults() saura afficher comme un message.
        return { 
            recommendations: [{ 
                rank: 0, // Un rang 0 ou spécial
                model_name: "Requête Hors Sujet", 
                score_for_task: 0, 
                justification: parsedResponse.off_topic_message || "La demande n'est pas liée à la recommandation de modèles d'embedding.", 
                key_specs: { Max_Tokens: "-", Parameters: "-", Dimensions: "-" } 
            }] 
        };
    }

    // 2. Si ce n'est pas hors sujet, retourner les recommandations normalement
    if (parsedResponse.recommendations && parsedResponse.recommendations.length > 0) {
         return parsedResponse;
    }
   
    // 3. Cas de secours si le JSON est valide mais vide (pas de recommandations trouvées)
    return { 
        recommendations: [{ 
            rank: 0,
            model_name: "Aucun modèle trouvé", 
            score_for_task: 0, 
            justification: "L'IA n'a pas pu trouver de modèle correspondant précisément à vos critères dans le benchmark. Essayez de reformuler votre demande.", 
            key_specs: { Max_Tokens: "-", Parameters: "-", Dimensions: "-" } 
        }] 
    };
}



function displayResults(data, useCase) {
    const resultsContent = document.getElementById('results-content');
    resultsContent.innerHTML = ''; 

    if (!data.recommendations || data.recommendations.length === 0) {
        resultsContent.innerHTML = `<p class="text-gray-600">Le LLM n'a pas pu fournir de recommandation pour cette demande.</p>`;
        return;
    }

    data.recommendations.forEach((rec, index) => {
        // Logique spéciale pour afficher le message hors-sujet ou "aucun résultat"
        if (rec.rank === 0) {
            const card = `
                <div class="result-card fade-in p-6 rounded-2xl border bg-white text-gray-800 shadow-lg border-gray-200" style="animation-delay: ${index * 150}ms;">
                    <div class="flex items-start justify-between">
                        <div>
                            <span class="text-sm font-semibold text-indigo-600">Information</span>
                            <h3 class="text-2xl font-bold text-gray-900 mt-1">${rec.model_name}</h3>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <div class="mt-2 text-sm text-gray-600">
                            ${rec.justification}
                        </div>
                    </div>
                </div>
            `;
            resultsContent.innerHTML += card;
            return; // Passe à la recommandation suivante (s'il y en a)
        }
        
        // Logique d'affichage normale pour les vraies recommandations
        const isTopPick = rec.rank === 1;
        const cardClass = isTopPick 
            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl border-transparent' 
            : 'bg-white text-gray-800 shadow-lg border-gray-200';
        const titleClass = isTopPick ? 'text-white' : 'text-gray-900';
        const subtitleClass = isTopPick ? 'text-indigo-200' : 'text-gray-500';
        const justificationClass = isTopPick ? 'text-indigo-100' : 'text-gray-600';
        const specValueClass = isTopPick ? 'text-white' : 'text-gray-800';
        const scoreBgClass = isTopPick ? 'bg-white/20' : 'bg-gray-100';

        const card = `
            <div class="result-card fade-in p-6 rounded-2xl border ${cardClass}" style="animation-delay: ${index * 150}ms;">
                ${isTopPick ? `<div class="absolute top-0 right-6 -mt-3 bg-yellow-400 text-yellow-900 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">Top Recommandation</div>` : ''}
                
                <div class="flex items-start justify-between">
                    <div>
                        <span class="text-sm font-semibold ${isTopPick ? 'text-indigo-300' : 'text-indigo-600'}">Recommandation #${rec.rank}</span>
                        <h3 class="text-2xl font-bold ${titleClass} mt-1">${rec.model_name}</h3>
                    </div>
                </div>

                <div class="mt-4 pt-4 border-t ${isTopPick ? 'border-white/20' : 'border-gray-200'}">
                    <h4 class="font-semibold ${isTopPick ? 'text-indigo-200' : 'text-gray-700'}">Analyse de l'expert IA :</h4>
                    <div class="mt-2 text-sm max-h-24 overflow-y-auto custom-scrollbar pr-2 ${justificationClass}">
                        ${rec.justification}
                    </div>
                </div>

                <div class="mt-4 pt-4 border-t ${isTopPick ? 'border-white/20' : 'border-gray-200'}">
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="font-semibold ${isTopPick ? 'text-indigo-200' : 'text-gray-700'}">Score Tâche (${useCase})</h4>
                        <span class="font-bold text-lg ${titleClass}">${rec.score_for_task}</span>
                    </div>
                    <div class="w-full bg-black/20 rounded-full h-2.5">
                        <div class="bg-gradient-to-r ${isTopPick ? 'from-yellow-300 to-yellow-500' : 'from-indigo-400 to-purple-500'}" style="width: ${rec.score_for_task}%; height: 100%; border-radius: 9999px;"></div>
                    </div>
                </div>

                <div class="mt-4 pt-4 border-t ${isTopPick ? 'border-white/20' : 'border-gray-200'} grid grid-cols-3 gap-4 text-center">
                    <div class="${scoreBgClass} p-2 rounded-lg">
                        <p class="text-xs ${subtitleClass}">Paramètres</p>
                        <p class="font-bold text-sm ${specValueClass}">${rec.key_specs.Parameters}</p>
                    </div>
                    <div class="${scoreBgClass} p-2 rounded-lg">
                        <p class="text-xs ${subtitleClass}">Max Tokens</p>
                        <p class="font-bold text-sm ${specValueClass}">${rec.key_specs.Max_Tokens}</p>
                    </div>
                    <div class="${scoreBgClass} p-2 rounded-lg">
                        <p class="text-xs ${subtitleClass}">Dimensions</p>
                        <p class="font-bold text-sm ${specValueClass}">${rec.key_specs.Dimensions}</p>
                    </div>
                </div>
            </div>
        `;
        resultsContent.innerHTML += card;
    });
}