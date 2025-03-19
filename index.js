import { app, Tray, Menu, nativeImage } from "electron";
import path from "path";
import fs from "fs";
import Store from "electron-store";
import { Client } from "discord-rpc";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { execSync } from "child_process";
import { Module } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logFile = path.join(app.getPath("userData"), "sololvrpc.log");
const logStream = fs.createWriteStream(logFile, { flags: "a" });

function log(message, type = "INFO") {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  logStream.write(logMessage);
  console.log(logMessage);
}

if (app.isPackaged) {
  const appPath = app.getAppPath();
  const unpackedPath = path.join(appPath, "..", "app.asar.unpacked");
  const resourcesPath = process.resourcesPath;

  log(`App is packaged. App path: ${appPath}`);
  log(`Unpacked path: ${unpackedPath}`);
  log(`Resources path: ${resourcesPath}`);

  if (fs.existsSync(unpackedPath)) {
    process.env.NODE_PATH = [
      path.join(unpackedPath, "node_modules"),
      path.join(resourcesPath, "node_modules"),
    ].join(path.delimiter);
    Module._initPaths();
    log(`NODE_PATH set to: ${process.env.NODE_PATH}`);
  } else {
    log("Unpacked path does not exist", "WARNING");
  }
} else {
  log("App is running in development mode");
}

const store = new Store();
let client = new Client({ transport: "ipc" });

const APP_ID = "1351742186147807314";
const GAME_PROCESS_NAME = "Solo_Leveling_ARISE.exe";
const GAME_NAME = "Solo Leveling:ARISE";

let tray = null;
let isRunning = true;
let presenceInterval = null;
let gameStartTimestamp = null;

function createTray() {
  let iconPath;
  if (app.isPackaged) {
    iconPath = path.join(process.resourcesPath, "icon.png");
  } else {
    iconPath = path.join(__dirname, "icon.png");
  }

  log(`Attempting to load icon from: ${iconPath}`);

  if (!fs.existsSync(iconPath)) {
    log("Icon not found, creating default icon", "WARNING");
    const icon = nativeImage.createEmpty();
    icon.addRepresentation({
      width: 16,
      height: 16,
      scaleFactor: 1,
      data: Buffer.alloc(16 * 16 * 4, 0),
    });
    tray = new Tray(icon);
  } else {
    const icon = nativeImage.createFromPath(iconPath);
    const resizedIcon = icon.resize({ width: 16, height: 16 });
    tray = new Tray(resizedIcon);
    log("Icon loaded successfully");
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Auto-start",
      type: "checkbox",
      checked: store.get("autoStart", true),
      click: (menuItem) => {
        store.set("autoStart", menuItem.checked);
        setAutoStart(menuItem.checked);
        log(`Auto-start ${menuItem.checked ? "enabled" : "disabled"}`);
      },
    },
    { type: "separator" },
    {
      label: "Restart Rich Presence",
      click: async () => {
        log("Restarting Rich Presence...");
        if (client.isConnected) {
          await client.clearActivity();
          log("Cleared previous activity");
        }
        client = new Client({ transport: "ipc" });
        gameStartTimestamp = null;
        await updatePresence();
        log("Rich Presence restarted");
      },
    },
    { type: "separator" },
    {
      label: "Exit",
      click: () => {
        log("Exiting application...");
        isRunning = false;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("SoloLevelingRPC");
  tray.setContextMenu(contextMenu);
  log("Tray created successfully");
}

function setAutoStart(enable) {
  const appPath = app.isPackaged ? app.getPath("exe") : process.execPath;
  const startupFolder = path.join(
    process.env.APPDATA,
    "Microsoft\\Windows\\Start Menu\\Programs\\Startup"
  );
  const shortcutPath = path.join(startupFolder, "SoloLvRPC.lnk");
  const userDataPath = app.getPath("userData");

  log(`Setting auto-start to ${enable} at ${shortcutPath}`);

  if (enable) {
    const wsScript = `
      Set WshShell = WScript.CreateObject("WScript.Shell")
      Set shortcut = WshShell.CreateShortcut("${shortcutPath}")
      shortcut.TargetPath = "${appPath}"
      shortcut.WorkingDirectory = "${path.dirname(appPath)}"
      shortcut.Save
    `;
    const scriptPath = path.join(userDataPath, "createShortcut.vbs");
    fs.writeFileSync(scriptPath, wsScript);
    try {
      execSync(`cscript //nologo "${scriptPath}"`);
      log("Auto-start shortcut created");
    } catch (error) {
      log(`Error creating shortcut: ${error.message}`, "ERROR");
      if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
      }
    }
  } else {
    if (fs.existsSync(shortcutPath)) {
      fs.unlinkSync(shortcutPath);
      log("Auto-start shortcut removed");
    }
  }
}

async function isGameRunning() {
  try {
    const output = execSync(
      'tasklist /FI "IMAGENAME eq ' + GAME_PROCESS_NAME + '" /FO CSV /NH'
    ).toString();
    const gameRunning = output.includes(GAME_PROCESS_NAME);
    log(`Game process check: ${gameRunning ? "running" : "not running"}`);
    return gameRunning;
  } catch (error) {
    log(`Error checking game process: ${error.message}`, "ERROR");
    return false;
  }
}

async function updatePresence() {
  if (!client.isConnected) {
    try {
      log("Connecting to Discord...");
      await client.login({ clientId: APP_ID });
      log("Connected to Discord successfully");
    } catch (error) {
      log(`Failed to connect to Discord: ${error.message}`, "ERROR");
      return;
    }
  }

  const gameRunning = await isGameRunning();
  if (gameRunning) {
    try {
      if (!gameStartTimestamp) {
        gameStartTimestamp = Date.now();
        log("Game start timestamp set");
      }

      await client.setActivity({
        state: "In Game",
        largeImageKey: "game_icon",
        largeImageText: GAME_NAME,
        startTimestamp: gameStartTimestamp,
      });
      log("Discord presence updated: In Game");
    } catch (error) {
      log(`Failed to update presence: ${error.message}`, "ERROR");
    }
  } else {
    try {
      await client.clearActivity();
      gameStartTimestamp = null;
      log("Discord presence cleared");
    } catch (error) {
      log(`Failed to clear activity: ${error.message}`, "ERROR");
    }
  }
}

app.whenReady().then(() => {
  log("Application starting...");
  createTray();

  if (store.get("autoStart", true)) {
    setAutoStart(true);
  }

  presenceInterval = setInterval(updatePresence, 5000);
  updatePresence();
  log("Application initialized successfully");
});

app.on("window-all-closed", (e) => {
  e.preventDefault();
  log("Window close prevented");
});

app.on("before-quit", async () => {
  log("Application quitting...");
  if (presenceInterval) {
    clearInterval(presenceInterval);
    log("Presence interval cleared");
  }
  if (client.isConnected) {
    await client.clearActivity();
    log("Discord activity cleared");
  }
  logStream.end();
});
