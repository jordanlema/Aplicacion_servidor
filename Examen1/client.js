const { io } = require("socket.io-client");

const socket = io("ws://localhost:3000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Conectado al servidor Socket.IO");
});

socket.on("notification", (msg) => {
  console.log("Notificación recibida:", msg);
});
