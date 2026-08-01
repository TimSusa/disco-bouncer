// Test: require('electron/main') instead of require('electron')
try {
  const electron = require("electron/main");
  console.log("typeof electron:", typeof electron);
  console.log("electron keys:", Object.keys(electron));
  console.log("electron.app:", electron?.app);
  if (electron?.app) {
    electron.app.whenReady().then(() => {
      console.log("App ready! isPackaged:", electron.app.isPackaged);
      electron.app.quit();
    });
  }
} catch(e) {
  console.error("Failed:", e.message);
}
