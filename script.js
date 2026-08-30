const map = document.getElementById('map');
const world = document.getElementById('world');
const player = document.getElementById('player');
const dialogBox = document.getElementById('dialog-box');
const dialogText = document.getElementById('dialog-text');

const dragState = {
  active: false,
  startX: 0,
  startY: 0,
  originX: 0,
  originY: 0
};

let worldScale = 1;

function getVoiceProfile(characterName) {
  const profiles = {
    'ちいかわ': { rate: 1.15, pitch: 1.35, volume: 1 },
    'うさぎ': { rate: 0.95, pitch: 1.0, volume: 1 },
    'はちわれ': { rate: 1.0, pitch: 0.9, volume: 1 },
    'なとり': { rate: 0.9, pitch: 0.8, volume: 1 },
    'タマ': { rate: 1.05, pitch: 1.5, volume: 1 }
  };

  return profiles[characterName] || { rate: 1.0, pitch: 1.0, volume: 1 };
}

function showCharacterDialogue(characterName, message) {
  const text = `${characterName}: ${message}`;
  dialogText.textContent = text;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    const profile = getVoiceProfile(characterName);

    utterance.lang = 'ja-JP';
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = profile.volume;
    window.speechSynthesis.speak(utterance);
  }
}

const worldWidth = 1000;
const worldHeight = 620;

function isMobileLayout() {
  return window.innerWidth <= 640;
}

const playerState = {
  x: 120,
  y: 120,
  size: 50
};

const characters = [
  {
    id: 'chiikawa',
    name: 'ちいかわ',
    className: 'chiikawa',
    x: 240,
    y: 180,
    lines: [
      'わァ……',
      'ヤーッ！',
      'フッ……',
      '泣いちゃった……',
      'なんとかなれーッ!!',
      'えへへ……こっちだね。',
      'うわっ……びっくりした！',
      'よし、いけるかも……！'
    ]
  },
  {
    id: 'usagi',
    name: 'うさぎ',
    className: 'usagi',
    x: 520,
    y: 250,
    lines: [
      'ヤハ！ ここ、すごく落ち着くね。',
      'ウラッ……おひるね、しちゃってもいいかも。',
      'ハァ？ こっちの草むら、ちょっとだけ気になる。',
      'ふわぁ……あの風、やさしいよね。',
      'ハッ、今日はなんだかおだやかだな。',
      'うわっ、びっくりした！でも、まあいいか。'
    ]
  },
  {
    id: 'hachiware',
    name: 'はちわれ',
    className: 'hachiware',
    x: 780,
    y: 190,
    lines: [
      '今日はちょっとだけ張り切ってるよ。',
      'このあたり、空気がいいね。ってことは、きっと大丈夫。',
      'お腹がすいたけど、焦んなくて大丈夫だよー。',
      'あの木の下、ちょっとだけ安心するね。',
      'ひと息つくには、こういう場所がぴったりだよ。',
      'ちゃんと見てると、いいことありそうだね。'
    ]
  },
  {
    id: 'kurimanju',
    name: 'くりまんじゅう',
    className: 'kurimanju',
    x: 310,
    y: 410,
    lines: [
      'ハーッ……',
      'うっ……ハーッ…',
      'しょっぱみがあって……うまッ',
      'ハーッ……このおつまみ、いいね。',
      '……ちょっと、いい気分だ。',
      'ごちそうさま……ハーッ…'
    ]
  },
  {
    id: 'momonga',
    name: 'モモンガ',
    className: 'momonga',
    x: 660,
    y: 420,
    lines: [
      'イーヤーヤダヤダ',
      'どうウマイ？ ちゃんと見てるでしょ？',
      'しょっぱみがあって……うまッ',
      'ちょっと、こっちを見てよ。',
      'えー、もっとかわいく言ってよ。',
      '古本屋、ちょっと来て。'
    ]
  }
];

