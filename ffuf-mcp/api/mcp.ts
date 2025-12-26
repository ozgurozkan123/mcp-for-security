import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Create MCP server with tools
const server = new McpServer({
  name: "ffuf",
  version: "1.0.0",
});

// Register tools
server.tool(
  "do-ffuf",
  "Run ffuf with specified URL",
  {
    url: z.string().url().describe("Target URL to fuzz"),
    ffuf_args: z.array(z.string()).describe("Additional ffuf arguments"),
  },
  async ({ url, ffuf_args }) => {
    // Simulate tool logic here for testing
    return {
      content: [{ type: "text", text: `Fuzzing ${url} with args: ${ffuf_args.join(' ')}` }],
    };
  }
);

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const response = await server.handleMessage(body);
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ name: "ffuf", version: "1.0.0", status: "ready" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
