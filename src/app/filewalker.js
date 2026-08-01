const fs = require("node:fs");
const path = require("node:path");

/** Retrieve file paths from a given folder and its subfolders. */
const getFilePaths = (folderPath) => {
	let entryPaths;
	try {
		entryPaths = fs
			.readdirSync(folderPath)
			.map((entry) => path.join(folderPath, entry));
	} catch {
		return [];
	}

	const filePaths = [];
	const dirPaths = [];

	for (const entryPath of entryPaths) {
		try {
			const stat = fs.statSync(entryPath);
			if (stat.isFile()) {
				filePaths.push(entryPath);
			} else if (stat.isDirectory()) {
				dirPaths.push(entryPath);
			}
		} catch {
			// skip inaccessible entries
		}
	}

	const dirFiles = dirPaths.reduce(
		(prev, curr) => prev.concat(getFilePaths(curr)),
		[],
	);

	return [...filePaths, ...dirFiles];
};

module.exports = { getFilePaths };
