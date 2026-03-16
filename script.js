// ===== Advanced Neon Calculator Script with Factorial, Power-Y, Degrees Toggle, and Hyperbolic Functions =====

const displayResult = document.getElementById('resultLine');
const displayHistory = document.getElementById('historyLine');
const keypad = document.getElementById('keypad');
const sciPad = document.getElementById('scientific');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');
const themeToggle = document.getElementById('themeToggle');
const toggleSci = document.getElementById('toggleSci');
const degreeToggle = document.getElementById('degreeToggle'); // new toggle for degrees/radians

let expression = '';
let memory = 0;
let history = [];
let sciVisible = true;
let useDegrees = true; // default degrees for trig

// ---------- Display ----------
function updateDisplay() {
  displayResult.textContent = expression || '0';
}
function append(val) { expression += val; updateDisplay(); }
function clearAll() { expression = ''; displayHistory.textContent = ''; updateDisplay(); }
function clearEntry() { expression = expression.slice(0, -1); updateDisplay(); }
function insertFn(fn) { expression += fn + '('; updateDisplay(); }

// Factorial function
function factorial(n) {
  n = Math.floor(n);
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// Convert degree to radians if needed
function trigWrapper(func, val) {
  let arg = useDegrees ? val * Math.PI / 180 : val;
  return func(arg);
}

// Safe evaluation
function evaluate() {
  if (!expression) return;
  try {
    let exp = expression.replace(/÷/g, '/').replace(/×/g, '*').replace(/√/g, 'Math.sqrt').replace(/π/g, 'Math.PI').replace(/e/g, 'Math.E');
    // Trig functions with degree toggle
    // Trig functions with degree toggle (fixed)
    exp = exp.replace(/\bsin\(/g, 'trigWrapper(Math.sin,')
      .replace(/\bcos\(/g, 'trigWrapper(Math.cos,')
      .replace(/\btan\(/g, 'trigWrapper(Math.tan,');

    exp = exp.replace(/\basin\b/g, 'Math.asin')
      .replace(/\bacos\b/g, 'Math.acos')
      .replace(/\batan\b/g, 'Math.atan');

    // Hyperbolic functions
    exp = exp.replace(/\bsinh\b/g, 'Math.sinh').replace(/\bcosh\b/g, 'Math.cosh').replace(/\btanh\b/g, 'Math.tanh');
    exp = exp.replace(/\basinh\b/g, 'Math.asinh').replace(/\bacosh\b/g, 'Math.acosh').replace(/\batanh\b/g, 'Math.atanh');
    exp = exp.replace(/\blog\b/g, 'Math.log10').replace(/\bln\b/g, 'Math.log');
    // Factorial replacement (supports numbers and parentheses like (3+2)!)
exp = exp.replace(/(\([^\)]+\)|\d+)!/g, 'factorial($1)');


    const result = Function('factorial', 'trigWrapper', '"use strict";return (' + exp + ')')(factorial, trigWrapper);
    addToHistory(expression, result);
    expression = result.toString();
    updateDisplay();
  } catch { displayResult.textContent = 'Error'; }
}

function addToHistory(exp, res) { history.unshift({ exp, res }); if (history.length > 20) history.pop(); renderHistory(); }
function renderHistory() {
  historyList.innerHTML = '';
  history.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.exp} = ${item.res}`;
    li.addEventListener('click', () => { expression = item.res.toString(); updateDisplay(); });
    historyList.appendChild(li);
  });
}

// ---------- Handlers ----------
keypad.addEventListener('click', (e) => {
  const btn = e.target.closest('button'); if (!btn) return;
  const val = btn.dataset.value; const act = btn.dataset.action;
  if (val !== undefined) append(val); else if (act) handleAction(act);
});
sciPad.addEventListener('click', (e) => {
  const btn = e.target.closest('button'); if (!btn) return;
  const fn = btn.dataset.fn; const act = btn.dataset.action;
  if (fn) insertFn(fn); else if (act) handleAction(act);
});

function handleAction(action) {
  switch (action) {
    case 'clear': clearAll(); break;
    case 'back': case 'clear-entry': clearEntry(); break;
    case 'equals': evaluate(); break;
    case 'percent': expression += '/100'; updateDisplay(); break;
    case 'pi': append('π'); break;
    case 'e': append('e'); break;
    case 'paren': append('('); break;
    case 'fact': append('!'); break;
    case 'pow': append('**'); break;
    case 'mc': memory = 0; break;
    case 'mr': append(memory.toString()); break;
    case 'mplus': if (expression) memory += Number(evalSafe(expression)); break;
    case 'mminus': if (expression) memory -= Number(evalSafe(expression)); break;
    case 'deg-toggle':
  useDegrees = !useDegrees;
  // Show DEG or RAD on the toggle button
  if (degreeToggle) {
    degreeToggle.textContent = useDegrees ? 'DEG' : 'RAD';
  }
  break;
  }
}
function evalSafe(exp) {
  try {
    // Replace constants
    exp = exp.replace(/π/g, 'Math.PI').replace(/e/g, 'Math.E');

    // Replace trigonometric and log functions
    exp = exp.replace(/sin\(/g, 'Math.sin(')
             .replace(/cos\(/g, 'Math.cos(')
             .replace(/tan\(/g, 'Math.tan(')
             .replace(/log\(/g, 'Math.log10(')
             .replace(/ln\(/g, 'Math.log(')
             .replace(/sqrt\(/g, 'Math.sqrt(');

    // Handle degree mode (convert degrees → radians)
    if (useDegrees) {
      exp = exp.replace(/Math\.sin\(([^)]+)\)/g, 'Math.sin(($1)*Math.PI/180)');
      exp = exp.replace(/Math\.cos\(([^)]+)\)/g, 'Math.cos(($1)*Math.PI/180)');
      exp = exp.replace(/Math\.tan\(([^)]+)\)/g, 'Math.tan(($1)*Math.PI/180)');
    }

    // Handle factorial (!)
    exp = exp.replace(/(\d+)!/g, (_, n) => {
      return Array.from({ length: Number(n) }, (_, i) => i + 1)
                  .reduce((a, b) => a * b, 1);
    });

    // Evaluate safely
    return Function('"use strict";return (' + exp + ')')();
  } catch {
    return "Error";
  }
}


// Theme toggle
themeToggle.addEventListener('change', () => { document.body.classList.toggle('dark', themeToggle.checked); });

// Show/Hide scientific panel
toggleSci.addEventListener('click', () => { sciVisible = !sciVisible; sciPad.style.display = sciVisible ? 'block' : 'none'; });

// History clear
clearHistoryBtn.addEventListener('click', () => { history = []; renderHistory(); });

// Keyboard support
document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (/^[0-9+\-*/().]$/.test(key)) append(key);
  else if (key === 'Enter') evaluate();
  else if (key === 'Backspace') clearEntry();
  else if (key === '!') append('!');
});

// Initial render
updateDisplay();
renderHistory();