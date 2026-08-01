import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Snackbar from "@material-ui/core/Snackbar";
import Tooltip from "@material-ui/core/Tooltip";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import FolderIcon from "@material-ui/icons/Folder";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import HomeIcon from "@material-ui/icons/Home";
import MenuIcon from "@material-ui/icons/Menu";
import AudioFileIcon from "@material-ui/icons/MusicNote";
import { makeStyles, useTheme } from "@material-ui/styles";
import { PropTypes } from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useConnectivity } from "../../hooks/useConnectivity";
import { buildDefaultOsTree } from "../../utils/default-os-tree";
import {
	addIpcFileTreeListenerOnce,
	addIpcHomeFolderListenerOnce,
	addIpcPersistedFolderListenerOnce,
	getFileTree,
	getHomeFolder,
	getPersistedFolder,
	openFolderDialog,
	setPersistedFolder,
} from "../../utils/ipc-renderer";

const useStyles = makeStyles((theme) => ({
	treeRoot: {
		width: "100%",
		backgroundColor: theme.palette.background.paper,
	},
	nested: {
		paddingLeft: theme.spacing(3),
	},
	goUpBar: {
		display: "flex",
		alignItems: "center",
		padding: "4px 8px",
		borderBottom: `1px solid ${theme.palette.divider}`,
		backgroundColor: theme.palette.background.default,
	},
	goUpButton: {
		padding: 6,
		color: theme.palette.text.secondary,
	},
	currentPath: {
		fontSize: 11,
		color: theme.palette.text.secondary,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		marginLeft: 4,
		flex: 1,
	},
	connectionDot: {
		width: 8,
		height: 8,
		borderRadius: "50%",
		marginLeft: 8,
		flexShrink: 0,
	},
	connectionOnline: {
		backgroundColor: "#4CAF50",
	},
	connectionOffline: {
		backgroundColor: "#f44336",
	},
	snackbarContent: {
		backgroundColor: theme.palette.type === "dark" ? "#383838" : "#323232",
		color: "#fff",
		padding: "8px 16px",
		borderRadius: 4,
	},
}));

function getParentPath(filePath) {
	if (!filePath) return null;
	const parts = filePath.split("/");
	if (parts.length <= 1) return null;
	parts.pop();
	return parts.join("/") || "/";
}

