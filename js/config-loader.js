// Каталог загадок. Для добавления новой загадки добавьте её путь в этот список.
window.PUZZLE_FILES = [
  "puzzles/puzzle_001.json"
];

window.loadPuzzleConfig = async function(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Не удалось загрузить загадку: " + path);
  return await response.json();
};
