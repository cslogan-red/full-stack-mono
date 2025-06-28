/**
 * Proxy Client Test
 */
import { IncomingMessage } from "node:http";
import { ProxyClient } from "../../clients/proxyClient";
import { testDataProps, testDataReqProps, setupTestData } from "../testData";

describe("ProxyClient", () => {
  let proxyClient: ProxyClient;

  beforeAll(() => {
    setupTestData();
    // Mock the necessary modules before running the tests
    jest.mock("http-proxy", () => ({
      createProxyServer: jest.fn(() => ({
        on: jest.fn(),
        listen: jest.fn(),
        close: jest.fn(),
      })),
    }));
    jest.mock("http", () => ({
      createServer: jest.fn((requestListener) => {
        const server = {
          on: jest.fn(),
          listen: jest.fn(),
          close: jest.fn(),
        };
        requestListener(
          { socket: { remoteAddress: "" }, headers: {} } as unknown,
          {
            writeHead: jest.fn(),
            end: jest.fn(),
          },
          () => {},
        );
        return server;
      }),
    }));
    jest.mock("express", () => {
      const mockExpress = jest.fn(() => ({
        use: jest.fn(),
        get: jest.fn(),
        post: jest.fn(),
        listen: jest.fn(),
        _router: {
          stack: [],
        },
      }));
      return mockExpress;
    });
  });
  beforeEach(() => {
    // Initialize the ProxyClient with test data properties
    proxyClient = new ProxyClient({
      ...testDataProps,
    });
  });

  it("should create a proxy server client", () => {
    expect(proxyClient).toBeDefined();
    expect(proxyClient.proxyServer).toBeDefined();
    expect(proxyClient.getProxyServer()).toBeDefined();
  });

  it("should block malicious ua requests", () => {
    const req = {
      socket: { remoteAddress: "" },
      headers: { "user-agent": "sqlmap" },
      on: jest.fn((event, callback) => {
        if (event === "data") {
          callback(Buffer.from("test data"));
        }
      }),
      ...testDataReqProps,
    };
    const resp = proxyClient.isMaliciousRequest(
      req as unknown as IncomingMessage,
      "192.168.0.1",
    );
    expect(resp).toBe(true);
  });

  it("should block malicious url requests", () => {
    const req = {
      socket: { remoteAddress: "" },
      headers: { "user-agent": "" },
      on: jest.fn((event, callback) => {
        if (event === "data") {
          callback(Buffer.from("test data"));
        }
      }),
      ...testDataReqProps,
      url: "/SELECT",
    };
    const resp = proxyClient.isMaliciousRequest(
      req as unknown as IncomingMessage,
      "192.168.0.1",
    );
    expect(resp).toBe(true);
  });

  it("should block content-length requests", () => {
    const req = {
      socket: { remoteAddress: "" },
      headers: { "content-length": 1_000_001 },
      on: jest.fn((event, callback) => {
        if (event === "data") {
          callback(Buffer.from("test data"));
        }
      }),
      ...testDataReqProps,
    };
    const resp = proxyClient.isMaliciousRequest(
      req as unknown as IncomingMessage,
      "192.168.0.1",
    );
    expect(resp).toBe(true);
  });

  it("should handle rate limiting", () => {
    const resp = proxyClient.isBruteForceAttempt("192.168.0.1");
    expect(resp).toBe(false); // Assuming no brute force attempts initially
  });
});
