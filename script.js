// script.js

// Variables globales
let verbsData = [];
let currentVerb = null;
let currentTense = null;
let currentPronoun = null;
let modeExtreme = false;
let points = 0;
let attempts = 3;

// Définition des temps pour les modes normal et extrême
const normalTenses = [
    "présent",
    "passé composé",
    "imparfait",
    "passé simple",
    "futur simple"
];
const extremeTenses = [
    "imparfait du subjonctif", // Correction du nom
    "subjonctif passé",
    "conditionnel présent",
    "plus-que-parfait",
    "passé antérieur",
    "futur antérieur",
    "conditionnel passé première forme"
];

// Fonction pour normaliser les chaînes (supprimer les accents et mettre en minuscules)
function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Charger les données JSON
fetch('verbs.json')
    .then(response => response.json())
    .then(data => {
        verbsData = data.verbs;
        initializeGame();
    })
    .catch(error => console.error('Error loading JSON:', error));

// Initialiser le jeu
function initializeGame() {
    spinReels();
    document.getElementById('submit-btn').addEventListener('click', checkAnswer);
    document.getElementById('spin-btn').addEventListener('click', spinReels);
    document.getElementById('toggle-mode-btn').addEventListener('click', toggleMode);
    document.getElementById('show-answer-btn').addEventListener('click', showCorrectAnswer);
    
    // Ajouter l'écouteur d'événement pour la touche Entrée sur le champ de saisie
    document.getElementById('user-input').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Empêcher tout comportement par défaut
            checkAnswer();
        }
    });
}

// Fonction pour lancer les rouleaux avec animation
function spinReels() {
    const verbSlot = document.getElementById('verb-slot');
    const tenseSlot = document.getElementById('tense-slot');
    const pronounSlot = document.getElementById('pronoun-slot');

    // Ajouter la classe 'spinning' pour lancer l'animation
    verbSlot.classList.add('spinning');
    tenseSlot.classList.add('spinning');
    pronounSlot.classList.add('spinning');

    // Temporisation correspondant à la durée de l'animation CSS
    setTimeout(() => {
        // Sélectionner un verbe aléatoire
        currentVerb = verbsData[Math.floor(Math.random() * verbsData.length)];

        // Sélectionner un temps aléatoire basé sur le mode
        let tenses = modeExtreme ? extremeTenses : normalTenses;
        currentTense = tenses[Math.floor(Math.random() * tenses.length)];

        // Vérifier si le verbe a des conjugaisons pour ce temps
        if (!currentVerb.conjugations[currentTense]) {
            console.error(`Le verbe "${currentVerb.infinitive}" n'a pas de conjugaison pour le temps "${currentTense}".`);
            spinReels(); // Relancer les rouleaux
            return;
        }

        // Récupérer les pronoms disponibles pour ce temps
        const availablePronouns = Object.keys(currentVerb.conjugations[currentTense]);

        if (availablePronouns.length === 0) {
            console.error(`Aucun pronom disponible pour le verbe "${currentVerb.infinitive}" au temps "${currentTense}".`);
            spinReels(); // Relancer les rouleaux
            return;
        }

        // Sélectionner un pronom aléatoire parmi les disponibles
        currentPronoun = availablePronouns[Math.floor(Math.random() * availablePronouns.length)];

        // Mettre à jour les rouleaux avec les nouvelles valeurs
        verbSlot.textContent = currentVerb.infinitive;
        tenseSlot.textContent = currentTense;
        pronounSlot.textContent = currentPronoun;

        // Mettre à jour l'affichage du pronom
        document.getElementById('display-pronoun').textContent = formatPronoun(currentPronoun, currentTense);

        // Réinitialiser l'input et les tentatives si nécessaire
        document.getElementById('user-input').value = '';
        if (attempts === 0 || attempts === 3) {
            attempts = 3;
            updateStatus();
        }

        // Retirer la classe 'spinning' après l'animation
        verbSlot.classList.remove('spinning');
        tenseSlot.classList.remove('spinning');
        pronounSlot.classList.remove('spinning');

        // Masquer tout message affiché précédemment
        hideMessage();
    }, 500); // Durée de l'animation en millisecondes (à ajuster si nécessaire)
}

// Fonction pour formater le pronom affiché
function formatPronoun(pronoun, tense) {
    // Si le pronom commence par "que", on peut le retirer pour l'affichage
    // ou ajuster selon les besoins
    if (pronoun.startsWith("que ")) {
        return pronoun.replace("que ", "") + " ";
    }
    if (pronoun.startsWith("qu’")) { // Gestion des apostrophes
        return pronoun.replace("qu’", "qu’") + " ";
    }
    return pronoun + " ";
}

// Fonction pour vérifier la réponse de l'utilisateur
function checkAnswer() {
    const userInput = document.getElementById('user-input').value.trim();
    if (userInput === "") {
        showMessage('error', "Veuillez entrer une conjugaison.");
        return;
    }

    // Récupérer la conjugaison correcte pour le pronom et le temps sélectionnés
    let conjugation = currentVerb.conjugations[currentTense][currentPronoun];
    if (!conjugation) {
        showMessage('error', "Le pronom sélectionné n'est pas disponible pour ce temps.");
        return;
    }

    // Comparaison insensible à la casse et sans accents
    if (normalizeString(userInput) === normalizeString(conjugation)) {
        // Réponse correcte
        let pointsEarned = modeExtreme ? 3 : 1;
        points += pointsEarned;
        document.getElementById('points').textContent = points;
        playSound('success-sound');
        showMessage('success', `Correct ! +${pointsEarned} point(s).`);
        spinReels();
    } else {
        // Réponse incorrecte
        attempts--;
        updateStatus();
        playSound('wrong-sound'); // Jouer le son "wrong"
        if (attempts > 0) {
            showMessage('error', `Incorrect. Il vous reste ${attempts} tentative(s).`);
        } else {
            showMessage('error', `Incorrect. La bonne réponse était : ${conjugation}`);
            spinReels();
        }
    }
}

// Fonction pour mettre à jour l'affichage des points et des tentatives
function updateStatus() {
    document.getElementById('points').textContent = points;
    document.getElementById('attempts').textContent = attempts;
}

// Fonction pour basculer entre le mode normal et extrême
function toggleMode() {
    modeExtreme = !modeExtreme;
    const container = document.querySelector('.container');
    if (modeExtreme) {
        container.classList.add('extreme-mode');
        showMessage('success', "Mode Extrême activé ! Vous marquez trois fois plus de points.");
        spinReels(); // Recharger un nouveau verbe et temps en mode extrême
    } else {
        container.classList.remove('extreme-mode');
        showMessage('success', "Mode Extrême désactivé.");
        spinReels(); // Recharger un nouveau verbe et temps en mode normal
    }
}

// Fonction pour afficher la réponse correcte
function showCorrectAnswer() {
    // Récupérer la conjugaison correcte pour le pronom et le temps sélectionnés
    let conjugation = currentVerb.conjugations[currentTense][currentPronoun];
    if (!conjugation) {
        showMessage('error', "Le pronom sélectionné n'est pas disponible pour ce temps.");
        return;
    }

    // Afficher la réponse dans un message
    showMessage('success', `La bonne réponse était : ${conjugation}`);
}

// Fonction pour afficher un message intégré
function showMessage(type, text) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    messageDiv.style.display = 'block';
    // Masquer le message après 3 secondes
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Fonction pour masquer le message
function hideMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.style.display = 'none';
}

// Fonction pour jouer un son spécifique
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    sound.currentTime = 0; // Réinitialiser le son
    sound.play();
}
