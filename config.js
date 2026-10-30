// Конфигурация уровня. Все данные ниже - заглушки для проверки механик, замените своими.
window.GAME_CONFIG = {
  id: "level1",                 // ключ для сохранения прогресса в браузере
  title: "Кража в доме (9x9)",
  size: 9,
  thief: "e",                   // id вора - показывается при победе

  // Карта комнат: 9 строк по 9 символов, буква = id комнаты из rooms
  map: [
    "LLLLLBBBB",
    "LLLLLBBBB",
    "LLLLLBBBB",
    "LLLLLBBBB",
    "HHHHHHHHH",
    "KKKKYYYYY",
    "KKKKYYYYY",
    "KKKKYYYYY",
    "KKKKYYYYY"
  ],
  // floor - png пола (тайлится в каждой клетке), color - запасной цвет, если png нет
  rooms: {
    L: { name: "Гостиная", color: "#e8d3b0", floor: "images/floor_living.png" },
    B: { name: "Спальня",  color: "#fbe9a8", floor: "images/floor_bedroom.png" },
    H: { name: "Коридор",  color: "#d9c3a0", floor: "images/floor_hall.png" },
    K: { name: "Кухня",    color: "#f6c98b", floor: "images/floor_kitchen.png" },
    Y: { name: "Двор",     color: "#a8f0d8", floor: "images/floor_yard.png" }
  },

  // Типы предметов. walkable:true - на клетке можно стоять (кресло). Новые типы добавляйте сами.
  objectTypes: {
    chair:    { label: "кресло",  color: "#f3e6c4", walkable: true,  img: "images/chair.png" },
    table:    { label: "стол",    color: "#e0c96b", walkable: false, img: "images/table.png" },
    wardrobe: { label: "шкаф",    color: "#c9a56b", walkable: false, img: "images/wardrobe.png" },
    plant:    { label: "цветок",  color: "#6fb86f", walkable: false, img: "images/plant.png" },
    tv:       { label: "ТВ",      color: "#8d9aa8", walkable: false, img: "images/tv.png" },
    bed:      { label: "кровать", color: "#f0d9a0", walkable: false, img: "images/bed.png" }
  },
  // x, y - левый верхний угол (с нуля), w, h - размер в клетках
  objects: [
    { type: "tv",       x: 0, y: 0, w: 2, h: 1 },
    { type: "table",    x: 2, y: 1, w: 2, h: 2 },
    { type: "chair",    x: 4, y: 1 },
    { type: "chair",    x: 1, y: 2 },
    { type: "chair",    x: 0, y: 3 },
    { type: "bed",      x: 6, y: 0, w: 2, h: 2 },
    { type: "wardrobe", x: 8, y: 0, w: 1, h: 2 },
    { type: "plant",    x: 5, y: 3 },
    { type: "plant",    x: 8, y: 4 },
    { type: "table",    x: 1, y: 6, w: 2, h: 1 },
    { type: "chair",    x: 3, y: 6 },
    { type: "wardrobe", x: 0, y: 8 },
    { type: "plant",    x: 5, y: 5 },
    { type: "chair",    x: 6, y: 7 },
    { type: "plant",    x: 8, y: 8 }
  ],

  // Персонажи: ровно столько, сколько строк в сетке. img - портрет, color - запас
  people: [
    { id: "a", name: "Александр",  img: "images/people/a.png", color: "#a5493d" },
    { id: "b", name: "Белла",      img: "images/people/b.png", color: "#2f8a4a" },
    { id: "c", name: "Карина",     img: "images/people/c.png", color: "#4aa5ad" },
    { id: "d", name: "Даниил",     img: "images/people/d.png", color: "#6f7fc4" },
    { id: "e", name: "Евангелина", img: "images/people/e.png", color: "#6b4682" },
    { id: "f", name: "Фёдор",      img: "images/people/f.png", color: "#d79a9a" },
    { id: "g", name: "Галина",     img: "images/people/g.png", color: "#c9a14a" },
    { id: "h", name: "Игорь",      img: "images/people/h.png", color: "#5a6f8a" },
    { id: "i", name: "Ирина",      img: "images/people/i.png", color: "#8a5a6f" }
  ],

  // Ответы: id -> [x, y]
  solution: {
    a: [2, 0], b: [4, 1], c: [1, 2], d: [0, 3], e: [6, 4],
    f: [7, 5], g: [3, 6], h: [8, 7], i: [5, 8]
  },

  // Подсказки персонажей: id -> список строк. **текст** выделяется жирным
  clues: {
    a: ["Пример подсказки: рядом с **цветком**."],
    b: ["Пример подсказки: сидела в **кресле**."],
    c: ["Пример подсказки: была в **Гостиной**."],
    d: ["Пример подсказки."],
    e: ["Пример подсказки."],
    f: ["Пример подсказки."],
    g: ["Пример подсказки."],
    h: ["Пример подсказки."],
    i: ["Пример подсказки."]
  },

  // Общие подсказки ко всему полю
  generalClues: [
    "Пример общей подсказки: в каждой строке и в каждом столбце ровно один человек.",
    "Пример общей подсказки: вор был в комнате один."
  ]
};
