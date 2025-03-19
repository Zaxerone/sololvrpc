# Solo Leveling Rich Presence

A Discord Rich Presence application for Solo Leveling ARISE.

## Features

- Automatic game process detection
- Discord Rich Presence integration
- System tray interface
- Auto-start on Windows boot
- Toggle auto-start from system tray
- Minimized to system tray

## Building

To create an executable:

```bash
pnpm run build
```

The executable will be created in the `dist` directory.

## Usage

1. Run the application
2. The application will appear in your system tray
3. Right-click the tray icon to:
   - Toggle auto-start
   - Exit the application

## Development

To run the application in development mode:

```bash
pnpm start
```

## Notes

- Make sure Discord is running before starting this application
- Auto-start is enabled by default but can be toggled from the system tray
