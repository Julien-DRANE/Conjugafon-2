// script.js

// Variables de jeu
let points = 0;
let verbsRemaining = 0;
let currentQuestion = 0;
const maxPoints = 15;
let competitionMode = false;

// DOM Elements
const pointsElement = document.getElementById('points');
const verbsRemainingElement = document.getElementById('verbs-remaining');
const messageElement = document.getElementById('message');
const submitBtn = document.getElementById('submit-btn');
const spinBtn = document.getElementById('spin-btn');
const showAnswerBtn = document.getElementById('show-answer-btn');
const toggleModeBtn = document.getElementById('toggle-mode-btn');
const userInput = document.getElementById('user-input');

// Sons
const successSound = document.getElementById('success-sound');
const wrongSound = document.getElementById('wrong-sound');

// Initialisation du jeu
function initGame() {
    points = 0;
    verbsRemaining = 15; // Supposez que vous avez 15 verbes
    currentQuestion = 0;
    competitionMode = false;
    updateScores();
    updateModeButton();
    messageElement.style.display = 'none';
    // Charger le premier verbe
    loadNextVerb();
}

// Mise à jour des compteurs
function updateScores() {
    pointsElement.textContent = points;
    verbsRemainingElement.textContent = verbsRemaining;
}

// Chargement du prochain verbe (à implémenter selon votre logique)
function loadNextVerb() {
    // Exemple de logique pour charger le verbe, le temps et le pronom
    // Remplacez ceci par votre propre logique de génération de questions
    currentQuestion++;
    verbsRemaining--;

    // Vérifier si on doit activer le mode Extrême
    if (competitionMode && (currentQuestion === 6 || currentQuestion === 13)) {
        activateExtremeMode();
    }

    // Vérifier si le joueur a gagné
    if (points >= maxPoints) {
        endGame(true);
        return;
    }

    // Vérifier si les verbes sont épuisés
    if (verbsRemaining <= 0) {
        endGame(false);
        return;
    }

    // Charger le verbe, le temps et le pronom
    // Exemple :
    const verb = getRandomVerb(); // Fonction à définir
    const tense = getRandomTense(); // Fonction à définir
    const pronoun = getRandomPronoun(); // Fonction à définir

    document.getElementById('verb-slot').textContent = verb.infinitive;
    document.getElementById('tense-slot').textContent = tense;
    document.getElementById('pronoun-slot').textContent = pronoun;

    document.getElementById('display-pronoun').textContent = `${pronoun} `;
}

// Fonction pour activer le mode Extrême
function activateExtremeMode() {
    // Appliquer les styles du mode Extrême
    document.body.classList.add('extreme-mode');
    // Désactiver le bouton de mode Extrême si nécessaire
    // Ici, le mode Extrême est automatique, donc pas besoin de désactiver le bouton
    // Mais vous pouvez afficher un message ou un indicateur
    showMessage('Mode Extrême Activé !', 'success');
}

// Fonction pour désactiver le mode Extrême
function deactivateExtremeMode() {
    document.body.classList.remove('extreme-mode');
    showMessage('Mode Extrême Désactivé.', 'success');
}

// Fin du jeu
function endGame(victory) {
    if (victory) {
        showMessage('Félicitations ! Vous avez gagné la compétition ! 🎉', 'success');
    } else {
        showMessage('La compétition est terminée. Vous n\'avez pas atteint les 15 points.', 'error');
    }
    // Désactiver les interactions
    submitBtn.disabled = true;
    spinBtn.disabled = true;
    showAnswerBtn.disabled = true;
}

// Affichage des messages
function showMessage(message, type) {
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';
}

// Fonction de vérification de la réponse
function checkAnswer() {
    const userAnswer = userInput.value.trim().toLowerCase();
    const correctAnswer = getCorrectAnswer(); // Fonction à définir
    if (userAnswer === correctAnswer) {
        points += 1;
        showMessage('Bonne réponse ! 🎉', 'success');
        successSound.play();
    } else {
        showMessage(`Mauvaise réponse. La bonne réponse était "${correctAnswer}".`, 'error');
        wrongSound.play();
    }
    updateScores();
    loadNextVerb();
    userInput.value = '';
}

