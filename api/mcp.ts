import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Create MCP server
const server = new McpServer({
    name: "arjun",
    version: "1.0.0",
});

// Register tools
server.tool(
    "do-arjun",
    "Run Arjun to discover hidden HTTP parameters",
    {
        url: z.string().url().describe("Target URL to scan for hidden parameters"),
        textFile: z.string().optional().describe("Path to file containing multiple URLs"),
        wordlist: z.string().optional().describe("Path to custom wordlist file"),
        method: z.enum(["GET", "POST", "JSON", "HEADERS"]).optional().describe("HTTP method"),
        rateLimit: z.number().optional().describe("Requests per second"),
        chunkSize: z.number().optional().describe("Chunk size")
    },
    async ({ url, textFile, wordlist, method, rateLimit, chunkSize }) => {
        try {
            // Simulated process logic
            console.log("Executing tool with parameters:", { url, textFile, wordlist, method, rateLimit, chunkSize });
            return { content: [{ type: "text", text: `Simulated result for ${url}` }] };
        } catch (error) {
            console.error("Error executing tool:", error);
            throw new Error(`Execution failed: ${error.message}`);
        }
    },
);

export default async function handler(req: Request): Promise<Response> {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id",
    };

    try {
        console.log("Request method:", req.method);
        // Handle CORS preflight
        if (req.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: corsHeaders,
            });
        }

        // Handle GET for health check
        if (req.method === "GET") {
            return new Response(JSON.stringify({
                name: "arjun",
                version: "1.0.0",
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
            console.log("Request body:", body);
            const response = await server.handleMessage(body);
            if (!response) throw new Error("Invalid response from server");

            return new Response(JSON.stringify(response), {
                status: 200,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

    } catch (error: any) {
        console.error("Request handling error:", error);
        return new Response(
            JSON.stringify({
                jsonrpc: "2.0",
                id: null,
                error: { code: -32700, message: `Unexpected error: ${error.message}` },
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
    });
}
