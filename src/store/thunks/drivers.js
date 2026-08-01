import cloneDeep from "lodash/cloneDeep";
import { isSafari } from "../../utils/is-safari";
import { actionsViewSettings } from "../";

const { setAudioDriverOuts } = actionsViewSettings;

export function initDrivers() {
	return async (dispatch) => {
		try {
			const drivers = await scanForAudioDrivers();
			const driTmp = drivers.map(({ deviceId, label, groupId }) => {
				return {
					label: cloneDeep(label).trim(),
					deviceId: cloneDeep(deviceId),
					groupId: cloneDeep(groupId),
				};
			});
			dispatch(setAudioDriverOuts({ audioDriverOuts: driTmp }));
		} catch (err) {
			// Silently fail — audio output enumeration may not be available
			console.warn("Audio driver enumeration failed:", err);
		}
	};
}

/**
 * Scan for audio output devices (speakers/headphones).
 * Does NOT request microphone permission — only enumerates output devices.
 * In Electron mode, falls back to the main process driver list.
 */
async function scanForAudioDrivers() {
	if (isSafari()) {
		return [];
	}

	// In Electron mode, try to get drivers from the main process
	if (window.appRuntime) {
		return [];
	}

	// Browser mode: enumerate devices directly (no getUserMedia needed)
	// enumerateDevices() works without mic permission — just returns IDs
	// Labels may be empty until permission is granted, but we only need IDs
	try {
		const devices = await navigator.mediaDevices.enumerateDevices();
		return devices.filter((device) => device.kind === "audiooutput");
	} catch {
		return [];
	}
}
