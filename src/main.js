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
        displayResults(recommendations, useCase);
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
    // !! IMPORTANT !!
    // La clé API est maintenant un placeholder qui sera injecté par Docker.
    const apiKey = "GEMINI_API_KEY_PLACEHOLDER";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const systemPrompt = `You are an expert AI/ML engineer specializing in Natural Language Processing and embedding models. Your task is to recommend the top 3 best-suited embedding models for a user based on their project description and a provided benchmark dataset. You must analyze the user's needs for constraints and features like multilingual support, document length, performance requirements (real-time/lightweight), and overall goal. Then, you must cross-reference these needs with the benchmark data to find the best models. Your recommendations should explain the trade-offs (e.g., performance vs. size). The primary factor for ranking is the model's score in the user-specified main task, but you MUST adjust the ranking based on the user's specific textual description. For instance, if the user mentions "plusieurs langues", a model with 'Yes' in the 'Multilingual' column should be prioritized. If the user mentions "longs documents", a model with a high 'Max_Tokens' value is better. If the user mentions "ressources limitées" or "temps-réel", smaller models (lower 'Parameters') are preferable. You MUST provide your response in a structured JSON format. Do not add any text or markdown formatting before or after the JSON object.`;

    const userPrompt = `Here is the benchmark data (subset of top models) in CSV format:\n--- BENCHMARK DATA ---\n${benchmarkCsvData}\n--- END BENCHMARK DATA ---\n\nHere is the user's request:\n- Main Task: "${useCase}"\n- Project Description: "${description}"\n\nPlease provide your top 3 recommendations in the specified JSON format.`;
    
    const responseSchema = {"type": "OBJECT", "properties": {"recommendations": {"type": "ARRAY", "description": "An array of the top 3 recommended embedding models.", "items": {"type": "OBJECT", "properties": {"rank": { "type": "NUMBER" }, "model_name": { "type": "STRING" }, "score_for_task": { "type": "NUMBER" }, "justification": { "type": "STRING" }, "key_specs": {"type": "OBJECT", "properties": {"Max_Tokens": { "type": "STRING" }, "Parameters": { "type": "STRING" }, "Dimensions": { "type": "STRING" }}}}}}}};

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

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const result = await response.json();
    const jsonText = result.candidates[0].content.parts[0].text;
    return JSON.parse(jsonText);
}

function displayResults(data, useCase) {
    const resultsContent = document.getElementById('results-content');
    resultsContent.innerHTML = '';

    if (!data.recommendations || data.recommendations.length === 0) {
        resultsContent.innerHTML = `<p class="text-gray-600">Le LLM n'a pas pu fournir de recommandation pour cette demande.</p>`;
        return;
    }

    data.recommendations.forEach((rec, index) => {
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