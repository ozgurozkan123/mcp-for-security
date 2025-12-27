// MCP Server endpoint for Vercel Serverless
// Implements the Model Context Protocol (MCP) JSON-RPC 2.0 interface

const SERVER_INFO = {
  name: "arjun-mcp",
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
        textFile: { type: "string", description: "Path to file containing multiple URLs", optional: true },
        wordlist: { type: "string", description: "Path to custom wordlist file", optional: true },
        method: { type: "string", description: "HTTP method to use for scanning (default: GET)", enum: ["GET", "POST", "JSON", "HEADERS"], optional: true },
        rateLimit: { type: "number", description: "Maximum requests per second (default: 9999)", optional: true },
        chunkSize: { type: "number", description: "Chunk size.", optional: true }
      },
      required: ["url"]
    }
  }
];

async function handleRequest(req: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  console.log(`Request method: ${req.method}`);

  if (req.method === "GET") {
    try {
      return new Response(JSON.stringify({
        serverInfo: SERVER_INFO,
        status: "running",
      }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
    } catch (error: any) {
      console.error("Error in health check:", error);
      return new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  if (req.method === "POST") {
    try {
      const json = await req.json();
      console.log("Received JSON payload:", json);

      return new Response(JSON.stringify({ response: "Handled" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (error: any) {
      console.error("Error parsing JSON:", error);
      return new Response(JSON.stringify({ error: "Bad Request" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export default handleRequest;