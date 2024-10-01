// Variables globales 
let verbes;
let verbesTurbo;
let verbesExtreme; // Ajout pour le mode EXTREME
let groupeActuel = "premierGroupe";

const sujets = ["je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles"];
const descriptionPronoms = {
    je: "à la première personne du singulier",
    tu: "à la deuxième personne du singulier",
    il: "à la troisième personne du singulier",
    elle: "à la troisième personne du singulier",
    on: "à la troisième personne du singulier",
    nous: "à la première personne du pluriel",
    vous: "à la deuxième personne du pluriel",
    ils: "à la troisième personne du pluriel",
    elles: "à la troisième personne du pluriel"
};

const coefficients = {
    premierGroupe: 1,
    deuxiemeGroupe: 2,
    troisiemeGroupe: 3,
    extreme: 3 // Coefficient pour le mode EXTREME
};

let score = 0;
let currentQuestion = 0;
const totalQuestions = 5;
let temps;
let verbeActuel;
let historique = [];
let modeAleatoireActif = true;
let modeTurboActif = false; // Mode TURBO désactivé par défaut
let modeExtremeActif = false; // Mode EXTREME désactivé par défaut
let groupesUtilises = new Set();

const tempsTurbo = [
    "présent",
    "futur",
    "imparfait",
    "passé composé",
    "imparfait du subjonctif",
    "conditionnel présent",
    "subjonctif présent",
    "impératif",
    "passé simple",
    "participe présent"
];

const tempsExtreme = [
    "passé antérieur",
    "passé simple",
    "plus-que-parfait",
    "futur antérieur",
    "subjonctif passé",
    "subjonctif imparfait",
    "subjonctif plus-que-parfait",
    "conditionnel passé"
];

let tentatives = 0;
const maxTentativesParQuestion = 3;

// Charger les verbes depuis les fichiers JSON
async function chargerVerbes() {
    try {
        const response = await fetch('verbes.json');
        const responseTurbo = await fetch('verbes_turbo.json');
        const responseExtreme = await fetch('verbes_extreme.json'); // Charger les verbes EXTREME

        if (!response.ok || !responseTurbo.ok || !responseExtreme.ok) {
            throw new Error('Erreur lors du chargement des fichiers JSON');
        }

        verbes = await response.json();
        verbesTurbo = await responseTurbo.json(); // Charger les verbes TURBO
        verbesExtreme = await responseExtreme.json(); // Charger les verbes EXTREME

        console.log("Verbes chargés : ", verbes);
        console.log("Verbes TURBO chargés : ", verbesTurbo);
        console.log("Verbes EXTREME chargés : ", verbesExtreme); // Vérification

        // Générer la première phrase après le chargement des verbes
        genererPhrase(true); // Générer une phrase initiale
    } catch (error) {
        console.error('Erreur : ', error);
    }
}

// Activer le mode TURBO
function activerModeTurbo() {
    modeTurboActif = !modeTurboActif;
    const modeTurboButton = document.getElementById('modeTurbo');
    const turboX2 = document.getElementById('turbo-x2'); // Récupérer l'élément x2
    modeTurboButton.classList.toggle('active', modeTurboActif);
    modeTurboButton.innerText = modeTurboActif ? "Mode TURBO (Actif)" : "Mode TURBO (Inactif)";
    document.body.classList.toggle('turbo-mode', modeTurboActif);
    
    // Afficher ou masquer le symbole x2
    turboX2.style.display = modeTurboActif ? 'inline-block' : 'none';

    // Afficher ou masquer les boutons en fonction de l'état du mode TURBO
    const boutonsGroupes = document.querySelectorAll('#premierGroupe, #deuxiemeGroupe, #troisiemeGroupe, #modeAleatoire, #modeExtreme');
    boutonsGroupes.forEach(bouton => {
        bouton.style.display = modeTurboActif ? 'none' : 'inline-block';
    });

    // Générer une nouvelle phrase uniquement à partir des verbes TURBO lorsque le mode est activé
    genererPhrase(true);
}

// Activer le mode EXTREME
function activerModeExtreme() {
    modeExtremeActif = !modeExtremeActif;
    const modeExtremeButton = document.getElementById('modeExtreme');
    modeExtremeButton.classList.toggle('active', modeExtremeActif);
    modeExtremeButton.innerText = modeExtremeActif ? "Mode EXTREME (Actif)" : "Mode EXTREME (Inactif)";
    document.body.classList.toggle('extreme-mode', modeExtremeActif);

    // Afficher ou masquer les boutons en fonction de l'état du mode EXTREME
    const boutonsGroupes = document.querySelectorAll('#premierGroupe, #deuxiemeGroupe, #troisiemeGroupe, #modeAleatoire, #modeTurbo');
    boutonsGroupes.forEach(bouton => {
        bouton.style.display = modeExtremeActif ? 'none' : 'inline-block';
    });

    // Générer une nouvelle phrase uniquement à partir des verbes EXTREME lorsque le mode est activé
    genererPhrase(true);
}

