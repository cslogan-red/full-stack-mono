import { LoggingLevelType } from "../helpers/loggingHelper";

type TestDataPropsType = {
  target: string; // The target server URL to proxy requests to
  port?: number; // Optional port number for the proxy server
  secure?: boolean; // Whether to use HTTPS for the target server
  changeOrigin?: boolean; // Whether to change the origin of the host header to the target URL
  ws?: boolean; // Whether to proxy WebSocket connections
  logLevel?: LoggingLevelType; // Logging level for the proxy server
};

export const testDataProps: TestDataPropsType = {
  target: "http://localhost",
  port: 3001,
  secure: false,
  changeOrigin: true,
  ws: false,
  logLevel: "info",
};

type TestDataReqType = {
  url: "/api/v1/latlng";
  method: "GET" | "POST" | "PUT" | "DELETE";
};

export const testDataReqProps: TestDataReqType = {
  url: "/api/v1/latlng",
  method: "GET",
};

export const setupTestData = () => {
  process.env.NODE_ENV = "test"; // Set the environment to test
};
