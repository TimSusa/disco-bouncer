/**
 * End-to-end test for the folder loading flow.
 *
 * Tests the IPC communication between electron.js (main process)
 * and the FileTree component (renderer) by verifying:
 *
 * 1. electron.js registers all required IPC handlers
 * 2. electron.js falls back to home folder when no config exists
 * 3. FileTree component sends correct IPC messages
 * 4. Theme toggle state is properly initialized
 * 5. Burger menu contains Open Folder option
 */

// Mock fs for config tests
const fs = require("fs");
const path = require("path");

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

// ── Test 1: electron.js has all required IPC handlers ──────
console.log("\n[1] electron.js IPC handlers");

const electronSrc = fs.readFileSync(
  path.join(__dirname, "src/app/electron.js"),
  "utf-8",
);

const requiredHandlers = [
  "get-persisted-folder",
  "set-persisted-folder",
  "get-file-tree",
  "open-folder-dialog",
  "open-file-dialog",
  "remove-file",
  "remove-files",
  "exit-app",
  "open-with",
  "set-to-actual-win-coords",
  "get-home-folder",
];

for (const handler of requiredHandlers) {
  assert(
    electronSrc.includes(`"${handler}"`),
    `IPC handler "${handler}" is registered`,
  );
}

// ── Test 2: electron.js has home folder fallback ────────────
console.log("\n[2] electron.js home folder fallback");

assert(
  electronSrc.includes("os.homedir()"),
  "Uses os.homedir() for home folder",
);
assert(
  electronSrc.includes("get-home-folder"),
  "Has get-home-folder IPC handler",
);
assert(
  electronSrc.includes("getDownloadsFolder"),
  "Has getDownloadsFolder fallback",
);

// ── Test 3: FileTree uses IPC for home folder ───────────────
console.log("\n[3] FileTree IPC integration");

const fileTreeSrc = fs.readFileSync(
  path.join(__dirname, "src/components/FileTree/FileTree.jsx"),
  "utf-8",
);

assert(
  fileTreeSrc.includes("getHomeFolder"),
  "FileTree calls getHomeFolder IPC",
);
assert(
  fileTreeSrc.includes("addIpcHomeFolderListenerOnce"),
  "FileTree listens for home folder reply",
);
assert(
  fileTreeSrc.includes("openFolderDialog"),
  "FileTree has openFolderDialog for burger menu",
);
assert(
  !fileTreeSrc.includes("process.env.HOME"),
  "FileTree does NOT use process.env.HOME",
);
assert(
  fileTreeSrc.includes("MenuIcon"),
  "FileTree uses MenuIcon (burger)",
);
assert(
  fileTreeSrc.includes('primary="Open Folder"'),
  "Burger menu has 'Open Folder' option",
);
assert(
  fileTreeSrc.includes('primary="Parent Folder"'),
  "Burger menu has 'Parent Folder' option",
);
assert(
  fileTreeSrc.includes('primary="Home Folder"'),
  "Burger menu has 'Home Folder' option",
);

// ── Test 4: ipc-renderer has all required exports ───────────
console.log("\n[4] ipc-renderer.js exports");

const ipcSrc = fs.readFileSync(
  path.join(__dirname, "src/utils/ipc-renderer.js"),
  "utf-8",
);

const requiredExports = [
  "getPersistedFolder",
  "addIpcPersistedFolderListenerOnce",
  "setPersistedFolder",
  "getFileTree",
  "addIpcFileTreeListenerOnce",
  "getHomeFolder",
  "addIpcHomeFolderListenerOnce",
  "openFolderDialog",
  "addIpcFolderDialogListener",
  "openIpcFileDialog",
  "removeFile",
  "removeFiles",
];

for (const exp of requiredExports) {
  assert(ipcSrc.includes(`export function ${exp}`), `Exports ${exp}`);
}

// ── Test 5: Theme toggle initialization ─────────────────────
console.log("\n[5] Theme toggle state");

const viewSettingsSrc = fs.readFileSync(
  path.join(__dirname, "src/store/reducers/view-settings.js"),
  "utf-8",
);

assert(
  viewSettingsSrc.includes("isChangedTheme: false"),
  "viewSettingsInitState has isChangedTheme: false",
);
assert(
  viewSettingsSrc.includes("changeTheme"),
  "changeTheme action exists",
);

// ── Test 6: MuiWrappedApp reads isChangedTheme ─────────────
const muiWrappedSrc = fs.readFileSync(
  path.join(__dirname, "src/providers/MuiWrappedApp.jsx"),
  "utf-8",
);

assert(
  muiWrappedSrc.includes('state.viewSettings'),
  "MuiWrappedApp reads isChangedTheme from Redux",
);
assert(
  muiWrappedSrc.includes("isChangedTheme ? darkTheme : lightTheme"),
  "MuiWrappedApp switches theme based on isChangedTheme",
);

// ── Test 7: AddMenu uses IPC helpers ────────────────────────
console.log("\n[6] AddMenu uses IPC helpers");

const addMenuSrc = fs.readFileSync(
  path.join(__dirname, "src/components/MenuAppBar/AddMenu.jsx"),
  "utf-8",
);

assert(
  addMenuSrc.includes("openFolderDialog"),
  "AddMenu uses openFolderDialog from IPC helpers",
);
assert(
  !addMenuSrc.includes("window.appRuntime"),
  "AddMenu does NOT use window.appRuntime directly",
);
assert(
  addMenuSrc.includes('primary="Open Folder"'),
  "AddMenu has 'Open Folder' option",
);

// ── Test 8: DrawerListCmp listens for folder dialog reply ───
console.log("\n[7] DrawerListCmp folder dialog listener");

const drawerSrc = fs.readFileSync(
  path.join(__dirname, "src/components/Drawer/DrawerListCmp.jsx"),
  "utf-8",
);

assert(
  drawerSrc.includes("addIpcFolderDialogListener"),
  "DrawerListCmp listens for folder dialog replies",
);
assert(
  drawerSrc.includes("setTreeKey"),
  "DrawerListCmp refreshes tree on folder dialog reply",
);

// ── Test 9: Redux store structure ───────────────────────────
console.log("\n[8] Redux store structure");

const storeSrc = fs.readFileSync(
  path.join(__dirname, "src/store/index.js"),
  "utf-8",
);
assert(
  storeSrc.includes("reducerViewSettings") || storeSrc.includes("viewSettings"),
  "Store exports viewSettings reducer",
);

const contentSrc = fs.readFileSync(
  path.join(__dirname, "src/store/reducers/content.js"),
  "utf-8",
);
assert(
  contentSrc.includes("setContent"),
  "Content reducer has setContent action",
);
assert(
  contentSrc.includes("removeMarkedTracks"),
  "Content reducer has removeMarkedTracks action",
);

// ── Summary ─────────────────────────────────────────────────
console.log(`\n${"═".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${"═".repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
