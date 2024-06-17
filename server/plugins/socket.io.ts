import { Server as Engine } from "engine.io";
import { detectWinner } from "~/server/utils/detectWinner";
import { io } from "~/server/utils/socket.io";

export default defineNitroPlugin((nitroApp) => {
  const engine = new Engine();

  io.bind(engine);

  let players: string[] = ["", ""];
  let turn = 1;
  let board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];

  io.on("connection", async (socket) => {
    const totalConnections = (await io.fetchSockets()).length;

    if (totalConnections > 2) {
      socket.disconnect(true);
      console.log("refused connection, already at max (2)");
      return;
    }

    players[players.indexOf("")] = socket.id;
    console.log("a user connected", socket.id);
    console.log("players", players);

    socket.emit("playerNumber", players.indexOf(socket.id) + 1);
    socket.emit("turn", turn);
    socket.emit("board", board);

    socket.on("play", (data) => {
      if (turn === 0) {
        return;
      }

      const playerNumber = players.indexOf(socket.id) + 1;
      const row = data.row;
      const col = data.cell;

      if (playerNumber !== turn || board[row][col] !== "") {
        return;
      }

      board[row][col] = playerNumber === 1 ? "X" : "O";
      turn = turn === 1 ? 2 : 1;

      io.emit("board", board);
      io.emit("turn", turn);

      const winner = detectWinner(board);

      if (winner) {
        io.emit("message", `Player ${winner} won!`);
        turn = 0;
        io.emit("turn", turn);
      }
    });

    socket.on("restart", () => {
      board = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ];
      turn = 1;
      io.emit("board", board);
      io.emit("turn", turn);
      io.emit("message", "");
    });

    socket.on("disconnect", async () => {
      players[players.indexOf(socket.id)] = "";
      console.log("a user disconnected", socket.id);
      console.log("players", players);
    });
  });

  nitroApp.router.use(
    "/socket.io/",
    defineEventHandler({
      handler(event) {
        engine.handleRequest(event.node.req, event.node.res);
        event._handled = true;
      },
      websocket: {
        open(peer) {
          const nodeContext = peer.ctx.node;
          const req = nodeContext.req;

          // @ts-expect-error private method
          engine.prepare(req);

          const rawSocket = nodeContext.req.socket;
          const websocket = nodeContext.ws;

          // @ts-expect-error private method
          engine.onWebSocket(req, rawSocket, websocket);
        },
      },
    })
  );
});
