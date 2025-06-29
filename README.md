# full-stack-mono
A full-stack TypeScript Lerna monorepo using TypeScript Node &amp; React (via vite)

## About
This demo showcases some simplistic but fully-functional and production-ready full-stack components,
including a custom Node reverse-proxy that handles simple detection & blocking of malicious requests,
a Node Express web server, and a vite React frontend.

The frontend is a basic map application designed to showcase the difference between a standard
single-threaded (UI thread) JS application and the benefits of multi-threading on web workers
as you process more complex data sets - check out how smooth the map animation remains with multi-threading!

## Getting started
```
npx init lerna
cd ts_be && npm install
cd ../ts_fe && npm install
```
## To run the Node BE locally on 3001/4001 (through reverse proxy on 3001)
```
cd ts_be
docker build -t node-proxy-webserver .
docker run -p 3001:3001 -p 4001:4001 node-proxy-webserver
```
## To run the React FE locally on 5173
```
cd ts_fe
npm run dev
```

## Maptiler setup
You'll need a free maptiler API key: https://cloud.maptiler.com/account
Create a `.env` file: `touch ts_fe/.env` and add this line to it:
```
VITE_MAP_URL="https://api.maptiler.com/maps/streets-v2/style.json?key=<REPLACE_YOUR_API_KEY>
```

### You'll now have the full-stack app running locally that you can hit at http://localhost:5173, give it try!

![Demo Screenshot](ts_fe/src/assets/demo_ui.png?raw=true "Map Demo")