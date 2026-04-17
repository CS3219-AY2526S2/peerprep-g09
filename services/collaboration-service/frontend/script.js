const socket = io();
const roomId = window.location.pathname.split('/').pop();

const urlParams = new URLSearchParams(window.location.search);
const questionId = urlParams.get('questionId') || '';
const fallbackData = {
    title: 'Challenge Unavailable',
    description: 'We encountered an error loading the question. Please try refreshing or re-matching.',
    constraints: [],
    examples: []
};

const statusLabel = document.getElementById('connection-status');

// Handle connection UI
socket.on('connect', () => {
    statusLabel.innerText = "Online";
    statusLabel.className = "status-online";
    socket.emit('join-room', roomId, questionId);
});

socket.on('disconnect', () => {
    statusLabel.innerText = "Offline";
    statusLabel.className = "status-offline";
});

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});

require(['vs/editor/editor.main'], function() {
    // Create the editor instance inside your #editor-container div
    const editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: "// Start collaborating on PeerPrep G09!",
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true // Ensures editor resizes with the panel
    });

    editor.onDidChangeModelContent((event) => {
        // Only emit if the change was made by the user (not by a socket update)
        if (!editor.isUpdatingFromRemote) {
            const code = editor.getValue();
            socket.emit('code-change', { roomId, code });
        }
    });

    socket.on('receive-code', (newCode) => {
        const currentCode = editor.getValue();
        if (newCode !== currentCode) {
            // Use a flag to prevent infinite loops of emitting/receiving
            editor.isUpdatingFromRemote = true;
            editor.setValue(newCode);
            editor.isUpdatingFromRemote = false;
        }
    });
});

socket.on('user-left', (message) => {
    // You could update the statusLabel or use a toast notification
    statusLabel.innerText = "online";
    statusLabel.className = "status-offline";
    
    // Optional: Alert the user
    alert(message);
});

// The Exit button logic remains the same. 
// When window.location.href changes, the socket disconnects automatically, 
// triggering the server logic above.
document.getElementById('exit-btn').addEventListener('click', () => {
    if (confirm("Are you sure you want to leave the workspace?")) {
        window.location.href = "/";
    }
});

let timerInterval;

socket.on('timer-update', (data) => {
    startCountdown(data.remaining);
});

function startCountdown(durationMs) {
    if (timerInterval) clearInterval(timerInterval);

    let timeLeft = durationMs;

    timerInterval = setInterval(() => {
        timeLeft -= 1000;

        // 1-minute warning (60 seconds)
        if (timeLeft <= 60000 && timeLeft > 59000) {
            showWarning("Warning: 1 minute remaining before session ends!");
        }

        // Timer finished
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            terminateMeeting();
        }

        updateTimerUI(timeLeft);
    }, 1000);
}

function updateTimerUI(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const display = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    // Ensure you have an element with id="timer-display" in your HTML
    const timerElem = document.getElementById('timer-display');
    if (timerElem) timerElem.innerText = display;
}

function showWarning(msg) {
    console.warn(msg);
    alert(msg); 
}

function terminateMeeting() {
    alert("Meeting time has expired. Redirecting...");
    window.location.href = "/";
}

const userCountLabel = document.getElementById('user-count');

socket.on('user-count-update', (count) => {
    userCountLabel.innerText = `Users: ${count}`;
    
    // Optional: Visual cue if you're alone
    if (count < 2) {
        userCountLabel.style.color = "orange"; // Waiting for partner
    } else {
        userCountLabel.style.color = "lightgreen"; // Full room
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const question = urlParams.get('questionId');

    console.log("Full Search String:", window.location.search); 
    
    if (question) {
        console.log("Fetching data for:", question);
    }
});

function renderContent(data) {
    if (!data) return;

    document.getElementById('qn-title').innerText = data.title || 'No Title';
    document.getElementById('qn-description').innerText = data.description || 'No Description';

    const constraintsContainer = document.getElementById('qn-constraints');
    if (constraintsContainer && data.constraints) {
        constraintsContainer.innerHTML = data.constraints
            .map(c => `<li>${c}</li>`)
            .join('');
    }

    const examplesContainer = document.getElementById('qn-examples');
    if (examplesContainer && data.examples) {
        examplesContainer.innerHTML = data.examples.map((ex, index) => `
            <div class="example-block">
                <h4>Example ${index + 1}:</h4>
                <pre>
<strong>Input:</strong> ${ex.input || 'N/A'}
<strong>Output:</strong> ${ex.output || 'N/A'}
<strong>Explanation:</strong> ${ex.explanation || 'N/A'}
                </pre>
            </div>
        `).join('');
    }
}

socket.on('init-room-data', (data) => {
    if (data.question) {
        renderContent(data.question);
    } else {
        renderContent(fallbackData);
    }
});
