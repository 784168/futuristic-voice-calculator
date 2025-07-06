
document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.querySelector('.splash-screen');

    // Hide splash screen after a few seconds
    setTimeout(() => {
        splashScreen.classList.add('hidden');
    }, 4000); // 4 seconds delay

    const resultDisplay = document.getElementById('voice-result');
    const micIcon = document.getElementById('mic-icon');
    let recognition;
    let isListening = false;

    // Particle Background Setup
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];

    const particleConfig = {
        count: 100,
        speed: 2,
        color: '#00f7ff',
        minRadius: 1,
        maxRadius: 3,
        lineDistance: 150,
    };

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * particleConfig.speed;
            this.vy = (Math.random() - 0.5) * particleConfig.speed;
            this.radius = Math.random() * (particleConfig.maxRadius - particleConfig.minRadius) + particleConfig.minRadius;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = particleConfig.color;
            ctx.fill();
        }
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < particleConfig.count; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < particleConfig.lineDistance) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 247, 255, ${1 - distance / particleConfig.lineDistance})`;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        requestAnimationFrame(animate);
    }

    createParticles();
    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createParticles();
    });

    // Voice Recognition Setup
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isListening = true;
            micIcon.classList.add('listening');
            resultDisplay.value = ''; // Clear display on start
        };

        recognition.onend = () => {
            isListening = false;
            micIcon.classList.remove('listening');
        };

        recognition.onresult = (event) => {
            let fullTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
                fullTranscript += event.results[i][0].transcript;
            }

            resultDisplay.value = fullTranscript; // Display full transcript immediately
            adjustFontSize(resultDisplay);

            // Check if the user said "equals" or "result" to trigger calculation
            if (fullTranscript.toLowerCase().includes('equals') || fullTranscript.toLowerCase().includes('result')) {
                // Process the transcript to build a valid calculation string
                let calculationString = fullTranscript
                    .toLowerCase()
                    .replace(/plus/g, '+')
                    .replace(/minus/g, '-')
                    .replace(/times/g, '*')
                    .replace(/x/g, '*')
                    .replace(/divided by/g, '/')
                    .replace(/equals/g, '') // Remove "equals"
                    .replace(/result/g, ''); // Remove "result"

                // Remove spaces after processing operators
                calculationString = calculationString.replace(/ /g, '');

                // Perform calculation locally
                console.log('Calculating locally:', calculationString); // Debugging line
                resultDisplay.value = calculationString; // Put the string to be evaluated in the display
                calculateResult('voice-result'); // Use the existing function to calculate
                recognition.stop(); // Stop listening after calculation
            }
        };

        recognition.onerror = (event) => {
            resultDisplay.value = 'Error: ' + event.error;
            if (isListening) {
                recognition.stop();
            }
        };

        micIcon.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else {
        micIcon.style.display = 'none';
        alert('Voice recognition not supported in this browser.');
    }

    // Navigation
    const navItems = document.querySelectorAll('.mobile-nav .nav-item');
    const screens = document.querySelectorAll('.calculator-screen');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const target = document.getElementById(item.dataset.target);
            screens.forEach(s => s.classList.remove('active'));
            target.classList.add('active');

            // Load expenses if on expenses tracker screen
            if (item.dataset.target === 'expenses-tracker') {
                loadExpenses();
            }
        });
    });

    // Initial load for expenses tracker if it's the default active screen
    if (document.getElementById('expenses-tracker').classList.contains('active')) {
        loadExpenses();
    }

    // Sound and Ripple Effect for Buttons
    const buttons = document.querySelectorAll('button');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const soundData = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU2LjQxAAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV- ';

    let audioBuffer;

    fetch(soundData)
        .then(response => response.arrayBuffer())
        .then(data => audioContext.decodeAudioData(data))
        .then(buffer => {
            audioBuffer = buffer;
        })
        .catch(e => console.error("Error with decoding audio data", e));

    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Play sound
            if (audioBuffer) {
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start(0);
            }

            // Ripple effect
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            ripple.classList.add('ripple');
            button.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

function appendValue(value, resultId) {
    const display = document.getElementById(resultId);
    display.value += value;
    adjustFontSize(display);
}

function clearDisplay(resultId) {
    const display = document.getElementById(resultId);
    display.value = '';
    adjustFontSize(display);
}

function deleteLast(resultId) {
    const display = document.getElementById(resultId);
    let result = display.value;
    display.value = result.slice(0, -1);
    adjustFontSize(display);
}

function calculateResult(resultId) {
    // This function is no longer used for voice calculations, as they are sent to the backend.
    // It remains for manual button calculations.
    const display = document.getElementById(resultId);
    try {
        let result = eval(display.value);
        display.value = result;
        adjustFontSize(display);
    } catch (error) {
        display.value = 'Error';
        adjustFontSize(display);
    }
}

function adjustFontSize(displayElement) {
    const maxLength = 12; // Max characters before shrinking starts
    const baseFontSize = 60; // Base font size in px
    const minFontSize = 24; // Minimum font size in px

    if (displayElement.value.length > maxLength) {
        const scaleFactor = (displayElement.value.length - maxLength) * 2; // Adjust this factor for desired shrinking speed
        let newSize = baseFontSize - scaleFactor;
        if (newSize < minFontSize) {
            newSize = minFontSize;
        }
        displayElement.style.fontSize = `${newSize}px`;
    } else {
        displayElement.style.fontSize = `${baseFontSize}px`;
    }
}

// EMI Calculator
function calculateEMI() {
    const amount = parseFloat(document.getElementById('loan-amount').value);
    const rate = parseFloat(document.getElementById('interest-rate').value) / 100 / 12;
    const tenure = parseFloat(document.getElementById('loan-tenure').value);

    if (amount && rate && tenure) {
        const emi = (amount * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
        const totalAmount = emi * tenure;
        const totalInterest = totalAmount - amount;

        document.getElementById('emi-result').innerHTML = `
            <p>Monthly EMI: ${emi.toFixed(2)}</p>
            <p>Total Amount: ${totalAmount.toFixed(2)}</p>
            <p>Total Interest: ${totalInterest.toFixed(2)}</p>
        `;
    } else {
        document.getElementById('emi-result').innerHTML = '<p>Please enter all values.</p>';
    }
}

// Expenses Tracker
function addExpense() {
    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;

    if (description && amount) {
        const expense = { description, amount, category, id: Date.now() };
        const expenses = getExpenses();
        expenses.push(expense);
        saveExpenses(expenses);
        renderExpenses();
        document.getElementById('expense-description').value = '';
        document.getElementById('expense-amount').value = '';
    } else {
        alert('Please enter description and amount.');
    }
}

function getExpenses() {
    return JSON.parse(localStorage.getItem('expenses')) || [];
}

function saveExpenses(expenses) {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function renderExpenses() {
    const expenseList = document.getElementById('expense-list');
    const expenseTotal = document.getElementById('expense-total');
    const expenses = getExpenses();

    expenseList.innerHTML = '';
    let total = 0;

    expenses.forEach(expense => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" ${expense.checked ? 'checked' : ''} onchange="toggleExpenseStatus(${expense.id})">
            <span class="${expense.checked ? 'completed' : ''}">${expense.description} (${expense.category})</span>
            <span class="${expense.checked ? 'completed' : ''}">${expense.amount.toFixed(2)}</span>
            <button onclick="removeExpense(${expense.id})">X</button>
        `;
        expenseList.appendChild(li);
        total += expense.amount;
    });

    expenseTotal.textContent = `Total: ${total.toFixed(2)}`;
}