// Activer le mode Aléatoire
function activerModeAleatoire() {
    modeAleatoireActif = !modeAleatoireActif;
    const modeAleatoireButton = document.getElementById('modeAleatoire');
    modeAleatoireButton.classList.toggle('active', modeAleatoireActif);
    modeAleatoireButton.innerText = modeAleatoireActif ? "Mode Aléatoire (Actif)" : "Mode Aléatoire (Inactif)";
}

// Choisir un groupe de verbes
function choisirGroupe(groupe) {
    groupeActuel = groupe;
    modeAleatoireActif = false; // Désactiver le mode aléatoire lorsqu'un groupe est choisi manuellement
    genererPhrase(true);
}

// Fonction d'aide pour obtenir les indices des pronoms disponibles
function obtenirIndicesPronomsDisponibles(verbe, temps) {
    const conjugaisons = verbe.conjugaisons[temps];
    if (!conjugaisons) return []; // Vérification pour éviter les erreurs

    return conjugaisons
        .map((conj, index) => conj !== "0" ? index : null)
        .filter(index => index !== null);
}

// Fonction d'aide pour choisir un pronom disponible
function choisirPronomDisponible(verbe, temps) {
    const indicesDisponibles = obtenirIndicesPronomsDisponibles(verbe, temps);
    if (indicesDisponibles.length === 0) return null;

    const indiceChoisi = indicesDisponibles[Math.floor(Math.random() * indicesDisponibles.length)];
    return { pronom: sujets[indiceChoisi], indice: indiceChoisi };
}

// Générer une phrase aléatoire
function genererPhrase(forceGenerate = false) {
    if (!forceGenerate && currentQuestion > 0) {
        console.log("Pas de génération de nouvelle phrase car forceGenerate est false et currentQuestion > 0.");
        return;
    }

    let verbesGroupe;
    let tempsChoisi;
    let pronomChoisi = null;

    if (modeExtremeActif) {
        // Utiliser uniquement les verbes EXTREME lorsque le mode EXTREME est activé
        verbesGroupe = verbesExtreme.verbes; // Assurez-vous que la clé est correcte
        tempsChoisi = tempsExtreme[Math.floor(Math.random() * tempsExtreme.length)];
    } else if (modeTurboActif) {
        // Utiliser uniquement les verbes TURBO lorsque le mode TURBO est activé
        verbesGroupe = verbesTurbo.TURBO;
        tempsChoisi = tempsTurbo[Math.floor(Math.random() * tempsTurbo.length)];
    } else {
        // Sélectionner les verbes en fonction du groupe actuel
        if (!verbes || !verbes[groupeActuel]) {
            console.error("Les verbes ne sont pas chargés correctement.");
            return;
        }

        // Gérer le mode aléatoire entre les groupes
        if (modeAleatoireActif) {
            const groupes = ["premierGroupe", "deuxiemeGroupe", "troisiemeGroupe"];
            if (groupesUtilises.size === groupes.length) {
                groupesUtilises.clear();
            }

            const groupesRestants = groupes.filter(groupe => !groupesUtilises.has(groupe));
            groupeActuel = groupesRestants.length > 0
                ? groupesRestants[Math.floor(Math.random() * groupesRestants.length)]
                : groupes[Math.floor(Math.random() * groupes.length)];

            groupesUtilises.add(groupeActuel);
        }

        verbesGroupe = verbes[groupeActuel];
        const tempsOptions = ["présent", "futur", "imparfait", "passé composé"];
        tempsChoisi = tempsOptions[Math.floor(Math.random() * tempsOptions.length)];
    }

    verbeActuel = verbesGroupe[Math.floor(Math.random() * verbesGroupe.length)];
    if (!verbeActuel) {
        console.error("Aucun verbe disponible pour le groupe sélectionné.");
        return;
    }

    pronomChoisi = choisirPronomDisponible(verbeActuel, tempsChoisi);
    if (pronomChoisi === null) {
        console.error(`Aucun pronom disponible pour le verbe "${verbeActuel.infinitif}" au temps "${tempsChoisi}".`);
        genererPhrase(true); 
        return;
    }

    // Ajout des "que" et "qu'" pour le subjonctif
    let pronomAffiche = pronomChoisi.pronom;
    if (tempsChoisi.includes("subjonctif")) {
        pronomAffiche = pronomChoisi.pronom.startsWith("il") ? "qu'il" : `que ${pronomChoisi.pronom}`;
    }

    temps = tempsChoisi;
    verbeActuel.pronomActuel = pronomChoisi.pronom;
    verbeActuel.indicePronomActuel = pronomChoisi.indice;

    console.log(`Phrase générée: Verbe "${verbeActuel.infinitif}", Temps "${temps}", Pronom "${pronomChoisi.pronom}".`);

    // Mettre à jour l'interface utilisateur avec le verbe et le temps sélectionnés
    document.getElementById('verbe-container').innerText = `Verbe : ${verbeActuel.infinitif}`;
    document.getElementById('temps-container').innerText = `Temps : ${temps.charAt(0).toUpperCase() + temps.slice(1)}`;
    
    // Afficher la phrase avec le pronom
    document.getElementById('phrase-container').innerText = `Conjugue le verbe "${verbeActuel.infinitif}" à ${temps} pour "${pronomAffiche}".`;
}

// Appeler la fonction de chargement des verbes au chargement de la page
window.onload = chargerVerbes;
