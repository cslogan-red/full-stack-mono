# full-stack-mono
A full-stack TypeScript Lerna monorepo using TypeScript Node &amp; React (via vite)

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

### You'll now have the full-stack app running locally that you can hit at http://localhost:5173, give it try!