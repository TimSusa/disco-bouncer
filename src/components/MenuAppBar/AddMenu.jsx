import { IconButton, Tooltip } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import AddIcon from "@material-ui/icons/Add";
import FolderIcon from "@material-ui/icons/Folder";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actionsContent } from "../../store";
import { removeFiles } from "../../utils/ipc-renderer.js";

export default AddMenu;

function AddMenu() {
	const dispatch = useDispatch();
	const { removeMarkedTracks } = actionsContent;
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);
	const { tracksToRemove } = useSelector((state) => state.content);
	return (
		<React.Fragment>
			<Tooltip title="Add Elements">
				<IconButton
					aria-owns={anchorEl ? "menu-appbar-add" : null}
					aria-haspopup="true"
					onClick={handleMenu}
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
				onClose={handleClose}
			>
				<MenuItem onClick={handleRemoveMarkedTracks}>
					Remove Marked Tracks
				</MenuItem>
				<MenuItem onClick={handleChooseMusicFolder}>
					<FolderIcon style={{ marginRight: 8 }} />
					Choose Music Folder
				</MenuItem>
			</Menu>
		</React.Fragment>
	);
	function handleMenu(event) {
		setAnchorEl(event.currentTarget);
	}

	function handleClose() {
		setAnchorEl(null);
	}

	function handleRemoveMarkedTracks() {
		removeFiles(tracksToRemove);
		dispatch(removeMarkedTracks({ tracksToRemove }));
		setAnchorEl(null);
	}

	function handleChooseMusicFolder() {
		if (window.appRuntime) {
			window.appRuntime.send("open-folder-dialog", {});
		}
		setAnchorEl(null);
	}
}