function createTown() {
  const houses = [
    { x: 120, y: 420, width: 92, height: 70 },
    { x: 760, y: 420, width: 92, height: 70 },
    { x: 630, y: 500, width: 92, height: 70 },
    { x: 450, y: 480, width: 92, height: 70 },
    { x: 220, y: 500, width: 92, height: 70 }
  ];

  const offsets = [
    { dx: 0, dy: 0 },
    { dx: -worldWidth, dy: 0 },
    { dx: worldWidth, dy: 0 },
    { dx: 0, dy: -worldHeight },
    { dx: 0, dy: worldHeight },
    { dx: -worldWidth, dy: -worldHeight },
    { dx: -worldWidth, dy: worldHeight },
    { dx: worldWidth, dy: -worldHeight },
    { dx: worldWidth, dy: worldHeight }
  ];
  const sceneOffsets = window.innerWidth <= 640 ? [{ dx: 0, dy: 0 }] : offsets;

  houses.forEach((house) => {
    sceneOffsets.forEach((offset) => {
      const elem = document.createElement('div');
      elem.className = 'house';
      elem.style.left = `${house.x + offset.dx}px`;
      elem.style.top = `${house.y + offset.dy}px`;
      elem.style.width = `${house.width}px`;
      elem.style.height = `${house.height}px`;
      world.appendChild(elem);
    });
  });

  const trees = [
    { x: 80, y: 300 }, { x: 170, y: 330 }, { x: 390, y: 300 },
    { x: 540, y: 320 }, { x: 710, y: 330 }, { x: 860, y: 300 },
    { x: 890, y: 390 }, { x: 290, y: 520 }, { x: 600, y: 560 }
  ];

  trees.forEach((tree) => {
    sceneOffsets.forEach((offset) => {
      const elem = document.createElement('div');
      elem.className = 'tree';
      elem.style.left = `${tree.x + offset.dx}px`;
      elem.style.top = `${tree.y + offset.dy}px`;
      world.appendChild(elem);
    });
  });

  characters.forEach((character) => {
    character.baseX = character.x;
    character.baseY = character.y;
    character.motion = {
      vx: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.5),
      vy: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.5),
      rangeX: 18 + Math.random() * 28,
      rangeY: 18 + Math.random() * 28,
      pauseTimer: 0
    };
    character.instances = [];

    // ワールドがラップするので、キャラクターも複数位置に描画
    const characterOffsets = window.innerWidth <= 640 ? [{ dx: 0, dy: 0 }] : [
      { dx: 0, dy: 0 },
      { dx: -worldWidth, dy: 0 },
      { dx: worldWidth, dy: 0 },
      { dx: 0, dy: -worldHeight },
      { dx: 0, dy: worldHeight },
      { dx: -worldWidth, dy: -worldHeight },
      { dx: -worldWidth, dy: worldHeight },
      { dx: worldWidth, dy: -worldHeight },
      { dx: worldWidth, dy: worldHeight }
    ];

    characterOffsets.forEach((offset) => {
      const elem = document.createElement('button');
      elem.type = 'button';
      elem.className = `character ${character.className}`;
      elem.style.left = `${character.x + offset.dx}px`;
      elem.style.top = `${character.y + offset.dy}px`;
      elem.setAttribute('aria-label', character.name);

      const svg = createCharacterSVG(character.className);
      elem.appendChild(svg);

      const nameLabel = document.createElement('div');
      nameLabel.className = 'character-name';
      nameLabel.textContent = character.name;
      elem.appendChild(nameLabel);

      elem.addEventListener('click', () => {
        const message = character.lines[Math.floor(Math.random() * character.lines.length)];
        showCharacterDialogue(character.name, message);
      });

      character.instances.push({ element: elem, offset });
      world.appendChild(elem);
    });
  });
}

function animateCharacters() {
  characters.forEach((character) => {
    if (!character.motion || !character.instances) return;

    const { motion } = character;

    if (motion.pauseTimer > 0) {
      motion.pauseTimer -= 1;
      return;
    }

    if (Math.random() < 0.006) {
      motion.pauseTimer = 20 + Math.random() * 60;
      return;
    }

    character.x += motion.vx;
    character.y += motion.vy;

    if (character.x > character.baseX + motion.rangeX || character.x < character.baseX - motion.rangeX) {
      motion.vx *= -1;
      character.x = clamp(character.x, character.baseX - motion.rangeX, character.baseX + motion.rangeX);
    }

    if (character.y > character.baseY + motion.rangeY || character.y < character.baseY - motion.rangeY) {
      motion.vy *= -1;
      character.y = clamp(character.y, character.baseY - motion.rangeY, character.baseY + motion.rangeY);
    }

    if (Math.random() < 0.02) {
      motion.vx *= Math.random() > 0.5 ? 1 : -1;
      motion.vy *= Math.random() > 0.5 ? 1 : -1;
    }

    character.instances.forEach(({ element, offset }) => {
      element.style.left = `${character.x + offset.dx}px`;
      element.style.top = `${character.y + offset.dy}px`;
    });
  });

  requestAnimationFrame(animateCharacters);
}

