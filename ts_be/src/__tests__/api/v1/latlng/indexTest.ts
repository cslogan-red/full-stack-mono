/**
 * @file index.ts
 * This file contains tests for the main application functionality.
 */
import { Request } from "express";
import { describe, expect, it } from "@jest/globals";
import { getLatLng, getLatLngParty } from "../../../../api/v1/latlng";
import { setupTestData } from "../../../testData";

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
    jest.mock("../../../../clients/webServerClient", () => ({
      WebServerClient: jest.fn(() => ({
        app: {
          use: jest.fn(),
          get: jest.fn(),
          post: jest.fn(),
          listen: jest.fn(),
        },
      })),
    }));
    jest.mock("../../../../clients/proxyClient", () => ({
      ProxyClient: jest.fn(() => ({
        createProxyServerClient: jest.fn(),
      })),
    }));
  });
  it("should initialize api/v1/latlng/getLatLng without errors", async () => {
    await expect(
      getLatLng({ req: { query: {}, header: {} } as Request }),
    ).resolves.not.toThrow();
  });
  it("should initialize api/v1/latlng/getLatLngParty without errors", async () => {
    await expect(
      getLatLngParty({ req: { query: {}, header: {} } as Request }),
    ).resolves.not.toThrow();
  });
});