// Écouteur pour le bouton Vérifier
submitBtn.addEventListener('click', checkAnswer);

// Écouteur pour la touche Entrée
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' || event.key === 'Return') {
        event.preventDefault();
        checkAnswer();
    }
});

// Écouteur pour le bouton Tourner (à implémenter selon votre logique)
spinBtn.addEventListener('click', function() {
    // Exemple de logique de spin
    // loadNextVerb(); // Ou votre propre logique
});

// Écouteur pour le bouton Réponse (à implémenter selon votre logique)
showAnswerBtn.addEventListener('click', function() {
    // Exemple de logique pour afficher la réponse
    // showCorrectAnswer(); // Fonction à définir
});

// Écouteur pour le bouton Mode Compétition
toggleModeBtn.addEventListener('click', function() {
    competitionMode = !competitionMode;
    if (competitionMode) {
        toggleModeBtn.textContent = 'Mode Compétition Activé';
        toggleModeBtn.style.backgroundColor = '#4CAF50'; // Vert pour activé
        initGame(); // Réinitialiser le jeu en mode compétition
    } else {
        toggleModeBtn.textContent = 'Mode Compétition';
        toggleModeBtn.style.backgroundColor = '#f44336'; // Rouge pour désactivé
        deactivateExtremeMode();
        initGame(); // Réinitialiser le jeu sans mode compétition
    }
});

// Fonctions à définir pour obtenir les verbes, temps, pronoms et réponses
function getRandomVerb() {
    // Retournez un objet verbe depuis votre JSON
    // Exemple :
    const verbs = [
        // Ajoutez vos verbes ici
        { infinitive: 'voir' },
        { infinitive: 'vouloir' },
        { infinitive: 'venir' },
        { infinitive: 'devoir' },
        { infinitive: 'prendre' },
        { infinitive: 'trouver' },
        { infinitive: 'donner' },
        { infinitive: 'parler' },
        { infinitive: 'aimer' },
        { infinitive: 'dormir' }
    ];
    return verbs[Math.floor(Math.random() * verbs.length)];
}

function getRandomTense() {
    // Retournez un temps aléatoire depuis votre JSON
    // Exemple :
    const tenses = [
        'présent',
        'passé composé',
        'imparfait',
        'passé simple',
        'futur simple',
        'imparfait du subjonctif',
        'subjonctif passé',
        'conditionnel présent',
        'plus-que-parfait',
        'passé antérieur',
        'futur antérieur',
        'conditionnel passé première forme'
    ];
    return tenses[Math.floor(Math.random() * tenses.length)];
}

function getRandomPronoun() {
    // Retournez un pronom aléatoire
    const pronouns = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles'];
    return pronouns[Math.floor(Math.random() * pronouns.length)];
}

function getCorrectAnswer() {
    // Implémentez la logique pour obtenir la bonne réponse basée sur le verbe, le temps et le pronom
    // Ceci est un exemple simplifié. Vous devrez adapter en fonction de votre structure JSON des verbes.
    const verb = document.getElementById('verb-slot').textContent;
    const tense = document.getElementById('tense-slot').textContent;
    const pronoun = document.getElementById('pronoun-slot').textContent;

    // Recherchez le verbe dans votre JSON et récupérez la conjugaison correcte
    const verbData = verbs.find(v => v.infinitive === verb);
    if (verbData) {
        const conjugation = verbData.conjugations[tense][pronoun];
        return conjugation.toLowerCase();
    }
    return '';
}

// Exemple de données verbales (à remplacer par votre JSON réel)
const verbs = [
    {
        "infinitive": "voir",
        "conjugations": {
            "présent": {
                "je": "vois",
                "tu": "vois",
                "il/elle": "voit",
                "nous": "voyons",
                "vous": "voyez",
                "ils/elles": "voient"
            },
            // Ajoutez toutes les conjugaisons nécessaires
        }
    },
    // Ajoutez les autres verbes ici
];

// Initialisation du jeu au chargement de la page
window.onload = initGame;
