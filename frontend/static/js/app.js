import { basicSetup, EditorView } from "https://esm.sh/codemirror"
import { EditorState } from "https://esm.sh/@codemirror/state"
import { python } from "https://esm.sh/@codemirror/lang-python"
import { oneDark } from "https://esm.sh/@codemirror/theme-one-dark"
import { keymap } from "https://esm.sh/@codemirror/view"
import { indentWithTab } from "https://esm.sh/@codemirror/commands"

const outputDiv = document.getElementById('output');
const statusDiv = document.getElementById('connection-status');
const runBtn = document.getElementById('run-btn');

// Debug Log
outputDiv.innerText = "App.js loaded. Initializing...\n> ";

// --- WebSocket Setup (Moved to top) ---
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
        python(),
        oneDark,
        updateListener
    ]
});

const view = new EditorView({
    state: startState,
    parent: document.getElementById('editor')
});

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "init" || data.type === "update") {
        const currentContent = view.state.doc.toString();
        if (currentContent !== data.content) {
            isRemoteUpdate = true;
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
    if (!pyodide) {
        outputDiv.innerText += "Python is still loading...\n> ";
        return;
    }

    const code = view.state.doc.toString();
    outputDiv.innerText += "Running...\n";

    // Redirect stdout
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
    outputDiv.innerText += "\n> ";
});

document.getElementById('clear-output').addEventListener('click', () => {
    outputDiv.innerText = "> ";
});
