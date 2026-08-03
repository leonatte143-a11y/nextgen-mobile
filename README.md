# KAIRO mobile app (Expo)

React Native app for the KAIRO workspace. Run commands from **this folder** (`KAIRO/mobile-app`).

## Setup

```bash
cp .env.example .env
# Set EXPO_PUBLIC_API_URL to your PC LAN IP + backend port (see ../docs/ENVIRONMENT.md)
npm install
npx expo start --clear
```

## Backend

The API lives in **`../backend/`** — not inside this app.

## Git

This directory may contain the **`.git`** history that previously lived at the legacy `MobileApp` root. For a single repo for the whole workspace, consider moving `.git` to `KAIRO/` later with `git subtree` or a fresh `git init` at the workspace root (optional).
