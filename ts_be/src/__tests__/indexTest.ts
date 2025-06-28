/**
 * @file index.ts
 * This file contains tests for the main application functionality.
 */
import { describe, expect, it } from "@jest/globals";
import { entryPoint } from "../index";
import { setupTestData } from "./testData";

describe("Application Entry Point", () => {
  beforeAll(() => {
    setupTestData();
    // Mock the console to prevent actual logging during tests
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
    jest.mock("../clients/webServerClient", () => ({
      WebServerClient: jest.fn(() => ({
        app: {
          use: jest.fn(),
          get: jest.fn(),
          post: jest.fn(),
          listen: jest.fn(),
        },
      })),
    }));
    jest.mock("../clients/proxyClient", () => ({
      ProxyClient: jest.fn(() => ({
        createProxyServerClient: jest.fn(),
      })),
    }));
  });
  it("should initialize the application without errors", async () => {
    await expect(entryPoint()).resolves.not.toThrow();
  });
});
