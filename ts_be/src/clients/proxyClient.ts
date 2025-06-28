import * as http from "http";
import { Server } from "http";
import { createProxyServer } from "http-proxy";
import { LoggingHelper, LoggingLevelType } from "../helpers/loggingHelper";
import {
  MaliciousActivityType,
  ENABLED_ACTIVITY_TYPES,
} from "../helpers/activityHelper";

export type ProxyClientOptions = {
  target: string; // The target server URL to proxy requests to
  port?: number; // Optional port number for the proxy server
  secure?: boolean; // Whether to use HTTPS for the target server
  changeOrigin?: boolean; // Whether to change the origin of the host header to the target URL
  ws?: boolean; // Whether to proxy WebSocket connections
  logLevel?: LoggingLevelType; // Logging level for the proxy server
  blockIP?: boolean; // whether to enforce IP blocking
};

type RequestCount = {
  [key: string]: {
    count: number;
    timestamp: number;
  };
};

enum ProxyClientPorts {
  HTTP = 3001,
}

export class ProxyClient {
  public proxyServer: Server<
    typeof http.IncomingMessage,
    typeof http.ServerResponse
  > | null = null;
  private blockedIPs: Set<string> = new Set(); // To keep track of blocked IPs
  private requestsCounts: RequestCount = {}; // To track request counts per IP
  private blockIP: boolean; // Flag to enable or disable IP blocking
  private loggingHelper: LoggingHelper = LoggingHelper.getInstance();

  // instatiation generates a reverse proxy server that forwards requests to a target server
  constructor(options: ProxyClientOptions) {
    this.proxyServer = this.createProxyServerClient(options);
    this.blockIP = options.blockIP || false;
  }

  // Create a proxy server with the provided options
  private createProxyServerClient = (
    options: ProxyClientOptions,
  ): Server<typeof http.IncomingMessage, typeof http.ServerResponse> => {
    const {
      target,
      port = ProxyClientPorts.HTTP,
      secure = false,
      changeOrigin = true,
      ws = false,
    } = options;

    const proxy = createProxyServer({
      target,
      secure,
      changeOrigin,
      ws,
    });

    // Create an HTTP server to handle incoming requests
    const server = http.createServer((req, res) => {
      const clientIP = req.socket.remoteAddress || "unknown";

      // Detect malicious activity
      if (this.isMaliciousRequest(req, clientIP)) {
        this.loggingHelper.warn(
          `Blocked malicious request from IP: ${clientIP}`,
        );
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Forbidden: Malicious activity detected.");
        return;
      }

      // Proxy the request to the target server
      proxy.web(req, res, { target }, (err) => {
        this.loggingHelper.error(`Proxy error: ${err}`);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Something went wrong.");
      });
    });

    if (process.env.NODE_ENV !== "test") {
      // Start the server on the specified port
      server.listen(port, () => {
        this.loggingHelper.info(
          `Reverse proxy server is running on http://localhost:${port}`,
        );
      });
    }

    return proxy as unknown as Server<
      typeof http.IncomingMessage,
      typeof http.ServerResponse
    >;
  };

  public isMaliciousRequest(
    req: http.IncomingMessage,
    clientIP: string,
  ): boolean {
    // Block specific IPs
    if (this.blockedIPs.has(clientIP)) {
      return true;
    }

    // Detect brute-force attempts
    if (ENABLED_ACTIVITY_TYPES.B_F && this.isBruteForceAttempt(clientIP)) {
      // Log it to stdo & file ouptut for further analysis
      this.loggingHelper.warn(
        `Brute-force attempt detected from IP: ${clientIP}`,
      );
      this.loggingHelper.logToFileDefault(
        `${MaliciousActivityType.B_F} detected from IP: ${clientIP}`,
      );
      if (this.blockIP) {
        this.blockedIPs.add(clientIP); // Optionally block the IP
      }
      return true;
    }

    // Detect unusual User-Agent headers
    const userAgent = req.headers["user-agent"] || "";
    if (
      ENABLED_ACTIVITY_TYPES.UA_MANIP &&
      (userAgent.includes("sqlmap") || userAgent.includes("malicious-bot"))
    ) {
      // Log it to stdo & file ouptut for further analysis
      this.loggingHelper.warn(`Detected suspicious User-Agent: ${userAgent}`);
      this.loggingHelper.logToFileDefault(
        `${MaliciousActivityType.UA_MANIP} suspicious User-Agent: ${userAgent}, from IP: ${clientIP}`,
      );
      if (this.blockIP) {
        this.blockedIPs.add(clientIP); // Optionally block the IP
      }
      return true;
    }

    // Check for overly large request bodies based on content-length
    const contentLength = parseInt(req.headers["content-length"] || "0", 10);
    if (ENABLED_ACTIVITY_TYPES.REQ_BODY_SIZE && contentLength > 1_000_000) {
      // 1 MB limit
      // Log it to stdo & file ouptut for further analysis
      this.loggingHelper.warn(`Request from ${clientIP} exceeds allowed size`);
      this.loggingHelper.logToFileDefault(
        `${MaliciousActivityType.REQ_BODY_SIZE} Request from ${clientIP} exceeds allowed size,
          content-length: ${contentLength}`,
      );
      if (this.blockIP) {
        this.blockedIPs.add(clientIP); // Optionally block the IP
      }
      return true;
    }

    // Detect SQL injection patterns in query parameters or body
    const sqlInjectionPatterns = [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // Common SQL injection characters
      /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b/i, // SQL keywords
      /\b(OR|AND)\b.*\=.*\b/i, // Logical operators with conditions
    ];

    // Check query string
    const url = req.url || "";
    if (
      ENABLED_ACTIVITY_TYPES.SQL_INJECTION &&
      sqlInjectionPatterns.some((pattern) => pattern.test(url))
    ) {
      // Log it to stdo & file ouptut for further analysis
      this.loggingHelper.warn(
        `Detected potential SQL injection in URL: ${url}`,
      );
      this.loggingHelper.logToFileDefault(
        `${MaliciousActivityType.SQL_INJECTION} Detected potential SQL injection in URL: ${url}, from IP: ${clientIP}`,
      );
      if (this.blockIP) {
        this.blockedIPs.add(clientIP); // Optionally block the IP
      }
      return true;
    }

    return false;
  }

  // Attempt brute-force detection by counting requests from the same IP
  public isBruteForceAttempt(clientIP: string): boolean {
    const now = Date.now();
    const timeWindow = 60 * 1000; // 1 minute
    const maxRequests = 100; // Max requests for given time window
    const requestData = this.requestsCounts[clientIP] || {
      count: 0,
      timestamp: now,
    };

    if (requestData) {
      const { timestamp } = requestData;
      if (now - timestamp < timeWindow) {
        // Within the time window, increment the count
        requestData.count += 1;
        this.requestsCounts[clientIP] = requestData;

        // Check if the count exceeds the limit
        if (requestData.count > maxRequests) {
          if (this.blockIP) {
            this.blockedIPs.add(clientIP); // Optionally block the IP
          }
          return true;
        }
      } else {
        // Reset count after the time window has passed
        this.requestsCounts[clientIP] = { count: 1, timestamp: now };
      }
    }
    return false;
  }

  public getProxyServer = () => {
    return this.proxyServer;
  };
}
