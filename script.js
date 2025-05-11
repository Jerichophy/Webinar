const passwordInput = document.getElementById('password');
const ruleBox = document.getElementById('rule-box');
const ruleText = document.getElementById('rule-text');
const successMessage = document.getElementById('success-message');
const confirmContainer = document.getElementById('confirm-container');
const confirmInput = document.getElementById('confirm-password');
const confirmMessage = document.getElementById('confirm-message');

// Sound effects
var victorySound = new Audio('https://github.com/user/project/blob/main/images/success.mp3?raw=true');
var failSound = new Audio('https://github.com/user/project/blob/main/images/lost.mp3?raw=true');

let brokenRules = [];
let confirmTimeout;

// Function to handle Leetspeak matching
function createLeetRegex(word) {
  const substitutions = {
    a: "[a@4]",
    e: "[e3]",
    i: "[i1!|]",
    o: "[o0]",
    u: "[uµv]"
  };

  const pattern = word
    .toLowerCase()
    .split("")
    .map(ch => substitutions[ch] || ch)
    .join("");

  return new RegExp(pattern, "i");
}

// Rules list
const rules = [
  {
    text: "Password must be at least 14 characters.",
    validate: (pw) => pw.length >= 14,
  },
  {
    text: "Password must contain at least 3 uppercase letters.",
    validate: (pw) => (pw.match(/[A-Z]/g) || []).length >= 3,
  },
  {
    text: "Password must contain at least 2 lowercase letters.",
    validate: (pw) => (pw.match(/[a-z]/g) || []).length >= 2,
  },
  {
    text: "Password must contain at least 2 digits.",
    validate: (pw) => (pw.match(/\d/g) || []).length >= 2,
  },
  {
    text: "Password must contain at least 1 special character.",
    validate: (pw) => /[@#$%^&*!?]/.test(pw),
  },
  {
    text: 'Password must include a common household animal',
    validate: (pw) => {
      const animalList = [
        "cat", "dog", "fish", "rat", "bat", "ant", "fly", "bug", "mouse",
        "frog", "bee", "kit", "pup", "pet", "hamster", "gerbil", "parrot",
        "turtle", "lizard", "snake", "gecko", "bunny", "kitten", "puppy",
        "pusa", "aso", "isda", "daga", "paniki", "langgam", "talangka", "ipis", "babo",
        "palaka", "puti", "matang", "pagong", "bayawak", "ahas", "tuko", "kuneho", "kutitap"
      ];
      return animalList.some(animal => createLeetRegex(animal).test(pw));
    }
  },
  {
    text: "Password must not contain any vowels (a, e, i, o, u).",
    validate: (pw) => !/[aeiou]/i.test(pw),
  },
  {
    text: "Password must contain exactly 4 consecutive numbers.",
    validate: (pw) => /\d{4}/.test(pw),
  },
  {
    text: "Password must reference subjects na nagpahiwalay sa ECE Sakalam.",
    validate: (pw) => {
      const nuke = ["feedback", "elex3", "elex 3", "electronics", "DSP"];
      return nuke.some(nuke => createLeetRegex(nuke).test(pw));
    }
  },
  {
    text: "Password must contain a loveteam sa classroom",
    validate: (pw) => {
      const ships = ["GabRon", "Almille", "Panget"];
      const pairs = [
        [["aaron", "manalo", "ron"], ["ategab", "gab"]],
        ["sarah", "micko"],
        ["heart", "roy"],
        [["rap", "raphael"], "lara"],
        [["catcatan", "christian"], "shannah"]
      ];

      const hasShip = ships.some(name => createLeetRegex(name).test(pw));
      if (hasShip) return true;

      return pairs.some(pair => {
        const namesA = Array.isArray(pair[0]) ? pair[0] : [pair[0]];
        const namesB = Array.isArray(pair[1]) ? pair[1] : [pair[1]];

        return namesA.some(a =>
          namesB.some(b => {
            const ab = createLeetRegex(a + b);
            const ba = createLeetRegex(b + a);
            return ab.test(pw) || ba.test(pw);
          })
        );
      });
    }
  },
  {
    text: "Password must not contain spaces or underscores.",
    validate: (pw) => !/[\s_]/.test(pw),
  },
  {
    text: "Password must contain at least one emoji.",
    validate: (pw) => /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{1F004}-\u{1F0CF}\u{2300}-\u{23FF}\u{2B06}\u{2194}\u{1F1E6}-\u{1F1FF}]/gu.test(pw),
  },
  {
    text: "Which type of Ethernet cable is used to directly connect.<br><img src='images/Cable.png' alt='OSPF Cost' style='max-width:100%; margin-top:10px;'>",
    validate: (pw) => {
      const Cable = ['Crossover'];
      return /crossover/i.test(pw) || Cable.some(c => createLeetRegex(c).test(pw));
    }
  }
];

// Update rule display logic
function updateRuleDisplay(password) {
  brokenRules = [];

  for (let rule of rules) {
    if (!rule.validate(password)) brokenRules.push(rule);
  }

  if (brokenRules.length === 0) {
    ruleBox.classList.add("hidden");
    ruleText.innerHTML = "";
    successMessage.classList.remove("hidden");
    hidePasswordInput();  // Hide the password when all rules are fulfilled
    showConfirmInput();
  } else {
    ruleText.innerHTML = brokenRules[0].text;
    ruleBox.classList.remove("hidden");
    successMessage.classList.add("hidden");
    confirmContainer.classList.add("hidden");
    clearTimeout(confirmTimeout);
  }
}

// Hide the original password field and change it to type password
function hidePasswordInput() {
  passwordInput.type = "password"; // Make password hidden
}

// Show confirm input
function showConfirmInput() {
  confirmContainer.classList.remove("hidden");
  confirmInput.value = "";
  confirmMessage.innerText = "";
  confirmInput.focus();

  confirmTimeout = setTimeout(() => {
    resetForm();  // Reset after timeout (e.g., 20 seconds)
  }, 20000); // 20 seconds timeout to reset
}

// Confirm match check
confirmInput.addEventListener("input", () => {
  if (confirmInput.value === passwordInput.value) {
    clearTimeout(confirmTimeout);
    confirmMessage.innerText = "✅ Passwords match!";
    victorySound.play();
  } else {
    confirmMessage.innerText = "❌ Passwords do not match.";
  }
});

// Listen for password typing
passwordInput.addEventListener("input", (e) => {
  const pw = e.target.value;
  updateRuleDisplay(pw);
});

// Auto-reset the form to its initial state
function resetForm() {
  failSound.play(); // 💀 Play fail sound when time runs out
  passwordInput.type = "text";  // Show the password again
  passwordInput.value = "";
  ruleBox.classList.remove("hidden");
  ruleText.innerHTML = "Please enter a valid password.";
  successMessage.classList.add("hidden");
  confirmContainer.classList.add("hidden");
  confirmMessage.innerText = "";
  clearTimeout(confirmTimeout);
}
