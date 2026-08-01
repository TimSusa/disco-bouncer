// Bridges Electron's ipcRenderer via the preload script.
// In web mode, appRuntime is null and all IPC calls are no-ops.

let appRuntime = null;

if (typeof window !== "undefined" && window.appRuntime) {
	appRuntime = window.appRuntime;
}

export default appRuntime;
