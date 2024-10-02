// script.js

let verbsData = [];
let currentVerb = null;
let currentTense = null;
let currentPronoun = null;
let modeExtreme = false;
let points = 0;
let attempts = 3;

// Tenses for normal and extreme modes
const normalTenses = ["présent", "passé composé", "imparfait", "passé simple", "futur simple"];
const extremeTenses = ["subjonctif imparfait", "subjonctif passé", "conditionnel présent", "plus-que-parfait", "passé antérieur", "futur antérieur", "conditionnel passé première forme"];

const pronouns = ["je", "tu", "il/elle", "nous", "vous", "ils/elles"];

// Load JSON data
fetch('verbs.json')
    .then(response => response.json())
    .then(data => {
        verbsData = data.verbs;
        initializeGame();
    })
    .catch(error => console.error('Error loading JSON:', error));

// Initialize the game
function initializeGame() {
    spinReels();
    document.getElementById('submit-btn').addEventListener('click', checkAnswer);
    document.getElementById('spin-btn').addEventListener('click', spinReels);
    document.getElementById('toggle-mode-btn').addEventListener('click', toggleMode);
    document.getElementById('show-answer-btn').addEventListener('click', showCorrectAnswer);
}

// Spin the reels to select verb, tense, and pronoun
function spinReels() {
    // Select a random verb
    currentVerb = verbsData[Math.floor(Math.random() * verbsData.length)];

    // Select a random tense based on mode
    let tenses = modeExtreme ? extremeTenses : normalTenses;
    currentTense = tenses[Math.floor(Math.random() * tenses.length)];

    // Select a random pronoun
    currentPronoun = pronouns[Math.floor(Math.random() * pronouns.length)];

    // Update the UI
    document.getElementById('verb-slot').textContent = currentVerb.infinitive;
    document.getElementById('tense-slot').textContent = currentTense;
    document.getElementById('pronoun-slot').textContent = currentPronoun;

    // Update the pronoun display
    document.getElementById('display-pronoun').textContent = formatPronoun(currentPronoun, currentTense);

    // Reset input and attempts if new question
    document.getElementById('user-input').value = '';
    if (attempts === 0 || attempts === 3) {
        attempts = 3;
        updateStatus();
    }

    // Clear any existing messages
    hideMessage();
}

// Format pronoun based on tense
function formatPronoun(pronoun, tense) {
    // Gestion des contractions
    if (pronoun === "je") {
        // Vérifie si le verbe commence par une voyelle ou un 'h' muet
        const firstLetter = currentVerb.infinitive.charAt(0).toLowerCase();
        if (['a', 'e', 'i', 'o', 'u', 'h'].includes(firstLetter)) {
            return "j’";
        }
    }

    // Gestion des pronoms spécifiques pour le subjonctif
    if (tense.includes("subjonctif")) {
        if (pronoun === "je") return "que je ";
        if (pronoun === "il/elle") return "qu’il ";
        if (pronoun === "ils/elles") return "qu’ils/elles ";
    }

    // Autres pronoms
    return pronoun + " ";
}

// Vérifie la réponse de l'utilisateur
function checkAnswer() {
    const userInput = document.getElementById('user-input').value.trim().toLowerCase();
    if (userInput === "") {
        showMessage('error', "Veuillez entrer une conjugaison.");
        return;
    }

    // Récupère la conjugaison correcte pour le pronom et le temps sélectionnés
    let conjugation = currentVerb.conjugations[currentTense];
    if (!conjugation) {
        showMessage('error', "Le temps sélectionné n'est pas disponible.");
        return;
    }

    let correctAnswer = conjugation[currentPronoun];
    if (!correctAnswer) {
        showMessage('error', "Le pronom sélectionné n'est pas disponible pour ce temps.");
        return;
    }

    // Extraire uniquement la forme du verbe conjugué
    let correctVerb = "";

    if (["passé composé", "plus-que-parfait", "passé antérieur", "futur antérieur", "subjonctif passé", "conditionnel passé première forme"].includes(currentTense)) {
        // Ces temps utilisent un auxiliaire + participe passé
        let parts = correctAnswer.split(' ');
        // Si l'auxiliaire est "être", prendre en compte l'accord
        if (["être"].includes(currentVerb.infinitive)) {
            // Pour simplifier, on ignore les accords (e)s, (e)/m etc.
            correctVerb = parts.slice(1).join(' ');
        } else {
            correctVerb = parts.slice(1).join(' ');
        }
    } else {
        // Temps simples
        correctVerb = correctAnswer;
    }

    // Nettoyer la réponse correcte des parenthèses et apostrophes
    correctVerb = correctVerb.replace(/\(e\)/g, '').replace(/\(s\)/g, '').replace(/’/g, '').replace(/qu’il /g, '').replace(/qu’ils\/elles /g, '').replace(/que je /g, '').trim();

    // Comparaison insensible à la casse
    if (userInput === correctVerb.toLowerCase()) {
        // Réponse correcte
        let pointsEarned = modeExtreme ? 3 : 1;
        points += pointsEarned;
        document.getElementById('points').textContent = points;
        playSound();
        showMessage('success', `Correct ! +${pointsEarned} point(s).`);
        spinReels();
    } else {
        // Réponse incorrecte
        attempts--;
        updateStatus();
        if (attempts > 0) {
            showMessage('error', `Incorrect. Il vous reste ${attempts} tentative(s).`);
        } else {
            showMessage('error', `Incorrect. La bonne réponse était : ${correctVerb}`);
            spinReels();
        }
    }
}

