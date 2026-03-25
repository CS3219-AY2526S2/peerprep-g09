// 1. Initialize Socket.io
const socket = io();
const roomId = window.location.pathname.split('/').pop();

const statusLabel = document.getElementById('connection-status');

// Handle connection UI
socket.on('connect', () => {
    statusLabel.innerText = "Online";
    statusLabel.className = "status-online";
    socket.emit('join-room', roomId);
});

socket.on('disconnect', () => {
    statusLabel.innerText = "Offline";
    statusLabel.className = "status-offline";
});

// 2. Configure and Load Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});

require(['vs/editor/editor.main'], function() {
    // Create the editor instance inside your #editor-container div
    const editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: "// Start collaborating on PeerPrep G09!",
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true // Ensures editor resizes with the panel
    });

    // 3. Sync Changes: Local -> Server
    editor.onDidChangeModelContent((event) => {
        // Only emit if the change was made by the user (not by a socket update)
        if (!editor.isUpdatingFromRemote) {
            const code = editor.getValue();
            socket.emit('code-change', { roomId, code });
        }
    });

    // 4. Sync Changes: Server -> Local
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

// Simple Exit button logic
document.getElementById('exit-btn').addEventListener('click', () => {
    if (confirm("Are you sure you want to leave the workspace?")) {
        window.location.href = "/";
    }
});