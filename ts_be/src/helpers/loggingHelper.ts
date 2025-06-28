import * as fs from "fs";

export type LoggingLevelType = "debug" | "info" | "warn" | "error";

// LoggingHelper singleton for formatted & consistent logging across the application
export class LoggingHelper {
  private static instance: LoggingHelper | null = null;

  private constructor() {}

  public static getInstance(): LoggingHelper {
    if (!LoggingHelper.instance) {
      LoggingHelper.instance = new LoggingHelper();
    }
    return LoggingHelper.instance;
  }

  public log(message: string, level: LoggingLevelType = "info"): void {
    const timestamp = new Date().toISOString();
    console[level](`[${timestamp}] ${message}`);
  }

  public error(message: string): void {
    this.log(message, "error");
  }

  public warn(message: string): void {
    this.log(message, "warn");
  }

  public info(message: string): void {
    this.log(message, "info");
  }

  public debug(message: string): void {
    this.log(message, "debug");
  }

  public formatMessage(message: string, level: LoggingLevelType): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  public logToFileDefault(message: string): void {
    this.logToFile(message);
  }
  /**
   * Logs a message to a file with a specified logging level.
   * @param message The message to log.
   * @param level The logging level (default is 'info').
   * @param filePath The path to the log file (default is './application_log.txt').
   */
  public logToFile(
    message: string,
    level: LoggingLevelType = "info",
    filePath: string = "./application_log.txt",
  ): void {
    const formattedMessage = this.formatMessage(message, level);
    fs.appendFile(
      filePath,
      formattedMessage + "\n",
      (err: NodeJS.ErrnoException | null) => {
        if (err) {
          console.error(`Failed to write log to file: ${err.message}`);
        }
      },
    );
  }
}
