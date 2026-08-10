const { io } = require("socket.io-client");

const socket = io("http://localhost:3002", {
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("Connected! socket.id:", socket.id);
  socket.emit("join_room", {
    roomId: "123456",
    name: "TestUser",
    avatarId: "avatar-1",
    deviceId: "device-123"
  });
});

socket.on("connect_error", (err) => {
  console.error("Connection Error:", err.message);
});

socket.on("error", (err) => {
  console.error("Socket Error:", err);
});

socket.on("disconnect", () => {
  console.log("Disconnected!");
});
