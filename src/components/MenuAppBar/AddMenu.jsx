import { IconButton, Tooltip } from "@material-ui/core";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import FolderIcon from "@material-ui/icons/Folder";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actionsContent } from "../../store";
import { openFolderDialog, removeFiles } from "../../utils/ipc-renderer.js";

export default AddMenu;

function AddMenu() {
	const dispatch = useDispatch();
	const { removeMarkedTracks } = actionsContent;
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);
	const { tracksToRemove } = useSelector((state) => state.content);

	return (
		<React.Fragment>
			<Tooltip title="Menu">
				<IconButton
					aria-owns={anchorEl ? "menu-appbar-add" : null}
					aria-haspopup="true"
					onClick={(e) => setAnchorEl(e.currentTarget)}
					color="inherit"
				>
					<AddIcon />
				</IconButton>
			</Tooltip>

			<Menu
				id="menu-appbar-add"
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				open={open}
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
						removeFiles(tracksToRemove);
						dispatch(removeMarkedTracks({ tracksToRemove }));
						setAnchorEl(null);
					}}
				>
					<ListItemIcon>
						<DeleteIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText primary="Remove Marked Tracks" />
				</MenuItem>
			</Menu>
		</React.Fragment>
	);
}
