import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const server = new McpServer({
  name: "mcp-streamable-http",
  version: "1.0.0",
});

const baseURL = "https://fluffy-spork-gx4747wpjpwcvx4w-3001.app.github.dev/api/";

const getClient = server.tool(
  "get-client-list",
  "Get list of client from LENS",
  async () => {
    const response = await fetch(`${baseURL}client`);
    const output = await response.json();
    const data = output.result;
    return { content: [{ type: "text", text: data }] };
  }
);

const getAnnouncements = server.tool(
  "get-announcements-by-account",
  "Get announcements for a given account",
  {
    uduns: z.string().describe("Account Global ultimate duns number (uduns)"),
  },
  async (params: { uduns: string }) => {
    const response = await fetch(`${baseURL}announcements/${params.uduns}`);
    const output = await response.json();
    const data = output.result;
    return { content: [{ type: "text", text: data }] };
  }
);

const getEYActivities = server.tool(
  "get-ey-activities-by-account",
  "Get EY activities histogram for a given account",
  {
    uduns: z.string().describe("Account Global ultimate duns number (uduns)"),
  },
  async (params: { uduns: string }) => {
    const response = await fetch(`${baseURL}eyactivitieshistogram/${params.uduns}`);
    const output = await response.json();
    const data = output.result;
    return { content: [{ type: "text", text: data }] };
  }
);

const getForecast = server.tool(
  "get-forecast-by-account",
  "Get forecast for a given account",
  {
    uduns: z.string().describe("Account Global ultimate duns number (uduns)"),
  },
  async (params: { uduns: string }) => {
    const response = await fetch(`${baseURL}forecast/${params.uduns}`);
    const output = await response.json();
    const data = output.result;
    return { content: [{ type: "text", text: data }] };
  }
);

const getImpact = server.tool(
  "get-impact-by-account",
  "Get impact for a given account",
  {
    uduns: z.string().describe("Account Global ultimate duns number (uduns)"),
  },
  async (params: { uduns: string }) => {
    const response = await fetch(`${baseURL}impact/${params.uduns}`);
    const output = await response.json();
    const data = output.result;
    return { content: [{ type: "text", text: data }] };
  }
);

const getMeetingActivity = server.tool(
  "get-meeting-activity-by-account",
  "Get meeting activity histogram for a given account",
  {
    uduns: z.string().describe("Account Global ultimate duns number (uduns)"),
  },
  async (params: { uduns: string }) => {
    const response = await fetch(`${baseURL}meetingactivityhistogram/${params.uduns}`);
    const output = await response.json();
    const data = output.result;
    return { content: [{ type: "text", text: data }] };
  }
);

const getPipelineDetails = server.tool(
  "get-pipeline-details-by-account",
  "Get pipeline details for a given account",
  {
    uduns: z.string().describe("Account Global ultimate duns number (uduns)"),
  },
  async (params: { uduns: string }) => {
    const response = await fetch(`${baseURL}pipelineDetails/${params.uduns}`);
    const output = await response.json();
    const data = output.result;
    return { content: [{ type: "text", text: data }] };
  }
);

const getTopInsights = server.tool(
  "get-top-insights-by-account",
  "Get top insights for a given account",
  {
    uduns: z.string().describe("Account Global ultimate duns number (uduns)"),
  },
  async (params: { uduns: string }) => {
    const response = await fetch(`${baseURL}topinsights/${params.uduns}`);
    const output = await response.json();
    const data = output.result;
    return { content: [{ type: "text", text: data }] };
  }
);
const app = express();
app.use(express.json());

const transport: StreamableHTTPServerTransport =
  new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // set to undefined for stateless servers
  });

// Setup routes for the server
const setupServer = async () => {
  await server.connect(transport);
};

app.post("/mcp", async (req: Request, res: Response) => {
  console.log("Received MCP request:", req.body);
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

app.get("/mcp", async (req: Request, res: Response) => {
  console.log("Received GET MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    })
  );
});

app.delete("/mcp", async (req: Request, res: Response) => {
  console.log("Received DELETE MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    })
  );
});

// Start the server
const PORT = process.env.PORT || 3000;
setupServer()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MCP Streamable HTTP Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to set up the server:", error);
    process.exit(1);
  });
