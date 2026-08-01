import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import { makeStyles } from "@material-ui/styles";
import { PropTypes } from "prop-types";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { actionsContent } from "../../store";
import { addIpcFolderDialogListener } from "../../utils/ipc-renderer";
import { FileTree } from "../FileTree";

const version = process.env.REACT_APP_VERSION || "dev";

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

export default DrawerListCmp;
export { DrawerListCmp };

function DrawerListCmp(_props) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const { stopAll } = actionsContent;
	const [treeKey, setTreeKey] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: stopAll is stable from createSlice
	useEffect(() => {
		dispatch(stopAll());
	}, []);

	// Listen for folder dialog replies from menu bar
	useEffect(() => {
		const cleanup = addIpcFolderDialogListener((result) => {
			if (result?.tree) {
				setTreeKey((k) => k + 1);
			}
		});
		return cleanup;
	}, []);

	function handleOpenFolder() {
		if (window.appRuntime) {
			// Electron: open native folder dialog
			window.appRuntime.send("open-folder-dialog", {});
		} else {
			// Web mode: use HTML file input
			const input = document.createElement("input");
			input.type = "file";
			input.webkitdirectory = true;
			input.directory = true;
			input.multiple = true;
			input.onchange = (e) => {
				const files = Array.from(e.target.files);
				const audioFiles = files
					.filter((f) => /\.(wav|flac|mp3|ogg|mp4|aif|aiff|m4a)$/i.test(f.name))
					.map((f) => f.name);
				if (audioFiles.length > 0) {
					dispatch(actionsContent.setContent({ content: audioFiles }));
				}
			};
			input.click();
		}
	}

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
				onSelectFile={handleFileSelect}
				onSelectFolder={handleFolderSelect}
			/>
			<Divider />
			<div className={classes.versionText}>v{version}</div>
		</React.Fragment>
	);
}

DrawerListCmp.propTypes = {
	classes: PropTypes.shape({
		drawerHeader: PropTypes.any,
		iconColor: PropTypes.any,
	}),
	onClose: PropTypes.func,
};