// Met à jour l'affichage des points et des tentatives
function updateStatus() {
    document.getElementById('points').textContent = points;
    document.getElementById('attempts').textContent = attempts;
}

// Bascule entre le mode normal et le mode extrême
function toggleMode() {
    modeExtreme = !modeExtreme;
    const container = document.querySelector('.container');
    if (modeExtreme) {
        container.classList.add('extreme-mode');
        showMessage('success', "Mode Extrême activé ! Vous marquez trois fois plus de points.");
    } else {
        container.classList.remove('extreme-mode');
        showMessage('success', "Mode Extrême désactivé.");
    }
}

// Affiche la réponse correcte
function showCorrectAnswer() {
    // Récupère la conjugaison correcte pour le pronom et le temps sélectionnés
    let conjugation = currentVerb.conjugations[currentTense];
    if (!conjugation) {
        showMessage('error', "Le temps sélectionné n'est pas disponible.");
        return;
    }

    let correctAnswer = conjugation[currentPronoun];
    if (!correctAnswer) {
        showMessage('error', "Le pronom sélectionné n'est pas disponible pour ce temps.");
        return;
    }

    // Extraire uniquement la forme du verbe conjugué
    let correctVerb = "";

    if (["passé composé", "plus-que-parfait", "passé antérieur", "futur antérieur", "subjonctif passé", "conditionnel passé première forme"].includes(currentTense)) {
        // Ces temps utilisent un auxiliaire + participe passé
        let parts = correctAnswer.split(' ');
        correctVerb = parts.slice(1).join(' ');
    } else {
        // Temps simples
        correctVerb = correctAnswer;
    }

    // Nettoyer la réponse correcte des parenthèses et apostrophes
    correctVerb = correctVerb.replace(/\(e\)/g, '').replace(/\(s\)/g, '').replace(/’/g, '').replace(/qu’il /g, '').replace(/qu’ils\/elles /g, '').replace(/que je /g, '').trim();

    // Affiche la réponse dans un message
    showMessage('success', `La bonne réponse était : ${correctVerb}`);
}

// Affiche un message intégré
function showMessage(type, text) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Masque le message
function hideMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.style.display = 'none';
}

// Joue le son de succès
function playSound() {
    const sound = document.getElementById('success-sound');
    sound.play();
}
function spinReels() {
    // Ajouter la classe 'spinning' pour lancer l'animation
    document.getElementById('verb-slot').classList.add('spinning');
    document.getElementById('tense-slot').classList.add('spinning');
    document.getElementById('pronoun-slot').classList.add('spinning');

    // Utiliser un timeout pour attendre la fin de l'animation
    setTimeout(() => {
        // Sélectionner un nouveau verbe, temps et pronom
        currentVerb = verbsData[Math.floor(Math.random() * verbsData.length)];
        let tenses = modeExtreme ? extremeTenses : normalTenses;
        currentTense = tenses[Math.floor(Math.random() * tenses.length)];
        currentPronoun = pronouns[Math.floor(Math.random() * pronouns.length)];

        // Mettre à jour les slots
        document.getElementById('verb-slot').textContent = currentVerb.infinitive;
        document.getElementById('tense-slot').textContent = currentTense;
        document.getElementById('pronoun-slot').textContent = currentPronoun;

        // Mettre à jour le pronom affiché
        document.getElementById('display-pronoun').textContent = formatPronoun(currentPronoun, currentTense);

        // Réinitialiser les tentatives si nécessaire
        if (attempts === 0 || attempts === 3) {
            attempts = 3;
            updateStatus();
        }

        // Réinitialiser l'input
        document.getElementById('user-input').value = '';

        // Retirer la classe 'spinning'
        document.getElementById('verb-slot').classList.remove('spinning');
        document.getElementById('tense-slot').classList.remove('spinning');
        document.getElementById('pronoun-slot').classList.remove('spinning');

        // Masquer tout message affiché
        hideMessage();
    }, 500); // Durée de l'animation en millisecondes
}
