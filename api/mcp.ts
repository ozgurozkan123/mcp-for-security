import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Create MCP server
const server = new McpServer({
    name: "assetfinder",
    version: "1.0.0",
});

// Register tools
server.tool(
    "do-assetfinder",
    "Find related domains and subdomains using assetfinder for a given target.",
    {
        target: z.string().describe("The root domain (e.g., example.com) to discover associated subdomains and related domains."),
    },
    async ({ target }) => {
        // Placeholder for actual invocation logic.
        return { content: [{ type: "text", text: `Simulated output for ${target}` }] };
    },
);

export default async function handler(req: Request): Promise<Response> {
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" } });
    }

    if (req.method === "POST") {
        try {
            const body = await req.json();
            const response = await server.handleMessage(body);
            return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
    }

    return new Response(JSON.stringify({ name: "assetfinder", version: "1.0.0", status: "ready" }), { status: 200, headers: { "Content-Type": "application/json" } });
}
