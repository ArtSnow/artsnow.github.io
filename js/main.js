(async function() {
  const $ = id => document.getElementById(id);
  const boardEl=$("board"), peopleEl=$("peopleList"), cluesEl=$("globalClues");
  let game=null, pressTimer=null, longPressed=false, pointerStart=null;
  const furnitureEmoji={chair:"🪑",table:"🪵",wardrobe:"🚪",flowerpot:"🪴",tv:"📺",sofa:"🛋️",bookshelf:"📚"};
  const fallbackEmoji=["🕵️","👩","🧔","👨‍🦰","👵","👨‍🦳"];

  function say(message,type="") {
    const el=$("feedback"); el.textContent=message; el.className="feedback "+type;
  }
  function assetPath(path) { return path ? path : ""; }
  function render() {
    const c=game.config;
    $("puzzleNumber").textContent="ЗАГАДКА "+String(c.number||"001").padStart(3,"0");
    $("roomName").textContent=c.room.name;
    $("puzzleSelect").value=c.id;
    boardEl.style.gridTemplateColumns=`repeat(${game.width},minmax(0,1fr))`;
    boardEl.innerHTML="";
    for(let y=0;y<game.height;y++) for(let x=0;x<game.width;x++) {
      const cell=document.createElement("button"); cell.type="button"; cell.className="cell"; cell.dataset.x=x; cell.dataset.y=y;
      const furniture=game.furnitureAt(x,y), occupant=game.characterAt(x,y);
      if(furniture) {
        cell.classList.add("furniture");
        if(furniture.image) {
          const img=document.createElement("img"); img.className="furniture-img"; img.src=assetPath(furniture.image); img.alt=furniture.label||furniture.id;
          img.onerror=()=>{img.replaceWith(makeFurnitureFallback(furniture));}; cell.append(img);
        } else cell.append(makeFurnitureFallback(furniture));
        if(furniture.label) { const label=document.createElement("span"); label.className="cell-label"; label.textContent=furniture.label; cell.append(label); }
      }
      if(occupant) {
        const person=game.characters.get(occupant);
        if(person.image) {
          const img=document.createElement("img"); img.className="occupant"; img.src=person.image; img.alt=person.name;
          img.onerror=()=>{img.replaceWith(makePersonFallback(occupant));}; cell.append(img);
        } else cell.append(makePersonFallback(occupant));
        const mark=document.createElement("span"); mark.className="locked-mark"; mark.textContent="✓"; cell.append(mark);
      } else if(game.isManualCross(x,y)||game.isAutoCross(x,y)) {
        const cross=document.createElement("span"); cross.className="cross "+(game.isManualCross(x,y)?"manual-cross":"auto-cross"); cross.textContent="×"; cell.append(cross);
      }
      if(game.selectedCharacter && game.isChair(x,y) && !occupant) cell.classList.add("selected-target");
      cell.addEventListener("pointerdown",e=>startPress(e,x,y));
      cell.addEventListener("pointerup",e=>endPress(e,x,y));
      cell.addEventListener("pointerleave",cancelPress);
      cell.addEventListener("pointercancel",cancelPress);
      cell.addEventListener("contextmenu",e=>e.preventDefault());
      boardEl.append(cell);
    }
    cluesEl.innerHTML="";
    (c.globalClues||[]).forEach(clue=>{const li=document.createElement("li");li.textContent=clue;cluesEl.append(li);});
    renderPeople();
  }
  function makeFurnitureFallback(f) { const span=document.createElement("span"); span.className="occupant-fallback"; span.textContent=furnitureEmoji[f.id]||"⬜"; return span; }
  function makePersonFallback(id) { const span=document.createElement("span"); span.className="occupant-fallback"; const idx=[...game.characters.keys()].indexOf(id); span.textContent=fallbackEmoji[idx%fallbackEmoji.length]; return span; }
  function renderPeople() {
    peopleEl.innerHTML="";
    for(const p of game.config.characters) {
      const card=document.createElement("button"); card.type="button"; card.className="person-card"+(game.selectedCharacter===p.id?" active":"");
      const avatar=document.createElement("span"); avatar.className="avatar";
      if(p.image) { const img=document.createElement("img"); img.src=p.image; img.alt=p.name; img.onerror=()=>{avatar.textContent="🧑";}; avatar.append(img); }
      else avatar.textContent=fallbackEmoji[[...game.characters.keys()].indexOf(p.id)%fallbackEmoji.length];
      const info=document.createElement("span"); const name=document.createElement("span"); name.className="person-name"; name.textContent=p.name;
      const status=document.createElement("span"); status.className="person-status";
      const pos=game.placements[p.id]; status.textContent=pos?`Закреплён: ${pos.x+1}, ${pos.y+1}`:(game.selectedCharacter===p.id?"Выбран":"Нажми, чтобы выбрать");
      info.append(name,status); card.append(avatar,info); card.addEventListener("click",()=>{game.selectedCharacter=p.id; $("selectionHint").textContent="Выбран: "+p.name; render();});
      peopleEl.append(card);
    }
    const selected=game.selectedCharacter && game.characters.get(game.selectedCharacter);
    const panel=$("selectedClues");
    if(selected) {
      panel.hidden=false; panel.innerHTML="";
      const strong=document.createElement("strong"); strong.textContent="Подсказки: "+selected.name; panel.append(strong);
      const ul=document.createElement("ul"); (selected.clues||[]).forEach(t=>{const li=document.createElement("li");li.textContent=t;ul.append(li);}); panel.append(ul);
    } else { panel.hidden=true; $("selectionHint").textContent="Выбери персонажа"; }
  }
  function startPress(e,x,y) {
    if(e.button!==undefined && e.button!==0) return;
    longPressed=false; pointerStart={x,y};
    pressTimer=setTimeout(()=>{
      longPressed=true;
      const result=game.placeSelected(x,y);
      if(result.ok) say("Персонаж закреплён. Остальные кресла в его ряду и столбце исключены.","success");
      else if(game.characterAt(x,y)) { game.removeAt(x,y); say("Персонаж убран с клетки."); }
      else say(result.reason,"error");
      render();
    },480);
  }
  function endPress(e,x,y) {
    if(pressTimer) clearTimeout(pressTimer); pressTimer=null;
    if(longPressed) { e.preventDefault(); return; }
    const occupant=game.characterAt(x,y);
    if(occupant) {
      game.removeAt(x,y); say("Персонаж убран. Можно выбрать его снова."); render(); return;
    }
    if(game.selectedCharacter) {
      if(game.isChair(x,y)) {
        const result=game.placeSelected(x,y);
        if(result.ok) say("Персонаж поставлен. Удержи клетку, чтобы закрепить.","");
        else say(result.reason,"error");
        render();
      } else if(game.isManualCross(x,y)) {
        game.toggleManualCross(x,y); say("Крестик убран."); render();
      } else if(game.isAutoCross(x,y)) say("Это место исключено правилами поля.","error");
      else say("Персонажа можно поставить только на кресло.","error");
    } else {
      const result=game.toggleManualCross(x,y);
      if(result.ok) say("Заметка-крестик добавлена."); else say(result.reason,"error");
      render();
    }
  }
  function cancelPress() { if(pressTimer) clearTimeout(pressTimer); pressTimer=null; }
  async function loadPuzzle(path) {
    try {
      const config=await window.loadPuzzleConfig(path);
      game=new PuzzleGame(config);
      $("puzzleNumber").textContent="ЗАГАДКА "+String(config.number||"001").padStart(3,"0");
      $("roomName").textContent=config.room.name;
      $("selectionHint").textContent="Выбери персонажа";
      say("Выбери персонажа, затем удерживай кресло для закрепления.");
      render();
    } catch(err) { say(err.message,"error"); }
  }
  $("puzzleSelect").innerHTML="";
  for(const path of window.PUZZLE_FILES) {
    const option=document.createElement("option"); option.value=path; option.textContent=path.split("/").pop().replace(".json",""); $("puzzleSelect").append(option);
  }
  $("puzzleSelect").addEventListener("change",e=>loadPuzzle(e.target.value));
  $("resetBtn").addEventListener("click",()=>{if(confirm("Сбросить все отметки этой загадки?")){game.reset();say("Поле сброшено.");render();}});
  $("clearMarksBtn").addEventListener("click",()=>{game.clearManual();say("Твои ручные крестики очищены.");render();});
  $("checkBtn").addEventListener("click",()=>{const result=game.checkSolution();say(result.message,result.ok?"success":"error");});
  await loadPuzzle(window.PUZZLE_FILES[0]);
})();