function toggleExpenseStatus(id) {
    let expenses = getExpenses();
    expenses = expenses.map(expense => 
        expense.id === id ? { ...expense, checked: !expense.checked } : expense
    );
    saveExpenses(expenses);
    renderExpenses();
}

function removeExpense(id) {
    let expenses = getExpenses();
    expenses = expenses.filter(expense => expense.id !== id);
    saveExpenses(expenses);
    renderExpenses();
}

function loadExpenses() {
    renderExpenses();
}

// Fuel Cost Calculator
function calculateFuelCost() {
    const distance = parseFloat(document.getElementById('distance').value);
    const price = parseFloat(document.getElementById('fuel-price').value);
    const mileage = parseFloat(document.getElementById('mileage').value);
    const persons = parseInt(document.getElementById('persons').value);

    if (distance && price && mileage && persons) {
        const fuelNeeded = distance / mileage;
        const totalCost = fuelNeeded * price;
        const costPerPerson = totalCost / persons;

        document.getElementById('fuel-cost-result').innerHTML = `
            <p>Total Fuel Needed: ${fuelNeeded.toFixed(2)} liters</p>
            <p>Total Cost: ${totalCost.toFixed(2)}</p>
            <p>Cost Per Person: ${costPerPerson.toFixed(2)}</p>
        `;
    } else {
        document.getElementById('fuel-cost-result').innerHTML = '<p>Please enter all values.</p>';
    }
}

// Split Bill Calculator
function calculateSplitBill() {
    const billAmount = parseFloat(document.getElementById('bill-amount').value);
    const tipPercentage = parseFloat(document.getElementById('tip-percentage').value);
    const numberOfPeople = parseInt(document.getElementById('number-of-people').value);

    if (billAmount && tipPercentage && numberOfPeople) {
        const tipAmount = billAmount * (tipPercentage / 100);
        const totalAmount = billAmount + tipAmount;
        const amountPerPerson = totalAmount / numberOfPeople;

        document.getElementById('split-bill-result').innerHTML = `
            <p>Total Tip: ${tipAmount.toFixed(2)}</p>
            <p>Total Amount: ${totalAmount.toFixed(2)}</p>
            <p>Amount Per Person: ${amountPerPerson.toFixed(2)}</p>
        `;
    } else {
        document.getElementById('split-bill-result').innerHTML = '<p>Please enter all values.</p>';
    }
}
