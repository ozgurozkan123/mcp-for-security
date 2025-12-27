import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { spawn } from 'child_process';

// Create MCP server instance
const server = new McpServer({
    name: "ffuf",
    version: "1.0.0"
});

// Register tool
server.tool(
    "do-ffuf",
    "Run ffuf with specified URL",
    {
        url: z.string().url().describe("Target URL to fuzz"),
        ffuf_args: z.array(z.string()).describe(`Additional ffuf arguments`)
    },
    async ({ url, ffuf_args }) => {
        const ffuf = spawn('ffuf', ['-u', url, ...ffuf_args]);
        let output = '';

        ffuf.stdout.on('data', (data) => {
            output += data.toString();
        });

        ffuf.stderr.on('data', (data) => {
            output += data.toString();
        });

        return new Promise((resolve, reject) => {
            ffuf.on('close', (code) => {
                if (code === 0) {
                    resolve({
                        content: [{
                            type: "text",
                            text: output + "\n ffuf completed successfully"
                        }]
                    });
                } else {
                    reject(new Error(`ffuf exited with code ${code}`));
                }
            });

            ffuf.on('error', (error) => {
                reject(new Error(`Failed to start ffuf: ${error.message}`));
            });
        });
    }
);

// Vercel serverless handler
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
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    }

    return new Response(JSON.stringify({
        name: "ffuf",
        version: "1.0.0",
        status: "ready",
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}