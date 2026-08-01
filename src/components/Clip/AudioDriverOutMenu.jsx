import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";

import { actionsContent } from "../../store";

const { setAudioDriverOutName } = actionsContent;
const useStyles = makeStyles((theme) => ({
	formControl: {
		margin: theme.spacing(1),
		width: "95%",
	},
	selectEmpty: {
		marginTop: theme.spacing(1),
	},
}));

export function AudioDriverOutMenu(props) {
	const { driverName, tracksId, clipId } = props;
	const classes = useStyles();
	const dispatch = useDispatch();
	const audioDriverOuts = useSelector(
		(state) => state.viewSettings.audioDriverOuts,
	);

	function handleChange(e) {
		dispatch(
			setAudioDriverOutName({
				tracksId,
				clipId,
				audioDriverOutName: e.target.value,
			}),
		);
	}
	const defaultDriver = audioDriverOuts.find(
		(driver) => driver.deviceId === "default" || driver.deviceId === "",
	).label;
	return (
		<FormControl className={classes.formControl}>
			<InputLabel id="audio-driver-out-label">Audio Driver Out</InputLabel>
			<Select
				labelId="audio-driver-out-label"
				id="audio-driver-out"
				value={driverName ? driverName : defaultDriver}
				onChange={handleChange}
			>
				{(audioDriverOuts || []).map((driver) => {
					return (
						<MenuItem
							key={driver.deviceId || driver.label}
							value={driver.label || "none"}
						>
							{driver.label}
						</MenuItem>
					);
				})}
			</Select>
		</FormControl>
	);
}

AudioDriverOutMenu.propTypes = {
	clipId: PropTypes.any,
	driverName: PropTypes.string,
	tracksId: PropTypes.any,
};