export function FileTree({ onSelectFile, onSelectFolder }) {
	const classes = useStyles();
	const _theme = useTheme();
	const [treeData, setTreeData] = useState(null);
	const [expandedNodes, setExpandedNodes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentPath, setCurrentPath] = useState(null);
	const [anchorEl, setAnchorEl] = useState(null);
	const menuOpen = Boolean(anchorEl);
	const [snackbar, setSnackbar] = useState({ open: false, message: "" });

	// Store home path for fallback
	const homePathRef = useRef(null);
	const lastValidPathRef = useRef(null);

	// Show snackbar notification
	const showNotification = useCallback((message) => {
		setSnackbar({ open: true, message });
	}, []);

	// Handle disconnect - show home tree
	// biome-ignore lint/correctness/useExhaustiveDependencies: loadFolder is stable via ref
	const handleDisconnect = useCallback(() => {
		showNotification("⚡ Verbindung verloren - Zeige Home-Ordner");
		if (homePathRef.current) {
			loadFolder(homePathRef.current);
		} else {
			getHomeFolder();
			addIpcHomeFolderListenerOnce((homePath) => {
				if (homePath) {
					homePathRef.current = homePath;
					loadFolder(homePath);
				}
			});
		}
	}, [showNotification]);

	// Handle reconnect - try to restore last valid path
	// biome-ignore lint/correctness/useExhaustiveDependencies: loadFolder is stable via ref
	const handleReconnect = useCallback(() => {
		showNotification("✓ Verbindung wiederhergestellt");
		const pathToRestore = lastValidPathRef.current || homePathRef.current;
		if (pathToRestore) {
			loadFolder(pathToRestore);
		}
	}, [showNotification]);

	// Use connectivity hook
	const { isOnline } = useConnectivity({
		onDisconnect: handleDisconnect,
		onReconnect: handleReconnect,
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
	useEffect(() => {
		loadInitialFolder();
	}, []);

	function loadInitialFolder() {
		// Browser mode: show default OS tree immediately
		if (!window.appRuntime) {
			const defaultTree = buildDefaultOsTree();
			setTreeData(defaultTree);
			setExpandedNodes([defaultTree.id]);
			setCurrentPath(defaultTree.name);
			setLoading(false);
			return;
		}

		// Electron mode: load via IPC
		setLoading(true);
		try {
			getPersistedFolder();
			addIpcPersistedFolderListenerOnce((folderPath) => {
				if (folderPath) {
					homePathRef.current = folderPath;
					loadFolder(folderPath);
				} else {
					getHomeFolder();
					addIpcHomeFolderListenerOnce((homePath) => {
						if (homePath) {
							homePathRef.current = homePath;
							loadFolder(homePath);
						} else {
							loadFolder("/");
						}
					});
				}
			});
		} catch (e) {
			console.error("Failed to load initial folder:", e);
			setLoading(false);
			getHomeFolder();
			addIpcHomeFolderListenerOnce((homePath) => {
				homePathRef.current = homePath || "/";
				loadFolder(homePath || "/");
			});
		}
	}

	function loadFolder(folderPath) {
		setLoading(true);
		setCurrentPath(folderPath);
		lastValidPathRef.current = folderPath;
		setPersistedFolder(folderPath);
		getFileTree(folderPath);
		addIpcFileTreeListenerOnce((tree) => {
			if (tree) {
				setTreeData(tree);
				setExpandedNodes([tree.id]);
			} else {
				// Empty tree or error - try parent directory
				const parentPath = getParentPath(folderPath);
				if (parentPath && parentPath !== folderPath) {
					loadFolder(parentPath);
					return;
				}
				setTreeData(null);
			}
			setLoading(false);
		});
	}

	function handleGoUp() {
		const parentPath = getParentPath(currentPath);
		if (parentPath) {
			loadFolder(parentPath);
		}
	}

	function handleGoHome() {
		if (homePathRef.current) {
			loadFolder(homePathRef.current);
		}
	}

	function handleToggle(nodeId) {
		setExpandedNodes((prev) =>
			prev.includes(nodeId)
				? prev.filter((id) => id !== nodeId)
				: [...prev, nodeId],
		);
	}

	function handleNodeSelect(node) {
		if (node.type === "folder") {
			handleToggle(node.id);
			const audioFiles = collectAudioFiles(node);
			if (onSelectFolder && audioFiles.length > 0) {
				onSelectFolder(audioFiles);
			}
			// Browser mode: open file picker for this folder
			if (
				!window.appRuntime &&
				(!node.children || node.children.length === 0)
			) {
				openFilePickerForFolder(node);
				return;
			}
			// Electron mode: load tree from main process
			if (window.appRuntime && (!node.children || node.children.length === 0)) {
				getFileTree(node.path);
				addIpcFileTreeListenerOnce((tree) => {
					if (tree) {
						setTreeData((prev) => mergeTree(prev, tree));
						setExpandedNodes((prev) => [...prev, tree.id]);
					}
				});
			}
		} else if (node.type === "file" && node.isAudio) {
			if (onSelectFile) onSelectFile(node);
		}
	}

	function openFilePickerForFolder(_node) {
		const input = document.createElement("input");
		input.type = "file";
		input.webkitdirectory = true;
		input.directory = true;
		input.multiple = true;
		input.onchange = (e) => {
			const files = Array.from(e.target.files);
			const audioExt = /\.(wav|flac|mp3|ogg|mp4|aif|aiff|m4a)$/i;
			const audioFiles = files
				.filter((f) => audioExt.test(f.name))
				.map((f) => f.webkitRelativePath || f.name);

			if (audioFiles.length > 0 && onSelectFolder) {
				onSelectFolder(audioFiles);
			}

			// Build and merge tree from selected files
			const folderName = audioFiles[0]?.split("/")[0] || "Selected Folder";
			const newTree = buildSubTree(folderName, audioFiles);
			setTreeData((prev) => mergeTree(prev, newTree));
			setExpandedNodes((prev) => [...prev, newTree.id]);
		};
		input.click();
	}

	function buildSubTree(folderName, relativePaths) {
		const rootNode = {
			id: folderName,
			name: folderName,
			path: folderName,
			type: "folder",
			children: [],
		};
		const audioExt = /\.(wav|flac|mp3|ogg|mp4|aif|aiff|m4a)$/i;

		for (const relPath of relativePaths) {
			const parts = relPath.split("/");
			let current = rootNode;
			const startIdx = parts[0] === folderName ? 1 : 0;

			for (let i = startIdx; i < parts.length; i++) {
				const part = parts[i];
				const isLast = i === parts.length - 1;
				const isAudio = isLast && audioExt.test(part);
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
		return rootNode;
	}

	function mergeTree(oldNode, newNode) {
		if (!oldNode) return newNode;
		if (oldNode.id === newNode.id) {
			return { ...oldNode, children: newNode.children || [] };
		}
		if (oldNode.children) {
			return {
				...oldNode,
				children: oldNode.children.map((child) => mergeTree(child, newNode)),
			};
		}
		return oldNode;
	}

	function collectAudioFiles(node) {
		const files = [];
		if (node.type === "file" && node.isAudio) {
			files.push(node.path);
		}
		if (node.children) {
			node.children.forEach((child) => {
				files.push(...collectAudioFiles(child));
			});
		}
		return files;
	}

	function renderNode(node, depth = 0) {
		if (!node) return null;
		const isExpanded = expandedNodes.includes(node.id);
		const hasChildren = node.children && node.children.length > 0;

		if (node.type === "file") {
			return (
				<ListItem
					button
					key={node.id}
					onClick={() => handleNodeSelect(node)}
					style={{ paddingLeft: 16 + depth * 16 }}
				>
					<ListItemIcon>
						<AudioFileIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText primary={node.name} />
				</ListItem>
			);
		}

		return (
			<div key={node.id}>
				<ListItem button onClick={() => handleNodeSelect(node)}>
					<ListItemIcon>
						{isExpanded ? (
							<FolderOpenIcon fontSize="small" />
						) : (
							<FolderIcon fontSize="small" />
						)}
					</ListItemIcon>
					<ListItemText primary={node.name} />
					{hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
				</ListItem>
				<Collapse in={isExpanded} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
						{node.children.map((child) => renderNode(child, depth + 1))}
					</List>
				</Collapse>
			</div>
		);
	}

	return (
		<div className={classes.treeRoot}>
			{/* Burger menu bar */}
			<div className={classes.goUpBar}>
				<IconButton
					className={classes.goUpButton}
					size="small"
					onClick={(e) => setAnchorEl(e.currentTarget)}
				>
					<MenuIcon fontSize="small" />
				</IconButton>

				<Menu
					anchorEl={anchorEl}
					open={menuOpen}
					onClose={() => setAnchorEl(null)}
				>
					<MenuItem
						onClick={() => {
							openFolderDialog();
							setAnchorEl(null);
						}}
					>
						<ListItemIcon>
							<FolderIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText primary="Open Folder" />
					</MenuItem>
					<MenuItem
						onClick={() => {
							handleGoUp();
							setAnchorEl(null);
						}}
					>
						<ListItemIcon>
							<ArrowUpwardIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText primary="Parent Folder" />
					</MenuItem>
					<MenuItem
						onClick={() => {
							handleGoHome();
							setAnchorEl(null);
						}}
					>
						<ListItemIcon>
							<HomeIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText primary="Home Folder" />
					</MenuItem>
				</Menu>

				{currentPath && (
					<span className={classes.currentPath} title={currentPath}>
						{currentPath.split("/").pop() || currentPath}
					</span>
				)}

				{/* Connection status indicator */}
				<Tooltip title={isOnline ? "Online" : "Offline"}>
					<div
						className={`${classes.connectionDot} ${isOnline ? classes.connectionOnline : classes.connectionOffline}`}
					/>
				</Tooltip>
			</div>

			{/* Tree content */}
			{loading && (
				<ListItem>
					<ListItemText primary="Loading..." />
				</ListItem>
			)}
			{!loading && !treeData && (
				<ListItem>
					<ListItemText
						primary={
							isOnline ? "No folder loaded" : "Offline - showing home folder"
						}
					/>
				</ListItem>
			)}
			{treeData?.children?.map((child) => renderNode(child))}

			{/* Snackbar for notifications */}
			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
				message={snackbar.message}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				ContentProps={{
					className: classes.snackbarContent,
				}}
			/>
		</div>
	);
}

FileTree.propTypes = {
	onSelectFile: PropTypes.func,
	onSelectFolder: PropTypes.func,
};
