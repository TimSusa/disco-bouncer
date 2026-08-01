const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");

// Lazy-load electron after app is ready to avoid module resolution issues
let BrowserWindow, ipcMain, dialog, shell, app;

function getElectron() {
	if (!app) {
		const electron = require("electron");
		BrowserWindow = electron.BrowserWindow;
		ipcMain = electron.ipcMain;
		dialog = electron.dialog;
		shell = electron.shell;
		app = electron.app;
	}
	return { BrowserWindow, ipcMain, dialog, shell, app };
}

// ── Config persistence ──────────────────────────────────────────
const CONFIG_FILE = "disco-bouncer-config.json";

function getConfigPath() {
	const { app } = getElectron();
	return path.join(app.getPath("userData"), CONFIG_FILE);
}

function readConfig() {
	try {
		const p = getConfigPath();
		if (!fs.existsSync(p)) return {};
		return JSON.parse(fs.readFileSync(p, "utf-8"));
	} catch {
		return {};
	}
}

function writeConfig(config) {
	try {
		const p = getConfigPath();
		const dir = path.dirname(p);
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(p, JSON.stringify(config, null, 2));
	} catch (err) {
		console.error("Config write failed:", err);
	}
}

function getPersistedFolder() {
	return readConfig().lastFolder || null;
}

function setPersistedFolder(folderPath) {
	const config = readConfig();
	config.lastFolder = folderPath;
	writeConfig(config);
}

function getDownloadsFolder() {
	return path.join(os.homedir(), "Downloads");
}

// ── App lifecycle ───────────────────────────────────────────────
// When run via `electron .`, require('electron') returns the built-in API.
// The npm 'electron' package may shadow it (returns path string instead).
// process.versions.electron is set by Electron's V8 runtime, not by npm.
if (!process.versions.electron) {
	throw new Error("This file must be loaded by Electron, not Node.js");
}

// Try the built-in module first; fall back if npm package shadows it
let electron;
try {
	electron = require("electron");
	if (typeof electron === "string" || !electron.app) {
		// npm package shadowed the built-in — use process.electronBinding
		const bindings = process.electronBinding("electron_main");
		electron = bindings ? bindings : electron;
	}
} catch {
	throw new Error("Failed to load Electron module");
}

app = electron.app;
BrowserWindow = electron.BrowserWindow;
ipcMain = electron.ipcMain;
dialog = electron.dialog;
shell = electron.shell;

const isDev = !app.isPackaged;
let win = null;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	app.quit();
} else {
	app.on("second-instance", () => {
		if (win) {
			if (win.isMinimized()) win.restore();
			win.focus();
		}
	});

	app.whenReady().then(createWindow);

	app.on("window-all-closed", () => {
		app.quit();
	});
}

// ── Window creation ─────────────────────────────────────────────
function createWindow() {
	let windowState = { x: undefined, y: undefined, width: 1000, height: 800 };
	try {
		const keeper = require("electron-window-state");
		windowState = keeper({ defaultWidth: 1000, defaultHeight: 800 });
	} catch {}

	win = new BrowserWindow({
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
			webSecurity: true,
			enableRemoteModule: false,
			sandbox: false,
		},
		title: "Disco Bouncer",
	});

	win.setMenu(null);

	if (windowState.manage) {
		try {
			windowState.manage(win);
		} catch {}
	}

	if (isDev) win.webContents.openDevTools();

	registerIpcHandlers();

	const url = isDev
		? "http://localhost:3000/"
		: `file://${path.join(__dirname, "index.html")}`;

	win.loadURL(url);
	win.on("closed", () => {
		win = null;
	});
}

// ── IPC handlers ────────────────────────────────────────────────
function registerIpcHandlers() {
	ipcMain.on("open-file-dialog", onOpenFileDialog);

	ipcMain.on("open-with", (_event, data) => {
		shell.showItemInFolder(data.path);
	});

	ipcMain.on("remove-file", (_event, data) => {
		try {
			fs.rmSync(data.path, { force: true });
		} catch {}
	});

	ipcMain.on("remove-files", (_event, data) => {
		if (data?.paths) {
			data.paths.forEach((item) => {
				try {
					fs.rmSync(item.src, { force: true });
				} catch {}
			});
		}
	});

	ipcMain.on("exit-app", () => app.exit(0));

	ipcMain.on("set-to-actual-win-coords", (event) => {
		if (win) {
			const bounds = win.getBounds();
			event.sender.send("set-to-actual-win-coords-reply", [
				bounds.x,
				bounds.y,
				bounds.width,
				bounds.height,
			]);
		}
	});

	// File tree / folder persistence
	ipcMain.on("get-persisted-folder", (event) => {
		const folder = getPersistedFolder() || getDownloadsFolder();
		event.sender.send("get-persisted-folder-reply", folder);
	});

	ipcMain.on("get-home-folder", (event) => {
		const home = os.homedir();
		event.sender.send("get-home-folder-reply", home);
	});

	ipcMain.on("set-persisted-folder", (event, folderPath) => {
		setPersistedFolder(folderPath);
		event.sender.send("set-persisted-folder-reply", { success: true });
	});

	ipcMain.on("get-file-tree", (event, data) => {
		try {
			const { listDirectory } = require("./filewalker-tree");
			const { dirs, files } = listDirectory(data.folderPath);
			const node = {
				id: data.folderPath,
				name: path.basename(data.folderPath) || data.folderPath,
				path: data.folderPath,
				type: "folder",
				children: [...dirs, ...files],
			};
			event.sender.send("get-file-tree-reply", node);
		} catch (err) {
			console.error("get-file-tree error:", err);
			event.sender.send("get-file-tree-reply", null);
		}
	});

	ipcMain.on("open-folder-dialog", (event) => {
		dialog
			.showOpenDialog({ properties: ["openDirectory"] })
			.then((result) => {
				if (result.canceled || result.filePaths.length === 0) {
					event.sender.send("open-folder-dialog-reply", null);
					return;
				}
				const folderPath = result.filePaths[0];
				setPersistedFolder(folderPath);
				try {
					const { listDirectory } = require("./filewalker-tree");
					const { dirs, files } = listDirectory(folderPath);
					const node = {
						id: folderPath,
						name: path.basename(folderPath) || folderPath,
						path: folderPath,
						type: "folder",
						children: [...dirs, ...files],
					};
					event.sender.send("open-folder-dialog-reply", {
						folderPath,
						tree: node,
					});
				} catch {
					event.sender.send("open-folder-dialog-reply", {
						folderPath,
						tree: null,
					});
				}
			})
			.catch((err) => {
				console.error("open-folder-dialog error:", err);
				event.sender.send("open-folder-dialog-reply", null);
			});
	});
}

function onOpenFileDialog(event) {
	dialog
		.showOpenDialog({ properties: ["openFile", "openDirectory"] })
		.then((result) => {
			if (result.canceled || result.filePaths.length === 0) return;
			const selectedPath = result.filePaths[0];

			try {
				if (fs.statSync(selectedPath).isDirectory()) {
					setPersistedFolder(selectedPath);
				}
			} catch {}

			const { getFilePaths } = require("./filewalker");
			const tracks = getFilePaths(selectedPath).filter((item) =>
				/\.(wav|flac|mp3|ogg|mp4|aif|aiff|m4a)$/i.test(item),
			);

			event.sender.send("open-file-dialog-reply", {
				content: { tracks },
				presetName: selectedPath,
			});
		})
		.catch((err) => {
			console.error("open-file-dialog error:", err);
		});
}
