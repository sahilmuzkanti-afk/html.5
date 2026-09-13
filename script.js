const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const statusText = document.getElementById("status");
const overlay = document.getElementById("overlay");
const mainImage = new Image();
const keyclick = {};
let score = 0;
let gscore = 0;
let countblink = 10;
let ghost = false;
let ghost2 = false;
let paused = false;
const player = { x: 50, y: 100, pacmouth: 320, pacdir: 0, psize: 32, speed: 5 };
const enemy = { x: 150, y: 200, speed: 5, moving: 0, dirx: 0, diry: 0, flash: 0, ghosteat: false };
const enemy2 = { x: 150, y: 200, speed: 5, moving: 0, dirx: 0, diry: 0, flash: 0, ghosteat: false };
const powerdot = { x: 10, y: 10, powerup: false, pcountdown: 0, ghostNum: 0, ghostNum2: 0, ghosteat: false };
const mouseEvents = ["click", "dblclick", "mousedown", "mouseup", "contextmenu", "wheel", "dragstart", "drop"];
mouseEvents.forEach(type => document.addEventListener(type, event => event.preventDefault(), { capture: true, passive: false }));
document.addEventListener("keydown", event => {
  if (event.key === "Tab") { event.preventDefault(); return; }
  if (event.key.toLowerCase() === "p" && !event.repeat) {
    event.preventDefault();
    paused = !paused;
    updatePauseUI();
    return;
  }
  if (!paused && [37, 38, 39, 40].includes(event.keyCode)) {
    event.preventDefault();
    keyclick[event.keyCode] = true;
    move();
  }
}, false);
document.addEventListener("keyup", event => delete keyclick[event.keyCode], false);
function updatePauseUI() {
  if (statusText) statusText.textContent = paused ? "PAUSED" : "RUNNING";
  if (overlay) overlay.hidden = !paused;
}
function move() {
  if (37 in keyclick) { player.x -= player.speed; player.pacdir = 64; }
  if (38 in keyclick) { player.y -= player.speed; player.pacdir = 96; }
  if (39 in keyclick) { player.x += player.speed; player.pacdir = 0; }
  if (40 in keyclick) { player.y += player.speed; player.pacdir = 32; }
  wrap(player);
  player.pacmouth = player.pacmouth === 320 ? 352 : 320;
}
function myNum(n) { return Math.floor(Math.random() * n); }
function wrap(unit) {
  if (unit.x >= canvas.width - 32) unit.x = 0;
  if (unit.y >= canvas.height - 32) unit.y = 0;
  if (unit.x < 0) unit.x = canvas.width - 32;
  if (unit.y < 0) unit.y = canvas.height - 32;
}
function spawn(unit, second) {
  unit.ghostNum = myNum(5) * 64;
  unit.x = myNum(450);
  unit.y = myNum(250) + 30;
  if (second) ghost2 = true; else ghost = true;
}
function chase(unit) {
  if (unit.moving < 0) {
    unit.moving = myNum(20) * 3 + myNum(1);
    unit.speed = myNum(2) + 1;
    unit.dirx = 0; unit.diry = 0;
    if (powerdot.ghosteat) unit.speed *= -1;
    if (unit.moving % 2) unit.dirx = player.x < unit.x ? -unit.speed : unit.speed;
    else unit.diry = player.y < unit.y ? -unit.speed : unit.speed;
  }
  unit.moving--;
  unit.x += unit.dirx; unit.y += unit.diry;
  wrap(unit);
}
function touching(a, b) { return a.x <= b.x + 26 && b.x <= a.x + 26 && a.y <= b.y + 26 && b.y <= a.y + 32; }
function hitGhost(unit) {
  if (!touching(player, unit)) return;
  if (powerdot.ghosteat) score++; else gscore++;
  player.x = 10; player.y = 100; unit.x = 300; unit.y = 200; powerdot.pcountdown = 0;
}
function render() {
  context.fillStyle = "black"; context.fillRect(0, 0, canvas.width, canvas.height);
  if (!powerdot.powerup && powerdot.pcountdown < 5) { powerdot.x = myNum(420) + 30; powerdot.y = myNum(250) + 30; powerdot.powerup = true; }
  if (!ghost) spawn(enemy, false);
  if (!ghost2) spawn(enemy2, true);
  chase(enemy); chase(enemy2); hitGhost(enemy); hitGhost(enemy2);
  if (touching(player, powerdot) && powerdot.powerup) {
    powerdot.powerup = false; powerdot.pcountdown = 500; powerdot.ghostNum = enemy.ghostNum; powerdot.ghostNum2 = enemy2.ghostNum;
    enemy.ghostNum = 384; enemy2.ghostNum = 384; powerdot.x = 0; powerdot.y = 0; powerdot.ghosteat = true; player.speed = 10;
  }
  if (powerdot.ghosteat && --powerdot.pcountdown <= 0) { powerdot.ghosteat = false; enemy.ghostNum = powerdot.ghostNum; enemy2.ghostNum = powerdot.ghostNum2; player.speed = 5; }
  if (powerdot.powerup) { context.fillStyle = "#fff"; context.beginPath(); context.arc(powerdot.x, powerdot.y, 10, 0, Math.PI * 2); context.fill(); }
  if (countblink-- <= 0) { countblink = 20; enemy.flash = enemy.flash ? 0 : 32; enemy2.flash = enemy.flash; }
  context.font = "20px Verdana"; context.fillStyle = "white"; context.fillText(`Pacman: ${score} vs Ghost: ${gscore}`, 2, 18);
  context.drawImage(mainImage, enemy2.ghostNum, enemy2.flash, 32, 32, enemy2.x, enemy2.y, 32, 32);
  context.drawImage(mainImage, enemy.ghostNum, enemy.flash, 32, 32, enemy.x, enemy.y, 32, 32);
  context.drawImage(mainImage, player.pacmouth, player.pacdir, 32, 32, player.x, player.y, 32, 32);
}
function playgame() {
  if (!paused) render();
  requestAnimationFrame(playgame);
}
mainImage.onload = playgame;
mainImage.src = "pac.png";
updatePauseUI();
globalThis.__pacman = { player, enemy, enemy2, powerdot, render, isPaused: () => paused };
