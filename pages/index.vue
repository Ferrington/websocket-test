<script setup lang="ts">
const isConnected = ref(false);
const transport = ref("N/A");

if (socket.connected) {
  onConnect();
}

function onConnect() {
  isConnected.value = true;
  transport.value = socket.io.engine.transport.name;

  socket.io.engine.on("upgrade", (rawTransport) => {
    transport.value = rawTransport.name;
  });
}

function onDisconnect() {
  isConnected.value = false;
  transport.value = "N/A";
}

socket.on("connect", onConnect);
socket.on("disconnect", onDisconnect);

onBeforeUnmount(() => {
  socket.off("connect", onConnect);
  socket.off("disconnect", onDisconnect);
});

socket.on("playerNumber", (number: number) => {
  playerName.value = number === 1 ? "X's" : "O's";
  playerNumber.value = number;
});

socket.on("turn", (turn: number) => {
  whoseTurn.value = turn;
});

socket.on("message", (msg: string) => {
  message.value = msg;
});

socket.on("board", (_board: string[][]) => {
  board.value = _board;
});

const playerNumber = ref(0);
const playerName = ref("");
const whoseTurn = ref(0);
const message = ref("");
const board = ref([
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
]);

const turnMessage = computed(() => {
  return whoseTurn.value === 0
    ? "Game Over"
    : whoseTurn.value === playerNumber.value
    ? "It's your turn"
    : "It's your opponent's turn";
});

function play(row: number, cell: number) {
  socket.emit("play", { row, cell });
}

function restart() {
  socket.emit("restart");
}
</script>

<template>
  <div>
    <p>Status: {{ isConnected ? "connected" : "disconnected" }}</p>
    <p>Transport: {{ transport }}</p>
  </div>
  <TheGame
    :playerName="playerName"
    :turnMessage="turnMessage"
    :board="board"
    :message="message"
    @play="play"
    @restart="restart"
  />
</template>
