// Variables globales 
let verbes, verbesTurbo, verbesExtreme; 
let groupeActuel = "premierGroupe";

const sujets = ["je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles"];
const coefficients = { premierGroupe: 1, deuxiemeGroupe: 2, troisiemeGroupe: 3, extreme: 3 };
let score = 0, currentQuestion = 0, modeAleatoireActif = true, modeTurboActif = false, modeExtremeActif = false;
let groupesUtilises = new Set();

// Options de temps
const tempsOptions = {
    normal: ["présent", "futur", "imparfait", "passé composé"],
    turbo: ["présent", "futur", "imparfait", "passé composé", "imparfait du subjonctif", "conditionnel présent", "subjonctif présent", "impératif", "passé simple", "participe présent"],
    extreme: ["passé antérieur", "passé simple", "plus-que-parfait", "futur antérieur", "subjonctif passé", "subjonctif imparfait", "subjonctif plus-que-parfait", "conditionnel passé"]
};

// Charger les verbes depuis les fichiers JSON
async function chargerVerbes() {
    try {
        const [response, responseTurbo, responseExtreme] = await Promise.all([
            fetch('verbes.json'), 
            fetch('verbes_turbo.json'), 
            fetch('verbes_extreme.json')
        ]);

        if (!response.ok || !responseTurbo.ok || !responseExtreme.ok) throw new Error('Erreur lors du chargement des fichiers JSON');

        verbes = await response.json();
        verbesTurbo = await responseTurbo.json();
        verbesExtreme = await responseExtreme.json();
        
        genererPhrase(true);
    } catch (error) {
        console.error('Erreur : ', error);
    }
}

// Activer le mode (Normal, Turbo, ou Extrême)
function activerMode(mode) {
    if (mode === 'turbo') {
        modeTurboActif = !modeTurboActif;
        toggleButton('modeTurbo', modeTurboActif, "Mode TURBO (Actif)", "Mode TURBO (Inactif)");
    } else if (mode === 'extreme') {
        modeExtremeActif = !modeExtremeActif;
        toggleButton('modeExtreme', modeExtremeActif, "Mode EXTREME (Actif)", "Mode EXTREME (Inactif)");
    }

    // Afficher ou masquer les boutons en fonction du mode
    const boutonsGroupes = document.querySelectorAll('#premierGroupe, #deuxiemeGroupe, #troisiemeGroupe, #modeAleatoire');
    boutonsGroupes.forEach(bouton => {
        bouton.style.display = (modeTurboActif || modeExtremeActif) ? 'none' : 'inline-block';
    });

    genererPhrase(true);
}

// Fonction pour activer ou désactiver les boutons
function toggleButton(buttonId, isActive, activeText, inactiveText) {
    const button = document.getElementById(buttonId);
    button.classList.toggle('active', isActive);
    button.innerText = isActive ? activeText : inactiveText;
}

// Choisir un groupe de verbes
function choisirGroupe(groupe) {
    groupeActuel = groupe;
    modeAleatoireActif = false;
    genererPhrase(true);
}

// Générer une phrase aléatoire
function genererPhrase(forceGenerate = false) {
    if (!forceGenerate && currentQuestion > 0) return;

    let verbesGroupe, tempsChoisi;
    
    if (modeExtremeActif) {
        verbesGroupe = verbesExtreme.verbes;
        tempsChoisi = tempsOptions.extreme[Math.floor(Math.random() * tempsOptions.extreme.length)];
    } else if (modeTurboActif) {
        verbesGroupe = verbesTurbo.TURBO;
        tempsChoisi = tempsOptions.turbo[Math.floor(Math.random() * tempsOptions.turbo.length)];
    } else {
        verbesGroupe = verbes[groupeActuel];
        tempsChoisi = tempsOptions.normal[Math.floor(Math.random() * tempsOptions.normal.length)];
    }

    const verbeActuel = verbesGroupe[Math.floor(Math.random() * verbesGroupe.length)];
    const pronomChoisi = choisirPronomDisponible(verbeActuel, tempsChoisi);

    if (!pronomChoisi) {
        console.error(`Aucun pronom disponible pour le verbe "${verbeActuel.infinitif}" au temps "${tempsChoisi}".`);
        genererPhrase(true); 
        return;
    }

    // Calculer les points selon le temps et le groupe
    let points = calculerPoints(tempsChoisi);
    score += points;

    const pronomAffiche = tempsChoisi.includes("subjonctif") ? (pronomChoisi.pronom.startsWith("il") ? "qu'il" : `que ${pronomChoisi.pronom}`) : pronomChoisi.pronom;
    
    console.log(`Phrase générée: Verbe "${verbeActuel.infinitif}", Temps "${tempsChoisi}", Pronom "${pronomChoisi.pronom}".`);
    document.getElementById('verbe-container').innerText = `Verbe : ${verbeActuel.infinitif}`;
    document.getElementById('temps-container').innerText = `Temps : ${tempsChoisi.charAt(0).toUpperCase() + tempsChoisi.slice(1)}`;
    document.getElementById('phrase-container').innerText = `Conjugue le verbe "${verbeActuel.infinitif}" à ${tempsChoisi} pour "${pronomAffiche}".`;
    document.getElementById('score-container').innerText = `Score : ${score}`;
}

// Fonction pour calculer les points en fonction du temps
function calculerPoints(temps) {
    const pointsParTemps = {
        "présent": 1,
        "futur": 2,
        "imparfait": 4,
        "passé composé": 3,
        "imparfait du subjonctif": 4,
        "conditionnel présent": 3,
        "subjonctif présent": 4,
        "impératif": 2,
        "passé simple": 3,
        "participe présent": 1,
        "passé antérieur": 3,
        "plus-que-parfait": 4,
        "futur antérieur": 2,
        "subjonctif passé": 4,
        "subjonctif imparfait": 4,
        "subjonctif plus-que-parfait": 4,
        "conditionnel passé": 3
    };
    return pointsParTemps[temps] * coefficients[groupeActuel] || 0;
}

// Choisir un pronom disponible (fonction d'exemple, à compléter selon votre logique)
function choisirPronomDisponible(verbe, temps) {
    // Logique pour choisir un pronom disponible
    // ...
}

// Appeler la fonction de chargement des verbes au chargement de la page
window.onload = chargerVerbes;
