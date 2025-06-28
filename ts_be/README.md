# r_proxy

A simple TypeScript Node.js http reverse proxy implementation with minimal overhead

# Setup

Run the provided `dockerfile` after the following in the root directory:
```
npm install && docker build -t node-proxy-webserver .

# start the container running ports for the webserver and proxy
docker run -p 3001:3001 -p 4001:4001 node-proxy-webserver
```
Observe postman requests the proxy at `http://localhost:3001/api/v1/latlng` return the Express server (running at 4001) hello
and that invalid SQL injection character attempts are forbidden by default

### Logging

Logging is built around the concept of intercepting already decrypted http 1.1 traffic
and investigating for potentially malicious traffic

### Configuration

Malicious traffic is configured within the exported enum in `activityHelper.ts` and is initially configured
to detect SQL injection, brute-force, request body size (content-length), and suspicious user-agent activity

### Logging

A centralized logging helper is utilized throughout and uses easily searchable prefixes in a log output file
for analysis and ingestion by log gathering systems