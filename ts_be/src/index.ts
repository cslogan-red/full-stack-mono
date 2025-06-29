import { ProxyClient } from "./clients/proxyClient";
import { WebServerClient, ROUTER } from "./clients/webServerClient";
import { LoggingHelper } from "./helpers/loggingHelper";

// Entry point for the application
const loggingHelper = LoggingHelper.getInstance();
export const entryPoint = async () => {
  // Start the proxy on port 3001, forwarding requests to a target server on port 4001
  new ProxyClient({
    target: "http://localhost:4001", // Target server to proxy requests to
    port: 3001,
    secure: false,
    changeOrigin: true,
    ws: true,
    logLevel: "info",
  });

  // Basic web server client of port 4001
  const webServerClient = new WebServerClient("http://localhost:4001");

  // establish basic routes
  webServerClient
    .getAPIV1LatLng(ROUTER.apiV1LatLng)
    .then((data) => console.log(`GET ${ROUTER.apiV1LatLng}: ${data}`))
    .catch((err) => console.error("Error fetching data:", err));

  webServerClient
    .getAPIV1LatLngParty(ROUTER.apiV1LatLngParty)
    .then((data) => console.log(`GET ${ROUTER.apiV1LatLngParty}: ${data}`))
    .catch((err) => console.error("Error fetching data:", err));
};

try {
  // attempt entry point
  entryPoint();
} catch (error) {
  // log any errors that occur during the entry point execution
  loggingHelper.error(
    `Error in entryPoint: ${error instanceof Error ? error.message : "Unknown error"}`,
  );
}
