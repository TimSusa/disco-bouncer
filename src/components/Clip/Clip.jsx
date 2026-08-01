import IconButton from "@material-ui/core/IconButton";
import Slider from "@material-ui/core/Slider";
import { makeStyles } from "@material-ui/core/styles";
import NoLoopIcon from "@material-ui/icons/ArrowRightAlt";
import CloseIcon from "@material-ui/icons/Close";
import SaveIcon from "@material-ui/icons/Delete";
import FastForwardIcon from "@material-ui/icons/FastForward";
import FastRewindIcon from "@material-ui/icons/FastRewind";
import LoopIcon from "@material-ui/icons/Loop";
import PauseIcon from "@material-ui/icons/Pause";
import PlayIcon from "@material-ui/icons/PlayArrow";
import OpenWithIcon from "@material-ui/icons/Search";
import { useTheme } from "@material-ui/styles";
import PropTypes from "prop-types";
import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import WaveSurfer from "wavesurfer.js";
import { actionsContent, actionsViewSettings } from "../../store";
import context from "../../store/context";
import { openWith } from "../../utils/ipc-renderer.js";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "flex",
		width: "100%",
		flexDirection: "column",
		border: `solid 1px ${theme.palette.type === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
		borderRadius: 5,
		padding: 8,
		height: 200,
		backgroundColor: theme.palette.background.paper,
	},
}));

export function Clip({ index }) {
	const classes = useStyles();
	const theme = useTheme();
	const { audioContext } = useContext(context);
	const dispatch = useDispatch();
	const { registerClip } = actionsViewSettings;
	const {
		changeClipSrc,
		changeClipVolume,
		toggleIsLooping,
		markForRemoval,
		markForHitlist,
		stopAll,
	} = actionsContent;
	const { audioDriverOuts } = useSelector((state) => state.viewSettings);
	const { tracks } = useSelector((state) => state.content);
	const { id: tmpTrackId, data } = tracks[index];

	const {
		isPlaying,
		isLooping,
		isWaveformShown,
		volume,
		audioDriverOutName,
		src,
		id,
		isMarkedForHitlist,
		willBeRemoved,
	} = data[0];
	const waveformRef = useRef(null);
	const wavesurfer = useRef(null);
	const nrOfCycles = useRef(0);
	const playWasCalled = useRef(false);
	const [playing, setPlay] = useState(isPlaying);
	const [duration, setDuration] = useState(0);

	// Determine waveform colors based on theme
	const isDark = theme.palette.type === "dark";
	const waveColor = isDark ? "#5C5C5C" : "#BDBDBD";
	const progressColor = isDark ? "#80CBC4" : "#00897B";

	// biome-ignore lint/correctness/useExhaustiveDependencies: wavesurfer instance recreated on src change
	useEffect(() => {
		const options = formWaveSurferOptions(waveformRef.current);
		wavesurfer.current = WaveSurfer.create(options);
		wavesurfer.current.load(src);
		wavesurfer.current.setVolume(volume);

		wavesurfer.current.on("seek", () => {
			dispatch(stopAll());
			handlePlayPause();
			setDuration(parseInt(wavesurfer.current.getDuration(), 10) / 60);
		});
		wavesurfer.current.on("ready", () => {
			setDuration(parseInt(wavesurfer.current.getDuration(), 10) / 60);
		});
		wavesurfer.current.on("finish", () => {
			nrOfCycles.current++;
			if (isLooping) {
				wavesurfer.current.play();
			} else {
				wavesurfer.current.stop();
			}
		});
		return () => wavesurfer.current.destroy();
	}, [src]);

	useEffect(() => {
		if (audioDriverOutName) {
			const sinkId = audioDriverOuts.find(
				(driver) => driver.label === audioDriverOutName,
			).deviceId;
			wavesurfer.current.setSinkId(sinkId);
		}
		//eslint-disable-next-line
	}, [audioDriverOutName, audioDriverOuts.find]);

	useEffect(() => {
		if (isPlaying) {
			wavesurfer.current.playPause(audioContext.baseLatency);
			playWasCalled.current = true;
		} else if (playWasCalled.current) {
			wavesurfer.current.playPause(audioContext.baseLatency);
		}
		//eslint-disable-next-line
	}, [isPlaying, audioContext.baseLatency]);

	const getBackgroundColor = () => {
		if (willBeRemoved) {
			return isMarkedForHitlist ? "green" : "red";
		} else {
			return isMarkedForHitlist ? "green" : "inherit";
		}
	};

	return (
		<div
			role="region"
			aria-label="Audio clip"
			className={classes.root}
			draggable="false"
			onDrop={(e) => {
				const dt = e.dataTransfer;
				const files = dt.files;
				e.preventDefault();
				dispatch(
					changeClipSrc({
						tracksId: tmpTrackId,
						clipId: id,
						src: files[0].path || files[0].name,
					}),
				);
			}}
			onDragOver={(e) => {
				e.preventDefault();
			}}
			onDragEnd={(e) => {
				e.preventDefault();
			}}
		>
			<div
				style={{
					width: "100%",
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
					borderRadius: 5,
					height: "%",
					padding: "8px 8px 0 8px",
					backgroundColor: getBackgroundColor(),
				}}
			>
				<div style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
					{src.split("/").pop()}
				</div>
				<IconButton
					onClick={() => {
						dispatch(markForHitlist({ tracksId: tmpTrackId, clipId: id }));
						setPlay(false);
						dispatch(
							registerClip({
								clip: {
									tracksId: tmpTrackId,
									clipId: id,
									isPlaying: false,
								},
							}),
						);
					}}
				>
					<CloseIcon style={{ width: 16 }}></CloseIcon>
				</IconButton>
			</div>
			<div
				style={{
					width: "100%",
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-evenly",
					height: "13%",
				}}
			>
				<IconButton
					onClick={() => {
						handlePlayPause();
					}}
					aria-label="play"
				>
					{isPlaying ? (
						<PauseIcon style={{ width: 16 }}></PauseIcon>
					) : (
						<PlayIcon style={{ width: 16 }} />
					)}
				</IconButton>
				<IconButton
					onClick={() => {
						dispatch(
							toggleIsLooping({
								tracksId: tmpTrackId,
								clipId: id,
								isLooping: !isLooping,
							}),
						);
					}}
					aria-label="loop"
				>
					{isLooping ? (
						<LoopIcon style={{ width: 16 }}></LoopIcon>
					) : (
						<NoLoopIcon style={{ width: 16 }} />
					)}
				</IconButton>
				<IconButton
					aria-label="skip-backward"
					onClick={() => {
						wavesurfer.current.skip(-1);
						wavesurfer.current.play();
					}}
				>
					<FastRewindIcon style={{ width: 16 }}></FastRewindIcon>
				</IconButton>
				<IconButton
					aria-label="skip-forward"
					onClick={() => {
						wavesurfer.current.skip(1);
						wavesurfer.current.play();
					}}
				>
					<FastForwardIcon style={{ width: 16 }}></FastForwardIcon>
				</IconButton>

				<IconButton
					onClick={() => {
						dispatch(markForRemoval({ tracksId: tmpTrackId, clipId: id }));
						setPlay(false);
						dispatch(
							registerClip({
								clip: {
									tracksId: tmpTrackId,
									clipId: id,
									isPlaying: false,
								},
							}),
						);
					}}
					aria-label="load-file"
				>
					<SaveIcon style={{ width: 16 }}></SaveIcon>
				</IconButton>
				<IconButton
					onClick={() => {
						openWith(src);
					}}
					aria-label="open-in-files"
				>
					<OpenWithIcon style={{ width: 16 }}></OpenWithIcon>
				</IconButton>
				<div>{duration}</div>
			</div>
			<div
				style={{
					width: "100%",
					display: isWaveformShown ? "unset" : "none",
				}}
				id="waveform"
				ref={waveformRef}
			/>

			<div style={{ width: "100%" }}>
				<Slider
					onChange={onVolumeChange}
					value={volume}
					name="volume"
					min={0.01}
					max={1}
					step={0.025}
					valueLabelDisplay="off"
					aria-labelledby="range-slider"
				/>
			</div>
		</div>
	);

	function handlePlayPause() {
		setPlay(!playing);
		if (isPlaying) {
			dispatch(
				registerClip({
					clip: {
						tracksId: tmpTrackId,
						clipId: id,
						isPlaying: false,
					},
				}),
			);
		} else {
			dispatch(
				registerClip({
					clip: {
						tracksId: tmpTrackId,
						clipId: id,
						isPlaying: true,
					},
				}),
			);
		}
	}

	function formWaveSurferOptions(ref) {
		return {
			container: ref,
			audioContext,
			barWidth: 2,
			barRadius: 2,
			responsive: true,
			height: 80,
			normalize: true,
			partialRender: true,
			waveColor: waveColor,
			progressColor: progressColor,
			cursorColor: isDark ? "#80CBC4" : "#00897B",
			cursorWidth: 1,
		};
	}

	function onVolumeChange(_e, value) {
		const newVolume = +value;

		if (newVolume) {
			dispatch(
				changeClipVolume({
					clipId: id,
					tracksId: tmpTrackId,
					volume: newVolume,
				}),
			);
			wavesurfer.current.setVolume(newVolume || 1);
		}
	}
}

Clip.propTypes = {
	index: PropTypes.any,
};
