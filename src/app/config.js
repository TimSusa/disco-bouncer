const fs = require("node:fs");
const path = require("node:path");

const CONFIG_FILE = "disco-bouncer-config.json";

function getConfigPath() {
	const { app } = require("electron");
	return path.join(app.getPath("userData"), CONFIG_FILE);
}

function readConfig() {
	try {
		const configPath = getConfigPath();
		if (!fs.existsSync(configPath)) return {};
		const raw = fs.readFileSync(configPath, "utf-8");
		return JSON.parse(raw);
	} catch {
		return {};
	}
}

function writeConfig(config) {
	try {
		const configPath = getConfigPath();
		const dir = path.dirname(configPath);
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
	} catch (err) {
		console.error("Failed to write config:", err);
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

module.exports = { getPersistedFolder, setPersistedFolder };
