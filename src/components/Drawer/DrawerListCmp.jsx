import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import { makeStyles } from "@material-ui/styles";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { actionsContent } from "../../store";
import { addIpcFolderDialogListener } from "../../utils/ipc-renderer";
import { FileTree } from "../FileTree";

const version = process.env.REACT_APP_VERSION || "dev";

const AUDIO_EXT = /\.(wav|flac|mp3|ogg|mp4|aif|aiff|m4a)$/i;

const useStyles = makeStyles((theme) => ({
	drawerHeader: {
		height: 64,
	},
	openFolderButton: {
		margin: theme.spacing(1, 1.5),
		textTransform: "none",
		justifyContent: "flex-start",
		color: theme.palette.text.secondary,
		border: `1px solid ${theme.palette.divider}`,
		"&:hover": {
			backgroundColor: theme.palette.action.hover,
			borderColor: theme.palette.primary.main,
		},
	},
	versionText: {
		padding: "8px 16px",
		fontSize: 12,
		color: theme.palette.text.secondary,
		opacity: 0.5,
	},
}));

/**
 * Build a tree node structure from an array of webkitRelativePath strings.
 * Each path looks like "FolderName/SubFolder/file.mp3"
 */
function buildTreeFromPaths(folderName, relativePaths) {
	const rootNode = {
		id: folderName,
		name: folderName,
		path: folderName,
		type: "folder",
		children: [],
	};

	for (const relPath of relativePaths) {
		const parts = relPath.split("/");
		let current = rootNode;

		// Skip the first part (root folder name) if it matches
		const startIdx = parts[0] === folderName ? 1 : 0;

		for (let i = startIdx; i < parts.length; i++) {
			const part = parts[i];
			const isLast = i === parts.length - 1;
			const isAudio = isLast && AUDIO_EXT.test(part);
			const id = parts.slice(0, i + 1).join("/");

			if (isLast && isAudio) {
				current.children.push({
					id,
					name: part,
					path: relPath,
					type: "file",
					isAudio: true,
				});
			} else if (!isLast) {
				let child = current.children.find(
					(c) => c.name === part && c.type === "folder",
				);
				if (!child) {
					child = {
						id,
						name: part,
						path: parts.slice(0, i + 1).join("/"),
						type: "folder",
						children: [],
					};
					current.children.push(child);
				}
				current = child;
			}
		}
	}

	// Sort: folders first, then files, both alphabetically
	function sortChildren(node) {
		if (node.children) {
			node.children.sort((a, b) => {
				if (a.type === b.type) return a.name.localeCompare(b.name);
				return a.type === "folder" ? -1 : 1;
			});
			node.children.forEach(sortChildren);
		}
	}
	sortChildren(rootNode);

	return rootNode;
}

export default DrawerListCmp;
export { DrawerListCmp };

function DrawerListCmp(_props) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const { stopAll } = actionsContent;
	const [treeKey, setTreeKey] = useState(0);
	const [webTree, setWebTree] = useState(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: stopAll is stable from createSlice
	useEffect(() => {
		dispatch(stopAll());
	}, []);

	// Listen for folder dialog replies from menu bar (Electron only)
	useEffect(() => {
		const cleanup = addIpcFolderDialogListener((result) => {
			if (result?.tree) {
				setTreeKey((k) => k + 1);
			}
		});
		return cleanup;
	}, []);

	const handleOpenFolder = useCallback(() => {
		if (window.appRuntime) {
			// Electron: open native folder dialog
			window.appRuntime.send("open-folder-dialog", {});
		} else {
			// Web mode: use HTML file input with webkitdirectory
			const input = document.createElement("input");
			input.type = "file";
			input.webkitdirectory = true;
			input.directory = true;
			input.multiple = true;
			input.onchange = (e) => {
				const files = Array.from(e.target.files);
				const audioFiles = files
					.filter((f) => AUDIO_EXT.test(f.name))
					.map((f) => f.webkitRelativePath || f.name);

				if (audioFiles.length > 0) {
					// Dispatch audio paths to Redux for the middle pane
					dispatch(actionsContent.setContent({ content: audioFiles }));

					// Build and set the tree for the left pane
					const folderName = audioFiles[0]?.split("/")[0] || "Selected Folder";
					const tree = buildTreeFromPaths(folderName, audioFiles);
					setWebTree(tree);
					setTreeKey((k) => k + 1);
				}
			};
			input.click();
		}
	}, [dispatch]);

	function handleFileSelect(node) {
		if (node?.isAudio) {
			dispatch(actionsContent.setContent({ content: [node.path] }));
		}
	}

	function handleFolderSelect(audioPaths) {
		if (audioPaths && audioPaths.length > 0) {
			dispatch(actionsContent.setContent({ content: audioPaths }));
		}
	}

	return (
		<React.Fragment>
			<div className={classes.drawerHeader} />
			<Button
				className={classes.openFolderButton}
				startIcon={<FolderOpenIcon />}
				fullWidth
				onClick={handleOpenFolder}
			>
				Open Folder
			</Button>
			<Divider />
			<FileTree
				key={treeKey}
				externalTree={webTree}
				onSelectFile={handleFileSelect}
				onSelectFolder={handleFolderSelect}
			/>
			<Divider />
			<div className={classes.versionText}>v{version}</div>
		</React.Fragment>
	);
}

DrawerListCmp.propTypes = {};
