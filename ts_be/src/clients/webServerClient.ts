// node express web server client
import express from "express";
import { Server, IncomingMessage, ServerResponse } from "http";
import { getLatLng, getLatLngParty } from "../api/v1/latlng";
import { LoggingHelper } from "../helpers/loggingHelper";

enum WebServerClientPorts {
  HTTP = 4001, // Default port for HTTP server
}

export const ROUTER = {
  apiV1LatLng: "/api/v1/latlng",
  apiV1LatLngParty: "/api/v1/latlng/party",
};

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

  // GET api/v1/latlng
  public async getAPIV1LatLng(endpoint: string): Promise<Express.Response> {
    return this.app.get(endpoint, async (req, res) => {
      try {
        const returnVal = await getLatLng({ req });
        res.json({
          message: `Hello from the Express server at ${req.path}!`,
          returnVal,
          timestamp: new Date().toISOString(),
        });
      } catch (ex) {
        LoggingHelper.getInstance().error(
          `Error processing getAPIV1LatLng: ${ex}`,
        );
        res.status(500).json({
          message: `Internal server error`,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  // GET api/v1/latlng/party
  public async getAPIV1LatLngParty(
    endpoint: string,
  ): Promise<Express.Response> {
    return this.app.get(endpoint, async (req, res) => {
      try {
        const returnVal = await getLatLngParty({ req });
        res.json({
          message: `Hello from the Express server at ${req.path}!`,
          returnVal,
          timestamp: new Date().toISOString(),
        });
      } catch (ex) {
        LoggingHelper.getInstance().error(
          `Error processing getAPIV1LatLngParty: ${ex}`,
        );
        res.status(500).json({
          message: `Internal server error`,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }
}
