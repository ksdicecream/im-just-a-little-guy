const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;
const worldWidth = 1400;
const gravity = 1500;

const backgroundImage = new Image();
const platformImage = new Image();
const characterSprite=new Image();
const flagImage = new Image();

backgroundImage.src = 'assets/background.png';
platformImage.src = 'assets/platform.png';
characterSprite.src='assets/character.png';
flagImage.src = 'assets/flag.png';

const player = {
    x: 55,
    y: 0,
    w: 18,
    h: 27,
    vx: 0,
    vy: 0,
    speed: 250,
    jump: -570,
    onGround: false
}

const platforms = [
    {x: 0, y: 390, w: 460, h: 120},
    {x: 560, y: 340, w: 310, h: 170},
    {x: 960, y:375, w:430, h:150}
]

const keys = new Set();
let cameraX = 0;
let won = false;

window.addEventListener('keydown', event => {
    keys.add(event.key.toLowerCase());
    const key = event.key.toLowerCase();
    keys.add(key);

    if (key === 'r'){
        restart();
    }
    if ([' ', 'arrowup', 'w'].includes(key) && player.onGround && !won) {
        player.vy = player.jump;
        player.onGround = false;
    }
});

window.addEventListener('keyup', event => {
    keys.delete(event.key.toLowerCase());
});

function restart(){
    player.x = 55;
    player.y = platforms[0].y - player.h;
    player.vx = 0;
    player.vy = 0;
    player.onGround = true;
    cameraX = 0;
    won = false;
}

function update(dt) {
    if (won){
        return;
    }
    const left = keys.has('a') || keys.has('arrowleft');
    const right = keys.has('d') || keys.has('arrowright');

    player.vx = (Number(right) - Number(left)) * player.speed
    const oldBottom = player.y + player.h;
    player.x += player.vx * dt;
    player.x = Math.max(0, Math.min(worldWidth - player.w, player.x));
    player.vy += gravity * dt;
    player.y += player.vy * dt;
    player.onGround = false;

    if (player.vy >= 0) {
        for (const p of platforms) {
            const newBottom = player.y + player.h;
            const overlapsHorizontally =
                player.x + player.w > p.x &&
                player.x < p.x + p.w;

            if (oldBottom <= p.y && newBottom >= p.y && overlapsHorizontally) {
                player.y = p.y - player.h;
                player.vy = 0;
                player.onGround = true;
                break;
            }
        }
    }
    const lastPlatform = platforms[platforms.length - 1];
    if (player.x + player.w >= lastPlatform.x + lastPlatform.w - 55) {
        won = true;
    }

    cameraX = Math.max(0, Math.min(worldWidth - W, player.x - W * 0.35));
}

function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(backgroundImage, 0, 0, W, H);
    ctx.save();
    ctx.translate(-cameraX, 0);
    for(const p of platforms) {
        ctx.drawImage(platformImage, p.x, p.y, p.w, p.h);
    }

    const finishX = platforms[platforms.length - 1].x + platforms[platforms.length - 1].w - 40;
    const finishY = platforms[platforms.length - 1].y;

    ctx.drawImage(flagImage, finishX, finishY - 35, 55, 38);

    ctx.drawImage(characterSprite, player.x, player.y, player.w, player.h);

    ctx.restore();

    if(won) {
        ctx.fillStyle = 'rgba(76, 23, 232, 0.45)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = 'Georgia';
        ctx.fillText('You reached the flag! Press R to play again.', W / 2, H / 2);
    }
}

let previous = 0;

function frame(now) {
    const dt = Math.min((now - previous) / 1000, 0.035);
    previous = now;

    update(dt);
    draw();

    requestAnimationFrame(frame);
}

restart();
requestAnimationFrame(frame);
