// Motor Principal — Tour Interativo 3D pela UNIGRAN Campo Grande (Avatar Homem/Mulher/Cachorro + Quizzes dos Coordenadores)
(() => {
  const canvas = document.getElementById('game-canvas');
  const minimapCanvas = document.getElementById('minimap-canvas');
  const minimapCtx = minimapCanvas.getContext('2d');

  // UI Principal
  const hud = document.getElementById('hud');
  const titleScreen = document.getElementById('title-screen');
  const helpModal = document.getElementById('help-modal');
  const victoryScreen = document.getElementById('victory-screen');
  const quizModal = document.getElementById('quiz-modal');
  const arcadeModal = document.getElementById('arcade-modal');
  const arcadeTitle = document.getElementById('arcade-title');
  const arcadeIframe = document.getElementById('arcade-iframe');
  const btnArcadeLuta = document.getElementById('btn-arcade-luta');
  const btnArcadeFase = document.getElementById('btn-arcade-fase');
  const btnArcadeExt = document.getElementById('btn-arcade-ext');
  const btnArcadeClose = document.getElementById('btn-arcade-close');

  const ARCADE_GAMES = {
    luta: { title: 'Lab 1 (Eng. Software) — GameLuta', url: 'https://emerson-91.github.io/GameLuta/' },
    fase: { title: 'Lab 2 (Eng. Software) — Jogo de Fase UNIGRAN', url: 'https://emerson-91.github.io/jogo_unigran/' }
  };

  const raycaster = new THREE.Raycaster();
  const pointerNDC = new THREE.Vector2();

  const hudHeroImg = document.getElementById('hud-hero-img');
  const hudHeroName = document.getElementById('hud-hero-name');
  const hudPoints = document.getElementById('hud-points');
  const hudQuizzes = document.getElementById('hud-quizzes');
  const hudHearts = document.getElementById('hud-hearts');
  const hudRupees = document.getElementById('hud-rupees');
  const hudShards = document.getElementById('hud-shards');
  const areaBanner = document.getElementById('area-banner');
  const interactPrompt = document.getElementById('interact-prompt');
  const interactText = document.getElementById('interact-text');
  const itemToast = document.getElementById('item-toast');
  const itemToastTitle = document.getElementById('item-toast-title');
  const itemToastDesc = document.getElementById('item-toast-desc');
  const dialogueBox = document.getElementById('dialogue-box');
  const dialogueSpeaker = document.getElementById('dialogue-speaker');
  const dialogueText = document.getElementById('dialogue-text');
  const btnStartQuiz = document.getElementById('btn-start-quiz');
  const btnSound = document.getElementById('btn-sound');

  // UI do Quiz dos Coordenadores
  const quizCourseTag = document.getElementById('quiz-course-tag');
  const quizTitle = document.getElementById('quiz-title');
  const quizProgress = document.getElementById('quiz-progress');
  const quizLiveScore = document.getElementById('quiz-live-score');
  const quizQuestionBox = document.getElementById('quiz-question-box');
  const quizQuestionText = document.getElementById('quiz-question-text');
  const quizOptions = document.getElementById('quiz-options');
  const quizFeedback = document.getElementById('quiz-feedback');
  const btnQuizNext = document.getElementById('btn-quiz-next');
  const quizResultBox = document.getElementById('quiz-result-box');
  const quizResultIcon = document.getElementById('quiz-result-icon');
  const quizResultTitle = document.getElementById('quiz-result-title');
  const quizResultSummary = document.getElementById('quiz-result-summary');
  const btnQuizClose = document.getElementById('btn-quiz-close');

  const TOTAL_DIPLOMAS = 5;
  const TOTAL_QUIZZES = 15;
  const POINTS_PER_CORRECT = 100;
  const POINTS_PERFECT_BONUS = 50;
  const POINTS_PER_DIPLOMA = 50;

  // ==================== THREE.JS SETUP (ALTO DESEMPENHO 60 FPS) ====================
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;
  if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x74c6ec);
  scene.fog = new THREE.Fog(0x82ceee, 68, 175);

  const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.5, 260);
  camera.position.set(0, 15, 44);

  scene.add(new THREE.HemisphereLight(0xe8f8ff, 0x3b6e35, 0.9));
  const sunLight = new THREE.DirectionalLight(0xfff4d6, 0.95);
  sunLight.position.set(24, 40, 22);
  scene.add(sunLight);
  const rimLight = new THREE.DirectionalLight(0x8fd3ff, 0.36);
  rimLight.position.set(-22, 18, -24);
  scene.add(rimLight);

  // ==================== CÂMERA ORBITAL LIVRE E SUAVE (ARRASTAR / Q-R / SCROLL / V) ====================
  const DEFAULT_CAM_YAW = 0.0;
  const DEFAULT_CAM_PITCH = 0.78; // ~45° isométrico confortável (permite baixar até vista de rua ou subir até topo!)
  const DEFAULT_CAM_ZOOM = 1.0;

  const camPos = new THREE.Vector3(0, 15, 73);
  const camLookTarget = new THREE.Vector3(0, 1.15, 59);
  let smoothAheadX = 0;
  let smoothAheadZ = 0;
  let camZoom = DEFAULT_CAM_ZOOM;
  let targetCamZoom = DEFAULT_CAM_ZOOM;
  let camYaw = DEFAULT_CAM_YAW;
  let targetCamYaw = DEFAULT_CAM_YAW;
  let camPitch = DEFAULT_CAM_PITCH;
  let targetCamPitch = DEFAULT_CAM_PITCH;
    let camDragging = false;
    let camDragMoved = false;
    let camDownX = 0;
    let camDownY = 0;
    let camLastX = 0;
    let camLastY = 0;

  function resetCameraView() {
    targetCamYaw = DEFAULT_CAM_YAW;
    targetCamPitch = DEFAULT_CAM_PITCH;
    targetCamZoom = DEFAULT_CAM_ZOOM;
  }

  // ==================== ESTADO DO TOUR ====================
  let gameState = 'title'; // 'title' | 'playing' | 'dialogue' | 'quiz' | 'paused' | 'victory'
  let victoryShown = false;

  let world = null;
  let player = null;
  let npcs = [];
  let particles = [];

  const stats = {
    points: 0,
    completedQuizzes: new Set(),
    correctAnswersTotal: 0,
    diplomas: 0,
    playTime: 0
  };

  let playerIsMoving = false;
  let playerIsRunning = false;
  let toastTimer = 0;
  let currentInteractable = null;
  let activeDialogueNpc = null;
  let minimapFrameCounter = 0;
  let lastAreaName = '';
  let minimapBgCanvas = null;

  // Estado do Quiz ativo
  let activeQuizNpc = null;
  let activeQuizIndex = 0;
  let activeQuizCorrect = 0;
  let activeQuizEarned = 0;
  let activeQuizAnswered = false;
  let activeQuizWasRepeat = false;

  const keys = Object.create(null);

  function clearSceneEntities() {
    if (world && world.root) scene.remove(world.root);
    if (player) scene.remove(player.group);
    npcs.forEach((n) => scene.remove(n.group));
    particles.forEach((pt) => scene.remove(pt.mesh));

    npcs = [];
    particles = [];
  }

  function initNewTour() {
    clearSceneEntities();

    world = GameWorld.buildWorld(scene);
    const avatarData = GameEntities.getCustomHeroData();

    player = GameEntities.createVisitorActor(scene, avatarData);
    player.pos.set(0, 0, 59); // Entrada principal na Rua Abrão Júlio Rahe, 325!
    player.dirX = 0;
    player.dirZ = -1;
    player.yaw = Math.PI;

    npcs = GameEntities.spawnCampusNPCs(scene);

    stats.points = 0;
    stats.completedQuizzes = new Set();
    stats.correctAnswersTotal = 0;
    stats.diplomas = 0;
    stats.playTime = 0;
    victoryShown = false;

    playerIsMoving = false;
    playerIsRunning = false;
    toastTimer = 0;
    activeDialogueNpc = null;
    activeQuizNpc = null;
    smoothAheadX = 0;
    smoothAheadZ = 0;
    camZoom = DEFAULT_CAM_ZOOM;
    targetCamZoom = DEFAULT_CAM_ZOOM;
    camYaw = DEFAULT_CAM_YAW;
    targetCamYaw = DEFAULT_CAM_YAW;
    camPitch = DEFAULT_CAM_PITCH;
    targetCamPitch = DEFAULT_CAM_PITCH;
    lastAreaName = '';

    camLookTarget.set(player.pos.x, 1.15, player.pos.z);
    camPos.set(player.pos.x, 14.8, player.pos.z + 14.2);
    camera.position.copy(camPos);
    camera.lookAt(camLookTarget);

    updateVisitorHUD();
    updateScoreHUD();
    buildMinimapBackground();
    drawMinimap();
    itemToast.classList.add('hidden');
    dialogueBox.classList.add('hidden');
    quizModal.classList.add('hidden');
  }

  // ==================== HUD ====================
  function updateVisitorHUD() {
    const data = GameEntities.getCustomHeroData();
    const speciesLabel = data.species === 'woman' ? 'Mulher' : (data.species === 'dog' ? 'Cachorro' : 'Homem');
    hudHeroImg.src = data.portraitDataUrl || 'img/logo.png';
    hudHeroName.textContent = `${data.name} (${speciesLabel})`;
  }

  function updateScoreHUD() {
    const qDone = stats.completedQuizzes.size;
    hudPoints.textContent = stats.points;
    hudRupees.textContent = stats.points;
    hudQuizzes.textContent = `${qDone} / ${TOTAL_QUIZZES}`;
    hudShards.textContent = `${stats.diplomas} / ${TOTAL_DIPLOMAS}`;

    // Resumo por Área (Humanas 0/4 • Exatas 0/4 • Biológicas 0/7)
    let hDone = 0, eDone = 0, bDone = 0;
    for (let i = 0; i < npcs.length; i++) {
      const n = npcs[i];
      if (!n.quiz || !stats.completedQuizzes.has(n.quiz.id)) continue;
      if (n.area === 'humanas') hDone++;
      else if (n.area === 'exatas') eDone++;
      else if (n.area === 'biologicas') bDone++;
    }
    hudHearts.innerHTML =
      `<span class="area-pill pill-hum">Hum ${hDone}/4</span>` +
      `<span class="area-pill pill-exa">Exa ${eDone}/4</span>` +
      `<span class="area-pill pill-bio">Bio ${bDone}/7</span>`;
  }

  function showToast(title, desc, duration = 3.8) {
    itemToastTitle.textContent = title;
    itemToastDesc.textContent = desc;
    itemToast.classList.remove('hidden');
    toastTimer = duration;
  }

  // ==================== DIÁLOGO + BOTÃO DO QUIZ ====================
  function openDialogue(speaker, text, npcRef = null) {
    gameState = 'dialogue';
    activeDialogueNpc = npcRef;
    dialogueSpeaker.textContent = speaker;
    dialogueText.textContent = text;

    if (npcRef && npcRef.quiz) {
      const alreadyDone = stats.completedQuizzes.has(npcRef.quiz.id);
      btnStartQuiz.textContent = alreadyDone
        ? '🔄 Refazer Quiz do Curso (Concluído ✅)'
        : '📝 Fazer Quiz do Curso (+Pontos!)';
      btnStartQuiz.classList.remove('hidden');
    } else {
      btnStartQuiz.classList.add('hidden');
    }

    dialogueBox.classList.remove('hidden');
    interactPrompt.classList.add('hidden');
    GameAudio.dialogue();
  }

  function closeDialogue() {
    dialogueBox.classList.add('hidden');
    btnStartQuiz.classList.add('hidden');
    activeDialogueNpc = null;
    if (gameState === 'dialogue') gameState = 'playing';
  }

  btnStartQuiz.addEventListener('click', () => {
    if (activeDialogueNpc && activeDialogueNpc.quiz) {
      const targetNpc = activeDialogueNpc;
      closeDialogue();
      openQuiz(targetNpc);
    }
  });

  // ==================== SISTEMA DE QUIZ DOS COORDENADORES ====================
  function openQuiz(npc) {
    activeQuizNpc = npc;
    activeQuizIndex = 0;
    activeQuizCorrect = 0;
    activeQuizEarned = 0;
    activeQuizAnswered = false;
    activeQuizWasRepeat = stats.completedQuizzes.has(npc.quiz.id);

    gameState = 'quiz';
    interactPrompt.classList.add('hidden');
    quizCourseTag.textContent = npc.quiz.courseTag;
    quizTitle.textContent = npc.quiz.title;
    quizLiveScore.textContent = stats.points;

    quizQuestionBox.classList.remove('hidden');
    quizResultBox.classList.add('hidden');
    quizModal.classList.remove('hidden');

    renderQuizQuestion();
    GameAudio.dialogue();
  }

  function renderQuizQuestion() {
    const qList = activeQuizNpc.quiz.questions;
    const item = qList[activeQuizIndex];
    activeQuizAnswered = false;

    quizProgress.textContent = `Pergunta ${activeQuizIndex + 1} / ${qList.length}`;
    quizLiveScore.textContent = stats.points;
    quizQuestionText.textContent = item.q;
    quizFeedback.classList.add('hidden');
    quizFeedback.className = 'quiz-feedback hidden';
    btnQuizNext.classList.add('hidden');

    quizOptions.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    item.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-opt-btn';
      btn.dataset.idx = String(idx);
      btn.innerHTML = `<span class="quiz-opt-letter">${letters[idx]}</span><span>${optText}</span>`;
      btn.addEventListener('click', () => handleQuizAnswer(idx));
      quizOptions.appendChild(btn);
    });
  }

  function handleQuizAnswer(selectedIdx) {
    if (activeQuizAnswered || !activeQuizNpc) return;
    activeQuizAnswered = true;

    const qList = activeQuizNpc.quiz.questions;
    const item = qList[activeQuizIndex];
    const isCorrect = selectedIdx === item.answer;

    const buttons = quizOptions.querySelectorAll('.quiz-opt-btn');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === item.answer) btn.classList.add('correct');
      else if (idx === selectedIdx && !isCorrect) btn.classList.add('wrong');
    });

    if (isCorrect) {
      activeQuizCorrect++;
      GameAudio.rupee();
      if (!activeQuizWasRepeat) {
        stats.points += POINTS_PER_CORRECT;
        stats.correctAnswersTotal++;
        activeQuizEarned += POINTS_PER_CORRECT;
        updateScoreHUD();
        quizLiveScore.textContent = stats.points;
      }
      quizFeedback.className = 'quiz-feedback ok';
      quizFeedback.textContent = activeQuizWasRepeat
        ? `✅ Correto! ${item.explain}`
        : `✅ Correto! (+${POINTS_PER_CORRECT} pts) ${item.explain}`;
    } else {
      GameAudio.playerHurt();
      quizFeedback.className = 'quiz-feedback err';
      quizFeedback.textContent = `❌ Quase lá! ${item.explain}`;
    }
    quizFeedback.classList.remove('hidden');

    const isLast = activeQuizIndex >= qList.length - 1;
    btnQuizNext.textContent = isLast ? 'Ver Resultado 🏆' : 'Próxima Pergunta ➜';
    btnQuizNext.classList.remove('hidden');
  }

  function advanceQuiz() {
    if (!activeQuizNpc || !activeQuizAnswered) return;
    const qList = activeQuizNpc.quiz.questions;
    if (activeQuizIndex < qList.length - 1) {
      activeQuizIndex++;
      renderQuizQuestion();
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    const qList = activeQuizNpc.quiz.questions;
    const totalQ = qList.length;
    const perfect = activeQuizCorrect === totalQ;

    let bonus = 0;
    if (!activeQuizWasRepeat) {
      stats.completedQuizzes.add(activeQuizNpc.quiz.id);
      if (perfect) {
        bonus = POINTS_PERFECT_BONUS;
        stats.points += bonus;
        activeQuizEarned += bonus;
      }
      if (activeQuizNpc.marker && activeQuizNpc.marker.material) {
        activeQuizNpc.marker.material.color.setHex(0x22c55e); // Verde: Quiz concluído!
      }
      updateScoreHUD();
      drawMinimap();
      GameAudio.chestFanfare();
      GameEntities.spawnBurst(scene, particles, player.pos.x, player.pos.y + 1.6, player.pos.z, 0xf7d426, 12, 5.5, 0.22);
    } else {
      GameAudio.heart();
    }

    quizQuestionBox.classList.add('hidden');
    quizResultBox.classList.remove('hidden');
    quizLiveScore.textContent = stats.points;

    if (perfect) {
      quizResultIcon.textContent = '🏆🎉';
      quizResultTitle.textContent = 'Nota Máxima no Quiz!';
    } else if (activeQuizCorrect > 0) {
      quizResultIcon.textContent = '🎓👏';
      quizResultTitle.textContent = 'Quiz Concluído!';
    } else {
      quizResultIcon.textContent = '📚✨';
      quizResultTitle.textContent = 'Quiz Finalizado!';
    }

    if (activeQuizWasRepeat) {
      quizResultSummary.textContent = `Você acertou ${activeQuizCorrect} de ${totalQ} perguntas neste treino! Sua pontuação total segue em ${stats.points} pontos (${stats.completedQuizzes.size}/${TOTAL_QUIZZES} quizzes concluídos).`;
    } else {
      const bonusTxt = bonus > 0 ? ` (incluindo +${bonus} pts de bônus gabarito!)` : '';
      quizResultSummary.textContent = `Você acertou ${activeQuizCorrect} de ${totalQ} perguntas e ganhou +${activeQuizEarned} pontos${bonusTxt}! Total acumulado: ${stats.points} pontos • Quizzes concluídos: ${stats.completedQuizzes.size} / ${TOTAL_QUIZZES}.`;
    }
  }

  function closeQuizModal() {
    quizModal.classList.add('hidden');
    const finishedCount = stats.completedQuizzes.size;
    activeQuizNpc = null;
    gameState = 'playing';

    if (finishedCount >= TOTAL_QUIZZES && !victoryShown) {
      victoryShown = true;
      showToast('🏆 Todos os 5 Quizzes Concluídos!', `Pontuação acumulada: ${stats.points} pts!`, 3.5);
      setTimeout(() => {
        if (gameState === 'playing') triggerVictory();
      }, 1200);
    }
  }

  btnQuizNext.addEventListener('click', advanceQuiz);
  btnQuizClose.addEventListener('click', closeQuizModal);

  // ==================== DIPLOMAS DO TOUR ====================
  function awardDiploma(customTitle, customDesc) {
    stats.diplomas = Math.min(TOTAL_DIPLOMAS, stats.diplomas + 1);
    stats.points += POINTS_PER_DIPLOMA;
    if (world.pedestalDiplomas[stats.diplomas - 1]) {
      world.pedestalDiplomas[stats.diplomas - 1].visible = true;
    }
    updateScoreHUD();
    drawMinimap();
    GameAudio.chestFanfare();
    GameEntities.spawnBurst(scene, particles, player.pos.x, player.pos.y + 1.6, player.pos.z, 0xf7d426, 12, 5.8, 0.22);
    showToast(
      customTitle || '📜 Diploma do Tour!',
      `${customDesc || 'Novo Diploma exibido na Praça Central!'} (+${POINTS_PER_DIPLOMA} pts!)`,
      4.2
    );
  }

  function triggerVictory() {
    gameState = 'victory';
    dialogueBox.classList.add('hidden');
    quizModal.classList.add('hidden');
    GameAudio.victory();
    const mins = Math.floor(stats.playTime / 60);
    const secs = Math.floor(stats.playTime % 60).toString().padStart(2, '0');
    document.getElementById('victory-stats').innerHTML = `
      <div class="stat-box"><div class="stat-val">🏆 ${stats.points}</div><div class="stat-lbl">Pontuação Total</div></div>
      <div class="stat-box"><div class="stat-val">${stats.completedQuizzes.size}/${TOTAL_QUIZZES}</div><div class="stat-lbl">Quizzes Concluídos</div></div>
      <div class="stat-box"><div class="stat-val">${stats.diplomas}/${TOTAL_DIPLOMAS}</div><div class="stat-lbl">Diplomas • ${mins}:${secs}</div></div>
    `;
    victoryScreen.classList.remove('hidden');
  }

  // ==================== COMPUTADOR INTERATIVO DO LAB (GAMELUTA & JOGO DE FASE) ====================
  function loadArcadeGame(gameKey) {
    const info = ARCADE_GAMES[gameKey] || ARCADE_GAMES.luta;
    arcadeTitle.textContent = info.title;
    arcadeIframe.src = info.url;
    btnArcadeExt.href = info.url;
    btnArcadeLuta.classList.toggle('active-game', gameKey === 'luta');
    btnArcadeFase.classList.toggle('active-game', gameKey === 'fase');
  }

  function openArcadeModal(gameKey = 'luta') {
    for (const k in keys) keys[k] = false;
    gameState = 'arcade';
    interactPrompt.classList.add('hidden');
    loadArcadeGame(gameKey);
    arcadeModal.classList.remove('hidden');
    GameAudio.dialogue();
  }

  function closeArcadeModal() {
    arcadeModal.classList.add('hidden');
    arcadeIframe.src = 'about:blank';
    if (gameState === 'arcade') gameState = 'playing';
  }

  btnArcadeLuta.addEventListener('click', () => loadArcadeGame('luta'));
  btnArcadeFase.addEventListener('click', () => loadArcadeGame('fase'));
  btnArcadeClose.addEventListener('click', closeArcadeModal);

  // ==================== ESPORTES NO GINÁSIO (BASQUETE & FUTSAL FUNCIONANDO!) ====================
  function isPlayerInGym() {
    return !!(player && world && world.gym && player.pos.z <= -75 && Math.abs(player.pos.x) <= 22.5);
  }

  function shootBasketball() {
    if (!world || !world.gym) return false;
    const gym = world.gym;
    const b = gym.basketball;
    if (!b.held) return false;

    // Escolhe a cesta para onde o jogador está virado (ou a mais próxima)
    let targetHoop = gym.hoops[0];
    let bestScore = -999;
    for (let i = 0; i < gym.hoops.length; i++) {
      const h = gym.hoops[i];
      const dx = h.x - player.pos.x;
      const dz = h.z - player.pos.z;
      const d = Math.hypot(dx, dz) || 1;
      const align = (dx / d) * player.dirX + (dz / d) * player.dirZ;
      const score = align * 12 - d * 0.25;
      if (score > bestScore) {
        bestScore = score;
        targetHoop = h;
      }
    }

    const dist = Math.hypot(targetHoop.x - player.pos.x, targetHoop.z - player.pos.z);
    const isThree = dist > 9.2;
    const chance = dist < 7.5 ? 0.92 : (dist < 13.5 ? 0.78 : 0.45);
    const willScore = Math.random() < chance;

    b.held = false;
    b.shotActive = true;
    b.shotTimer = 0;
    b.shotDuration = Math.max(0.62, Math.min(1.18, 0.52 + dist * 0.036));
    b.sx = b.x;
    b.sy = b.y;
    b.sz = b.z;
    b.tx = targetHoop.x + (willScore ? 0 : (Math.random() > 0.5 ? 0.55 : -0.55));
    b.ty = targetHoop.y + (willScore ? 0.05 : 0.25);
    b.tz = targetHoop.z + (willScore ? 0 : (Math.random() - 0.5) * 0.9);
    b.peakY = Math.max(5.3, targetHoop.y + 1.7 + dist * 0.14);
    b.willScore = willScore;
    b.shotPoints = isThree ? 3 : 2;

    // Vira o personagem para a cesta
    player.dirX = (targetHoop.x - player.pos.x) / (dist || 1);
    player.dirZ = (targetHoop.z - player.pos.z) / (dist || 1);
    GameAudio.dash();
    return true;
  }

  function handleGymSpaceAction() {
    if (!isPlayerInGym()) return false;
    const gym = world.gym;
    const bb = gym.basketball;
    const sb = gym.soccerBall;

    // 1. Se está segurando a bola de basquete -> ARREMESSA NA CESTA!
    if (bb.held) {
      return shootBasketball();
    }

    const dSoccer = Math.hypot(player.pos.x - sb.x, player.pos.z - sb.z);
    const dBasket = Math.hypot(player.pos.x - bb.x, player.pos.z - bb.z);

    // 2. Se está perto da bola de futebol -> CHUTE POTENTE!
    if (dSoccer < 2.8 && (dSoccer <= dBasket || bb.shotActive)) {
      const kickSpeed = playerIsRunning ? 24.0 : 19.5;
      sb.vx = player.dirX * kickSpeed;
      sb.vz = player.dirZ * kickSpeed;
      sb.vy = 3.6;
      GameAudio.dash();
      GameEntities.spawnBurst(scene, particles, sb.x, 0.35, sb.z, 0xffffff, 6, 3.2, 0.14);
      return true;
    }

    // 3. Se está perto da bola de basquete no chão -> PEGA PARA DRIBLAR!
    if (dBasket < 2.8 && !bb.shotActive) {
      bb.held = true;
      bb.vx = 0; bb.vy = 0; bb.vz = 0;
      GameAudio.rupee();
      showToast('Bola de Basquete!', 'Ande para driblar e pressione ESPAÇO para arremessar na cesta!', 2.8);
      return true;
    }

    return false;
  }

  function updateGymSports(dt, elapsed) {
    if (!world || !world.gym) return;
    const gym = world.gym;
    const bb = gym.basketball;
    const sb = gym.soccerBall;
    const bnd = gym.bounds;

    // Solta a bola de basquete se sair do Ginásio
    if (bb.held && !isPlayerInGym()) {
      bb.held = false;
      bb.x = 0; bb.y = 1.2; bb.z = gym.centerZ;
      bb.vx = 0; bb.vy = 0; bb.vz = 0;
    }

    // --- FÍSICA DO BASQUETE ---
    if (bb.held) {
      const dribble = Math.abs(Math.sin(elapsed * (playerIsMoving ? 10.5 : 7.0)));
      bb.x = player.pos.x + player.dirX * 0.85 - player.dirZ * 0.38;
      bb.z = player.pos.z + player.dirZ * 0.85 + player.dirX * 0.38;
      bb.y = bb.r + dribble * 1.15;
      bb.mesh.rotation.x += dt * 7;
    } else if (bb.shotActive) {
      bb.shotTimer += dt;
      const t = Math.min(1, bb.shotTimer / bb.shotDuration);
      bb.x = bb.sx + (bb.tx - bb.sx) * t;
      bb.z = bb.sz + (bb.tz - bb.sz) * t;
      // Parábola limpa passando por peakY em t = 0.5
      const linY = bb.sy + (bb.ty - bb.sy) * t;
      const arcBoost = 4 * t * (1 - t) * Math.max(0.8, bb.peakY - (bb.sy + bb.ty) * 0.5);
      bb.y = linY + arcBoost;
      bb.mesh.rotation.x += dt * 11;
      bb.mesh.rotation.z += dt * 5;

      if (t >= 1) {
        bb.shotActive = false;
        if (bb.willScore) {
          gym.basketScore += bb.shotPoints;
          gym.updateScoreboard(gym.basketScore, gym.futsalScore);
          const bonusPts = bb.shotPoints === 3 ? 40 : 25;
          stats.points += bonusPts;
          updateScoreHUD();
          GameAudio.chestFanfare();
          GameEntities.spawnBurst(scene, particles, bb.tx, bb.ty, bb.tz, 0xf7d426, 12, 5.2, 0.2);
          showToast(
            bb.shotPoints === 3 ? 'CESTA DE 3 PONTOS!' : 'CESTA DE 2 PONTOS!',
            `Placar Basquete: ${gym.basketScore} pts • +${bonusPts} pts no Tour UNIGRAN!`,
            3.2
          );
          bb.vx = (bb.tx > 0 ? -1.4 : 1.4);
          bb.vz = (Math.random() - 0.5) * 1.6;
          bb.vy = -2.8;
        } else {
          // Rebote no aro!
          GameAudio.playerHurt();
          bb.vx = (bb.tx > 0 ? -4.5 : 4.5);
          bb.vz = (Math.random() - 0.5) * 3.5;
          bb.vy = 2.6;
        }
      }
    } else {
      bb.vy -= 18 * dt;
      bb.x += bb.vx * dt;
      bb.y += bb.vy * dt;
      bb.z += bb.vz * dt;
      if (bb.y <= bb.r + 0.14) {
        bb.y = bb.r + 0.14;
        if (Math.abs(bb.vy) > 1.2) bb.vy = -bb.vy * 0.68;
        else bb.vy = 0;
        bb.vx *= Math.exp(-2.4 * dt);
        bb.vz *= Math.exp(-2.4 * dt);
      }
      if (bb.x < bnd.minX) { bb.x = bnd.minX; bb.vx = Math.abs(bb.vx) * 0.7; }
      if (bb.x > bnd.maxX) { bb.x = bnd.maxX; bb.vx = -Math.abs(bb.vx) * 0.7; }
      if (bb.z < bnd.minZ) { bb.z = bnd.minZ; bb.vz = Math.abs(bb.vz) * 0.7; }
      if (bb.z > bnd.maxZ) { bb.z = bnd.maxZ; bb.vz = -Math.abs(bb.vz) * 0.7; }
      bb.mesh.rotation.x += bb.vz * dt * 1.6;
      bb.mesh.rotation.z -= bb.vx * dt * 1.6;
    }

    bb.mesh.position.set(bb.x, bb.y, bb.z);
    bb.shadow.position.set(bb.x, 0.16, bb.z);
    bb.shadow.scale.setScalar(Math.max(0.45, 1.0 - (bb.y - bb.r) * 0.1));

    // --- FÍSICA DO FUTSAL / FUTEBOL ---
    if (sb.goalCooldown > 0) {
      sb.goalCooldown -= dt;
      if (sb.goalCooldown <= 0) {
        // Reposiciona a bola no centro da quadra após o gol!
        sb.x = 0; sb.y = sb.r + 0.14; sb.z = gym.centerZ;
        sb.vx = 0; sb.vy = 0; sb.vz = 0;
        GameEntities.spawnBurst(scene, particles, 0, 0.5, gym.centerZ, 0x38e8ff, 8, 3.0, 0.15);
      }
    } else if (isPlayerInGym() && !bb.held) {
      // Condução com os pés ao encostar na bola de futebol!
      const dx = sb.x - player.pos.x;
      const dz = sb.z - player.pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 1.05 && sb.y < 1.2) {
        const pushSpd = playerIsMoving ? (playerIsRunning ? 13.5 : 9.8) : 3.2;
        const nx = dist > 0.05 ? dx / dist : player.dirX;
        const nz = dist > 0.05 ? dz / dist : player.dirZ;
        sb.vx = (nx * 0.45 + player.dirX * 0.55) * pushSpd;
        sb.vz = (nz * 0.45 + player.dirZ * 0.55) * pushSpd;
      }
    }

    sb.vy -= 18 * dt;
    sb.x += sb.vx * dt;
    sb.y += sb.vy * dt;
    sb.z += sb.vz * dt;
    if (sb.y <= sb.r + 0.14) {
      sb.y = sb.r + 0.14;
      if (Math.abs(sb.vy) > 1.2) sb.vy = -sb.vy * 0.58;
      else sb.vy = 0;
      sb.vx *= Math.exp(-1.75 * dt);
      sb.vz *= Math.exp(-1.75 * dt);
    }

    // Detecção de GOL nas duas traves de Futsal!
    if (sb.goalCooldown <= 0) {
      for (let i = 0; i < gym.goals.length; i++) {
        const g = gym.goals[i];
        const crossed = g.side < 0 ? (sb.x <= g.x - 0.15) : (sb.x >= g.x + 0.15);
        if (crossed && sb.z >= g.minZ && sb.z <= g.maxZ && sb.y <= g.maxY) {
          sb.goalCooldown = 1.45;
          sb.vx *= 0.25;
          sb.vz *= 0.25;
          gym.futsalScore++;
          gym.updateScoreboard(gym.basketScore, gym.futsalScore);
          stats.points += 25;
          updateScoreHUD();
          GameAudio.chestFanfare();
          GameEntities.spawnBurst(scene, particles, g.x, 1.2, sb.z, 0x22c55e, 12, 5.8, 0.22);
          showToast('GOOOOL DE FUTSAL!', `Placar Futsal: ${gym.futsalScore} gols • +25 pts no Tour UNIGRAN!`, 3.2);
          break;
        }
      }
    }

    // Rebote nas paredes internas do Ginásio
    if (sb.x < bnd.minX) { sb.x = bnd.minX; sb.vx = Math.abs(sb.vx) * 0.72; }
    if (sb.x > bnd.maxX) { sb.x = bnd.maxX; sb.vx = -Math.abs(sb.vx) * 0.72; }
    if (sb.z < bnd.minZ) { sb.z = bnd.minZ; sb.vz = Math.abs(sb.vz) * 0.72; }
    if (sb.z > bnd.maxZ) { sb.z = bnd.maxZ; sb.vz = -Math.abs(sb.vz) * 0.72; }

    sb.mesh.rotation.x += sb.vz * dt * 2.2;
    sb.mesh.rotation.z -= sb.vx * dt * 2.2;
    sb.mesh.position.set(sb.x, sb.y, sb.z);
    sb.shadow.position.set(sb.x, 0.16, sb.z);
    sb.shadow.scale.setScalar(Math.max(0.5, 1.0 - (sb.y - sb.r) * 0.12));
  }

  // ==================== INTERAÇÃO [E] ====================
  function handleInteract() {
    if (gameState === 'dialogue') {
      closeDialogue();
      return;
    }
    if (gameState !== 'playing') return;

    if (currentInteractable) {
      if (currentInteractable.kind === 'npc') {
        const npc = currentInteractable.ref;
        npc.group.rotation.y = Math.atan2(player.pos.x - npc.pos.x, player.pos.z - npc.pos.z);
        npc.talked = true;
        openDialogue(npc.name, npc.dialogue, npc);
        return;
      } else if (currentInteractable.kind === 'chest') {
        const ch = currentInteractable.ref;
        ch.opened = true;
        awardDiploma(ch.title, ch.desc);
        return;
      } else if (currentInteractable.kind === 'arcade') {
        openArcadeModal(currentInteractable.ref.game);
        return;
      } else if (currentInteractable.kind === 'basketball') {
        const bb = world.gym.basketball;
        bb.held = true;
        bb.vx = 0; bb.vy = 0; bb.vz = 0;
        GameAudio.rupee();
        showToast('Bola de Basquete!', 'Ande para driblar e pressione ESPAÇO para arremessar na cesta!', 2.8);
        return;
      } else if (currentInteractable.kind === 'sign') {
        const s = currentInteractable.ref;
        openDialogue(s.speaker, s.text, null);
        return;
      }
    }

    // Se estiver segurando a bola de basquete e apertar E longe de NPCs -> solta a bola!
    if (world && world.gym && world.gym.basketball.held) {
      const bb = world.gym.basketball;
      bb.held = false;
      bb.vx = player.dirX * 3.0;
      bb.vz = player.dirZ * 3.0;
      bb.vy = 2.0;
    }
  }

  // ==================== LOOP DE ATUALIZAÇÃO ====================
  function updatePlayer(dt, elapsed) {
    // Rotação suave da câmera pelo teclado (Q = esquerda, R = direita)
    if (keys['KeyQ']) targetCamYaw -= 1.85 * dt;
    if (keys['KeyR']) targetCamYaw += 1.85 * dt;

    let inX = 0;
    let inZ = 0;
    if (keys['KeyW'] || keys['ArrowUp']) inZ -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) inZ += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) inX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) inX += 1;

    const prevX = player.pos.x;
    const prevZ = player.pos.z;
    playerIsMoving = false;
    playerIsRunning = !!(keys['ShiftLeft'] || keys['ShiftRight']);

    if (inX !== 0 || inZ !== 0) {
      // Movimento relativo ao ângulo atual da câmera!
      const cosY = Math.cos(camYaw);
      const sinY = Math.sin(camYaw);
      let mx = inX * cosY + inZ * sinY;
      let mz = -inX * sinY + inZ * cosY;
      const len = Math.hypot(mx, mz);
      mx /= len;
      mz /= len;
      player.dirX = mx;
      player.dirZ = mz;

      const moveSpeed = player.baseSpeed * (playerIsRunning ? 1.48 : 1.0);
      player.pos.x += mx * moveSpeed * dt;
      player.pos.z += mz * moveSpeed * dt;
      playerIsMoving = true;
    }

    if (world.isWaterBlocked(player.pos.x, player.pos.z)) {
      if (!world.isWaterBlocked(player.pos.x, prevZ)) player.pos.z = prevZ;
      else if (!world.isWaterBlocked(prevX, player.pos.z)) player.pos.x = prevX;
      else { player.pos.x = prevX; player.pos.z = prevZ; }
    }

    GameWorld.resolveCollisions(world, player.pos, 0.62);
    const targetGroundY = GameWorld.getGroundHeight(world, player.pos.x, player.pos.z, player.pos.y);
    player.pos.y += (targetGroundY - player.pos.y) * (1 - Math.exp(-18 * dt));
    if (Math.abs(player.pos.y - targetGroundY) < 0.02) player.pos.y = targetGroundY;

    GameWorld.updateBuildingCutaways(world, player.pos, npcs);

    GameEntities.animateHero3D(player, dt, elapsed, {
      isMoving: playerIsMoving,
      isRunning: playerIsRunning
    });

    const areaNow = GameWorld.getAreaName(world, player.pos.x, player.pos.z, player.pos.y);
    if (areaNow !== lastAreaName) {
      lastAreaName = areaNow;
      areaBanner.textContent = areaNow;
    }

    // Procura Coordenadores, Alunos, Diplomas e Placas próximos para prompt [E]
    currentInteractable = null;
    let bestDist = 3.6;

    for (let i = 0; i < npcs.length; i++) {
      const n = npcs[i];
      if (Math.abs(n.y - player.pos.y) > 2.2) continue;
      const dist = Math.hypot(player.pos.x - n.pos.x, player.pos.z - n.pos.z);
      if (dist < bestDist) {
        bestDist = dist;
        let lbl = `Conversar com ${n.name}`;
        if (n.quiz) {
          lbl = stats.completedQuizzes.has(n.quiz.id)
            ? `Falar com ${n.name} (Quiz ✅)`
            : `Falar & Fazer Quiz — ${n.name}`;
        }
        currentInteractable = { kind: 'npc', ref: n, label: lbl };
      }
    }
    for (let i = 0; i < world.chests.length; i++) {
      const ch = world.chests[i];
      if (ch.opened || Math.abs((ch.y || 0) - player.pos.y) > 2.2) continue;
      const dist = Math.hypot(player.pos.x - ch.x, player.pos.z - ch.z);
      if (dist < bestDist) {
        bestDist = dist;
        currentInteractable = { kind: 'chest', ref: ch, label: 'Pegar Diploma do Tour 📜 (+50 pts)' };
      }
    }
    for (let i = 0; i < world.arcadeStations.length; i++) {
      const st = world.arcadeStations[i];
      if (Math.abs((st.y || 0) - player.pos.y) > 2.2) continue;
      const dist = Math.hypot(player.pos.x - st.x, player.pos.z - st.z);
      if (dist < 4.5 && dist < bestDist + 1.0) {
        bestDist = dist;
        currentInteractable = { kind: 'arcade', ref: st, label: st.label };
      }
    }
    for (let i = 0; i < world.signs.length; i++) {
      const s = world.signs[i];
      if (Math.abs((s.y || 0) - player.pos.y) > 2.2) continue;
      const dist = Math.hypot(player.pos.x - s.x, player.pos.z - s.z);
      if (dist < bestDist) {
        bestDist = dist;
        currentInteractable = { kind: 'sign', ref: s, label: `Ler ${s.speaker}` };
      }
    }

    // Prompts dos esportes no Ginásio (Basquete & Futsal!)
    if (isPlayerInGym()) {
      const bb = world.gym.basketball;
      const sb = world.gym.soccerBall;
      if (bb.held && !currentInteractable) {
        currentInteractable = { kind: 'gym_hint', label: 'ESPAÇO = Arremessar na Cesta  •  E = Soltar Bola' };
      } else if (!currentInteractable) {
        const dB = Math.hypot(player.pos.x - bb.x, player.pos.z - bb.z);
        const dS = Math.hypot(player.pos.x - sb.x, player.pos.z - sb.z);
        if (!bb.shotActive && dB < 2.8 && dB <= dS) {
          currentInteractable = { kind: 'basketball', label: 'Pegar Bola de Basquete (ESPAÇO p/ arremessar)' };
        } else if (dS < 2.8) {
          currentInteractable = { kind: 'gym_hint', label: 'ESPAÇO = Chutar Bola de Futsal (ande nela p/ driblar)' };
        }
      }
    }

    if (currentInteractable) {
      interactText.textContent = currentInteractable.label;
      interactPrompt.classList.remove('hidden');
    } else {
      interactPrompt.classList.add('hidden');
    }
  }

  function updateNPCs(dt, elapsed) {
    for (let i = 0; i < npcs.length; i++) {
      const n = npcs[i];
      n.bodyPivot.position.y = Math.sin(elapsed * 3.2 + n.phase) * 0.03;
      if (n.marker) {
        n.marker.rotation.y += dt * 2.2;
        n.marker.position.y = 3.2 + Math.sin(elapsed * 3.5 + n.phase) * 0.14;
      }
    }
  }

  function updateEffects(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.life -= dt;
      pt.vy -= 11 * dt;
      pt.mesh.position.x += pt.vx * dt;
      pt.mesh.position.y = Math.max(0.08, pt.mesh.position.y + pt.vy * dt);
      pt.mesh.position.z += pt.vz * dt;
      pt.mesh.rotation.x += dt * 6;
      pt.mesh.rotation.y += dt * 7;
      const scaleT = Math.max(0.01, pt.life / pt.maxLife);
      pt.mesh.scale.setScalar((pt.baseSize || 0.18) * scaleT);
      if (pt.life <= 0) {
        scene.remove(pt.mesh);
        particles.splice(i, 1);
      }
    }

    if (toastTimer > 0) {
      toastTimer -= dt;
      if (toastTimer <= 0) itemToast.classList.add('hidden');
    }
  }

  function updateCamera(dt, elapsed) {
    if (gameState === 'title') {
      const angle = elapsed * 0.14;
      camera.position.set(Math.sin(angle) * 28, 16.0, Math.cos(angle) * 28 + 6);
      camera.lookAt(0, 1.8, 2);
      if (player) {
        GameEntities.animateHero3D(player, dt, elapsed, { isMoving: false, isRunning: false });
      }
      return;
    }

    const orbAlpha = 1 - Math.exp(-11.0 * dt);
    camZoom += (targetCamZoom - camZoom) * (1 - Math.exp(-8.5 * dt));
    camYaw += (targetCamYaw - camYaw) * orbAlpha;
    camPitch += (targetCamPitch - camPitch) * orbAlpha;

    const goalAheadX = playerIsMoving ? player.dirX * 1.15 : 0;
    const goalAheadZ = playerIsMoving ? player.dirZ * 1.15 : 0;
    const aheadAlpha = 1 - Math.exp(-3.6 * dt);
    smoothAheadX += (goalAheadX - smoothAheadX) * aheadAlpha;
    smoothAheadZ += (goalAheadZ - smoothAheadZ) * aheadAlpha;

    const desiredTargetX = player.pos.x + smoothAheadX * 0.5;
    const desiredTargetY = player.pos.y + 1.35;
    const desiredTargetZ = player.pos.z + smoothAheadZ * 0.5;
    const targetAlpha = 1 - Math.exp(-10.5 * dt);
    camLookTarget.x += (desiredTargetX - camLookTarget.x) * targetAlpha;
    camLookTarget.y += (desiredTargetY - camLookTarget.y) * targetAlpha;
    camLookTarget.z += (desiredTargetZ - camLookTarget.z) * targetAlpha;

    const radius = 20.5 * camZoom;
    const horizDist = Math.cos(camPitch) * radius;
    const vertDist = Math.max(1.8, Math.sin(camPitch) * radius);

    const desiredPosX = camLookTarget.x + Math.sin(camYaw) * horizDist;
    const desiredPosY = camLookTarget.y + vertDist;
    const desiredPosZ = camLookTarget.z + Math.cos(camYaw) * horizDist;
    const posAlpha = 1 - Math.exp(-10.5 * dt);
    camPos.x += (desiredPosX - camPos.x) * posAlpha;
    camPos.y += (desiredPosY - camPos.y) * posAlpha;
    camPos.z += (desiredPosZ - camPos.z) * posAlpha;

    camera.position.copy(camPos);
    camera.lookAt(camLookTarget);
  }

  // ==================== MINIMAPA DO TOUR UNIGRAN ====================
  function buildMinimapBackground() {
    const w = minimapCanvas.width;
    const h = minimapCanvas.height;
    minimapBgCanvas = document.createElement('canvas');
    minimapBgCanvas.width = w;
    minimapBgCanvas.height = h;
    const ctx = minimapBgCanvas.getContext('2d');
    const toMap = (v) => ((v + world.half) / world.size) * w;
    const toLen = (l) => (l / world.size) * w;

    ctx.fillStyle = '#559e4d';
    ctx.fillRect(0, 0, w, h);

    // 4 Ruas reais do quarteirão UNIGRAN Capital
    ctx.fillStyle = '#333b44';
    ctx.fillRect(0, toMap(60), w, toLen(16));          // R. Abrão Júlio Rahe (Sul)
    ctx.fillRect(0, toMap(-74), w, toLen(16));         // R. das Garças (Norte)
    ctx.fillRect(toMap(-78), 0, toLen(16), h);         // R. José Antônio (Oeste)
    ctx.fillRect(toMap(62), 0, toLen(16), h);          // R. Padre João Crippa (Leste)

    // Quarteirão interno UNIGRAN Capital
    ctx.fillStyle = '#cfc9be';
    ctx.fillRect(toMap(-60), toMap(-56), toLen(120), toLen(114));

    // Estacionamento interno Oeste
    ctx.fillStyle = '#5a636d';
    ctx.fillRect(toMap(-56), toMap(-16), toLen(24), toLen(50));

    // 3 Blocos reais da UNIGRAN Capital (A, B, C) + Ginásio do outro lado da Rua das Garças!
    const blockColors = {
      bloco_a: '#0284c7',
      bloco_b: '#7c3aed',
      bloco_c: '#0d9488',
      ginasio: '#ea580c'
    };
    const blockLabels = { bloco_a: 'BLOCO A', bloco_b: 'B', bloco_c: 'BLOCO C', ginasio: 'GINÁSIO' };
    for (let i = 0; i < world.buildings.length; i++) {
      const b = world.buildings[i];
      ctx.fillStyle = blockColors[b.id] || '#004274';
      ctx.fillRect(toMap(b.minX), toMap(b.minZ), toLen(b.maxX - b.minX), toLen(b.maxZ - b.minZ));
      ctx.strokeStyle = '#f7d426';
      ctx.lineWidth = 1.3;
      ctx.strokeRect(toMap(b.minX), toMap(b.minZ), toLen(b.maxX - b.minX), toLen(b.maxZ - b.minZ));

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(blockLabels[b.id] || '', toMap((b.minX + b.maxX) / 2), toMap((b.minZ + b.maxZ) / 2));
    }

    // Pátio Central (Logo 3D UNIGRAN)
    ctx.fillStyle = '#e5e0d6';
    ctx.beginPath();
    ctx.arc(toMap(0), toMap(-4), toLen(9), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#004274';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawMinimap() {
    if (!minimapBgCanvas) buildMinimapBackground();
    const w = minimapCanvas.width;
    const toMap = (v) => ((v + world.half) / world.size) * w;

    minimapCtx.drawImage(minimapBgCanvas, 0, 0);

    // Diplomas não coletados (dourado)
    for (let i = 0; i < world.chests.length; i++) {
      const ch = world.chests[i];
      if (ch.opened) continue;
      minimapCtx.fillStyle = '#f7d426';
      minimapCtx.fillRect(toMap(ch.x) - 3, toMap(ch.z) - 3, 6, 6);
    }

    // Coordenadores com Quiz (ciano pendente, verde concluído)
    for (let i = 0; i < npcs.length; i++) {
      const n = npcs[i];
      if (!n.quiz) continue;
      const done = stats.completedQuizzes.has(n.quiz.id);
      minimapCtx.fillStyle = done ? '#22c55e' : '#38e8ff';
      minimapCtx.beginPath();
      minimapCtx.arc(toMap(n.pos.x), toMap(n.pos.z), 3.3, 0, Math.PI * 2);
      minimapCtx.fill();
    }

    // Visitante
    if (player) {
      minimapCtx.fillStyle = '#ffffff';
      minimapCtx.beginPath();
      minimapCtx.arc(toMap(player.pos.x), toMap(player.pos.z), 3.8, 0, Math.PI * 2);
      minimapCtx.fill();
    }
  }

  // ==================== CUSTOMIZADOR 3D INTEGRADO NA TELA INICIAL (HOMEM / MULHER / CACHORRO) ====================
  const creatorCanvas = document.getElementById('creator-canvas');
  const creatorLiveTag = document.getElementById('creator-live-tag');
  const btnStart = document.getElementById('btn-start');
  const btnCreatorCancel = document.getElementById('btn-creator-cancel');
  const speciesButtons = Array.from(document.querySelectorAll('#species-tabs .species-tab'));

  const ccInputs = {
    name: document.getElementById('cc-name'),
    hairStyle: document.getElementById('cc-hair-style'),
    outfit: document.getElementById('cc-outfit'),
    beard: document.getElementById('cc-beard'),
    glasses: document.getElementById('cc-glasses'),
    skinColor: document.getElementById('cc-skin'),
    hairColor: document.getElementById('cc-hair-color'),
    shirtColor: document.getElementById('cc-shirt'),
    pantsColor: document.getElementById('cc-pants'),
    shoesColor: document.getElementById('cc-shoes')
  };

  let selectedSpecies = 'man';
  let creatorRenderer = null;
  let creatorScene = null;
  let creatorCamera = null;
  let creatorRig = null;
  let creatorParts = null;
  let creatorActive = true;
  let isEditingMidTour = false;
  let creatorYaw = 0.35;
  let creatorDragging = false;
  let creatorDragX = 0;

  function initCreatorPreview() {
    if (creatorRenderer) return;
    try {
      creatorRenderer = new THREE.WebGLRenderer({ canvas: creatorCanvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
      creatorRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      creatorRenderer.setSize(260, 295, false);
      if (THREE.sRGBEncoding) creatorRenderer.outputEncoding = THREE.sRGBEncoding;

      creatorScene = new THREE.Scene();
      creatorCamera = new THREE.PerspectiveCamera(34, 260 / 295, 0.5, 40);
      creatorCamera.position.set(0, 1.85, 5.4);
      creatorCamera.lookAt(0, 1.32, 0);

      creatorScene.add(new THREE.HemisphereLight(0xfffaf0, 0x5c7a52, 0.98));
      const keyL = new THREE.DirectionalLight(0xfff3d4, 1.0);
      keyL.position.set(4, 7, 5);
      creatorScene.add(keyL);

      const ped = new THREE.Mesh(
        new THREE.CylinderGeometry(1.12, 1.24, 0.16, 20),
        new THREE.MeshLambertMaterial({ color: 0xd9b382 })
      );
      ped.position.y = -0.08;
      creatorScene.add(ped);

      const pedRim = new THREE.Mesh(
        new THREE.CylinderGeometry(1.16, 1.16, 0.05, 20),
        new THREE.MeshLambertMaterial({ color: 0x3b2f24 })
      );
      pedRim.position.y = -0.02;
      creatorScene.add(pedRim);

      creatorCanvas.addEventListener('mousedown', (ev) => {
        creatorDragging = true;
        creatorDragX = ev.clientX;
      });
      window.addEventListener('mouseup', () => { creatorDragging = false; });
      window.addEventListener('mousemove', (ev) => {
        if (!creatorDragging || !creatorActive) return;
        creatorYaw += (ev.clientX - creatorDragX) * 0.015;
        creatorDragX = ev.clientX;
      });

      creatorCanvas.addEventListener('touchstart', (ev) => {
        if (ev.touches.length > 0) {
          creatorDragging = true;
          creatorDragX = ev.touches[0].clientX;
        }
      }, { passive: true });
      window.addEventListener('touchend', () => { creatorDragging = false; });
      window.addEventListener('touchmove', (ev) => {
        if (!creatorDragging || !creatorActive || ev.touches.length === 0) return;
        creatorYaw += (ev.touches[0].clientX - creatorDragX) * 0.015;
        creatorDragX = ev.touches[0].clientX;
      }, { passive: true });
    } catch (err) {
      console.error('Erro ao inicializar preview 3D:', err);
    }
  }

  function syncSpeciesUI() {
    speciesButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.species === selectedSpecies);
    });
    const allowBeard = selectedSpecies === 'man';
    ccInputs.beard.disabled = !allowBeard;
    if (!allowBeard) ccInputs.beard.value = 'none';
  }

  function updateCreatorLiveTag(formData) {
    if (!creatorLiveTag) return;
    const spLabel = formData.species === 'woman' ? 'Mulher' : (formData.species === 'dog' ? 'Cachorro' : 'Homem');
    creatorLiveTag.textContent = `${formData.name} • ${spLabel}`;
  }

  function readCreatorForm() {
    return {
      name: ccInputs.name.value.trim() || 'Visitante',
      species: selectedSpecies,
      hairStyle: ccInputs.hairStyle.value,
      outfit: ccInputs.outfit.value,
      beard: selectedSpecies === 'man' ? ccInputs.beard.value : 'none',
      glasses: ccInputs.glasses.value,
      skinColor: ccInputs.skinColor.value,
      hairColor: ccInputs.hairColor.value,
      shirtColor: ccInputs.shirtColor.value,
      pantsColor: ccInputs.pantsColor.value,
      shoesColor: ccInputs.shoesColor.value
    };
  }

  function fillCreatorForm(data) {
    selectedSpecies = ['man', 'woman', 'dog'].includes(data.species) ? data.species : 'man';
    ccInputs.name.value = data.name || 'Visitante';
    ccInputs.hairStyle.value = data.hairStyle || 'short';
    ccInputs.outfit.value = data.outfit || 'unigran';
    ccInputs.beard.value = selectedSpecies === 'man' ? (data.beard || 'none') : 'none';
    ccInputs.glasses.value = data.glasses || 'none';
    ccInputs.skinColor.value = data.skinColor || '#dc986a';
    ccInputs.hairColor.value = data.hairColor || '#24150e';
    ccInputs.shirtColor.value = data.shirtColor || '#004274';
    ccInputs.pantsColor.value = data.pantsColor || '#1e293b';
    ccInputs.shoesColor.value = data.shoesColor || '#f1f5f9';
    syncSpeciesUI();
  }

  function rebuildCreatorModel() {
    initCreatorPreview();
    const formData = readCreatorForm();
    updateCreatorLiveTag(formData);
    if (!creatorScene || !creatorRenderer) return;
    if (creatorRig) creatorScene.remove(creatorRig);
    const built = GameEntities.buildCustomHero3D(formData);
    creatorRig = built.rig;
    creatorParts = built.parts;
    creatorRig.rotation.y = creatorYaw;
    creatorScene.add(creatorRig);
    creatorRenderer.render(creatorScene, creatorCamera);
  }

  speciesButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const prevSpecies = selectedSpecies;
      selectedSpecies = btn.dataset.species;

      // Ajustes inteligentes ao trocar entre Homem, Mulher e Cachorro
      if (selectedSpecies === 'woman' && ccInputs.hairStyle.value === 'short') {
        ccInputs.hairStyle.value = 'long';
      } else if (selectedSpecies === 'man' && (ccInputs.hairStyle.value === 'long' || ccInputs.hairStyle.value === 'ponytail')) {
        ccInputs.hairStyle.value = 'short';
      } else if (selectedSpecies === 'dog') {
        if (ccInputs.hairStyle.value === 'short' || ccInputs.hairStyle.value === 'long') {
          ccInputs.hairStyle.value = 'none';
        }
        if (prevSpecies !== 'dog' && ccInputs.skinColor.value.toLowerCase() === '#dc986a') {
          ccInputs.skinColor.value = '#059be5';
        }
      }
      if (prevSpecies === 'dog' && selectedSpecies !== 'dog' && ccInputs.skinColor.value.toLowerCase() === '#059be5') {
        ccInputs.skinColor.value = '#dc986a';
        ccInputs.hairStyle.value = selectedSpecies === 'woman' ? 'long' : 'short';
      }

      syncSpeciesUI();
      rebuildCreatorModel();
    });
  });

  Object.values(ccInputs).forEach((el) => {
    el.addEventListener('input', rebuildCreatorModel);
    el.addEventListener('change', rebuildCreatorModel);
  });

  function openMidTourEditor() {
    if (gameState !== 'playing') return;
    isEditingMidTour = true;
    creatorActive = true;
    gameState = 'paused';
    fillCreatorForm(GameEntities.getCustomHeroData());
    rebuildCreatorModel();
    btnCreatorCancel.classList.remove('hidden');
    btnStart.textContent = 'Salvar Alterações no Tour';
    titleScreen.classList.remove('hidden');
  }

  function closeMidTourEditor() {
    if (!isEditingMidTour) return;
    isEditingMidTour = false;
    creatorActive = false;
    titleScreen.classList.add('hidden');
    gameState = 'playing';
  }

  document.getElementById('btn-open-creator-hud').addEventListener('click', openMidTourEditor);
  btnCreatorCancel.addEventListener('click', closeMidTourEditor);

  document.getElementById('btn-creator-random').addEventListener('click', () => {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const sp = pick(['man', 'woman', 'dog']);
    const hairBySpecies = {
      man: ['short', 'curly', 'spiky', 'cap', 'grad'],
      woman: ['long', 'ponytail', 'curly', 'cap', 'grad'],
      dog: ['none', 'cap', 'grad']
    };
    const skinBySpecies = {
      man: ['#dc986a', '#e8b48a', '#b67852', '#8d5524'],
      woman: ['#e6b08a', '#dc986a', '#b67852', '#8d5524'],
      dog: ['#059be5', '#d99b52', '#b45309', '#94a3b8']
    };
    fillCreatorForm({
      name: pick(['Visitante UNIGRAN', 'Futuro Formando', 'Calouro 3D', 'Explorador', 'Caramelo UNIGRAN']),
      species: sp,
      hairStyle: pick(hairBySpecies[sp]),
      outfit: pick(['unigran', 'labcoat', 'jersey', 'plain']),
      beard: sp === 'man' ? pick(['none', 'full']) : 'none',
      glasses: pick(['none', 'clear', 'shades']),
      skinColor: pick(skinBySpecies[sp]),
      hairColor: pick(['#1a1412', '#432415', '#7c4a21', '#d97706', '#1e293b']),
      shirtColor: pick(['#004274', '#0d9488', '#6d28d9', '#dc2626', '#facc15', '#2563eb']),
      pantsColor: pick(['#1e293b', '#254f88', '#111827', '#334155']),
      shoesColor: pick(['#f1f5f9', '#18181b', '#facc15', '#0284c7'])
    });
    rebuildCreatorModel();
  });

  btnStart.addEventListener('click', () => {
    if (creatorRig && creatorRenderer && creatorScene && creatorCamera) {
      creatorRig.rotation.y = 0.25;
      creatorRenderer.render(creatorScene, creatorCamera);
    }
    let snapshot = 'img/logo.png';
    try { snapshot = creatorCanvas.toDataURL('image/png'); } catch (_) {}

    const data = readCreatorForm();
    data.portraitDataUrl = snapshot;
    GameEntities.saveCustomHeroData(data);

    if (isEditingMidTour) {
      GameEntities.rebuildVisitorActor(player, data);
      updateVisitorHUD();
      isEditingMidTour = false;
      creatorActive = false;
      titleScreen.classList.add('hidden');
      gameState = 'playing';
      GameAudio.rupee();
      showToast(`${data.name} atualizado!`, 'Continue explorando os cursos e quizzes da UNIGRAN!', 2.6);
    } else {
      GameAudio.init();
      initNewTour();
      creatorActive = false;
      titleScreen.classList.add('hidden');
      hud.classList.remove('hidden');
      gameState = 'playing';
      showToast(
        `Bem-vindo à UNIGRAN Capital, ${data.name}!`,
        'Entrada pela R. Abrão Júlio Rahe, 325! Explore o Bloco A (Esquerda), Bloco B (Direita) e Bloco C (Norte) nos 2 andares!',
        5.5
      );
    }
  });

  // Inicializa mundo de fundo e preview 3D na tela inicial
  initNewTour();
  fillCreatorForm(GameEntities.getCustomHeroData());
  rebuildCreatorModel();

  // ==================== CONTROLES ====================
  window.addEventListener('keydown', (e) => {
    // Bloqueia atalhos globais quando digitando em input/select ou no customizador inicial
    if (creatorActive) {
      if (e.code === 'Escape' && isEditingMidTour) closeMidTourEditor();
      return;
    }
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT')) {
      return;
    }

    if (gameState === 'arcade') {
      if (e.code === 'Escape') closeArcadeModal();
      return;
    }

    // Atalhos dentro do Modal de Quiz (teclas 1-4 para responder, Enter/Espaço para avançar)
    if (gameState === 'quiz') {
      if (!activeQuizAnswered) {
        if (e.code === 'Digit1') { handleQuizAnswer(0); return; }
        if (e.code === 'Digit2') { handleQuizAnswer(1); return; }
        if (e.code === 'Digit3') { handleQuizAnswer(2); return; }
        if (e.code === 'Digit4') { handleQuizAnswer(3); return; }
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        if (!quizResultBox.classList.contains('hidden')) closeQuizModal();
        else advanceQuiz();
      }
      return;
    }

    keys[e.code] = true;

    if (e.code === 'KeyM') {
      const muted = GameAudio.toggleMute();
      btnSound.textContent = muted ? '🔇' : '🔊';
      return;
    }

    if (e.code === 'KeyH' && (gameState === 'playing' || (gameState === 'paused' && !creatorActive))) {
      toggleHelp();
      return;
    }

    if (gameState === 'dialogue') {
      if (e.code === 'Enter' && activeDialogueNpc && activeDialogueNpc.quiz) {
        e.preventDefault();
        const targetNpc = activeDialogueNpc;
        closeDialogue();
        openQuiz(targetNpc);
        return;
      }
      if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Escape' || e.code === 'Enter') {
        e.preventDefault();
        closeDialogue();
      }
      return;
    }

    if (gameState !== 'playing') return;

    if (e.code === 'KeyP') {
      openMidTourEditor();
    } else if (e.code === 'KeyE') {
      handleInteract();
    } else if (e.code === 'Space' || e.code === 'KeyF') {
      if (isPlayerInGym()) {
        e.preventDefault();
        handleGymSpaceAction();
      }
    } else if (e.code === 'KeyV') {
      resetCameraView();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  // Arrastar com mouse para girar câmera OU clicar nos computadores dos Labs de Eng. de Software para abrir GameLuta / Jogo de Fase!
  canvas.addEventListener('mousedown', (e) => {
    if (gameState !== 'playing') return;
    if (e.button === 0 || e.button === 2) {
      camDragging = true;
      camDragMoved = false;
      camDownX = e.clientX;
      camDownY = e.clientY;
      camLastX = e.clientX;
      camLastY = e.clientY;
      canvas.classList.add('dragging');
    }
  });
  window.addEventListener('mouseup', (e) => {
    const wasClick = camDragging && !camDragMoved && gameState === 'playing' && e.button === 0;
    camDragging = false;
    canvas.classList.remove('dragging');

    // Clique direto nos computadores do 2º Andar do Bloco A abre GameLuta ou Jogo de Fase!
    if (wasClick && world && world.clickableMeshes && world.clickableMeshes.length > 0 && player && player.pos.y >= 6.0) {
      const rect = canvas.getBoundingClientRect();
      pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNDC, camera);
      const hits = raycaster.intersectObjects(world.clickableMeshes, false);
      if (hits.length > 0 && hits[0].object.userData && hits[0].object.userData.arcadeGame) {
        openArcadeModal(hits[0].object.userData.arcadeGame);
      }
    }
  });
  window.addEventListener('mousemove', (e) => {
    if (!camDragging || gameState !== 'playing') return;
    const dx = e.clientX - camLastX;
    const dy = e.clientY - camLastY;
    if (Math.hypot(e.clientX - camDownX, e.clientY - camDownY) > 6) camDragMoved = true;
    camLastX = e.clientX;
    camLastY = e.clientY;
    targetCamYaw -= dx * 0.0085;
    targetCamPitch = Math.max(0.20, Math.min(1.24, targetCamPitch + dy * 0.0065));
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('dblclick', () => {
    if (gameState === 'playing') resetCameraView();
  });

  canvas.addEventListener('touchstart', (e) => {
    if (gameState !== 'playing' || e.touches.length !== 1) return;
    camDragging = true;
    camLastX = e.touches[0].clientX;
    camLastY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', () => { camDragging = false; });
  window.addEventListener('touchmove', (e) => {
    if (!camDragging || gameState !== 'playing' || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - camLastX;
    const dy = e.touches[0].clientY - camLastY;
    camLastX = e.touches[0].clientX;
    camLastY = e.touches[0].clientY;
    targetCamYaw -= dx * 0.009;
    targetCamPitch = Math.max(0.20, Math.min(1.24, targetCamPitch + dy * 0.007));
  }, { passive: true });

  window.addEventListener('wheel', (e) => {
    if (gameState !== 'playing') return;
    targetCamZoom = Math.max(0.55, Math.min(1.85, targetCamZoom + Math.sign(e.deltaY) * 0.08));
  }, { passive: true });

  const btnCamReset = document.getElementById('btn-cam-reset');
  if (btnCamReset) btnCamReset.addEventListener('click', resetCameraView);

  btnSound.addEventListener('click', () => {
    const muted = GameAudio.toggleMute();
    btnSound.textContent = muted ? '🔇' : '🔊';
  });

  function renderHelpCourseList() {
    const listEl = document.getElementById('help-course-list');
    if (!listEl) return;
    const blocks = [
      { id: 'bloco_a', title: 'BLOCO A (Logo após o Portão — 3 Andares: Informações, EMAJUC, Biblioteca, Auditório/Salas e 2 Labs com 40 PCs)', color: '#0369a1' },
      { id: 'bloco_b', title: 'BLOCO B (Leste — 2 Andares • Publicidade/Podcast, Arquitetura & Design)', color: '#6d28d9' },
      { id: 'bloco_c', title: 'BLOCO C (Norte — 2 Andares • Saúde, Microscópios & Clínicas)', color: '#0f766e' },
      { id: 'ginasio', title: 'GINÁSIO POLIESPORTIVO (Do outro lado da Rua das Garças)', color: '#c2410c' }
    ];
    listEl.innerHTML = blocks.map((blk) => {
      const items = npcs
        .filter((n) => n.quiz && n.buildingId === blk.id)
        .map((n) => {
          const done = stats.completedQuizzes.has(n.quiz.id);
          const floor = n.y >= 6.4 ? ' (2º)' : (n.y >= 2.2 ? ' (1º)' : ' (Térreo)');
          return `<span class="course-tag ${done ? 'done' : ''}">${done ? '✓ ' : ''}${n.courseName}${floor}</span>`;
        })
        .join(' ');
      return `<li><b style="color:${blk.color}">${blk.title}:</b><div class="course-tags-wrap">${items}</div></li>`;
    }).join('') +
      `<li><b>Dica dos 40 PCs:</b> Suba as 2 escadas no <b>Bloco A</b> até os Labs de Engenharia de Software e <b>clique nos computadores</b> (ou aperte <b>E</b>) para jogar o <b>GameLuta</b> e o <b>Jogo de Fase UNIGRAN</b>!</li>`;
  }

  function toggleHelp() {
    if (gameState === 'playing') {
      gameState = 'paused';
      renderHelpCourseList();
      helpModal.classList.remove('hidden');
    } else if (gameState === 'paused' && !creatorActive) {
      gameState = 'playing';
      helpModal.classList.add('hidden');
    }
  }

  document.getElementById('btn-help').addEventListener('click', toggleHelp);
  document.getElementById('btn-close-help').addEventListener('click', toggleHelp);

  document.getElementById('btn-continue-explore').addEventListener('click', () => {
    victoryScreen.classList.add('hidden');
    gameState = 'playing';
  });

  document.getElementById('btn-restart-victory').addEventListener('click', () => {
    victoryScreen.classList.add('hidden');
    initNewTour();
    gameState = 'playing';
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ==================== LOOP PRINCIPAL ====================
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(0.033, clock.getDelta());
    const elapsed = clock.elapsedTime;

    GameWorld.updateWorld(world, dt, elapsed);
    updateNPCs(dt, elapsed);

    if (gameState === 'playing') {
      stats.playTime += dt;
      updatePlayer(dt, elapsed);
      updateGymSports(dt, elapsed);
      updateEffects(dt);
      minimapFrameCounter++;
      if (minimapFrameCounter % 4 === 0) drawMinimap();
    } else {
      updateGymSports(dt, elapsed);
      updateEffects(dt);
    }

    updateCamera(dt, elapsed);
    renderer.render(scene, camera);

    if (creatorActive && creatorRenderer && creatorRig) {
      if (!creatorDragging) creatorYaw += dt * 0.7;
      creatorRig.rotation.y = creatorYaw;
      if (creatorParts) {
        creatorParts.bodyPivot.position.y = Math.sin(elapsed * 3.5) * 0.04;
        creatorParts.leftArm.rotation.z = 0.08 + Math.sin(elapsed * 3.5) * 0.03;
        creatorParts.rightArm.rotation.z = -0.08 - Math.sin(elapsed * 3.5) * 0.03;
        if (creatorParts.tail) creatorParts.tail.rotation.y = Math.sin(elapsed * 8) * 0.4;
      }
      creatorRenderer.render(creatorScene, creatorCamera);
    }
  }

  animate();
})();
