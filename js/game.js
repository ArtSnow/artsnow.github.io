class PuzzleGame {
  constructor(config) {
    this.config = config;
    this.width = config.room.width;
    this.height = config.room.height;
    this.furniture = new Map();
    for (const item of (config.furniture || [])) this.furniture.set(this.key(item.x,item.y), item);
    this.characters = new Map((config.characters || []).map(p => [p.id,p]));
    this.placements = {};       // characterId -> {x,y}
    this.manualCrosses = new Set();
    this.selectedCharacter = null;
    this.loadProgress();
  }
  key(x,y) { return `${x},${y}`; }
  furnitureAt(x,y) { return this.furniture.get(this.key(x,y)); }
  characterAt(x,y) {
    return Object.entries(this.placements).find(([,p]) => p.x===x && p.y===y)?.[0] || null;
  }
  isChair(x,y) { return this.furnitureAt(x,y)?.canPlaceCharacter === true; }
  isOccupied(x,y) { return !!this.characterAt(x,y); }
  isAutoCross(x,y) {
    return Object.values(this.placements).some(p => p.x===x || p.y===y) && !this.isOccupied(x,y);
  }
  isManualCross(x,y) { return this.manualCrosses.has(this.key(x,y)); }
  canPlace(characterId,x,y) {
    if (!this.isChair(x,y)) return {ok:false, reason:"На этот предмет нельзя поставить персонажа. Нужны кресла."};
    if (this.isOccupied(x,y) && this.characterAt(x,y)!==characterId) return {ok:false, reason:"Это кресло уже занято."};
    const other = Object.entries(this.placements).find(([id,p]) => id!==characterId && (p.x===x || p.y===y));
    if (other) return {ok:false, reason:"В этом ряду или столбце уже закреплён другой персонаж."};
    return {ok:true};
  }
  placeSelected(x,y) {
    if (!this.selectedCharacter) return {ok:false,reason:"Сначала выбери персонажа."};
    const id=this.selectedCharacter, check=this.canPlace(id,x,y);
    if (!check.ok) return check;
    delete this.placements[id];
    this.placements[id]={x,y};
    this.manualCrosses.delete(this.key(x,y));
    this.saveProgress();
    return {ok:true};
  }
  toggleManualCross(x,y) {
    if (this.isOccupied(x,y)) return {ok:false,reason:"В этой клетке уже стоит персонаж."};
    if (this.isAutoCross(x,y)) return {ok:false,reason:"Здесь уже стоит автоматический крестик."};
    const k=this.key(x,y);
    this.manualCrosses.has(k) ? this.manualCrosses.delete(k) : this.manualCrosses.add(k);
    this.saveProgress();
    return {ok:true};
  }
  removeAt(x,y) {
    const id=this.characterAt(x,y);
    if (!id) return false;
    delete this.placements[id]; this.saveProgress(); return true;
  }
  clearManual() { this.manualCrosses.clear(); this.saveProgress(); }
  reset() { this.placements={}; this.manualCrosses.clear(); this.selectedCharacter=null; this.saveProgress(); }
  checkSolution() {
    const solution=this.config.solution || {};
    const ids=Object.keys(solution);
    if (ids.length!==Object.keys(this.placements).length) return {ok:false,message:"Пока расставлены не все персонажи."};
    for (const id of ids) {
      const a=this.placements[id], b=solution[id];
      if (!a || a.x!==b.x || a.y!==b.y) return {ok:false,message:"Пока не всё совпадает. Проверь подсказки и расположение."};
    }
    return {ok:true,message:`Верно! Вор — ${this.characters.get(this.config.thief)?.name || "неизвестен"}!`};
  }
  storageKey() { return `kto-vor:${this.config.id}`; }
  saveProgress() {
    try { localStorage.setItem(this.storageKey(),JSON.stringify({placements:this.placements,manualCrosses:[...this.manualCrosses]})); } catch(e) {}
  }
  loadProgress() {
    try {
      const data=JSON.parse(localStorage.getItem(this.storageKey())||"null");
      if (!data) return;
      this.placements=data.placements||{};
      this.manualCrosses=new Set(data.manualCrosses||[]);
      // Удаляем сохранённые некорректные размещения.
      for (const [id,p] of Object.entries({...this.placements})) {
        if (!this.characters.has(id) || !this.isChair(p.x,p.y)) delete this.placements[id];
      }
    } catch(e) { this.placements={}; this.manualCrosses.clear(); }
  }
}
window.PuzzleGame = PuzzleGame;
