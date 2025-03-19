# 🎮 Solo Leveling Rich Presence

[![License](https://img.shields.io/github/license/Zaxerone/SoloLvRPC)](LICENSE)
[![Version](https://img.shields.io/github/release/Zaxerone/SoloLvRPC)](https://github.com/Zaxerone/sololvrpc/releases)

A sleek Discord Rich Presence application that enhances your Solo Leveling ARISE gaming experience by displaying your game status directly on your Discord profile.

## ✨ Features

- 🎯 **Automatic Game Detection**: Seamlessly detects when Solo Leveling ARISE is running
- 🎨 **Rich Discord Integration**: Beautiful status display showing your current game activity
- 🖥️ **System Tray Interface**: Easy access to controls and settings
- 🔄 **Auto-Start Option**: Automatically launches with Windows
- ⚙️ **Customizable Settings**: Toggle auto-start and other preferences from the system tray
- 🔽 **Minimized to Tray**: Runs efficiently in the background

## 🚀 Getting Started

### Prerequisites

- Windows 10 or higher
- Discord desktop application
- Node.js (for development)

### Installation

1. Download the latest release from the [releases page](https://github.com/Zaxerone/SoloLvRPC/releases)
2. Extract the archive to your desired location
3. Run the executable

### Usage

1. Launch the application
2. Look for the icon in your system tray
3. Right-click the tray icon to access options:
   - Toggle auto-start
   - Restart Rich Presence
   - Exit the application

<picture>
<img src="https://github.com/user-attachments/assets/a7460c1a-7edf-49e6-872e-bb0476e256db">
</picture>
<br>

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/Zaxerone/sololvrpc.git
cd sololvrpc

# Install dependencies
npm install

# Build the application
npm run build
```

### Development Mode

```bash
npm run start
```

### Clean Build

When creating a new build, it's recommended to clean the project first:

```bash
# Remove existing build files and dependencies
rm -rf node_modules/ dist/ package-lock.json

# Reinstall dependencies
npm install

# Build the application
npm run build
```

The executable will be generated in the `dist` directory.

## 📝 Notes

- Ensure Discord is running before starting this application
- Auto-start is enabled by default but can be toggled from the system tray
- The application requires administrator privileges for auto-start functionality

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Discord for their Rich Presence API
- The Solo Leveling ARISE development team

---

Made with ❤️ by Zaxerone
