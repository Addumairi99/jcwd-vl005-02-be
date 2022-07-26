const express = require("express");
const app = express();
const cors = require("cors");
const bearerToken = require("express-bearer-token");
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

require("dotenv").config();

const port = process.env.PORT || 2000;
const CLIENT_PORT = process.env.CLIENT_PORT;
const routers = require("./src/routes");

app.use(express.json());
app.use(
  cors({
    origin: CLIENT_PORT,
    exposedHeaders: ["UID", "Auth-Token", "Auth-Token-Admin", "Authorization"],
  })
);
app.use(express.static("public"));
app.use(bearerToken());

// Database connection
const connection = require("./src/config");
connection.connect((error) => {
  if (error) {
    console.log("Database connection error: ", error);
  }

  console.log(
    `Database connection is established at ID: ${connection.threadId}`
  );
});

// Route middleware
app.get("/", (req, res) => {
  res.send("<h1>TEST</h1>");
});

app.use("/admin", routers.adminProductRouter);
app.use("/admin", routers.adminTransactionRouter);
app.use("/admin", routers.adminReportRouter);
app.use("/admin", routers.adminManageUsersRouter);
app.use("/admin", routers.adminRouter);
app.use("/admin/categories", routers.adminCategoriesRouter);
app.use("/users", routers.user_router);
app.use("/user/products", routers.userProductRouter);
app.use("/user/cart", routers.userCartRouter);
app.use("/user/checkout", routers.userCheckoutRouter);
app.use("/user/payment", routers.braintreeRouter);
app.use("/user/history", routers.historyRouter);
app.use("/user/address", routers.addressRouter);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: CLIENT_PORT,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_channel", (data) => {
    socket.join(data);
    console.log(`${socket.id} is joining channel ${data}`);
  });

  socket.on("send_notification", (data) => {
    console.log(data);
    socket.to(data.channel).emit("receive_notification", data);
  });
});

server.listen(port, () => {
  console.log("Socket.io server is running");
});

// app.listen(port, () => {
//   console.log("Listening to Port: " + port);
// });
