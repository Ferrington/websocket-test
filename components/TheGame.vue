<script setup lang="ts">
defineProps<{
  playerName: string;
  turnMessage: string;
  message: string;
  board: string[][];
}>();

defineEmits<{
  play: [row: number, cell: number];
  restart: [];
}>();
</script>

<template>
  <div class="game-wrapper">
    <h1>{{ playerName }}</h1>
    {{ turnMessage }}
    {{ message }}
    <button @click="$emit('restart')">Restart Game</button>
    <div class="board">
      <div class="row" v-for="row in 3" :key="row">
        <div class="cell" v-for="cell in 3" :key="cell">
          <button class="button" @click="$emit('play', row - 1, cell - 1)">
            {{ board[row - 1]?.[cell - 1] }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-wrapper {
  padding: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.row {
  display: flex;
}

.cell {
  width: 100px;
  height: 100px;
}

.button {
  width: 100%;
  height: 100%;
}
</style>
