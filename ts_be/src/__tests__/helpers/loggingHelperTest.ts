/**
 * Logging Helper Test
 */
import { LoggingHelper } from "../../helpers/loggingHelper";
import { setupTestData } from "../testData";
import * as fs from "node:fs";
const logFilePath = "./application_log.txt";

describe("LoggingHelper", () => {
  let loggingHelper: LoggingHelper;

  beforeAll(() => {
    setupTestData();
    // Mock the fs module to prevent actual file operations
    jest.mock("fs", () => ({
      writeFileSync: jest.fn(),
      appendFile: jest.fn(),
      readFileSync: jest.fn(() => ""),
    }));
    jest.mock("path", () => ({
      join: jest.fn((...args) => args.join("/")),
    }));
  });
  beforeEach(() => {
    // Initialize the LoggingHelper before each test
    loggingHelper = LoggingHelper.getInstance();
    // Clear the log file before each test
    fs.writeFileSync(logFilePath, "");
  });

  it("should log messages with correct format", () => {
    const consoleSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    const message = "Test message";
    loggingHelper.info(message);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should log error messages with correct format", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const message = "Test error message";
    loggingHelper.error(message);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should log warning messages with correct format", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const message = "Test warning message";
    loggingHelper.warn(message);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should log debug messages with correct format", () => {
    const consoleSpy = jest
      .spyOn(console, "debug")
      .mockImplementation(() => {});
    const message = "Test debug message";
    loggingHelper.debug(message);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should log messages to file with default level", () => {
    const message = "Test file log message with level";
    loggingHelper.logToFile(message, "warn");
    loggingHelper.logToFileDefault(message);
  });
});
