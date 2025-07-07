console.log("script.js loaded");

function setErrorMessage(message) {
	const errorMsg = document.getElementById("errormsg");
	errorMsg.textContent = message;
}

function sendMessage() {
	try {
		const messageInput = document.getElementById("message");
		const message = messageInput.value;
		messageInput.value = "";
		const to = document.getElementById("to").value;
		fetch("/api/events", {
			method: "POST",
			body: JSON.stringify({ message, to }),
			headers: {
				"Content-Type": "application/json",
			},
		});
		console.log({ sending: message });
	} catch (error) {
		setErrorMessage(error.message);
	}
}

function listenForEvents() {
	const eventSource = new EventSource("/api/events");
	console.log({ eventSource });

	eventSource.onmessage = (event) => {
		try {
			console.log({ data: event.data });
			const json = JSON.parse(event.data);
			console.log({ json });
			const messagesDiv = document.getElementById("messages");
			const newMessage = document.createElement("div");
			const message = `[${new Date().toLocaleTimeString()}] ${json.message}`;
			console.log({ message });

			newMessage.textContent = message;
			messagesDiv.appendChild(newMessage);
		} catch (error) {
			setErrorMessage(error.message);
		}
	};

	eventSource.onerror = (event) => {
		console.debug("Event source error", event);
		setErrorMessage("Error connecting to server");
	};

	document.addEventListener("close", () => {
		eventSource.close();
	});
}

listenForEvents();
