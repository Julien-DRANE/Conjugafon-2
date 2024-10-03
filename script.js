// Variables Globales
let verbs = []; // Liste des verbes chargés depuis le JSON
let currentVerbIndex = 0;
let currentQuestionNumber = 0;
let points = 0;
let verbsRemaining = 0;
let isExtremeMode = false;
let isCompetitionMode = false;

// Chargement du JSON des verbes (Assurez-vous que le chemin est correct)
fetch('verbs.json')
    .then(response => response.json())
    .then(data => {
        verbs = data.verbs;
        verbsRemaining = verbs.length;
        document.getElementById('verbs-remaining').textContent = verbsRemaining;
        loadNextQuestion();
    })
    .catch(error => console.error('Erreur de chargement du JSON:', error));

// Fonction pour Charger la Prochaine Question
function loadNextQuestion() {
    if (currentVerbIndex >= verbs.length) {
        currentVerbIndex = 0; // Réinitialiser ou gérer la fin du jeu
    }

    let verb = verbs[currentVerbIndex];
    let conjugations = Object.keys(verb.conjugations);
    let randomTense = conjugations[Math.floor(Math.random() * conjugations.length)];
    let tenseConjugations = verb.conjugations[randomTense];
    let pronouns = Object.keys(tenseConjugations);

    let randomPronoun = pronouns[Math.floor(Math.random() * pronouns.length)];
    let correctAnswer = tenseConjugations[randomPronoun].toLowerCase();

    // Afficher les informations dans les slots
    document.getElementById('verb-slot').textContent = verb.infinitive;
    document.getElementById('tense-slot').textContent = randomTense;
    document.getElementById('pronoun-slot').textContent = randomPronoun;

    // Afficher le pronom dans le prompt
    let displayPronoun = randomPronoun.split(' ')[0]; // Ex: "que je" -> "je"
    if (displayPronoun.startsWith("qu’")) {
        displayPronoun = displayPronoun.replace("qu’", "je");
    }
    document.getElementById('display-pronoun').textContent = displayPronoun + ' ';

    // Stocker la réponse correcte
    document.getElementById('submit-btn').dataset.correctAnswer = correctAnswer;

    currentQuestionNumber++;
    currentVerbIndex++;
    verbsRemaining--;
    document.getElementById('verbs-remaining').textContent = verbsRemaining;

    // Vérifier si on doit activer le mode Extrême
    if (isCompetitionMode && (currentQuestionNumber === 6 || currentQuestionNumber === 13)) {
        activateExtremeMode();
    }
}

// Fonction pour Vérifier la Réponse
function checkAnswer() {
    let userInput = document.getElementById('user-input').value.trim().toLowerCase();
    let correctAnswer = document.getElementById('submit-btn').dataset.correctAnswer;

    if (userInput === correctAnswer) {
        points++;
        document.getElementById('points').textContent = points;
        showMessage('Bonne réponse !', 'success');
        playSound('success-sound');

        if (isCompetitionMode && points >= 15) {
            showMessage('Félicitations ! Vous avez gagné la compétition !', 'success');
            // Désactiver les interactions du jeu
            disableGame();
            return;
        }
    } else {
        showMessage(`Mauvaise réponse. La bonne réponse était "${correctAnswer}".`, 'error');
        playSound('wrong-sound');
    }

    document.getElementById('user-input').value = '';
    loadNextQuestion();
}

// Fonction pour Afficher les Messages
function showMessage(text, type) {
    let messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    // Masquer le message après 3 secondes
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Fonction pour Jouer les Sons
function playSound(soundId) {
    let sound = document.getElementById(soundId);
    sound.currentTime = 0;
    sound.play();
}

// Fonction pour Activer le Mode Extrême
function activateExtremeMode() {
    isExtremeMode = true;
    document.querySelector('.container').classList.add('extreme-mode');
    showMessage('Mode Extrême Activé !', 'success');
}

// Fonction pour Désactiver le Mode Extrême
function deactivateExtremeMode() {
    isExtremeMode = false;
    document.querySelector('.container').classList.remove('extreme-mode');
}

// Fonction pour Activer le Mode Compétition
function activateCompetitionMode() {
    if (isCompetitionMode) {
        showMessage('Mode Compétition déjà actif.', 'error');
        return;
    }
    isCompetitionMode = true;
    points = 0;
    currentQuestionNumber = 0;
    verbsRemaining = verbs.length;
    document.getElementById('points').textContent = points;
    document.getElementById('verbs-remaining').textContent = verbsRemaining;
    showMessage('Mode Compétition Activé !', 'success');

    // Désactiver le bouton de toggle du mode Extrême
    document.getElementById('toggle-mode-btn').disabled = true;

    // Charger la première question
    loadNextQuestion();
}

// Fonction pour Désactiver le Mode Compétition (si nécessaire)
function deactivateCompetitionMode() {
    isCompetitionMode = false;
    points = 0;
    currentQuestionNumber = 0;
    verbsRemaining = verbs.length;
    document.getElementById('points').textContent = points;
    document.getElementById('verbs-remaining').textContent = verbsRemaining;
    showMessage('Mode Compétition Désactivé.', 'success');

    // Activer le bouton de toggle du mode Extrême
    document.getElementById('toggle-mode-btn').disabled = false;

    // Recharger la question
    loadNextQuestion();
}

// Fonction pour Désactiver le Jeu (après victoire)
function disableGame() {
    // Désactiver les boutons et les entrées
    document.getElementById('user-input').disabled = true;
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('spin-btn').disabled = true;
    document.getElementById('show-answer-btn').disabled = true;
    document.getElementById('toggle-mode-btn').disabled = true;
    document.getElementById('competition-mode-btn').disabled = true;
}

// Événements des Boutons
document.getElementById('submit-btn').addEventListener('click', checkAnswer);
document.getElementById('spin-btn').addEventListener('click', () => {
    // Logique de rotation des slots
    document.querySelectorAll('.slot').forEach(slot => {
        slot.classList.add('spinning');
        setTimeout(() => {
            slot.classList.remove('spinning');
            // Logique pour changer le contenu des slots aléatoirement
            // Vous pouvez personnaliser cette partie selon votre logique actuelle
        }, 500);
    });
});
document.getElementById('show-answer-btn').addEventListener('click', () => {
    let correctAnswer = document.getElementById('submit-btn').dataset.correctAnswer;
    showMessage(`La bonne réponse était "${correctAnswer}".`, 'error');
});
document.getElementById('toggle-mode-btn').addEventListener('click', () => {
    if (isExtremeMode) {
        deactivateExtremeMode();
    } else {
        activateExtremeMode();
    }
});
document.getElementById('competition-mode-btn').addEventListener('click', activateCompetitionMode);
