import { basicSetup, EditorView } from "https://esm.sh/codemirror"
import { EditorState, Compartment } from "https://esm.sh/@codemirror/state"
import { python } from "https://esm.sh/@codemirror/lang-python"
import { javascript } from "https://esm.sh/@codemirror/lang-javascript"
import { oneDark } from "https://esm.sh/@codemirror/theme-one-dark"
import { keymap } from "https://esm.sh/@codemirror/view"
import { indentWithTab } from "https://esm.sh/@codemirror/commands"

const outputDiv = document.getElementById('output');
const statusDiv = document.getElementById('connection-status');
const runBtn = document.getElementById('run-btn');
const languageSelect = document.getElementById('language-select');

// Debug Log
outputDiv.innerText = "App.js loaded. Initializing...\n> ";

// --- WebSocket Setup ---
const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const wsUrl = `${protocol}://${window.location.host}/ws/${roomId}/${clientId}`;
const socket = new WebSocket(wsUrl);

socket.onopen = () => {
    statusDiv.innerText = "Connected";
    statusDiv.classList.remove("text-yellow-500", "text-red-500");
    statusDiv.classList.add("text-green-500");
    outputDiv.innerText += "WebSocket Connected.\n> ";
};

socket.onclose = () => {
    statusDiv.innerText = "Disconnected";
    statusDiv.classList.remove("text-green-500", "text-yellow-500");
    statusDiv.classList.add("text-red-500");
    outputDiv.innerText += "WebSocket Disconnected.\n> ";
};

socket.onerror = (error) => {
    outputDiv.innerText += "WebSocket Error.\n> ";
    console.error("WebSocket Error:", error);
};

// --- Pyodide Setup ---
let pyodide = null;

async function loadPyodideMain() {
    outputDiv.innerText += "Loading Python environment...\n> ";
    try {
        pyodide = await loadPyodide();
        outputDiv.innerText += "Python ready.\n> ";
    } catch (err) {
        outputDiv.innerText += `Error loading Pyodide: ${err}\n> `;
    }
}
loadPyodideMain();

// --- CodeMirror Setup ---
let isRemoteUpdate = false;
const languageConf = new Compartment();

const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged && !isRemoteUpdate) {
        const content = update.state.doc.toString();
        sendUpdate(content);
    }
});

const startState = EditorState.create({
    doc: "# Write your Python code here\nprint('Hello, World!')",
    extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        languageConf.of(python()),
        oneDark,
        updateListener
    ]
});

const view = new EditorView({
    state: startState,
    parent: document.getElementById('editor')
});

// Language Switching
languageSelect.addEventListener('change', (e) => {
    const lang = e.target.value;
    if (lang === 'python') {
        view.dispatch({
            effects: languageConf.reconfigure(python())
        });
        if (view.state.doc.toString().startsWith("// Write your JS")) {
            view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: "# Write your Python code here\nprint('Hello, World!')" }
            });
        }
    } else if (lang === 'javascript') {
        view.dispatch({
            effects: languageConf.reconfigure(javascript())
        });
        if (view.state.doc.toString().startsWith("# Write your Python")) {
            view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: "// Write your JS code here\nconsole.log('Hello, JS!');" }
            });
        }
    }
});

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "init" || data.type === "update") {
        const currentContent = view.state.doc.toString();
        // Only update if content is different to avoid cursor jumping or infinite loops
        if (currentContent !== data.content) {
            isRemoteUpdate = true; // Lock local updates to prevent echo
            const transaction = view.state.update({
                changes: { from: 0, to: currentContent.length, insert: data.content }
            });
            view.dispatch(transaction);
            isRemoteUpdate = false;
        }
    }
};

function sendUpdate(content) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "update",
            content: content
        }));
    }
}

// --- Execution Logic ---
runBtn.addEventListener('click', async () => {
    const lang = languageSelect.value;
    const code = view.state.doc.toString();
    outputDiv.innerText += `Running (${lang})...\n`;

    if (lang === 'python') {
        if (!pyodide) {
            outputDiv.innerText += "Python is still loading...\n> ";
            return;
        }

        // Redirect python stdout to our output div
        // This allows print() statements to be visible in the UI
        pyodide.setStdout({
            batched: (msg) => {
                outputDiv.innerText += msg + "\n";
            }
        });

        try {
            await pyodide.runPythonAsync(code);
        } catch (err) {
            outputDiv.innerText += `Error:\n${err}`;
        }
    } else if (lang === 'javascript') {
        // Capture console.log output
        // We override the default console.log to intercept messages
        const originalLog = console.log;
        console.log = (...args) => {
            outputDiv.innerText += args.join(' ') + "\n";
            originalLog.apply(console, args);
        };

        try {
            // Use new Function to execute in global scope but safer than direct eval
            new Function(code)();
        } catch (err) {
            outputDiv.innerText += `Error:\n${err}`;
        } finally {
            console.log = originalLog;
        }
    }

    outputDiv.innerText += "\n> ";
});

document.getElementById('clear-output').addEventListener('click', () => {
    outputDiv.innerText = "> ";
});
