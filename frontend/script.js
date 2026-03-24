// 1. Configure Monaco Loader (Using CDN)
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});

require(['vs/editor/editor.main'], function() {
    // 2. Initialize the Socket Connection
    // Replace with your actual Collab Service URL (e.g., http://localhost:5001)
    const socket = io('http://localhost:5001'); 

    // 3. Initialize Monaco Editor
    const editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: "// Welcome to PeerPrep! Start coding with your partner.",
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true
    });

    const outputDiv = document.getElementById('output');
    const roomId = "session-123"; // This should come from your Matching Service

    // 4. Join the specific collaboration room
    socket.emit('join-room', roomId);

    // 5. LISTEN: When the other user types, update local editor
    socket.on('receive-code-update', (newCode) => {
        const currentCode = editor.getValue();
        if (newCode !== currentCode) {
            // We use a flag or check to prevent an infinite loop of updates
            editor.setValue(newCode);
        }
    });

    // 6. EMIT: When YOU type, send changes to the Collab Service
    editor.onDidChangeModelContent((event) => {
        // Only emit if the change was triggered by the user (not by setValue)
        if (!event.isFlush) { 
            const code = editor.getValue();
            socket.emit('code-update', { roomId, code });
        }
    });

    // 7. Local Execution Logic (The "Run" button)
    document.getElementById('run-btn').addEventListener('click', () => {
        const code = editor.getValue();
        outputDiv.innerText = "Running...\n";
        try {
            const originalLog = console.log;
            console.log = (...args) => {
                outputDiv.innerText += args.join(' ') + '\n';
            };
            new Function(code)();
            console.log = originalLog;
        } catch (err) {
            outputDiv.innerText += "Error: " + err.message;
        }
    });
});