import express, { type Response } from "express";
import path from "node:path";
import { aiService } from "./aiService";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

const clients: { [ip: string]: Response } = {};

app.get("/api/events", (req, res) => {
	try {
		const ip = req.ip;
		if (!ip) {
			throw new Error("IP not found");
		}
		console.debug(`GET /api/events ${ip}`);
		res.set({
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		});
		res.flushHeaders();
		clients[ip] = res;
		res.write(
			`data: ${JSON.stringify({ message: "Connected to server" })}\n\n`,
		);

		res.on("close", () => {
			delete clients[ip];
			console.log(
				`${ip} disconnected. ${Object.keys(clients).length} clients remaining`,
			);
			res.end();
		});
	} catch (error) {
		console.error(error);
		if (!res.headersSent) {
			res.sendStatus(500);
		}
		if (!res.closed) {
			res.end();
		}
	}
});

app.post("/api/events", async (req, res) => {
	try {
		const ip = req.ip;
		if (!ip) {
			throw new Error("IP not found");
		}
		console.debug(`POST /api/events ${ip}`);

		const to = req.body.to;
		const message = req.body.message;

		// Just acknowledge the message, don't echo it back
		// The frontend will show the message immediately
		console.log(`Message received from ${ip}: ${message}`);

		// Generate AI response
		const aiResponse = await aiService.generateResponse(message);
		
		if (aiResponse.success) {
			// Send AI response after a short delay
			setTimeout(() => {
				if (to === "this") {
					const eventRes = clients[ip];
					if (eventRes) {
						eventRes.write(`data: ${JSON.stringify({ message: aiResponse.message, to, sender: "doctor" })}\n\n`);
					}
				} else {
					for (const clientIp in clients) {
						const eventRes = clients[clientIp];
						if (eventRes) {
							eventRes.write(`data: ${JSON.stringify({ message: aiResponse.message, to, sender: "doctor" })}\n\n`);
						}
					}
				}
			}, 1000);
		} else {
			console.error("AI response failed:", aiResponse.error);
			// Send fallback response
			// setTimeout(() => {
			// 	const fallbackResponse = "I'm sorry, I'm having trouble processing your message right now. Please try again in a moment.";
			// 	if (to === "this") {
			// 		const eventRes = clients[ip];
			// 		if (eventRes) {
			// 			eventRes.write(`data: ${JSON.stringify({ message: fallbackResponse, to, sender: "doctor" })}\n\n`);
			// 		}
			// 	} else {
			// 		for (const clientIp in clients) {
			// 			const eventRes = clients[clientIp];
			// 			if (eventRes) {
			// 				eventRes.write(`data: ${JSON.stringify({ message: fallbackResponse, to, sender: "doctor" })}\n\n`);
			// 			}
			// 		}
			// 	}
			// }, 1000);
		}

		res.json({
			success: true,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, error: "Internal server error" });
	}
});

// Endpoint to clear conversation history
app.post("/api/clear-history", (req, res) => {
	try {
		aiService.clearHistory();
		res.json({ success: true, message: "Conversation history cleared" });
	} catch (error) {
		console.error("Error clearing history:", error);
		res.status(500).json({ success: false, error: "Failed to clear history" });
	}
});

// Endpoint to get conversation history
app.get("/api/history", (req, res) => {
	try {
		const history = aiService.getHistory();
		res.json({ success: true, history });
	} catch (error) {
		console.error("Error getting history:", error);
		res.status(500).json({ success: false, error: "Failed to get history" });
	}
});

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
	console.log("AI Service Status:", process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here" ? "Configured" : "Not configured - please set OPENAI_API_KEY in .env file");
});
