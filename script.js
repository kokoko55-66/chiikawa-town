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
    
    // 少し遅延させて音声を開始（ブラウザの制限対応）
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(message);
      const profile = getVoiceProfile(characterName);

      utterance.lang = 'ja-JP';
      utterance.rate = profile.rate;
      utterance.pitch = profile.pitch;
      utterance.volume = profile.volume;
      
      // エラーハンドリング
      utterance.onerror = (e) => {
        console.warn('音声再生エラー:', e);
      };
      
      window.speechSynthesis.speak(utterance);
    }, 50);
  }
}

const worldWidth = 1000;
const baseWorldHeight = 620;

function isMobileLayout() {
  return window.innerWidth <= 640;
}

function getWorldHeight() {
  return isMobileLayout() ? Math.floor(baseWorldHeight * 2 / 3) : baseWorldHeight;
}

let worldHeight = getWorldHeight();

const playerState = {
  x: 120,
  y: 200,
  size: 50
};

function getPlayerVisualSize() {
  return isMobileLayout() ? 125 : 50;
}

const characters = [
  {
    id: 'chiikawa',
    name: 'ちいかわ',
    className: 'chiikawa',
    x: 240,
    y: 80,
    mobileY: 60,
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
    y: 150,
    mobileY: 200,
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
    y: 90,
    mobileY: 45,
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
    y: 270,
    mobileY: 310,
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
    y: 280,
    mobileY: 340,
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

  const mobileHouses = [
    // 上部
    { x: 90, y: 10, width: 92, height: 70 },
    { x: 760, y: 15, width: 92, height: 70 },
    { x: 500, y: 5, width: 92, height: 70 },
    // 中部
    { x: 180, y: 145, width: 92, height: 70 },
    { x: 700, y: 165, width: 92, height: 70 },
    // 下部
    { x: 620, y: 310, width: 92, height: 70 },
    { x: 330, y: 330, width: 92, height: 70 },
    { x: 100, y: 320, width: 92, height: 70 }
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

  if (isMobileLayout()) {
    mobileHouses.forEach((house) => {
      const elem = document.createElement('div');
      elem.className = 'house';
      elem.style.left = `${house.x}px`;
      elem.style.top = `${house.y}px`;
      elem.style.width = `${house.width}px`;
      elem.style.height = `${house.height}px`;
      world.appendChild(elem);
    });
  } else {
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
  }

  const trees = [
    { x: 80, y: 300 }, { x: 170, y: 330 }, { x: 390, y: 300 },
    { x: 540, y: 320 }, { x: 710, y: 330 }, { x: 860, y: 300 },
    { x: 890, y: 390 }, { x: 290, y: 520 }, { x: 600, y: 560 }
  ];

  const mobileTrees = [
    // 上部
    { x: 30, y: 20 }, { x: 150, y: 40 }, { x: 320, y: 15 },
    { x: 520, y: 35 }, { x: 760, y: 25 }, { x: 870, y: 40 },
    // 中部
    { x: 100, y: 160 }, { x: 400, y: 180 }, { x: 750, y: 130 },
    // 下部
    { x: 250, y: 310 }, { x: 610, y: 290 }, { x: 720, y: 330 },
    { x: 50, y: 340 }, { x: 900, y: 320 }
  ];

  if (isMobileLayout()) {
    mobileTrees.forEach((tree) => {
      const elem = document.createElement('div');
      elem.className = 'tree';
      elem.style.left = `${tree.x}px`;
      elem.style.top = `${tree.y}px`;
      world.appendChild(elem);
    });
  } else {
    trees.forEach((tree) => {
      sceneOffsets.forEach((offset) => {
        const elem = document.createElement('div');
        elem.className = 'tree';
        elem.style.left = `${tree.x + offset.dx}px`;
        elem.style.top = `${tree.y + offset.dy}px`;
        world.appendChild(elem);
      });
    });
  }

  characters.forEach((character) => {    // モバイル版ではmobileYを使用
    if (isMobileLayout()) {
      character.y = character.mobileY;
    }
        character.baseX = character.x;
    character.baseY = character.y;
    character.motion = {
      vx: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.5),
      vy: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.5),
      rangeX: 18 + Math.random() * 28,
      rangeY: isMobileLayout() ? 120 + Math.random() * 150 : 18 + Math.random() * 28,
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
  const size = isMobile ? 150 : 64;
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
  const playerSize = isMobileLayout() ? 125 : playerState.size;
  const maxX = worldWidth - playerSize;
  const maxY = getWorldHeight() - playerSize;

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
  worldHeight = getWorldHeight();
  const rect = map.getBoundingClientRect();
  const nextScale = Math.min(rect.width / worldWidth, rect.height / worldHeight);
  worldScale = Number.isFinite(nextScale) ? nextScale : 1;
  world.style.setProperty('--world-scale', worldScale.toFixed(4));
  world.style.setProperty('--world-height', `${worldHeight}px`);
  world.style.height = `${worldHeight}px`;
  map.style.setProperty('--map-aspect-ratio', `${worldWidth} / ${worldHeight}`);
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

// モバイル版で worldHeight が正しく設定されることを確認
window.addEventListener('load', () => {
  worldHeight = getWorldHeight();
  updateWorldScale();
});

function initializePlayer() {
  // プレイヤーを空にしてから再構築
  player.innerHTML = '';

  const isMobile = isMobileLayout();
  const svgSize = getPlayerVisualSize();
  playerState.size = isMobile ? 125 : 50;

  // SVGで顔を描画（薄いピンク色のかわいい顔）
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(svgSize));
  svg.setAttribute('height', String(svgSize));
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

window.addEventListener('resize', () => {
  if (!player || !player.querySelector('svg')) return;

  const size = getPlayerVisualSize();
  const svg = player.querySelector('svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));

  playerState.size = isMobileLayout() ? 125 : 50;
  player.style.width = `${isMobileLayout() ? 140 : 50}px`;
  player.style.height = `${isMobileLayout() ? 155 : 50}px`;
  playerState.x = clamp(playerState.x, 0, worldWidth - playerState.size);
  playerState.y = clamp(playerState.y, 0, getWorldHeight() - playerState.size);
  updatePlayerPosition();
  updateWorldScale();
});
