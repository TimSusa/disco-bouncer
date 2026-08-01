const fs = require("node:fs");
const path = require("node:path");

const AUDIO_EXTENSIONS = new Set([
	".wav",
	".flac",
	".mp3",
	".ogg",
	".mp4",
	".aif",
	".aiff",
	".m4a",
	".wma",
]);

function isAudioFile(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	return AUDIO_EXTENSIONS.has(ext);
}

/**
 * List immediate children of a directory (one level deep).
 * Returns { dirs: [...], files: [...] } sorted alphabetically.
 * Directories are marked with `hasChildren: true` for lazy loading.
 * Only includes directories that (transitively) contain audio files —
 * checked by scanning their direct children only (fast heuristic).
 */
function listDirectory(dirPath) {
	let entries;
	try {
		entries = fs.readdirSync(dirPath);
	} catch {
		return { dirs: [], files: [] };
	}

	const dirs = [];
	const files = [];

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry);
		let stat;
		try {
			stat = fs.statSync(fullPath);
		} catch {
			continue;
		}

		if (stat.isDirectory()) {
			// Check if this dir has audio files (one level deep heuristic)
			const hasAudio = directoryHasAudio(fullPath);
			if (hasAudio) {
				dirs.push({
					id: fullPath,
					name: entry,
					path: fullPath,
					type: "folder",
					hasChildren: true,
					children: [], // empty — loaded lazily on expand
				});
			}
		} else if (stat.isFile() && isAudioFile(fullPath)) {
			files.push({
				id: fullPath,
				name: entry,
				path: fullPath,
				type: "file",
				isAudio: true,
			});
		}
	}

	// Sort: folders first, then files, both alphabetically
	dirs.sort((a, b) => a.name.localeCompare(b.name));
	files.sort((a, b) => a.name.localeCompare(b.name));

	return { dirs, files };
}

/**
 * Quick check: does this directory contain audio files (direct children only)?
 * This is a heuristic to decide whether to show a directory in the tree.
 */
function directoryHasAudio(dirPath) {
	let entries;
	try {
		entries = fs.readdirSync(dirPath);
	} catch {
		return false;
	}

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry);
		try {
			const stat = fs.statSync(fullPath);
			if (stat.isFile() && isAudioFile(fullPath)) {
				return true;
			}
		} catch {}
	}
	return false;
}

module.exports = { listDirectory, isAudioFile, directoryHasAudio };
