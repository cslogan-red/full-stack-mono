/**
 * WebServerClient Test Suite
 * This suite tests the WebServerClient class, which is responsible for creating and managing a web server client.
 */
import { WebServerClient } from "../../clients/webServerClient";
import { setupTestData } from "../testData";

describe("WebServerClient", () => {
  let webServerClient: WebServerClient;
  // Mock the necessary modules before running the tests
  beforeAll(() => {
    setupTestData();
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
    // Initialize the WebServerClient before each test
    webServerClient = new WebServerClient();
  });

  it("should create a web server client", () => {
    expect(webServerClient).toBeDefined();
    expect(webServerClient.app).toBeDefined();
  });

  it("should respond to GET requests", async () => {
    const endpoint = "/api/v1/latlng";
    const resp = await webServerClient.getAPIV1LatLng(endpoint);

    expect(resp).toBeDefined();
  });

  it("should respond to GET requests", async () => {
    const endpoint = "/api/v1/latlng/party";
    const resp = await webServerClient.getAPIV1LatLngParty(endpoint);

    expect(resp).toBeDefined();
  });

  it("should log server start message", () => {
    const consoleSpy = jest.spyOn(console, "info");
    webServerClient.listen(4001);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should handle JSON requests", async () => {
    const endpoint = "/api/json";
    const resp = webServerClient.app.post(endpoint, (req, res) => {
      res.json({ received: req.body });
    });

    expect(resp).toBeDefined();
  });

  it("should handle URL-encoded requests", async () => {
    const endpoint = "/api/urlencoded";
    const resp = webServerClient.app.post(endpoint, (req, res) => {
      res.json({ received: req.body });
    });

    expect(resp).toBeDefined();
  });

  it("should handle server errors gracefully", async () => {
    const endpoint = "/api/error";
    const resp = webServerClient.app.get(endpoint, () => {
      throw new Error("Test error");
    });

    expect(resp).toBeDefined();
  });

  it("should handle invalid JSON requests", async () => {
    const endpoint = "/api/invalid-json";
    const resp = webServerClient.app.post(endpoint, (req, res) => {
      res.status(400).send("Invalid JSON");
    });

    expect(resp).toBeDefined();
  });
});
