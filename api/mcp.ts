// MCP Server endpoint for Vercel Serverless
// Implements the Model Context Protocol (MCP) JSON-RPC 2.0 interface

const SERVER_INFO = {
  name: "arjun",
  version: "1.0.0",
};

// Define your tools here
const TOOLS = [
  {
    name: "do-arjun",
    description: "Run Arjun to discover hidden HTTP parameters",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Target URL to scan for hidden parameters" },
        textFile: { type: "string", description: "Path to file containing multiple URLs" },
        wordlist: { type: "string", description: "Path to custom wordlist file" },
        method: { type: "string", description: "HTTP method to use for scanning" },
        rateLimit: { type: "number", description: "Requests per second" },
        chunkSize: { type: "number", description: "Chunk size for parameters sent at once" }
      },
      required: ["url"],
    },
  },
];

// Tool implementation
async function callTool(name: string, args: any): Promise<any> {
  try {
    switch (name) {
      case "do-arjun":
        // Command execution simulation (in reality, you should replace this with actual execution)
        return { content: [{ type: "text", text: "Simulated result for " + args.url }] };
      default:
        throw new Error("Unknown tool: " + name);
    }
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// Handle JSON-RPC requests
async function handleJsonRpc(request: any): Promise<any> {
  const { id, method, params } = request;

  switch (method) {
    case "initialize":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: params?.protocolVersion || "2025-03-26",
          capabilities: {},
          serverInfo: SERVER_INFO,
        },
      };
    case "tools/list":
      return {
        jsonrpc: "2.0",
        id,
        result: { tools: TOOLS },
      };
    case "tools/call":
      const toolResult = await callTool(params.name, params.arguments || {});
      return {
        jsonrpc: "2.0",
        id,
        result: toolResult,
      };
    default:
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: "Method not found: " + method },
      };
  }
}

// Vercel serverless handler
export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id",
  };

  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Handle GET for health check
    if (req.method === "GET") {
      return new Response(JSON.stringify({
        name: SERVER_INFO.name,
        version: SERVER_INFO.version,
        status: "ready",
        protocol: "MCP",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Handle POST for MCP JSON-RPC
    if (req.method === "POST") {
        const body = await req.json();
        const response = await handleJsonRpc(body);

        // Notifications don't get a response
        if (response === null) {
          return new Response(null, { status: 202, headers: corsHeaders });
        }

        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

  } catch (error: any) {
    return new Response(JSON.stringify({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error: " + error.message },
    }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
