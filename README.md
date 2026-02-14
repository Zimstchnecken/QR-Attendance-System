# QR Attendance Frontend (Expo)

- SDK 54
- Built with Expo (React Native)

---

## Requirements
- Node.js 
- Expo Go app nasa playstore siya, pag crim ka baka pumunta kapa ng SM
- Laptop and phone must be connected to the same WiFi

---

## Install

1. Install dependencies:
   - npm install

2. Start the development server:
   - npx expo start

3. After running `expo start`, may malaking QR code.
   - I-scan mo gamit ang Expo Go app.
   - Make sure same WiFi ang laptop at phone.

4. To stop the server:
   - Ctrl + C

---

## Clear Cache (if may error or bug)

- npx expo start -c

Use this if:
- May weird errors
- Changes are not reflecting
- Metro bundler acting strange

---

## Project Scope

- UI is **frontend-only**
- No backend or database connection yet
- QR scanner is currently a **placeholder**
- Email actions are **not implemented yet**

---

## Folder Structure (Simplified)
front-end/
├── app/
├── components/
├── constants/
├── assets/
├── data/
├── package.json
└── app.json

---

## Notes

- If Expo fails, try clearing cache first.
- If QR won’t scan, check WiFi connection.
- If dependencies break, delete `node_modules` then run `npm install` again.

