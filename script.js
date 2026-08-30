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
  const isMobile = isMobileLayout();
  // 現在の縦幅（baseWorldHeight/2）の2倍 = baseWorldHeight
  const height = isMobile ? Math.floor(baseWorldHeight / 2) * 2 : baseWorldHeight;
  console.log('getWorldHeight() - isMobile:', isMobile, 'calculated height:', height);
  return height;
}

let worldHeight = getWorldHeight();

const playerState = {
  x: 120,
  y: 200,
  size: 50
};

// モバイル版ではラベルを含めた実際の表示領域で境界判定を行う
 const MOBILE_PLAYER_BOX = { width: 165, height: 177 };
const MOBILE_CHARACTER_BOX = { width: 180, height: 195, imageSize: 150 };

function getPlayerVisualSize() {
  return isMobileLayout() ? 135 : 50;
}

const characters = [
  {
    id: 'chiikawa',
    name: 'ちいかわ',
    className: 'chiikawa',
    x: 240,
    y: 80,
    mobileY: 160,
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
    mobileY: 400,
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
    mobileY: 90,
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
    mobileY: 620,
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
    mobileY: 640,
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
  const isMobile = isMobileLayout();
  console.log('createTown() - isMobile:', isMobile, 'worldHeight:', worldHeight);
  
  const houses = [
    { x: 120, y: 420, width: 92, height: 70 },
    { x: 760, y: 420, width: 92, height: 70 },
    { x: 630, y: 500, width: 92, height: 70 },
    { x: 450, y: 480, width: 92, height: 70 },
    { x: 220, y: 500, width: 92, height: 70 }
  ];

  const mobileHouses = [
    // 上部
    { x: 80, y: 70, width: 92, height: 70 },
    { x: 750, y: 90, width: 92, height: 70 },
    { x: 450, y: 60, width: 92, height: 70 },
    // 中部
    { x: 150, y: 230, width: 92, height: 70 },
    { x: 750, y: 260, width: 92, height: 70 },
    // 下部
    { x: 600, y: 400, width: 92, height: 70 },
    { x: 280, y: 430, width: 92, height: 70 },
    { x: 50, y: 370, width: 92, height: 70 }
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
    { x: 30, y: 30 }, { x: 150, y: 60 }, { x: 320, y: 24 },
    { x: 520, y: 80 }, { x: 760, y: 40 }, { x: 870, y: 100 },
    // 中部
    { x: 100, y: 200 }, { x: 400, y: 260 }, { x: 750, y: 230 },
    // 下部
    { x: 250, y: 380 }, { x: 610, y: 430 }, { x: 720, y: 400 },
    { x: 50, y: 460 }, { x: 900, y: 360 }
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
      // 画面上下にはみ出さないようにボックス全体を世界内に収める
      character.x = clamp(character.x, 0, worldWidth - MOBILE_CHARACTER_BOX.width);
      character.y = clamp(character.y, 0, worldHeight - MOBILE_CHARACTER_BOX.height);
    }
        character.baseX = character.x;
    character.baseY = character.y;
    character.motion = {
      vx: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.5),
      vy: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.5),
      rangeX: 18 + Math.random() * 28,
      rangeY: isMobileLayout() ? 240 + Math.random() * 300 : 18 + Math.random() * 28,
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

    // モバイル版では画面上下にはみ出さないように再度境界内に収める
    if (isMobileLayout()) {
      character.x = clamp(character.x, 0, worldWidth - MOBILE_CHARACTER_BOX.width);
      character.y = clamp(character.y, 0, worldHeight - MOBILE_CHARACTER_BOX.height);
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
  const size = isMobile ? MOBILE_CHARACTER_BOX.imageSize : 64;
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
  const boxWidth = isMobileLayout() ? MOBILE_PLAYER_BOX.width : playerState.size;
  const boxHeight = isMobileLayout() ? MOBILE_PLAYER_BOX.height : playerState.size;
  const maxX = worldWidth - boxWidth;
  const maxY = getWorldHeight() - boxHeight;

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

  // aspect-ratio未対応環境でも崩れないよう、幅を基準にJSで高さをpx指定する
  if (map) {
    const mapWidth = map.getBoundingClientRect().width;
    const desiredHeight = Math.round(mapWidth * (worldHeight / worldWidth));
    if (desiredHeight > 0) {
      map.style.height = `${desiredHeight}px`;
    }
  }

  const rect = map.getBoundingClientRect();
  const nextScale = Math.min(rect.width / worldWidth, rect.height / worldHeight);
  worldScale = Number.isFinite(nextScale) ? nextScale : 1;
  
  // CSS変数をrootに設定
  const root = document.documentElement;
  root.style.setProperty('--world-scale', worldScale.toFixed(4));
  root.style.setProperty('--world-height', `${worldHeight}px`);
  root.style.setProperty('--map-aspect-ratio', `${worldWidth} / ${worldHeight}`);
  
  // world要素の高さを直接設定
  if (world) {
    world.style.height = `${worldHeight}px`;
    console.log('updateWorldScale() - world.style.height set to:', world.style.height);
  }
  
  // map要素のアスペクト比を直接設定
  if (map) {
    map.style.aspectRatio = `${worldWidth} / ${worldHeight}`;
    console.log('updateWorldScale() - map.style.aspectRatio set to:', map.style.aspectRatio);
  }
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

// ページ読み込み完了後に初期化
function initializeGame() {
  // モバイル版かどうかを確認し、worldHeight を正しく設定
  const isMobile = isMobileLayout();
  worldHeight = getWorldHeight();
  
  console.log('=== Game Initialization ===');
  console.log('isMobile:', isMobile);
  console.log('window.innerWidth:', window.innerWidth);
  console.log('baseWorldHeight:', baseWorldHeight);
  console.log('worldHeight:', worldHeight);
  console.log('document.readyState:', document.readyState);
  
  createTown();
  initializePlayer();
  updatePlayerPosition();
  updateWorldScale();
  animateCharacters();
  setupControls();
  
  console.log('=== Initialization Complete ===');
}

// 二重初期化防止（DOMContentLoadedとloadの両方が発火しても1回だけ実行）
function initializeGameOnce(source) {
  console.log(`${source} fired`);
  if (window.gameInitialized) return;
  window.gameInitialized = true;
  initializeGame();
}

// DOMContentLoaded時に実行
document.addEventListener('DOMContentLoaded', () => {
  initializeGameOnce('DOMContentLoaded');
});

// ページ読み込み完了時にも実行（念のため）
window.addEventListener('load', () => {
  initializeGameOnce('Window load');
});

function initializePlayer() {
  // プレイヤーを空にしてから再構築
  player.innerHTML = '';

  const isMobile = isMobileLayout();
  const svgSize = getPlayerVisualSize();
  playerState.size = isMobile ? 135 : 50;

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

  playerState.size = isMobileLayout() ? 135 : 50;
  player.style.width = `${isMobileLayout() ? MOBILE_PLAYER_BOX.width : 50}px`;
  player.style.height = `${isMobileLayout() ? MOBILE_PLAYER_BOX.height : 50}px`;
  const boxWidth = isMobileLayout() ? MOBILE_PLAYER_BOX.width : playerState.size;
  const boxHeight = isMobileLayout() ? MOBILE_PLAYER_BOX.height : playerState.size;
  playerState.x = clamp(playerState.x, 0, worldWidth - boxWidth);
  playerState.y = clamp(playerState.y, 0, getWorldHeight() - boxHeight);
  updatePlayerPosition();
  updateWorldScale();
});
