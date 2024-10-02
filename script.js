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
    document.getElementById('pronoun-slot').textContent = formatPronoun(currentPronoun, currentTense);

    // Reset input and attempts if new question
    document.getElementById('user-input').value = '';
    if (attempts === 0 || attempts === 3) {
        attempts = 3;
        updateStatus();
    }
}

// Format pronoun based on tense
function formatPronoun(pronoun, tense) {
    // Example formatting, can be expanded based on tense requirements
    if (tense.includes("subjonctif")) {
        if (pronoun === "je") return "que je";
        if (pronoun === "il/elle") return "qu’ il";
    }
    return pronoun + " ";
}

// Check the user's answer
function checkAnswer() {
    const userInput = document.getElementById('user-input').value.trim().toLowerCase();
    if (userInput === "") {
        alert("Veuillez entrer une conjugaison.");
        return;
    }

    // Get the correct conjugation
    let conjugation = currentVerb.conjugations[currentTense];
    if (!conjugation) {
        alert("Le temps sélectionné n'est pas disponible.");
        return;
    }

    let correctAnswer = conjugation[currentPronoun];
    if (!correctAnswer) {
        alert("Le pronom sélectionné n'est pas disponible pour ce temps.");
        return;
    }

    // Extract the verb part from the correct answer
    // Assuming the format "auxiliaire + participe passé" for passé composé, etc.
    let correctVerb = correctAnswer.split(' ').slice(1).join(' '); // Simplification
    if (currentTense === "présent" || currentTense === "imparfait" || currentTense === "futur simple" || currentTense === "subjonctif imparfait" || currentTense === "subjonctif passé" || currentTense.startsWith("conditionnel")) {
        correctVerb = correctAnswer.split(' ').slice(0).join(' '); // For tenses without auxiliary
    }

    if (userInput === correctVerb.toLowerCase()) {
        // Correct answer
        let pointsEarned = modeExtreme ? 3 : 1;
        points += pointsEarned;
        document.getElementById('points').textContent = points;
        playSound();
        alert("Correct ! +" + pointsEarned + " point(s).");
        spinReels();
    } else {
        // Incorrect answer
        attempts--;
        updateStatus();
        if (attempts > 0) {
            alert("Incorrect. Il vous reste " + attempts + " tentative(s).");
        } else {
            alert("Incorrect. Aucune tentative restante. La bonne réponse était : " + correctVerb);
            spinReels();
        }
    }
}

// Update the status display
function updateStatus() {
    document.getElementById('points').textContent = points;
    document.getElementById('attempts').textContent = attempts;
}

// Toggle between normal and extreme modes
function toggleMode() {
    modeExtreme = !modeExtreme;
    const container = document.querySelector('.container');
    if (modeExtreme) {
        container.classList.add('extreme-mode');
        alert("Mode Extrême activé ! Vous marquez trois fois plus de points.");
    } else {
        container.classList.remove('extreme-mode');
        alert("Mode Extrême désactivé.");
    }
}

// Play success sound
function playSound() {
    const sound = document.getElementById('success-sound');
    sound.play();
}
