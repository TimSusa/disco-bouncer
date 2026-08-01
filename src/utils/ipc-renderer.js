import ipcRenderer from "./ipc-runtime.js";

// ── File dialog ──────────────────────────────────────────────
export function openIpcFileDialog() {
	send("open-file-dialog", {});
}

export function addIpcFileListenerOnce(cb) {
	listenOnce("open-file-dialog-reply", cb);
}

// ── File tree / folder persistence ───────────────────────────
export function getPersistedFolder() {
	send("get-persisted-folder", {});
}

export function addIpcPersistedFolderListenerOnce(cb) {
	listenOnce("get-persisted-folder-reply", cb);
}

export function setPersistedFolder(folderPath) {
	send("set-persisted-folder", folderPath);
}

export function getFileTree(folderPath) {
	send("get-file-tree", { folderPath });
}

export function addIpcFileTreeListenerOnce(cb) {
	listenOnce("get-file-tree-reply", cb);
}

// ── Home folder ─────────────────────────────────────────────
export function getHomeFolder() {
	send("get-home-folder", {});
}

export function addIpcHomeFolderListenerOnce(cb) {
	listenOnce("get-home-folder-reply", cb);
}

// ── Folder dialog ────────────────────────────────────────────
export function openFolderDialog() {
	send("open-folder-dialog", {});
}

export function addIpcFolderDialogListenerOnce(cb) {
	listenOnce("open-folder-dialog-reply", cb);
}

export function addIpcFolderDialogListener(cb) {
	return listen("open-folder-dialog-reply", cb);
}

// ── Window ───────────────────────────────────────────────────
export function setActualWinCoords(payload) {
	send("set-to-actual-win-coords", payload);
}

export function addIpcWindowCoordsListenerOnce(cb) {
	listenOnce("set-to-actual-win-coords-reply", cb);
}

// ── App ──────────────────────────────────────────────────────
export function exitApp() {
	send("exit-app", {});
}

export function openWith(path) {
	send("open-with", { path });
}

export function removeFile(path) {
	send("remove-file", { path });
}

export function removeFiles(paths) {
	send("remove-files", { paths });
}

// ── Internal helpers ─────────────────────────────────────────
// The preload bridge strips the Electron Event object, so
// listeners receive only the data payload — no (event, data).

function send(channel, payload) {
	if (!ipcRenderer) return;
	ipcRenderer.send(channel, payload);
}

function listenOnce(channel, cb) {
	if (!ipcRenderer) return;
	ipcRenderer.once(channel, (data) => cb(data));
}

function listen(channel, cb) {
	if (!ipcRenderer) return () => {};
	return ipcRenderer.on(channel, (data) => cb(data));
}
