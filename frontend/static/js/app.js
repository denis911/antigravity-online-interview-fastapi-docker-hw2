import { EditorView, basicSetup } from "https://esm.sh/codemirror@6.0.1"
import { EditorState } from "https://esm.sh/@codemirror/state@6.0.1"
import { python } from "https://esm.sh/@codemirror/lang-python@6.0.1"
import { oneDark } from "https://esm.sh/@codemirror/theme-one-dark@6.0.1"
import { keymap } from "https://esm.sh/@codemirror/view@6.0.1"
import { indentWithTab } from "https://esm.sh/@codemirror/commands@6.0.1"

// --- Pyodide Setup ---
let pyodide = null;
const outputDiv = document.getElementById('output');
const runBtn = document.getElementById('run-btn');
const statusDiv = document.getElementById('connection-status');

async function loadPyodideMain() {
    outputDiv.innerText = "Loading Python environment...";
    try {
        pyodide = await loadPyodide();
        outputDiv.innerText += "\nPython ready.\n> ";
    } catch (err) {
        outputDiv.innerText = `Error loading Pyodide: ${err}`;
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

// --- WebSocket Setup ---
const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const wsUrl = `${protocol}://${window.location.host}/ws/${roomId}/${clientId}`;
const socket = new WebSocket(wsUrl);

socket.onopen = () => {
    statusDiv.innerText = "Connected";
    statusDiv.classList.remove("text-yellow-500", "text-red-500");
    statusDiv.classList.add("text-green-500");
};

socket.onclose = () => {
    statusDiv.innerText = "Disconnected";
    statusDiv.classList.remove("text-green-500", "text-yellow-500");
    statusDiv.classList.add("text-red-500");
};

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
        outputDiv.innerText += "\nPython is still loading...\n";
        return;
    }

    const code = view.state.doc.toString();
    outputDiv.innerText = "Running...\n";

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