function getCharacterImagePath(type) {
  const map = {
    chiikawa: 'pic/01chiikawa.avif',
    hachiware: 'pic/02hachiware.avif',
    usagi: 'pic/03usagi.avif',
    momonga: 'pic/04momonga.avif',
    kurimanju: 'pic/05kurimanju.avif'
  };

  return map[type] || 'pic/01chiikawa.avif';
}

function createCharacterSVG(type) {
  const img = document.createElement('img');
  img.src = getCharacterImagePath(type);
  img.alt = type;
  const isMobile = window.innerWidth <= 640;
  const size = isMobile ? 92 : 64;
  img.width = size;
  img.height = size;
  img.className = 'character-image';
  img.draggable = false;
  return img;
}

function updatePlayerPosition() {
  player.style.left = `${playerState.x}px`;
  player.style.top = `${playerState.y}px`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wrap(value, max) {
  return ((value % max) + max) % max;
}

function clampToWorldBounds(x, y) {
  const maxX = worldWidth - playerState.size;
  const maxY = worldHeight - playerState.size;

  return {
    x: clamp(x, 0, maxX),
    y: clamp(y, 0, maxY)
  };
}

function checkCollisionWithCharacters(newX, newY) {
  // プレイヤーの中心座標
  const playerCenterX = newX + playerState.size / 2;
  const playerCenterY = newY + playerState.size / 2;

  // ワールドのオフセットリスト
  const offsets = [
    { dx: 0, dy: 0 },
    { dx: -worldWidth, dy: 0 },
    { dx: worldWidth, dy: 0 },
    { dx: 0, dy: -worldHeight },
    { dx: 0, dy: worldHeight },
    { dx: -worldWidth, dy: -worldHeight },
    { dx: -worldWidth, dy: worldHeight },
    { dx: worldWidth, dy: -worldHeight },
    { dx: worldWidth, dy: worldHeight }
  ];

  for (const character of characters) {
    // キャラクター（64x64）の中心は32,32
    const charSize = 64;

    // すべてのオフセット位置でチェック
    for (const offset of offsets) {
      const charCenterX = character.x + offset.dx + charSize / 2;
      const charCenterY = character.y + offset.dy + charSize / 2;

      // 距離を計算
      const dx = playerCenterX - charCenterX;
      const dy = playerCenterY - charCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 衝突判定（距離が50以下）
      if (distance < 50) {
        // キャラが話す
        const message = character.lines[Math.floor(Math.random() * character.lines.length)];
        showCharacterDialogue(character.name, message);
        
        // プレイヤーが衝突したキャラを返す
        return character;
      }
    }
  }

  return null;
}

function movePlayer(dx, dy) {
  const candidateX = playerState.x + dx;
  const candidateY = playerState.y + dy;

  const nextPosition = isMobileLayout()
    ? clampToWorldBounds(candidateX, candidateY)
    : {
        x: wrap(candidateX, worldWidth),
        y: wrap(candidateY, worldHeight)
      };

  const collidedCharacter = checkCollisionWithCharacters(nextPosition.x, nextPosition.y);

  if (!collidedCharacter) {
    playerState.x = nextPosition.x;
    playerState.y = nextPosition.y;
    updatePlayerPosition();
  }
}

function updateWorldScale() {
  const rect = map.getBoundingClientRect();
  const nextScale = Math.min(rect.width / worldWidth, rect.height / worldHeight);
  worldScale = Number.isFinite(nextScale) ? nextScale : 1;
  world.style.setProperty('--world-scale', worldScale.toFixed(4));
}

function startDragPlayer(event) {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  event.preventDefault();
  dragState.active = true;
  dragState.startX = event.clientX;
  dragState.startY = event.clientY;
  dragState.originX = playerState.x;
  dragState.originY = playerState.y;
  player.setPointerCapture?.(event.pointerId);
}

function movePlayerByPointer(event) {
  if (!dragState.active) return;

  const dx = (event.clientX - dragState.startX) / worldScale;
  const dy = (event.clientY - dragState.startY) / worldScale;

  if (isMobileLayout()) {
    const next = clampToWorldBounds(
      dragState.originX + Math.round(dx),
      dragState.originY + Math.round(dy)
    );

    playerState.x = next.x;
    playerState.y = next.y;
    updatePlayerPosition();

    const collidedCharacter = checkCollisionWithCharacters(next.x, next.y);
    if (collidedCharacter) {
      const message = collidedCharacter.lines[Math.floor(Math.random() * collidedCharacter.lines.length)];
      showCharacterDialogue(collidedCharacter.name, message);
    }
    return;
  }

  const targetX = wrap(dragState.originX + Math.round(dx), worldWidth);
  const targetY = wrap(dragState.originY + Math.round(dy), worldHeight);

  playerState.x = targetX;
  playerState.y = targetY;
  updatePlayerPosition();

  const collidedCharacter = checkCollisionWithCharacters(targetX, targetY);
  if (collidedCharacter) {
    const message = collidedCharacter.lines[Math.floor(Math.random() * collidedCharacter.lines.length)];
    showCharacterDialogue(collidedCharacter.name, message);
  }
}

function endDragPlayer(event) {
  if (!dragState.active) return;
  dragState.active = false;
  if (event && event.pointerId !== undefined) {
    player.releasePointerCapture?.(event.pointerId);
  }
}

function setupControls() {
  const keyMap = {
    ArrowUp: [0, -32],
    ArrowDown: [0, 32],
    ArrowLeft: [-32, 0],
    ArrowRight: [32, 0],
    w: [0, -32],
    s: [0, 32],
    a: [-32, 0],
    d: [32, 0]
  };

  document.addEventListener('keydown', (event) => {
    const direction = keyMap[event.key];
    if (!direction) return;
    event.preventDefault();
    movePlayer(direction[0], direction[1]);
  });

  player.addEventListener('pointerdown', startDragPlayer);
  document.addEventListener('pointermove', movePlayerByPointer);
  document.addEventListener('pointerup', endDragPlayer);
  document.addEventListener('pointercancel', endDragPlayer);
  window.addEventListener('resize', updateWorldScale);
}

createTown();
initializePlayer();
updatePlayerPosition();
updateWorldScale();
animateCharacters();
setupControls();

function initializePlayer() {
  // プレイヤーを空にしてから再構築
  player.innerHTML = '';

  // SVGで顔を描画（薄いピンク色のかわいい顔）
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '50');
  svg.setAttribute('height', '50');
  svg.setAttribute('viewBox', '0 0 50 50');
  svg.setAttribute('class', 'player-svg');
  svg.innerHTML = `
    <defs>
      <radialGradient id="player-grad" cx="40%" cy="40%">
        <stop offset="0%" style="stop-color:#ffd4e5;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ffb3cc;stop-opacity:1" />
      </radialGradient>
    </defs>
    <!-- 体 -->
    <circle cx="25" cy="26" r="20" fill="url(#player-grad)" />
    <!-- 左耳 -->
    <ellipse cx="12" cy="10" rx="5" ry="8" fill="#ffb3cc" />
    <!-- 右耳 -->
    <ellipse cx="38" cy="10" rx="5" ry="8" fill="#ffb3cc" />
    <!-- 左目 -->
    <circle cx="18" cy="24" r="4" fill="#1f1f1f" />
    <circle cx="19" cy="22" r="1.5" fill="#fff" opacity="0.8" />
    <!-- 右目 -->
    <circle cx="32" cy="24" r="4" fill="#1f1f1f" />
    <circle cx="33" cy="22" r="1.5" fill="#fff" opacity="0.8" />
    <!-- 鼻 -->
    <circle cx="25" cy="32" r="1.5" fill="#ff99bb" />
    <!-- 口 -->
    <path d="M 23 37 Q 25 39 27 37" stroke="#1f1f1f" stroke-width="1.5" fill="none" stroke-linecap="round" />
  `;
  player.appendChild(svg);

  // 「あなた」ラベルを追加
  const label = document.createElement('div');
  label.className = 'player-label';
  label.textContent = 'あなた';
  player.appendChild(label);
}
