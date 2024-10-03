// Déclaration des temps pour les modes normal et extrême
const normalTenses = [
    "présent",
    "passé composé",
    "imparfait",
    "passé simple",
    "futur simple"
];

const extremeTenses = [
    "imparfait du subjonctif",
    "subjonctif passé",
    "conditionnel présent",
    "plus-que-parfait",
    "passé antérieur",
    "futur antérieur",
    "conditionnel passé première forme"
];

// Variables globales
let currentVerb = "";
let currentTense = "";
let currentPronoun = "";
let attemptsLeft = 3;
let points = 0;
let extremeMode = false;

// JSON des conjugaisons de verbes (à remplir avec votre JSON des conjugaisons)
let verbData = {};

// Charger le JSON depuis un fichier local (assurez-vous que 'verbs.json' est bien à la racine de votre projet)
fetch('verbs.json')
    .then(response => response.json())
    .then(data => {
        verbData = data;
        console.log("JSON Loaded:", verbData);
        spin(); // Démarrer le premier tour
    })
    .catch(error => console.error("Error loading JSON:", error));

// Fonction pour activer/désactiver le mode extrême
function toggleExtremeMode() {
    extremeMode = !extremeMode;
    document.body.classList.toggle("extreme-mode", extremeMode);
    document.getElementById("toggle-mode-btn").textContent = extremeMode ? "Désactiver Mode Extrême" : "Mode Extrême";
    spin(); // Recharger un verbe avec les temps extrêmes
}

// Fonction pour faire tourner les slots
function spin() {
    let verbs = verbData.verbs;
    if (!verbs || verbs.length === 0) {
        console.error("Aucun verbe chargé dans le JSON");
        return;
    }

    let randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
    currentVerb = randomVerb.infinitive;

    let tenses = extremeMode ? extremeTenses : normalTenses;
    currentTense = tenses[Math.floor(Math.random() * tenses.length)];

    let pronouns = Object.keys(randomVerb.conjugations[currentTense]);
    currentPronoun = pronouns[Math.floor(Math.random() * pronouns.length)];

    document.getElementById("verb-slot").textContent = currentVerb;
    document.getElementById("tense-slot").textContent = currentTense;
    document.getElementById("pronoun-slot").textContent = currentPronoun;
    document.getElementById("display-pronoun").textContent = currentPronoun;

    document.getElementById("user-input").value = "";
    document.getElementById("message").style.display = "none";
}

// Fonction pour vérifier la réponse
function checkAnswer() {
    let userInput = document.getElementById("user-input").value.trim().toLowerCase();
    let expectedAnswer = verbData.verbs.find(v => v.infinitive === currentVerb).conjugations[currentTense][currentPronoun].toLowerCase();

    if (userInput === expectedAnswer) {
        points += extremeMode ? 3 : 1;
        attemptsLeft = 3;
        document.getElementById("points").textContent = points;
        document.getElementById("message").textContent = "Bonne réponse !";
        document.getElementById("message").classList.remove("error");
        document.getElementById("message").classList.add("success");
        document.getElementById("message").style.display = "block";
        document.getElementById("success-sound").play();

        // Afficher l'image "Bonne Réponse !" pendant 1,5 seconde
        const goodAnswerImg = document.getElementById("good-answer-img");
        goodAnswerImg.style.display = "block";
        setTimeout(() => {
            goodAnswerImg.style.display = "none";
        }, 1500);

        spin(); // Recharger un nouveau verbe
    } else {
        attemptsLeft -= 1;
        if (attemptsLeft > 0) {
            document.getElementById("message").textContent = "Mauvaise réponse. Réessayez.";
        } else {
            document.getElementById("message").textContent = `Mauvaise réponse. La bonne réponse était : ${expectedAnswer}`;
            attemptsLeft = 3;
            spin();
        }
        document.getElementById("message").classList.remove("success");
        document.getElementById("message").classList.add("error");
        document.getElementById("message").style.display = "block";
        document.getElementById("wrong-sound").play();
    }

    document.getElementById("user-input").value = "";
    document.getElementById("attempts").textContent = attemptsLeft;
}

// Écouteurs d'événements
document.getElementById("spin-btn").addEventListener("click", spin);
document.getElementById("submit-btn").addEventListener("click", checkAnswer);
document.getElementById("toggle-mode-btn").addEventListener("click", toggleExtremeMode);
document.getElementById("show-answer-btn").addEventListener("click", () => {
    document.getElementById("message").textContent = `Réponse : ${verbData.verbs.find(v => v.infinitive === currentVerb).conjugations[currentTense][currentPronoun]}`;
    document.getElementById("message").classList.remove("error");
    document.getElementById("message").classList.add("success");
    document.getElementById("message").style.display = "block";
});

// Validation par la touche Entrée
document.getElementById("user-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        checkAnswer();
    }
});
