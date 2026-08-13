"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = require("http");
const app_1 = __importDefault(require("./src/app"));
const socket_1 = require("./src/config/socket");
const PORT = process.env.PORT || 5000;
// Express app alone can't host Socket.io — it needs the raw HTTP server,
// so we create that manually and let Express handle regular requests on it.
const httpServer = (0, http_1.createServer)(app_1.default);
(0, socket_1.initSocket)(httpServer);
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.io ready for real-time connections`);
});
