// node express web server client
import express from "express";
import { Server, IncomingMessage, ServerResponse } from "http";
import { getLatLng } from "../api/v1/latlng";
import { LoggingHelper } from "../helpers/loggingHelper";

enum WebServerClientPorts {
  HTTP = 4001, // Default port for HTTP server
}

/**
 * A minimal Node.js Express webserver, example usage:
 * const client = new WebServerClient();
 * client.get('api/v1/latlng')
 * .then(data => console.log('Response from server:', data))
 * .catch(err => console.error('Error:', err));
 */
export class WebServerClient {
  private loggingHelper: LoggingHelper;
  private serverUrl: string;
  public app: express.Express;
  public express:
    | Server<typeof IncomingMessage, typeof ServerResponse>
    | undefined;

  constructor(serverUrl = `http://localhost:${WebServerClientPorts.HTTP}`) {
    this.loggingHelper = LoggingHelper.getInstance();
    this.serverUrl = serverUrl;
    this.app = express();
    this.app.use(express.json()); // Middleware to parse JSON bodies
    this.app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
    this.listen(WebServerClientPorts.HTTP);
  }

  public listen(port: number): void {
    try {
      if (process.env.NODE_ENV !== "test") {
        this.express = this.app.listen(port, () => {
          this.loggingHelper.info(
            `Express web server is running at ${this.serverUrl}!`,
          );
        });
      } else {
        this.loggingHelper.info(
          `Express web server is running at ${this.serverUrl}!`,
        );
      }
    } catch (error) {
      this.loggingHelper.error(
        `Error starting Express server: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
      if (this.express) {
        this.express.close();
      }
    }
  }

  // Method to send a GET request
  public async get(endpoint: string): Promise<Express.Response> {
    return this.app.get(endpoint, async (req, res) => {
      try {
        const returnVal = await getLatLng({ req });
        res.json({
          message: `Hello from the Express server at ${req.path}!`,
          returnVal,
          timestamp: new Date().toISOString(),
        });
      } catch (ex) {
        LoggingHelper.getInstance().error(`Error processing getLatLng: ${ex}`);
        res.status(500).json({
          message: `Internal server error`,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }
}
