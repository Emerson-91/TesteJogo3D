// UNIGRAN Capital 3D Fiel — R. Abrão Júlio Rahe, 325 • Bloco A (3 Andares: Balcão, EMAJUC, Biblioteca, Auditório/Salas e 2 Labs Eng. Software com 40 PCs), Bloco B, Bloco C e Ginásio na R. das Garças
window.GameWorld = (() => {
  const WORLD_SIZE = 220;
  const WORLD_HALF = WORLD_SIZE / 2; // 110
  const WORLD_LIMIT = 104;
  const FLOOR2_Y = 4.2;
  const FLOOR3_Y = 8.4;

  // ==================== LOGO 3D EXTRUDADA EXATA DE img/logo.png (UNIGRAN) ====================
  function createUnigran3DLogo(scale = 1.0, depth = 0.22) {
    const logoGroup = new THREE.Group();
    const extrudeOpts = {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.032,
      bevelSize: 0.024,
      bevelSegments: 2,
      curveSegments: 14
    };

    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(-0.73, -0.44);
    arrowShape.lineTo(-0.54, -0.29);
    arrowShape.lineTo(-0.54, 0.24);
    arrowShape.quadraticCurveTo(-0.54, 0.57, -0.20, 0.57);
    arrowShape.lineTo(0.38, 0.57);
    arrowShape.lineTo(0.38, 0.37);
    arrowShape.lineTo(0.74, 0.67);
    arrowShape.lineTo(0.38, 0.97);
    arrowShape.lineTo(0.38, 0.77);
    arrowShape.lineTo(-0.22, 0.77);
    arrowShape.quadraticCurveTo(-0.73, 0.77, -0.73, 0.24);
    arrowShape.lineTo(-0.73, -0.44);

    const arrowGeo = new THREE.ExtrudeGeometry(arrowShape, extrudeOpts);
    arrowGeo.translate(0, 0, -depth * 0.5);

    const matYellow = new THREE.MeshLambertMaterial({ color: 0xf7d426, emissive: 0x5c4600, emissiveIntensity: 0.25 });
    logoGroup.add(new THREE.Mesh(arrowGeo, matYellow));

    const matBlue = new THREE.MeshLambertMaterial({ color: 0x1c84c8, emissive: 0x073b63, emissiveIntensity: 0.28 });
    const blueArrow = new THREE.Mesh(arrowGeo, matBlue);
    blueArrow.rotation.z = Math.PI;
    logoGroup.add(blueArrow);

    const uShape = new THREE.Shape();
    uShape.moveTo(-0.33, 0.35);
    uShape.lineTo(-0.14, 0.35);
    uShape.lineTo(-0.14, -0.05);
    uShape.quadraticCurveTo(-0.14, -0.19, 0.0, -0.19);
    uShape.quadraticCurveTo(0.14, -0.19, 0.14, -0.05);
    uShape.lineTo(0.14, 0.35);
    uShape.lineTo(0.33, 0.35);
    uShape.lineTo(0.33, -0.35);
    uShape.lineTo(-0.02, -0.35);
    uShape.quadraticCurveTo(-0.33, -0.35, -0.33, -0.03);
    uShape.lineTo(-0.33, 0.35);

    const uGeo = new THREE.ExtrudeGeometry(uShape, { ...extrudeOpts, depth: depth * 1.08 });
    uGeo.translate(0, 0, -depth * 0.54);
    const matNavyU = new THREE.MeshLambertMaterial({ color: 0x004274, emissive: 0x001b36, emissiveIntensity: 0.32 });
    logoGroup.add(new THREE.Mesh(uGeo, matNavyU));

    logoGroup.scale.setScalar(scale);
    return logoGroup;
  }

  function createUnigranLogoTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const tex = new THREE.CanvasTexture(canvas);
    if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;

    function drawBanner(logoImg) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1024, 256);
      ctx.fillStyle = '#004274';
      ctx.fillRect(0, 0, 1024, 20);
      ctx.fillRect(0, 236, 1024, 20);
      ctx.fillStyle = '#f7d426';
      ctx.fillRect(0, 20, 1024, 7);
      ctx.fillRect(0, 229, 1024, 7);

      if (logoImg) ctx.drawImage(logoImg, 44, 34, 188, 188);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#004274';
      ctx.font = '900 104px sans-serif';
      ctx.fillText('UNIGRAN CAPITAL', 252, 108);
      ctx.fillStyle = '#1c84c8';
      ctx.font = '800 32px sans-serif';
      ctx.fillText('R. ABRÃO JÚLIO RAHE, 325  •  CAMPO GRANDE - MS', 256, 184);
      tex.needsUpdate = true;
    }

    drawBanner(null);
    const img = new Image();
    img.onload = () => drawBanner(img);
    img.src = 'img/logo.png';
    return tex;
  }

  function createSignTexture(title, bgColor = '#004274', textColor = '#f7d426', subtitle = '') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 496, 112);
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (subtitle) {
      const fSize = title.length > 22 ? 26 : 33;
      ctx.font = `900 ${fSize}px sans-serif`;
      ctx.fillText(title, 256, 46);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 19px sans-serif';
      ctx.fillText(subtitle, 256, 90);
    } else {
      const fSize = title.length > 26 ? 23 : (title.length > 18 ? 29 : 35);
      ctx.font = `900 ${fSize}px sans-serif`;
      ctx.fillText(title, 256, 66);
    }
    const tex = new THREE.CanvasTexture(canvas);
    if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function createCodeScreenTexture(variant = 'code') {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (variant === 'luta') {
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, 160, 100);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(10, 12, 56, 10);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(94, 12, 56, 10);
      ctx.fillStyle = '#facc15';
      ctx.font = '900 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME LUTA', 80, 54);
      ctx.fillStyle = '#38e8ff';
      ctx.font = '700 12px sans-serif';
      ctx.fillText('CLIQUE P/ JOGAR', 80, 78);
    } else if (variant === 'fase') {
      ctx.fillStyle = '#0c4a6e';
      ctx.fillRect(0, 0, 160, 100);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, 78, 160, 22);
      ctx.fillStyle = '#facc15';
      ctx.font = '900 17px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('JOGO DE FASE', 80, 42);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 12px sans-serif';
      ctx.fillText('UNIGRAN • CLIQUE', 80, 64);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 160, 100);
      const cols = ['#38e8ff', '#a855f7', '#34d399', '#facc15', '#f472b6'];
      for (let y = 10; y < 88; y += 10) {
        ctx.fillStyle = cols[(y / 10) % cols.length];
        const indent = ((y * 7) % 3) * 10 + 8;
        ctx.fillRect(indent, y, 42 + ((y * 13) % 68), 5);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function createDiplomaMesh(scale = 1.0) {
    const g = new THREE.Group();
    const scroll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16 * scale, 0.16 * scale, 0.88 * scale, 10),
      new THREE.MeshLambertMaterial({ color: 0xfef9e7, emissive: 0x6b5620, emissiveIntensity: 0.38 })
    );
    scroll.rotation.z = Math.PI / 2;
    g.add(scroll);
    const ribbon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.185 * scale, 0.185 * scale, 0.18 * scale, 10),
      new THREE.MeshLambertMaterial({ color: 0xdc2626, emissive: 0x7f1d1d, emissiveIntensity: 0.42 })
    );
    ribbon.rotation.z = Math.PI / 2;
    g.add(ribbon);
    const seal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.14 * scale, 0),
      new THREE.MeshLambertMaterial({ color: 0xf5c842, emissive: 0xf59e0b, emissiveIntensity: 0.85 })
    );
    seal.position.set(0, 0.16 * scale, 0.14 * scale);
    g.add(seal);
    g.rotation.x = 0.25;
    return g;
  }

  // ==================== CHÃO URBANO LIMPO (NENHUM PRÉDIO EM CIMA DAS ESCRITAS!) ====================
  function createCampusGroundTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const toPx = (v) => ((v + WORLD_HALF) / WORLD_SIZE) * size;
    const toLen = (l) => (l / WORLD_SIZE) * size;

    ctx.fillStyle = '#559e4d';
    ctx.fillRect(0, 0, size, size);

    // Base do quarteirão UNIGRAN Capital (x: -60..60, z: -56..58)
    ctx.fillStyle = '#cfc9be';
    ctx.fillRect(toPx(-60), toPx(-56), toLen(120), toLen(114));

    ctx.strokeStyle = 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 1;
    for (let x = -58; x <= 58; x += 4) {
      ctx.beginPath();
      ctx.moveTo(toPx(x), toPx(-56));
      ctx.lineTo(toPx(x), toPx(58));
      ctx.stroke();
    }
    for (let z = -54; z <= 56; z += 4) {
      ctx.beginPath();
      ctx.moveTo(toPx(-60), toPx(z));
      ctx.lineTo(toPx(60), toPx(z));
      ctx.stroke();
    }

    // Calçada & Pátio do Ginásio do outro lado da Rua das Garças (Norte: z=-104..-74)
    ctx.fillStyle = '#cfc9be';
    ctx.fillRect(toPx(-28), toPx(-104), toLen(56), toLen(30));

    // Pátio Central / Corredor da Entrada Principal
    ctx.fillStyle = '#e5e0d6';
    ctx.fillRect(toPx(-7), toPx(-26), toLen(14), toLen(84));
    ctx.fillRect(toPx(-34), toPx(-10), toLen(68), toLen(12));

    // Círculo Central da Praça UNIGRAN (atrás do Bloco A, entre Blocos A, B e C!)
    ctx.fillStyle = '#d6d2c8';
    ctx.beginPath();
    ctx.arc(toPx(0), toPx(-4), toLen(10.5), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#004274';
    ctx.lineWidth = 5.5;
    ctx.stroke();

    // Estacionamento Interno Oeste (x=-56..-32, z=-16..34)
    ctx.fillStyle = '#5a636d';
    ctx.fillRect(toPx(-56), toPx(-16), toLen(24), toLen(50));
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    for (let z = -12; z <= 30; z += 4.5) {
      ctx.beginPath();
      ctx.moveTo(toPx(-55), toPx(z));
      ctx.lineTo(toPx(-47), toPx(z));
      ctx.moveTo(toPx(-41), toPx(z));
      ctx.lineTo(toPx(-33), toPx(z));
      ctx.stroke();
    }

    // ==================== 4 RUAS REAIS TOTALMENTE DESIMPEDIDAS ====================
    // Sul: Rua Abrão Júlio Rahe (z = 60..76)
    // Norte: Rua das Garças (z = -74..-58)
    // Oeste: Rua José Antônio (x = -78..-62)
    // Leste: Rua Padre João Crippa (x = 62..78)
    ctx.fillStyle = '#333b44';
    ctx.fillRect(0, toPx(60), size, toLen(16));
    ctx.fillRect(0, toPx(-74), size, toLen(16));
    ctx.fillRect(toPx(-78), 0, toLen(16), size);
    ctx.fillRect(toPx(62), 0, toLen(16), size);

    // Meio-fio claro ao redor do quarteirão
    ctx.strokeStyle = '#ece7dc';
    ctx.lineWidth = 4;
    ctx.strokeRect(toPx(-62), toPx(-58), toLen(124), toLen(118));

    // Faixa amarela central nas ruas
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([16, 14]);
    ctx.beginPath();
    ctx.moveTo(0, toPx(68)); ctx.lineTo(size, toPx(68));
    ctx.moveTo(0, toPx(-66)); ctx.lineTo(size, toPx(-66));
    ctx.moveTo(toPx(-70), 0); ctx.lineTo(toPx(-70), size);
    ctx.moveTo(toPx(70), 0); ctx.lineTo(toPx(70), size);
    ctx.stroke();
    ctx.setLineDash([]);

    // Faixa de pedestres na Rua Abrão Júlio Rahe (em frente ao portão x=0)
    ctx.fillStyle = '#f8fafc';
    for (let sx = -4.5; sx <= 4.5; sx += 1.5) {
      ctx.fillRect(toPx(sx - 0.42), toPx(61.0), toLen(0.84), toLen(14.0));
    }
    // Faixa de pedestres na Rua das Garças (ligando Bloco C ao Ginásio!)
    for (let sx = -4.5; sx <= 4.5; sx += 1.5) {
      ctx.fillRect(toPx(sx - 0.42), toPx(-73.0), toLen(0.84), toLen(14.0));
    }

    // Escritas das ruas posicionadas em áreas 100% livres (longe de faixas, carros e prédios!)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RUA ABRÃO JÚLIO RAHE • Nº 325', toPx(-34), toPx(72));
    ctx.fillText('RUA ABRÃO JÚLIO RAHE • ENTRADA', toPx(34), toPx(72));
    ctx.fillText('RUA DAS GARÇAS • BLOCO C', toPx(-34), toPx(-62));
    ctx.fillText('RUA DAS GARÇAS • GINÁSIO', toPx(34), toPx(-62));

    ctx.save();
    ctx.translate(toPx(-74), toPx(4));
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('RUA JOSÉ ANTÔNIO', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(toPx(74), toPx(4));
    ctx.rotate(Math.PI / 2);
    ctx.fillText('RUA PADRE JOÃO CRIPPA', 0, 0);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function buildWorld(scene) {
    const world = {
      size: WORLD_SIZE,
      half: WORLD_HALF,
      limit: WORLD_LIMIT,
      floor2Y: FLOOR2_Y,
      floor3Y: FLOOR3_Y,
      circles: [],
      boxes: [],
      stairs: [],
      upperSlabs: [],
      buildings: [],
      chests: [],
      signs: [],
      arcadeStations: [],   // Estações de PC interativas (E ou clique!) -> GameLuta & Jogo UNIGRAN!
      clickableMeshes: [],  // Meshes clicáveis com Raycaster no Lab de Informática!
      pedestalDiplomas: [],
      centralLogo: null,
      fountains: [],
      waterMesh: null,
      isWaterBlocked: () => false,
      fireflies: null,
      fairyOrbs: []
    };

    const group = new THREE.Group();
    scene.add(group);
    world.root = group;

    // Materiais leves (MeshLambertMaterial -> 60 FPS constantes!)
    const matCream = new THREE.MeshLambertMaterial({ color: 0xf1ece1 });
    const matUnigranBlue = new THREE.MeshLambertMaterial({ color: 0x004274 });
    const matUnigranLight = new THREE.MeshLambertMaterial({ color: 0x1c84c8 });
    const matHealthTeal = new THREE.MeshLambertMaterial({ color: 0x0d9488 });
    const matPubPurple = new THREE.MeshLambertMaterial({ color: 0x6d28d9 });
    const matMarble = new THREE.MeshLambertMaterial({ color: 0xe2e6eb });
    const matFloorTile = new THREE.MeshLambertMaterial({ color: 0xeae7e0 });
    const matFloorWood = new THREE.MeshLambertMaterial({ color: 0xc9a377 });
    const matFloorTech = new THREE.MeshLambertMaterial({ color: 0xdbe3ec });
    const matDarkStudio = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const matStoneDark = new THREE.MeshLambertMaterial({ color: 0x5c6670 });
    const matGlass = new THREE.MeshLambertMaterial({ color: 0x7dd3fc, emissive: 0x1e6091, emissiveIntensity: 0.35, transparent: true, opacity: 0.76 });
    const matGold = new THREE.MeshLambertMaterial({ color: 0xf7d426, emissive: 0x5c4200, emissiveIntensity: 0.35 });
    const matWood = new THREE.MeshLambertMaterial({ color: 0x8a562a });
    const matWoodDark = new THREE.MeshLambertMaterial({ color: 0x5a3518 });
    const matIron = new THREE.MeshLambertMaterial({ color: 0x242c36 });
    const matTrunk = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
    const matLeaves1 = new THREE.MeshLambertMaterial({ color: 0x2a803c });
    const matLeaves2 = new THREE.MeshLambertMaterial({ color: 0x3ea34d });
    const matRailing = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.36 });
    const matWhite = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const matGreen = new THREE.MeshLambertMaterial({ color: 0x16a34a });
    const matRed = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
    const matPink = new THREE.MeshLambertMaterial({ color: 0xec4899 });
    const matOrange = new THREE.MeshLambertMaterial({ color: 0xea580c });
    const matDivider = new THREE.MeshLambertMaterial({ color: 0xd4cfc4 });
    const matBoard = new THREE.MeshLambertMaterial({ color: 0x14532d });
    const codeScreenMat = new THREE.MeshBasicMaterial({ map: createCodeScreenTexture('code') });
    const lutaScreenMat = new THREE.MeshBasicMaterial({ map: createCodeScreenTexture('luta') });
    const faseScreenMat = new THREE.MeshBasicMaterial({ map: createCodeScreenTexture('fase') });

    // ==================== CHÃO DO QUARTEIRÃO UNIGRAN CAPITAL ====================
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE),
      new THREE.MeshLambertMaterial({ map: createCampusGroundTexture() })
    );
    ground.rotation.x = -Math.PI / 2;
    group.add(ground);

    // ==================== PÁTIO CENTRAL COM LOGO 3D UNIGRAN (atrás do Bloco A!) ====================
    const centerZ = -4;
    const dais = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.8, 0.36, 18), matMarble);
    dais.position.set(0, 0.18, centerZ);
    group.add(dais);

    const centralRing = new THREE.Mesh(new THREE.RingGeometry(3.4, 3.9, 32), matGold);
    centralRing.rotation.x = -Math.PI / 2;
    centralRing.position.set(0, 0.38, centerZ);
    group.add(centralRing);

    const monBase = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.38, 1.05, 8), matUnigranBlue);
    monBase.position.set(0, 0.8, centerZ);
    group.add(monBase);

    const monCap = new THREE.Mesh(new THREE.CylinderGeometry(1.24, 1.24, 0.16, 8), matGold);
    monCap.position.set(0, 1.38, centerZ);
    group.add(monCap);

    const centralLogo = createUnigran3DLogo(1.8, 0.28);
    centralLogo.position.set(0, 3.4, centerZ);
    group.add(centralLogo);
    world.centralLogo = centralLogo;
    world.circles.push({ x: 0, z: centerZ, r: 1.4, y: 0, active: true });

    for (let i = 0; i < 5; i++) {
      const ang = -Math.PI / 2 + (i / 5) * Math.PI * 2;
      const px = Math.cos(ang) * 3.8;
      const pz = centerZ + Math.sin(ang) * 3.8;
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.54, 0.88, 8), matMarble);
      ped.position.set(px, 0.56, pz);
      group.add(ped);
      world.circles.push({ x: px, z: pz, r: 0.62, y: 0, active: true });

      const dip = createDiplomaMesh(1.0);
      dip.position.set(px, 1.55, pz);
      dip.visible = false;
      group.add(dip);
      world.pedestalDiplomas.push(dip);
    }

    // ==================== PORTÃO PRINCIPAL NA RUA ABRÃO JÚLIO RAHE, 325 ====================
    const unigranLogoTex = createUnigranLogoTexture();
    addUnigranEntrancePortal(0, 54.5, unigranLogoTex);

    function addFrontFence(x1, x2, zPos) {
      const len = Math.abs(x2 - x1);
      const cx = (x1 + x2) / 2;
      const baseWall = new THREE.Mesh(new THREE.BoxGeometry(len, 1.1, 0.45), matCream);
      baseWall.position.set(cx, 0.55, zPos);
      group.add(baseWall);
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.16, 0.52), matUnigranBlue);
      topRail.position.set(cx, 1.18, zPos);
      group.add(topRail);
      world.boxes.push({ minX: x1, maxX: x2, minZ: zPos - 0.35, maxZ: zPos + 0.35, minY: 0, maxY: 2.2 });
    }
    addFrontFence(-58, -8.5, 54.5);
    addFrontFence(8.5, 58, 54.5);

    function addStreetSign(x, z, title, sub) {
      const sg = new THREE.Group();
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.2, 6), matIron);
      post.position.y = 1.6;
      sg.add(post);
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 1.2, 0.16),
        new THREE.MeshBasicMaterial({ map: createSignTexture(title, '#004274', '#f7d426', sub) })
      );
      board.position.y = 3.25;
      sg.add(board);
      sg.position.set(x, 0, z);
      group.add(sg);
      world.circles.push({ x, z, r: 0.4, y: 0, active: true });
    }
    addStreetSign(-13, 56.8, 'R. ABRÃO JÚLIO RAHE', 'Nº 325 • UNIGRAN CAPITAL');
    addStreetSign(13, -55.8, 'RUA DAS GARÇAS', 'BLOCO C  •  GINÁSIO DO OUTRO LADO');

    // ==================== HELPERS DE MOBILIÁRIO 3D ====================
    function addMicroscope(targetGrp, x, y, z) {
      const m = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.46), matIron);
      base.position.y = 0.04;
      m.add(base);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.56, 0.12), matWhite);
      arm.position.set(0, 0.32, -0.14);
      m.add(arm);
      const stage = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 0.32), matIron);
      stage.position.set(0, 0.28, 0.04);
      m.add(stage);
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.08), new THREE.MeshBasicMaterial({ color: 0x34d399 }));
      slide.position.set(0, 0.32, 0.04);
      m.add(slide);
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.42, 7), matWhite);
      tube.position.set(0, 0.56, 0.02);
      tube.rotation.x = 0.38;
      m.add(tube);
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.12, 6), matUnigranLight);
      lens.position.set(0, 0.42, 0.05);
      m.add(lens);
      m.position.set(x, y, z);
      targetGrp.add(m);
    }

    function addComputerStation(targetGrp, x, y, z, rotY = 0, screenMat = codeScreenMat, arcadeGameId = null) {
      const pc = new THREE.Group();
      const desk = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.8, 0.95), matMarble);
      desk.position.y = 0.4;
      pc.add(desk);
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.12), matIron);
      stand.position.set(0, 0.9, -0.14);
      pc.add(stand);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.65, 0.08), matIron);
      frame.position.set(0, 1.26, -0.14);
      pc.add(frame);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.56), screenMat);
      screen.position.set(0, 1.26, -0.09);
      pc.add(screen);
      const kb = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.22), matIron);
      kb.position.set(0, 0.83, 0.14);
      pc.add(kb);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.1, 0.54), matUnigranBlue);
      seat.position.set(0, 0.46, 0.72);
      pc.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.52, 0.1), matUnigranBlue);
      back.position.set(0, 0.74, 0.96);
      pc.add(back);

      if (arcadeGameId) {
        screen.userData.arcadeGame = arcadeGameId;
        frame.userData.arcadeGame = arcadeGameId;
        desk.userData.arcadeGame = arcadeGameId;
        world.clickableMeshes.push(screen, frame, desk);
      }

      pc.position.set(x, y, z);
      pc.rotation.y = rotY;
      targetGrp.add(pc);
    }

    // Constrói 40 COMPUTADORES REAIS (20 no Lab 1 + 20 no Lab 2) com InstancedMesh (60 FPS garantidos!) + Hitboxes clicáveis!
    function build40ComputersTwoLabs(targetGrp, yBase) {
      const pcPositions = [];
      // Lab 1 (Oeste do 2º Andar Bloco A: 4 fileiras x 5 computadores = 20 PCs!)
      // Lab 2 (Leste do 2º Andar Bloco A: 4 fileiras x 5 computadores = 20 PCs!)
      const rowsZ = [14.6, 18.2, 21.8, 25.4];
      const lab1X = [-22.8, -19.2, -15.6, -12.0, -8.4];
      const lab2X = [2.6, 6.2, 9.8, 13.4, 17.0];

      rowsZ.forEach((rz) => {
        lab1X.forEach((px) => pcPositions.push({ x: px, z: rz, lab: 1 }));
        lab2X.forEach((px) => pcPositions.push({ x: px, z: rz, lab: 2 }));
      });
      // Total exato = 40 computadores!

      const count = pcPositions.length;
      const deskInst = new THREE.InstancedMesh(new THREE.BoxGeometry(1.55, 0.78, 0.85), matMarble, count);
      const monInst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.96, 0.60, 0.08), matIron, count);
      const scrInst1 = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.88, 0.52), lutaScreenMat, 20);
      const scrInst2 = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.88, 0.52), faseScreenMat, 20);
      const chairInst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.52, 0.52, 0.52), matUnigranBlue, count);
      const kbInst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.56, 0.05, 0.2), matDarkStudio, count);

      const dObj = new THREE.Object3D();
      let i1 = 0, i2 = 0;
      pcPositions.forEach((p, idx) => {
        dObj.rotation.set(0, 0, 0);
        dObj.scale.set(1, 1, 1);

        dObj.position.set(p.x, yBase + 0.39, p.z);
        dObj.updateMatrix();
        deskInst.setMatrixAt(idx, dObj.matrix);

        dObj.position.set(p.x, yBase + 1.18, p.z - 0.14);
        dObj.updateMatrix();
        monInst.setMatrixAt(idx, dObj.matrix);

        dObj.position.set(p.x, yBase + 1.18, p.z - 0.09);
        dObj.updateMatrix();
        if (p.lab === 1) scrInst1.setMatrixAt(i1++, dObj.matrix);
        else scrInst2.setMatrixAt(i2++, dObj.matrix);

        dObj.position.set(p.x, yBase + 0.81, p.z + 0.16);
        dObj.updateMatrix();
        kbInst.setMatrixAt(idx, dObj.matrix);

        dObj.position.set(p.x, yBase + 0.34, p.z + 0.68);
        dObj.updateMatrix();
        chairInst.setMatrixAt(idx, dObj.matrix);
      });

      targetGrp.add(deskInst, monInst, scrInst1, scrInst2, kbInst, chairInst);

      // Zonas clicáveis (Raycaster) cobrindo os 20 PCs do Lab 1 (GameLuta) e os 20 PCs do Lab 2 (Jogo de Fase)!
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitLab1 = new THREE.Mesh(new THREE.BoxGeometry(17.0, 1.8, 13.0), hitMat);
      hitLab1.position.set(-15.6, yBase + 0.9, 20.0);
      hitLab1.userData.arcadeGame = 'luta';
      targetGrp.add(hitLab1);
      world.clickableMeshes.push(hitLab1);

      const hitLab2 = new THREE.Mesh(new THREE.BoxGeometry(17.0, 1.8, 13.0), hitMat);
      hitLab2.position.set(9.8, yBase + 0.9, 20.0);
      hitLab2.userData.arcadeGame = 'fase';
      targetGrp.add(hitLab2);
      world.clickableMeshes.push(hitLab2);

      // Colisões leves das 4 fileiras (deixando corredores livres entre as fileiras para caminhar!)
      rowsZ.forEach((rz) => {
        world.boxes.push({ minX: -23.6, maxX: -7.6, minZ: rz - 0.45, maxZ: rz + 0.45, minY: yBase, maxY: yBase + 1.6 });
        world.boxes.push({ minX: 1.8, maxX: 17.8, minZ: rz - 0.45, maxZ: rz + 0.45, minY: yBase, maxY: yBase + 1.6 });
      });

      // Totens luminosos interativos [E] / Clique na entrada de cada Lab!
      [
        { x: -15.6, z: 28.4, game: 'luta', title: 'LAB 1 (20 PCs) • CLIQUE: GAME LUTA', bg: '#7f1d1d', fg: '#fde047' },
        { x: 9.8, z: 28.4, game: 'fase', title: 'LAB 2 (20 PCs) • CLIQUE: JOGO UNIGRAN', bg: '#0c4a6e', fg: '#7dd3fc' }
      ].forEach((st) => {
        const sign = new THREE.Mesh(
          new THREE.PlaneGeometry(7.2, 1.25),
          new THREE.MeshBasicMaterial({ map: createSignTexture(st.title, st.bg, st.fg) })
        );
        sign.position.set(st.x, yBase + 2.45, st.z);
        sign.userData.arcadeGame = st.game;
        targetGrp.add(sign);
        world.clickableMeshes.push(sign);

        const beacon = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.32, 0),
          new THREE.MeshBasicMaterial({ color: st.game === 'luta' ? 0xf97316 : 0x38e8ff })
        );
        beacon.position.set(st.x, yBase + 1.55, st.z);
        beacon.userData.arcadeGame = st.game;
        targetGrp.add(beacon);
        world.clickableMeshes.push(beacon);

        world.arcadeStations.push({
          x: st.x,
          z: st.z,
          y: yBase,
          game: st.game,
          beacon,
          label: st.game === 'luta'
            ? 'Jogar GameLuta no PC do Lab 1 (ou Clique nos PCs!)'
            : 'Jogar Jogo de Fase UNIGRAN no Lab 2 (ou Clique nos PCs!)'
        });
      });
    }

    function addBookshelfWithBooks(targetGrp, x, y, z, rotY = 0) {
      const shelf = new THREE.Group();
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.5, 0.78), matWoodDark);
      frame.position.y = 1.25;
      shelf.add(frame);
      const bookColors = [0xdc2626, 0x2563eb, 0xfacc15, 0x16a34a, 0x9333ea, 0xea580c];
      for (let row = 0; row < 3; row++) {
        for (let b = 0; b < 6; b++) {
          const bk = new THREE.Mesh(
            new THREE.BoxGeometry(0.34, 0.52, 0.6),
            new THREE.MeshLambertMaterial({ color: bookColors[(row * 3 + b) % bookColors.length] })
          );
          bk.position.set(-1.0 + b * 0.4, 0.48 + row * 0.74, 0.16);
          shelf.add(bk);
        }
      }
      shelf.position.set(x, y, z);
      shelf.rotation.y = rotY;
      targetGrp.add(shelf);
    }

    function addRoomPlaque(targetGrp, x, y, z, title, bg = '#004274', fg = '#f7d426', rotY = 0) {
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(6.0, 1.1),
        new THREE.MeshBasicMaterial({ map: createSignTexture(title, bg, fg) })
      );
      sign.position.set(x, y, z);
      sign.rotation.y = rotY;
      targetGrp.add(sign);
    }

    function addPodcastStudio(targetGrp, cx, yBase, cz) {
      const st = new THREE.Group();
      const rug = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.08, 6.2), matDarkStudio);
      rug.position.set(0, 0.12, 0);
      st.add(rug);
      const panel = new THREE.Mesh(new THREE.BoxGeometry(7.2, 3.0, 0.22), matDarkStudio);
      panel.position.set(0, 1.6, -2.6);
      st.add(panel);
      const onAir = new THREE.Mesh(
        new THREE.PlaneGeometry(4.6, 1.05),
        new THREE.MeshBasicMaterial({ map: createSignTexture('ON AIR • PODCAST', '#7f1d1d', '#fef08a') })
      );
      onAir.position.set(0, 2.45, -2.46);
      st.add(onAir);
      const table = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.9, 2.0), matWoodDark);
      table.position.set(0, 0.55, 0);
      st.add(table);
      const mixer = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 0.72), matIron);
      mixer.position.set(0, 1.06, 0.1);
      st.add(mixer);
      const mixerGlow = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.35), new THREE.MeshBasicMaterial({ color: 0x38e8ff }));
      mixerGlow.position.set(0, 1.15, 0.1);
      st.add(mixerGlow);
      [-1.5, 0, 1.5].forEach((mx) => {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.72, 6), matIron);
        arm.position.set(mx, 1.32, -0.35);
        arm.rotation.x = 0.45;
        st.add(arm);
        const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.28, 8), matStoneDark);
        mic.position.set(mx, 1.58, -0.1);
        mic.rotation.x = 0.6;
        st.add(mic);
        const pop = new THREE.Mesh(new THREE.SphereGeometry(0.095, 7, 7), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        pop.position.set(mx, 1.66, 0.02);
        st.add(pop);
      });
      const tripod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 1.9, 6), matIron);
      tripod.position.set(2.9, 0.95, 1.8);
      st.add(tripod);
      const ringLight = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.06, 6, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      ringLight.position.set(2.9, 2.05, 1.8);
      ringLight.rotation.y = -0.6;
      st.add(ringLight);
      [-1.5, 1.5].forEach((cxPos) => {
        const ch = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.9, 0.68), matPubPurple);
        ch.position.set(cxPos, 0.55, -1.45);
        st.add(ch);
      });
      st.position.set(cx, yBase, cz);
      targetGrp.add(st);
    }

    function addStaircase3D(targetGrp, minX, maxX, startZ, endZ, yBottom, yTop, signText, minYTrigger, maxYTrigger) {
      const stairW = maxX - minX;
      const stairLen = startZ - endZ;
      const deltaY = yTop - yBottom;
      const stepsCount = 12;
      for (let s = 0; s < stepsCount; s++) {
        const t = (s + 0.5) / stepsCount;
        const stepY = yBottom + t * deltaY;
        const stepZ = startZ - t * stairLen;
        const stepMesh = new THREE.Mesh(
          new THREE.BoxGeometry(stairW - 0.08, deltaY / stepsCount + 0.14, stairLen / stepsCount + 0.14),
          matMarble
        );
        stepMesh.position.set((minX + maxX) / 2, stepY - 0.07, stepZ);
        targetGrp.add(stepMesh);
      }
      const railLen = Math.hypot(stairLen, deltaY);
      const railMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, railLen), matGold);
      railMesh.position.set((minX + maxX) / 2 + stairW / 2 - 0.12, yBottom + deltaY * 0.5 + 0.78, (startZ + endZ) / 2);
      railMesh.rotation.x = Math.atan2(deltaY, stairLen);
      targetGrp.add(railMesh);

      const stairSign = new THREE.Mesh(
        new THREE.PlaneGeometry(4.2, 0.85),
        new THREE.MeshBasicMaterial({ map: createSignTexture(signText, '#004274', '#f7d426') })
      );
      stairSign.position.set((minX + maxX) / 2, yBottom + 2.2, endZ + 0.15);
      targetGrp.add(stairSign);

      world.stairs.push({
        minX: minX - 0.25,
        maxX: maxX + 0.25,
        minZ: endZ - 0.55,
        maxZ: startZ + 0.45,
        axis: 'z',
        startCoord: startZ,
        endCoord: endZ,
        yBottom,
        yTop,
        minYTrigger,
        maxYTrigger
      });
    }

    // ================================================================================
    // 1. BLOCO A (LOGO APÓS O PORTÃO NA R. ABRÃO JÚLIO RAHE — 3 ANDARES FIÉIS!)
    //    Térreo: Balcão de Informações, EMAJUC/Direito à direita, Biblioteca à frente, Adm à esquerda
    //    1º Andar (y=4.2): Salas de Aula + Auditório UNIGRAN
    //    2º Andar (y=8.4): 2 Laboratórios de Informática Eng. de Software (40 COMPUTADORES!) + Emerson + Jogos Clicáveis!
    // ================================================================================
    (function buildBlocoAThreeFloors() {
      const cx = 0, cz = 28, w = 52, d = 32;
      const minX = cx - w / 2, maxX = cx + w / 2; // -26..26
      const minZ = cz - d / 2, maxZ = cz + d / 2; // 12..44
      const wallThick = 0.75;
      const totalH = FLOOR3_Y + 4.2; // 12.6m (3 andares reais!)

      const bGroup = new THREE.Group();
      group.add(bGroup);
      const southUpperWall = new THREE.Group();
      bGroup.add(southUpperWall);
      const floor2Group = new THREE.Group();
      bGroup.add(floor2Group);
      const floor3Group = new THREE.Group();
      bGroup.add(floor3Group);
      const roofGroup = new THREE.Group();
      bGroup.add(roofGroup);

      // Piso do Térreo
      const floor1 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d), matFloorTile);
      floor1.position.set(cx, 0.05, cz);
      bGroup.add(floor1);

      function addSegWall(targetGrp, wx, wz, sw, sd, yBottom, h, mat) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(sw, h, sd), mat);
        m.position.set(wx, yBottom + h / 2, wz);
        targetGrp.add(m);
        world.boxes.push({
          minX: wx - sw / 2, maxX: wx + sw / 2,
          minZ: wz - sd / 2, maxZ: wz + sd / 2,
          minY: yBottom, maxY: yBottom + h
        });
      }

      const doors = { south: 7.4, north: 6.2, east: 5.2, west: 5.2 };
      ['north', 'south', 'east', 'west'].forEach((side) => {
        const doorW = doors[side];
        const isSouth = side === 'south';
        const targetUpper = isSouth ? southUpperWall : bGroup;

        if (side === 'north' || side === 'south') {
          const wz = side === 'north' ? minZ + wallThick / 2 : maxZ - wallThick / 2;
          const segW = (w - doorW) / 2;
          addSegWall(bGroup, minX + segW / 2, wz, segW, wallThick, 0, FLOOR2_Y, matCream);
          addSegWall(bGroup, maxX - segW / 2, wz, segW, wallThick, 0, FLOOR2_Y, matCream);
          const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorW, 0.5, wallThick + 0.14), matUnigranBlue);
          lintel.position.set(cx, FLOOR2_Y - 0.25, wz);
          bGroup.add(lintel);

          const welcomeMat = new THREE.Mesh(new THREE.PlaneGeometry(doorW, 2.8), new THREE.MeshBasicMaterial({ color: 0x1c84c8 }));
          welcomeMat.rotation.x = -Math.PI / 2;
          welcomeMat.position.set(cx, 0.13, side === 'north' ? minZ + 0.4 : maxZ - 0.4);
          bGroup.add(welcomeMat);

          // Paredes do 1º e 2º Andar (y = 4.2..12.6)
          addSegWall(targetUpper, cx, wz, w, wallThick, FLOOR2_Y, totalH - FLOOR2_Y, matCream);
          [FLOOR2_Y + 2.0, FLOOR3_Y + 2.0].forEach((wy) => {
            for (let wx = -22; wx <= 22; wx += 5.5) {
              const win = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, wallThick + 0.14), matGlass);
              win.position.set(cx + wx, wy, wz);
              targetUpper.add(win);
            }
          });
        } else {
          const wx = side === 'west' ? minX + wallThick / 2 : maxX - wallThick / 2;
          const segD = (d - doorW) / 2;
          addSegWall(bGroup, wx, minZ + segD / 2, wallThick, segD, 0, FLOOR2_Y, matCream);
          addSegWall(bGroup, wx, maxZ - segD / 2, wallThick, segD, 0, FLOOR2_Y, matCream);
          const lintel = new THREE.Mesh(new THREE.BoxGeometry(wallThick + 0.14, 0.5, doorW), matUnigranBlue);
          lintel.position.set(wx, FLOOR2_Y - 0.25, cz);
          bGroup.add(lintel);

          addSegWall(targetUpper, wx, cz, wallThick, d, FLOOR2_Y, totalH - FLOOR2_Y, matCream);
          [FLOOR2_Y + 2.0, FLOOR3_Y + 2.0].forEach((wy) => {
            for (let wz = -11; wz <= 11; wz += 5.5) {
              const win = new THREE.Mesh(new THREE.BoxGeometry(wallThick + 0.14, 1.6, 2.6), matGlass);
              win.position.set(wx, wy, cz + wz);
              targetUpper.add(win);
            }
          });
        }
      });

      // ==================== TÉRREO BLOCO A ====================
      // 1. BALCÃO DE INFORMAÇÕES logo após entrar pela porta Sul!
      const infoDesk = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.15, 1.4), matUnigranBlue);
      infoDesk.position.set(0, 0.58, 36.2);
      bGroup.add(infoDesk);
      const infoTop = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.14, 1.55), matGold);
      infoTop.position.set(0, 1.2, 36.2);
      bGroup.add(infoTop);
      addRoomPlaque(bGroup, 0, 2.45, 36.2, 'BALCÃO DE INFORMAÇÕES', '#004274', '#f7d426', 0);
      world.boxes.push({ minX: -3.3, maxX: 3.3, minZ: 35.4, maxZ: 37.0, minY: 0, maxY: 1.6 });

      // 2. À DIREITA: EMAJUC / DIREITO (Leste do Térreo)
      addRoomPlaque(bGroup, 24.9, 2.9, 34.0, 'EMAJUC • DIREITO', '#312e81', '#fde047', -Math.PI / 2);
      const juryBench = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.05, 6.2), matWoodDark);
      juryBench.position.set(22.2, 0.52, 34.0);
      bGroup.add(juryBench);
      const sPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.0, 6), matGold);
      sPole.position.set(22.2, 1.55, 34.0);
      bGroup.add(sPole);
      const sBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.1), matGold);
      sBar.position.set(22.2, 1.92, 34.0);
      bGroup.add(sBar);
      world.boxes.push({ minX: 21.3, maxX: 23.1, minZ: 30.8, maxZ: 37.2, minY: 0, maxY: 1.8 });

      // 3. À FRENTE DO BALCÃO: BIBLIOTECA UNIGRAN (Norte do Térreo, ampla e acessível com livros e PCs!)
      addRoomPlaque(bGroup, -11.5, 2.9, 12.9, 'BIBLIOTECA UNIGRAN', '#92400e', '#fef08a', 0);
      addRoomPlaque(bGroup, 12.5, 2.9, 12.9, 'ACERVO & PESQUISA', '#92400e', '#fef08a', 0);
      [-15.0, -10.5, 10.5, 15.0].forEach((bx) => {
        addBookshelfWithBooks(bGroup, bx, 0, 14.5, 0);
        world.boxes.push({ minX: bx - 1.45, maxX: bx + 1.45, minZ: 14.0, maxZ: 15.1, minY: 0, maxY: 2.5 });
      });
      addComputerStation(bGroup, 9.5, 0, 21.5, 0);
      addComputerStation(bGroup, 13.5, 0, 21.5, 0);
      world.boxes.push({ minX: 8.5, maxX: 14.6, minZ: 20.8, maxZ: 22.3, minY: 0, maxY: 1.8 });

      // Administração (Oeste do Térreo)
      addRoomPlaque(bGroup, -24.9, 2.9, 21.5, 'ADMINISTRAÇÃO', '#1e3a8a', '#fde047', Math.PI / 2);
      const admTable = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.85, 5.2), matWoodDark);
      admTable.position.set(-22.2, 0.42, 21.5);
      bGroup.add(admTable);
      world.boxes.push({ minX: -23.2, maxX: -21.2, minZ: 18.8, maxZ: 24.2, minY: 0, maxY: 1.8 });

      // ESCADA 1 (Térreo y=0 -> 1º Andar y=4.2, no canto Sudoeste do Bloco A!)
      addStaircase3D(bGroup, -24.6, -19.6, 40.5, 32.0, 0, FLOOR2_Y, '▲ 1º ANDAR: SALAS & AUDITÓRIO', -1.0, 5.8);

      // ==================== 1º ANDAR BLOCO A (y = 4.2 — SALAS DE AULA + AUDITÓRIO!) ====================
      const slab1Mesh = new THREE.Mesh(new THREE.BoxGeometry(w - 1.5, 0.28, 32.0 - 12.8), matFloorWood);
      slab1Mesh.position.set(0, FLOOR2_Y - 0.14, (12.8 + 32.0) / 2);
      floor2Group.add(slab1Mesh);
      const upperSlab1 = { minX: -25.2, maxX: 25.2, minZ: 12.8, maxZ: 32.0, floorY: FLOOR2_Y };
      world.upperSlabs.push(upperSlab1);

      // Guarda-corpo Sul do 1º Andar (exceto na abertura da Escada 1!)
      const rail1W = 25.2 - (-19.6);
      const rail1 = new THREE.Mesh(new THREE.BoxGeometry(rail1W, 1.0, 0.18), matRailing);
      rail1.position.set(-19.6 + rail1W / 2, FLOOR2_Y + 0.5, 31.9);
      floor2Group.add(rail1);
      world.boxes.push({ minX: -19.6, maxX: 25.2, minZ: 31.7, maxZ: 32.2, minY: FLOOR2_Y - 0.3, maxY: FLOOR2_Y + 2.0 });

      // AUDITÓRIO UNIGRAN (Leste do 1º Andar: x=3..18, z=14..28)
      addRoomPlaque(floor2Group, 10.5, FLOOR2_Y + 2.6, 13.0, 'AUDITÓRIO UNIGRAN', '#004274', '#f7d426', 0);
      const audStage = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.55, 3.6), matWoodDark);
      audStage.position.set(10.5, FLOOR2_Y + 0.28, 15.2);
      floor2Group.add(audStage);
      // 3 Fileiras de poltronas do Auditório
      for (let r = 0; r < 3; r++) {
        const seatsRow = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.65, 0.85), matRed);
        seatsRow.position.set(10.5, FLOOR2_Y + 0.35, 20.5 + r * 2.5);
        floor2Group.add(seatsRow);
        world.boxes.push({ minX: 5.2, maxX: 15.8, minZ: 20.0 + r * 2.5, maxZ: 21.0 + r * 2.5, minY: FLOOR2_Y, maxY: FLOOR2_Y + 1.2 });
      }

      // SALAS DE AULA (Oeste e Centro do 1º Andar: Psicologia & Ciências Contábeis + Lousas + Carteiras!)
      const divAud = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.0, 14.0), matDivider);
      divAud.position.set(2.5, FLOOR2_Y + 1.5, 20.5);
      floor2Group.add(divAud);
      world.boxes.push({ minX: 2.2, maxX: 2.8, minZ: 13.5, maxZ: 27.5, minY: FLOOR2_Y, maxY: FLOOR2_Y + 3.2 });

      // Sala de Aula 101 (Psicologia)
      addRoomPlaque(floor2Group, -17.5, FLOOR2_Y + 2.8, 13.0, 'SALA 101 • PSICOLOGIA', '#581c87', '#f5d0fe', 0);
      const board1 = new THREE.Mesh(new THREE.BoxGeometry(6.0, 1.5, 0.14), matBoard);
      board1.position.set(-17.5, FLOOR2_Y + 1.6, 13.2);
      floor2Group.add(board1);
      for (let dRow = 0; dRow < 2; dRow++) {
        for (let dCol = 0; dCol < 3; dCol++) {
          const desk = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.72, 0.9), matWood);
          desk.position.set(-21.0 + dCol * 3.2, FLOOR2_Y + 0.36, 19.5 + dRow * 3.0);
          floor2Group.add(desk);
        }
      }

      // Sala de Aula 102 (Ciências Contábeis)
      addRoomPlaque(floor2Group, -5.0, FLOOR2_Y + 2.8, 13.0, 'SALA 102 • CONTÁBEIS', '#004274', '#fde047', 0);
      const board2 = new THREE.Mesh(new THREE.BoxGeometry(6.0, 1.5, 0.14), matBoard);
      board2.position.set(-5.0, FLOOR2_Y + 1.6, 13.2);
      floor2Group.add(board2);
      for (let dRow = 0; dRow < 2; dRow++) {
        for (let dCol = 0; dCol < 3; dCol++) {
          const desk = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.72, 0.9), matWood);
          desk.position.set(-8.5 + dCol * 3.2, FLOOR2_Y + 0.36, 19.5 + dRow * 3.0);
          floor2Group.add(desk);
        }
      }

      // ESCADA 2 (1º Andar y=4.2 -> 2º Andar y=8.4, no canto Sudeste do 1º Andar!)
      addStaircase3D(floor2Group, 19.6, 24.6, 31.2, 23.2, FLOOR2_Y, FLOOR3_Y, '▲ 2º ANDAR: LABS SOFTWARE (40 PCs)', 2.4, 9.6);

      // ==================== 2º ANDAR BLOCO A (y = 8.4 — 2 LABS ENG. DE SOFTWARE COM 40 COMPUTADORES!) ====================
      // Laje do 2º Andar cobrindo o andar inteiro com recorte limpo apenas para a abertura da Escada 2!
      const slab2Main = new THREE.Mesh(new THREE.BoxGeometry(44.4, 0.28, 19.2), matFloorTech);
      slab2Main.position.set(-3.0, FLOOR3_Y - 0.14, 22.4); // x: -25.2..19.2, z: 12.8..32.0
      floor3Group.add(slab2Main);

      const slab2NorthEast = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.28, 10.6), matFloorTech);
      slab2NorthEast.position.set(22.2, FLOOR3_Y - 0.14, 18.1); // x: 19.2..25.2, z: 12.8..23.4
      floor3Group.add(slab2NorthEast);

      const upperSlab2 = {
        minX: -25.2, maxX: 25.2, minZ: 12.8, maxZ: 32.0, floorY: FLOOR3_Y,
        cutout: { minX: 19.2, maxX: 25.4, minZ: 23.3, maxZ: 32.4 }
      };
      world.upperSlabs.push(upperSlab2);

      // Guarda-corpos de segurança no 2º Andar
      const rail2South = new THREE.Mesh(new THREE.BoxGeometry(44.4, 1.0, 0.18), matRailing);
      rail2South.position.set(-3.0, FLOOR3_Y + 0.5, 31.9);
      floor3Group.add(rail2South);
      world.boxes.push({ minX: -25.2, maxX: 19.2, minZ: 31.7, maxZ: 32.2, minY: FLOOR3_Y - 0.3, maxY: FLOOR3_Y + 2.0 });

      const rail2StairSide = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.0, 8.6), matRailing);
      rail2StairSide.position.set(19.2, FLOOR3_Y + 0.5, 27.6);
      floor3Group.add(rail2StairSide);
      world.boxes.push({ minX: 19.0, maxX: 19.4, minZ: 23.4, maxZ: 32.0, minY: FLOOR3_Y - 0.3, maxY: FLOOR3_Y + 2.0 });

      // Placas dos 2 Laboratórios de Engenharia de Software (40 PCs!)
      addRoomPlaque(floor3Group, -15.6, FLOOR3_Y + 2.9, 13.0, 'LAB 1 • ENG. SOFTWARE (20 PCs)', '#0f172a', '#38e8ff', 0);
      addRoomPlaque(floor3Group, 9.8, FLOOR3_Y + 2.9, 13.0, 'LAB 2 • ENG. SOFTWARE (20 PCs)', '#0f172a', '#facc15', 0);

      // Divisória de vidro baixa separando Lab 1 e Lab 2 (com corredor aberto no meio!)
      const labGlassDiv = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.2, 10.0), matRailing);
      labGlassDiv.position.set(-3.0, FLOOR3_Y + 1.1, 18.0);
      floor3Group.add(labGlassDiv);

      // OS 40 COMPUTADORES REAIS EM 3D + INTERAÇÃO DE JOGOS (GAMELUTA & JOGO UNIGRAN)!
      build40ComputersTwoLabs(floor3Group, FLOOR3_Y);

      // ==================== TELHADO & FACHADA BLOCO A ====================
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.5, d + 0.5), matUnigranLight);
      cornice.position.set(cx, totalH + 0.25, cz);
      roofGroup.add(cornice);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, 1.2, d - 0.2), matUnigranBlue);
      roof.position.set(cx, totalH + 1.0, cz);
      roofGroup.add(roof);

      const signMatA = new THREE.MeshBasicMaterial({
        map: createSignTexture('BLOCO A • UNIGRAN CAPITAL', '#004274', '#f7d426', 'INFORMAÇÕES • EMAJUC • BIBLIOTECA • AUDITÓRIO • 40 PCs')
      });
      const signFront = new THREE.Mesh(new THREE.PlaneGeometry(22, 3.4), signMatA);
      signFront.position.set(cx, totalH - 0.5, maxZ + 0.2);
      roofGroup.add(signFront);
      const signBack = new THREE.Mesh(new THREE.PlaneGeometry(22, 3.4), signMatA);
      signBack.rotation.y = Math.PI;
      signBack.position.set(cx, totalH - 0.5, minZ - 0.2);
      roofGroup.add(signBack);

      world.buildings.push({
        id: 'bloco_a',
        label: 'BLOCO A',
        minX, maxX, minZ, maxZ,
        slab: upperSlab1,
        slab3: upperSlab2,
        roofGroup,
        southUpperWall,
        floor2Group,
        floor3Group,
        bGroup
      });
    })();

    // ==================== CONSTRUTOR DE BLOCOS DE 2 ANDARES (BLOCO B & BLOCO C) ====================
    function buildTwoFloorBlock(cfg) {
      const { id, label, subtitle, cx, cz, w, d, doors, trimMat, stairSide, slabMaxZ } = cfg;
      const bGroup = new THREE.Group();
      group.add(bGroup);

      const halfW = w / 2, halfD = d / 2;
      const minX = cx - halfW, maxX = cx + halfW;
      const minZ = cz - halfD, maxZ = cz + halfD;
      const wallThick = 0.75;
      const totalH = FLOOR2_Y * 2;

      const floor1 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d), matFloorTile);
      floor1.position.set(cx, 0.05, cz);
      bGroup.add(floor1);

      function addSegWall(targetGrp, wx, wz, sw, sd, yBottom, h, mat) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(sw, h, sd), mat);
        m.position.set(wx, yBottom + h / 2, wz);
        targetGrp.add(m);
        world.boxes.push({
          minX: wx - sw / 2, maxX: wx + sw / 2,
          minZ: wz - sd / 2, maxZ: wz + sd / 2,
          minY: yBottom, maxY: yBottom + h
        });
      }

      const southUpperWall = new THREE.Group();
      bGroup.add(southUpperWall);

      ['north', 'south', 'east', 'west'].forEach((side) => {
        const doorW = doors[side] || 0;
        const isSouth = side === 'south';
        const targetUpper = isSouth ? southUpperWall : bGroup;

        if (side === 'north' || side === 'south') {
          const wz = side === 'north' ? minZ + wallThick / 2 : maxZ - wallThick / 2;
          if (doorW > 0) {
            const segW = (w - doorW) / 2;
            addSegWall(bGroup, minX + segW / 2, wz, segW, wallThick, 0, FLOOR2_Y, matCream);
            addSegWall(bGroup, maxX - segW / 2, wz, segW, wallThick, 0, FLOOR2_Y, matCream);
            const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorW, 0.5, wallThick + 0.14), matUnigranBlue);
            lintel.position.set(cx, FLOOR2_Y - 0.25, wz);
            bGroup.add(lintel);
            const wm = new THREE.Mesh(new THREE.PlaneGeometry(doorW, 2.8), new THREE.MeshBasicMaterial({ color: side === 'north' ? 0x0ea5e9 : 0x1c84c8 }));
            wm.rotation.x = -Math.PI / 2;
            wm.position.set(cx, 0.13, side === 'north' ? minZ + 0.4 : maxZ - 0.4);
            bGroup.add(wm);
          } else {
            addSegWall(bGroup, cx, wz, w, wallThick, 0, FLOOR2_Y, matCream);
          }
          addSegWall(targetUpper, cx, wz, w, wallThick, FLOOR2_Y, FLOOR2_Y, matCream);
          for (let wx = -halfW + 3.5; wx <= halfW - 3.5; wx += 5.0) {
            const win = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, wallThick + 0.14), matGlass);
            win.position.set(cx + wx, FLOOR2_Y + 2.0, wz);
            targetUpper.add(win);
          }
        } else {
          const wx = side === 'west' ? minX + wallThick / 2 : maxX - wallThick / 2;
          if (doorW > 0) {
            const segD = (d - doorW) / 2;
            addSegWall(bGroup, wx, minZ + segD / 2, wallThick, segD, 0, FLOOR2_Y, matCream);
            addSegWall(bGroup, wx, maxZ - segD / 2, wallThick, segD, 0, FLOOR2_Y, matCream);
            const lintel = new THREE.Mesh(new THREE.BoxGeometry(wallThick + 0.14, 0.5, doorW), matUnigranBlue);
            lintel.position.set(wx, FLOOR2_Y - 0.25, cz);
            bGroup.add(lintel);
            const wm = new THREE.Mesh(new THREE.PlaneGeometry(2.8, doorW), new THREE.MeshBasicMaterial({ color: 0x1c84c8 }));
            wm.rotation.x = -Math.PI / 2;
            wm.position.set(side === 'east' ? maxX - 0.4 : minX + 0.4, 0.13, cz);
            bGroup.add(wm);
          } else {
            addSegWall(bGroup, wx, cz, wallThick, d, 0, FLOOR2_Y, matCream);
          }
          addSegWall(targetUpper, wx, cz, wallThick, d, FLOOR2_Y, FLOOR2_Y, matCream);
          for (let wz = -halfD + 3.5; wz <= halfD - 3.5; wz += 5.0) {
            const win = new THREE.Mesh(new THREE.BoxGeometry(wallThick + 0.14, 1.6, 2.4), matGlass);
            win.position.set(wx, FLOOR2_Y + 2.0, cz + wz);
            targetUpper.add(win);
          }
        }
      });

      const floor2Group = new THREE.Group();
      bGroup.add(floor2Group);

      const slabMinX = minX + wallThick, slabMaxX = maxX - wallThick;
      const slabMinZ = minZ + wallThick;
      const slabMesh = new THREE.Mesh(new THREE.BoxGeometry(slabMaxX - slabMinX, 0.28, slabMaxZ - slabMinZ), matFloorWood);
      slabMesh.position.set((slabMinX + slabMaxX) / 2, FLOOR2_Y - 0.14, (slabMinZ + slabMaxZ) / 2);
      floor2Group.add(slabMesh);

      const upperSlab = { minX: slabMinX, maxX: slabMaxX, minZ: slabMinZ, maxZ: slabMaxZ, floorY: FLOOR2_Y };
      world.upperSlabs.push(upperSlab);

      const stairW = 4.6;
      const stairsLeft = stairSide === 'left';
      const stairMinX = stairsLeft ? slabMinX + 0.2 : slabMaxX - stairW - 0.2;
      const stairMaxX = stairsLeft ? slabMinX + stairW + 0.2 : slabMaxX - 0.2;
      const stairStartZ = Math.min(maxZ - 1.4, slabMaxZ + 7.4);
      addStaircase3D(bGroup, stairMinX, stairMaxX, stairStartZ, slabMaxZ, 0, FLOOR2_Y, '▲ SUBIR 2º ANDAR', -1.0, 6.0);

      const railStartX = stairsLeft ? stairMaxX : slabMinX;
      const railEndX = stairsLeft ? slabMaxX : stairMinX;
      if (railEndX - railStartX > 0.5) {
        const gRail = new THREE.Mesh(new THREE.BoxGeometry(railEndX - railStartX, 1.0, 0.18), matRailing);
        gRail.position.set((railStartX + railEndX) / 2, FLOOR2_Y + 0.5, slabMaxZ - 0.1);
        floor2Group.add(gRail);
        world.boxes.push({ minX: railStartX, maxX: railEndX, minZ: slabMaxZ - 0.25, maxZ: slabMaxZ + 0.25, minY: FLOOR2_Y - 0.3, maxY: FLOOR2_Y + 2.0 });
      }

      const roofGroup = new THREE.Group();
      bGroup.add(roofGroup);
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.5, d + 0.5), trimMat);
      cornice.position.set(cx, totalH + 0.25, cz);
      roofGroup.add(cornice);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, 1.15, d - 0.2), matUnigranBlue);
      roof.position.set(cx, totalH + 0.98, cz);
      roofGroup.add(roof);

      const signMat = new THREE.MeshBasicMaterial({ map: createSignTexture(label, '#004274', '#f7d426', subtitle) });
      if (doors.west) {
        const s = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.0), signMat);
        s.rotation.y = -Math.PI / 2;
        s.position.set(minX - 0.18, totalH - 0.4, cz);
        roofGroup.add(s);
      }
      if (doors.south) {
        const s = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.0), signMat);
        s.position.set(cx, totalH - 0.4, maxZ + 0.18);
        roofGroup.add(s);
      }
      if (doors.north) {
        const s = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.0), signMat);
        s.rotation.y = Math.PI;
        s.position.set(cx, totalH - 0.4, minZ - 0.18);
        roofGroup.add(s);
      }

      const obj = { id, label, minX, maxX, minZ, maxZ, slab: upperSlab, slab3: null, roofGroup, southUpperWall, floor2Group, floor3Group: null, bGroup };
      world.buildings.push(obj);
      return obj;
    }

    // ================================================================================
    // 2. BLOCO B (LESTE — 2 ANDARES: Publicidade & Estúdio de Podcast ON AIR + Arquitetura + Design de Interiores!)
    // ================================================================================
    const blocoB = buildTwoFloorBlock({
      id: 'bloco_b',
      label: 'BLOCO B',
      subtitle: 'PUBLICIDADE/PODCAST • ARQUITETURA • DESIGN',
      cx: 44, cz: -2, w: 24, d: 36,
      doors: { west: 6.0, south: 5.0 },
      trimMat: matPubPurple,
      stairSide: 'right',
      slabMaxZ: 6.5
    });

    // Térreo Bloco B: Estúdio de Podcast ON AIR + Agência Experimental!
    addPodcastStudio(blocoB.bGroup, 41.5, 0, -13.5);
    world.boxes.push({ minX: 39.2, maxX: 43.8, minZ: -14.8, maxZ: -12.2, minY: 0, maxY: 1.6 });
    addRoomPlaque(blocoB.bGroup, 55.1, 2.9, 1.0, 'AGÊNCIA PUBLICIDADE', '#5b21b6', '#fde047', -Math.PI / 2);
    addComputerStation(blocoB.bGroup, 53.0, 0, -2.0, -Math.PI / 2);
    addComputerStation(blocoB.bGroup, 53.0, 0, 2.5, -Math.PI / 2);
    world.boxes.push({ minX: 52.0, maxX: 54.0, minZ: -3.2, maxZ: 3.6, minY: 0, maxY: 1.8 });

    // 2º Andar Bloco B: Arquitetura e Urbanismo (maquete 3D) + Design de Interiores (ambiente decorado)
    addRoomPlaque(blocoB.floor2Group, 44.0, FLOOR2_Y + 2.6, -19.1, 'ARQUITETURA & URBANISMO', '#0369a1', '#f7d426', 0);
    const arqTable = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.85, 2.4), matWood);
    arqTable.position.set(44.0, FLOOR2_Y + 0.42, -15.5);
    blocoB.floor2Group.add(arqTable);
    [[-1.8, 0.9], [-0.6, 1.4], [0.6, 1.1], [1.8, 1.65]].forEach(([mx, mh]) => {
      const miniB = new THREE.Mesh(new THREE.BoxGeometry(0.65, mh, 0.65), matWhite);
      miniB.position.set(44.0 + mx, FLOOR2_Y + 0.85 + mh / 2, -15.5);
      blocoB.floor2Group.add(miniB);
    });
    world.boxes.push({ minX: 40.8, maxX: 47.2, minZ: -16.8, maxZ: -14.2, minY: FLOOR2_Y, maxY: FLOOR2_Y + 1.8 });

    addRoomPlaque(blocoB.floor2Group, 32.9, FLOOR2_Y + 2.6, -2.5, 'DESIGN DE INTERIORES', '#0284c7', '#fef08a', Math.PI / 2);
    const desRug = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.08, 5.8), matGold);
    desRug.position.set(36.2, FLOOR2_Y + 0.1, -2.5);
    blocoB.floor2Group.add(desRug);
    const desSofa = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.88, 3.6), matUnigranLight);
    desSofa.position.set(35.0, FLOOR2_Y + 0.48, -2.5);
    blocoB.floor2Group.add(desSofa);
    world.boxes.push({ minX: 34.2, maxX: 35.8, minZ: -4.5, maxZ: -0.5, minY: FLOOR2_Y, maxY: FLOOR2_Y + 1.5 });

    // ================================================================================
    // 3. BLOCO C (NORTE — 2 ANDARES: Saúde, Microscópios, Clínicas-Escola & Saída p/ Rua das Garças!)
    // ================================================================================
    const blocoC = buildTwoFloorBlock({
      id: 'bloco_c',
      label: 'BLOCO C',
      subtitle: 'SAÚDE • CLÍNICAS • MICROSCÓPIOS',
      cx: -4, cz: -38, w: 64, d: 28,
      doors: { south: 7.4, north: 6.4 },
      trimMat: matHealthTeal,
      stairSide: 'right',
      slabMaxZ: -32.5
    });

    // Térreo Bloco C: Biomedicina (Microscópios + mais gente), Fisioterapia, Enfermagem e Radiologia
    addRoomPlaque(blocoC.bGroup, -22.0, 2.9, -51.1, 'BIOMEDICINA • MICROSCÓPIOS', '#0f766e', '#ffffff', 0);
    [-26.5, -17.0].forEach((bx) => {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.9, 1.5), matWhite);
      bench.position.set(bx, 0.45, -46.5);
      blocoC.bGroup.add(bench);
      addMicroscope(blocoC.bGroup, bx - 1.8, 0.9, -46.5);
      addMicroscope(blocoC.bGroup, bx, 0.9, -46.5);
      addMicroscope(blocoC.bGroup, bx + 1.8, 0.9, -46.5);
      world.boxes.push({ minX: bx - 2.9, maxX: bx + 2.9, minZ: -47.3, maxZ: -45.7, minY: 0, maxY: 1.8 });
    });

    addRoomPlaque(blocoC.bGroup, -4.0, 2.9, -51.1, 'CLÍNICA FISIOTERAPIA', '#0d9488', '#fef08a', 0);
    const fisioMat = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.12, 3.4), matUnigranLight);
    fisioMat.position.set(-4.0, 0.14, -42.5);
    blocoC.bGroup.add(fisioMat);
    const pBall1 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 10), matHealthTeal);
    pBall1.position.set(-6.4, 0.65, -42.5);
    blocoC.bGroup.add(pBall1);
    const pBall2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 10), matGold);
    pBall2.position.set(-1.6, 0.6, -42.5);
    blocoC.bGroup.add(pBall2);

    addRoomPlaque(blocoC.bGroup, 10.0, 2.9, -51.1, 'ENFERMAGEM', '#0f766e', '#ffffff', 0);
    [7.8, 12.6].forEach((bx) => {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.72, 1.5), matWhite);
      bed.position.set(bx, 0.36, -46.5);
      blocoC.bGroup.add(bed);
      const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.12, 1.54), matHealthTeal);
      blanket.position.set(bx + 0.25, 0.76, -46.5);
      blocoC.bGroup.add(blanket);
      world.boxes.push({ minX: bx - 1.25, maxX: bx + 1.25, minZ: -47.3, maxZ: -45.7, minY: 0, maxY: 1.5 });
    });

    addRoomPlaque(blocoC.bGroup, 21.5, 2.9, -51.1, 'RADIOLOGIA', '#0284c7', '#ffffff', 0);
    const ctRing = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.32, 8, 18), matWhite);
    ctRing.position.set(22.0, 1.48, -46.5);
    blocoC.bGroup.add(ctRing);
    const ctTable = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.75, 2.4), matMarble);
    ctTable.position.set(22.0, 0.38, -45.7);
    blocoC.bGroup.add(ctTable);
    world.boxes.push({ minX: 20.5, maxX: 23.5, minZ: -47.5, maxZ: -44.4, minY: 0, maxY: 2.5 });

    // 2º Andar Bloco C: Microscopia 2 + Nutrição + Estética e Cosmética
    addRoomPlaque(blocoC.floor2Group, -22.0, FLOOR2_Y + 2.6, -51.1, 'LAB. MICROSCOPIA 2', '#0f766e', '#ffffff', 0);
    [-26.5, -16.5].forEach((bx) => {
      const bench2 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.9, 1.45), matWhite);
      bench2.position.set(bx, FLOOR2_Y + 0.45, -46.5);
      blocoC.floor2Group.add(bench2);
      addMicroscope(blocoC.floor2Group, bx - 1.5, FLOOR2_Y + 0.9, -46.5);
      addMicroscope(blocoC.floor2Group, bx + 0.2, FLOOR2_Y + 0.9, -46.5);
      addMicroscope(blocoC.floor2Group, bx + 1.6, FLOOR2_Y + 0.9, -46.5);
      world.boxes.push({ minX: bx - 2.7, maxX: bx + 2.7, minZ: -47.3, maxZ: -45.7, minY: FLOOR2_Y, maxY: FLOOR2_Y + 1.8 });
    });

    addRoomPlaque(blocoC.floor2Group, -3.5, FLOOR2_Y + 2.6, -51.1, 'NUTRIÇÃO', '#15803d', '#fef08a', 0);
    const nutCounter = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.92, 1.5), matWhite);
    nutCounter.position.set(-3.5, FLOOR2_Y + 0.46, -46.5);
    blocoC.floor2Group.add(nutCounter);
    [[-2.4, matGreen], [-1.2, matRed], [0, matOrange], [1.2, matGold], [2.4, matGreen]].forEach(([fx, fmat]) => {
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), fmat);
      fruit.position.set(-3.5 + fx, FLOOR2_Y + 1.15, -46.5);
      blocoC.floor2Group.add(fruit);
    });
    world.boxes.push({ minX: -7.2, maxX: 0.2, minZ: -47.3, maxZ: -45.7, minY: FLOOR2_Y, maxY: FLOOR2_Y + 1.6 });

    addRoomPlaque(blocoC.floor2Group, 13.0, FLOOR2_Y + 2.6, -51.1, 'ESTÉTICA E COSMÉTICA', '#be185d', '#fce7f3', 0);
    [10.2, 15.8].forEach((ex) => {
      const spaBed = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.72, 1.4), matPink);
      spaBed.position.set(ex, FLOOR2_Y + 0.36, -46.5);
      blocoC.floor2Group.add(spaBed);
      world.boxes.push({ minX: ex - 1.3, maxX: ex + 1.3, minZ: -47.3, maxZ: -45.7, minY: FLOOR2_Y, maxY: FLOOR2_Y + 1.5 });
    });

    // ================================================================================
    // 4. GINÁSIO POLIESPORTIVO UNIGRAN (DO OUTRO LADO DA RUA DAS GARÇAS — NORTE!)
    // ================================================================================
    (function buildGinasioPoliesportivo() {
      const cx = 0, cz = -88, w = 44, d = 24;
      const minX = cx - w / 2, maxX = cx + w / 2;
      const minZ = cz - d / 2, maxZ = cz + d / 2;
      const wallThick = 0.75, wallH = 6.2, doorW = 8.4;

      const gGroup = new THREE.Group();
      group.add(gGroup);
      const southUpperWall = new THREE.Group();
      gGroup.add(southUpperWall);
      const roofGroup = new THREE.Group();
      gGroup.add(roofGroup);

      const gFloor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d), matMarble);
      gFloor.position.set(cx, 0.05, cz);
      gGroup.add(gFloor);

      const courtCanvas = document.createElement('canvas');
      courtCanvas.width = 512;
      courtCanvas.height = 256;
      const cctx = courtCanvas.getContext('2d');
      cctx.fillStyle = '#1d4ed8';
      cctx.fillRect(0, 0, 512, 256);
      cctx.strokeStyle = '#ffffff';
      cctx.lineWidth = 6;
      cctx.strokeRect(18, 16, 476, 224);
      cctx.beginPath();
      cctx.moveTo(256, 16);
      cctx.lineTo(256, 240);
      cctx.stroke();
      cctx.fillStyle = '#ea580c';
      cctx.beginPath();
      cctx.arc(256, 128, 38, 0, Math.PI * 2);
      cctx.fill();
      cctx.stroke();
      cctx.fillRect(18, 76, 68, 104);
      cctx.strokeRect(18, 76, 68, 104);
      cctx.fillRect(426, 76, 68, 104);
      cctx.strokeRect(426, 76, 68, 104);
      const courtTex = new THREE.CanvasTexture(courtCanvas);
      if (THREE.sRGBEncoding) courtTex.encoding = THREE.sRGBEncoding;

      const indoorCourt = new THREE.Mesh(new THREE.PlaneGeometry(34, 16.5), new THREE.MeshLambertMaterial({ map: courtTex }));
      indoorCourt.rotation.x = -Math.PI / 2;
      indoorCourt.position.set(cx, 0.14, cz + 1.2);
      gGroup.add(indoorCourt);

      function addGymWall(targetGrp, wx, wz, sw, sd) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(sw, wallH, sd), matCream);
        m.position.set(wx, wallH / 2, wz);
        targetGrp.add(m);
        world.boxes.push({ minX: wx - sw / 2, maxX: wx + sw / 2, minZ: wz - sd / 2, maxZ: wz + sd / 2, minY: 0, maxY: wallH });
      }

      addGymWall(gGroup, cx, minZ + wallThick / 2, w, wallThick);
      addGymWall(gGroup, minX + wallThick / 2, cz, wallThick, d);
      addGymWall(gGroup, maxX - wallThick / 2, cz, wallThick, d);

      const segW = (w - doorW) / 2;
      addGymWall(gGroup, minX + segW / 2, maxZ - wallThick / 2, segW, wallThick);
      addGymWall(gGroup, maxX - segW / 2, maxZ - wallThick / 2, segW, wallThick);

      const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorW, 1.3, wallThick + 0.14), matUnigranBlue);
      lintel.position.set(cx, wallH - 0.65, maxZ - wallThick / 2);
      southUpperWall.add(lintel);

      const entryMat = new THREE.Mesh(new THREE.PlaneGeometry(doorW, 2.8), new THREE.MeshBasicMaterial({ color: 0xea580c }));
      entryMat.rotation.x = -Math.PI / 2;
      entryMat.position.set(cx, 0.14, maxZ - 0.5);
      gGroup.add(entryMat);

      for (let row = 0; row < 3; row++) {
        const bleacher = new THREE.Mesh(new THREE.BoxGeometry(30, 0.55 + row * 0.55, 1.15), row % 2 === 0 ? matUnigranBlue : matMarble);
        bleacher.position.set(cx, (0.55 + row * 0.55) / 2, minZ + 3.4 - row * 1.05);
        gGroup.add(bleacher);
      }
      world.boxes.push({ minX: -15.5, maxX: 15.5, minZ: minZ + 0.5, maxZ: minZ + 4.1, minY: 0, maxY: 2.5 });

      // Placar Eletrônico DINÂMICO (atualiza ao vivo a cada cesta e gol!)
      const sbCanvas = document.createElement('canvas');
      sbCanvas.width = 512;
      sbCanvas.height = 128;
      const sbCtx = sbCanvas.getContext('2d');
      const sbTex = new THREE.CanvasTexture(sbCanvas);
      if (THREE.sRGBEncoding) sbTex.encoding = THREE.sRGBEncoding;

      function updateScoreboard(basketPts, futsalGoals) {
        sbCtx.fillStyle = '#0f172a';
        sbCtx.fillRect(0, 0, 512, 128);
        sbCtx.strokeStyle = '#facc15';
        sbCtx.lineWidth = 7;
        sbCtx.strokeRect(6, 6, 500, 116);
        sbCtx.textAlign = 'center';
        sbCtx.textBaseline = 'middle';
        sbCtx.fillStyle = '#7dd3fc';
        sbCtx.font = '800 20px sans-serif';
        sbCtx.fillText('PLACAR AO VIVO • GINÁSIO UNIGRAN', 256, 30);
        sbCtx.fillStyle = '#fb923c';
        sbCtx.font = '900 34px sans-serif';
        sbCtx.fillText(`BASQUETE: ${basketPts}`, 136, 82);
        sbCtx.fillStyle = '#ffffff';
        sbCtx.fillText('|', 256, 82);
        sbCtx.fillStyle = '#4ade80';
        sbCtx.fillText(`FUTSAL: ${futsalGoals}`, 376, 82);
        sbTex.needsUpdate = true;
      }
      updateScoreboard(0, 0);

      const scoreboard = new THREE.Mesh(
        new THREE.PlaneGeometry(9.2, 2.0),
        new THREE.MeshBasicMaterial({ map: sbTex })
      );
      scoreboard.position.set(cx, 4.4, minZ + 0.85);
      gGroup.add(scoreboard);

      addBasketballHoop(-17.8, cz + 1.2, Math.PI / 2);
      addBasketballHoop(17.8, cz + 1.2, -Math.PI / 2);

      // Traves de Futsal + Redes brancas semitransparentes nos 2 lados!
      const netMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.38, side: THREE.DoubleSide });
      [-17.2, 17.2].forEach((gx) => {
        const dir = gx < 0 ? -1 : 1;
        const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.1, 6), matWhite);
        postL.position.set(gx, 1.05, cz - 0.6);
        gGroup.add(postL);
        const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.1, 6), matWhite);
        postR.position.set(gx, 1.05, cz + 3.0);
        gGroup.add(postR);
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.7, 6), matWhite);
        bar.rotation.x = Math.PI / 2;
        bar.position.set(gx, 2.1, cz + 1.2);
        gGroup.add(bar);

        // Rede traseira + laterais + teto da trave
        const backNet = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.1), netMat);
        backNet.rotation.y = Math.PI / 2;
        backNet.position.set(gx + dir * 1.25, 1.05, cz + 1.2);
        gGroup.add(backNet);
        const topNet = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 3.6), netMat);
        topNet.rotation.x = Math.PI / 2;
        topNet.position.set(gx + dir * 0.62, 2.08, cz + 1.2);
        gGroup.add(topNet);
        [-0.6, 3.0].forEach((sideZ) => {
          const sNet = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 2.1), netMat);
          sNet.position.set(gx + dir * 0.62, 1.05, cz + sideZ);
          gGroup.add(sNet);
        });
      });

      // Textura da Bola de Basquete (laranja com listras pretas)
      const bbCanvas = document.createElement('canvas');
      bbCanvas.width = 128; bbCanvas.height = 64;
      const bbCtx = bbCanvas.getContext('2d');
      bbCtx.fillStyle = '#ea580c';
      bbCtx.fillRect(0, 0, 128, 64);
      bbCtx.strokeStyle = '#18181b';
      bbCtx.lineWidth = 4;
      bbCtx.beginPath();
      bbCtx.moveTo(0, 32); bbCtx.lineTo(128, 32);
      bbCtx.moveTo(32, 0); bbCtx.lineTo(32, 64);
      bbCtx.moveTo(96, 0); bbCtx.lineTo(96, 64);
      bbCtx.stroke();
      const bbTex = new THREE.CanvasTexture(bbCanvas);
      if (THREE.sRGBEncoding) bbTex.encoding = THREE.sRGBEncoding;

      const basketBallMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 12, 10),
        new THREE.MeshLambertMaterial({ map: bbTex })
      );
      basketBallMesh.position.set(-5.2, 0.32, cz + 1.2);
      gGroup.add(basketBallMesh);

      const bbShadow = new THREE.Mesh(
        new THREE.CircleGeometry(0.34, 12),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.34, depthWrite: false })
      );
      bbShadow.rotation.x = -Math.PI / 2;
      bbShadow.position.set(-5.2, 0.16, cz + 1.2);
      gGroup.add(bbShadow);

      // Textura da Bola de Futsal / Futebol (branca com gomos pretos)
      const sbBallCanvas = document.createElement('canvas');
      sbBallCanvas.width = 128; sbBallCanvas.height = 64;
      const sbc = sbBallCanvas.getContext('2d');
      sbc.fillStyle = '#f8fafc';
      sbc.fillRect(0, 0, 128, 64);
      sbc.fillStyle = '#18181b';
      [[20, 20], [64, 16], [108, 22], [42, 46], [88, 46]].forEach(([px, py]) => {
        sbc.beginPath();
        sbc.arc(px, py, 10, 0, Math.PI * 2);
        sbc.fill();
      });
      const soccerTex = new THREE.CanvasTexture(sbBallCanvas);
      if (THREE.sRGBEncoding) soccerTex.encoding = THREE.sRGBEncoding;

      const soccerBallMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.30, 12, 10),
        new THREE.MeshLambertMaterial({ map: soccerTex })
      );
      soccerBallMesh.position.set(4.5, 0.30, cz + 1.2);
      gGroup.add(soccerBallMesh);

      const socShadow = new THREE.Mesh(
        new THREE.CircleGeometry(0.32, 12),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.34, depthWrite: false })
      );
      socShadow.rotation.x = -Math.PI / 2;
      socShadow.position.set(4.5, 0.16, cz + 1.2);
      gGroup.add(socShadow);

      world.gym = {
        bounds: { minX: -20.4, maxX: 20.4, minZ: -95.2, maxZ: -77.2 },
        centerZ: cz + 1.2,
        hoops: [
          { x: -16.95, y: 3.65, z: cz + 1.2 },
          { x: 16.95, y: 3.65, z: cz + 1.2 }
        ],
        goals: [
          { x: -17.2, side: -1, minZ: cz - 0.55, maxZ: cz + 2.95, maxY: 2.15 },
          { x: 17.2, side: 1, minZ: cz - 0.55, maxZ: cz + 2.95, maxY: 2.15 }
        ],
        basketball: {
          mesh: basketBallMesh, shadow: bbShadow,
          x: -5.2, y: 0.32, z: cz + 1.2,
          vx: 0, vy: 0, vz: 0, r: 0.32,
          held: false, shotActive: false, shotTimer: 0, shotDuration: 0.85,
          sx: 0, sy: 0, sz: 0, tx: 0, ty: 0, tz: 0, peakY: 5.5,
          willScore: false, shotPoints: 2
        },
        soccerBall: {
          mesh: soccerBallMesh, shadow: socShadow,
          x: 4.5, y: 0.30, z: cz + 1.2,
          vx: 0, vy: 0, vz: 0, r: 0.30,
          goalCooldown: 0
        },
        basketScore: 0,
        futsalScore: 0,
        updateScoreboard
      };

      const archRoof = new THREE.Mesh(
        new THREE.CylinderGeometry(d * 0.52, d * 0.52, w + 0.6, 16, 1, false, 0, Math.PI),
        matUnigranBlue
      );
      archRoof.rotation.z = Math.PI / 2;
      archRoof.scale.set(0.30, 1, 1);
      archRoof.position.set(cx, wallH + 0.25, cz);
      roofGroup.add(archRoof);

      const gymTrim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.5, d + 0.6), matGold);
      gymTrim.position.set(cx, wallH + 0.2, cz);
      roofGroup.add(gymTrim);

      const gymSign = new THREE.Mesh(
        new THREE.PlaneGeometry(17.0, 3.2),
        new THREE.MeshBasicMaterial({ map: createSignTexture('GINÁSIO POLIESPORTIVO UNIGRAN', '#004274', '#f7d426', 'EDUCAÇÃO FÍSICA • RUA DAS GARÇAS') })
      );
      gymSign.position.set(cx, wallH - 0.1, maxZ + 0.22);
      roofGroup.add(gymSign);

      world.buildings.push({
        id: 'ginasio',
        label: 'GINÁSIO POLIESPORTIVO UNIGRAN',
        minX, maxX, minZ, maxZ,
        slab: null, slab3: null,
        roofGroup, southUpperWall,
        floor2Group: null, floor3Group: null,
        bGroup: gGroup
      });
    })();

    // Carros estacionados apenas no estacionamento interno Oeste (ZERO carros em cima das escritas das ruas!)
    function addParkedCar(x, z, rotY, colorHex) {
      const car = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.72, 3.8), new THREE.MeshLambertMaterial({ color: colorHex }));
      body.position.y = 0.56;
      car.add(body);
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.62, 1.9), matGlass);
      cabin.position.set(0, 1.15, -0.15);
      car.add(cabin);
      car.position.set(x, 0, z);
      car.rotation.y = rotY;
      group.add(car);
      world.circles.push({ x, z, r: 1.5, y: 0, active: true });
    }
    addParkedCar(-51, -8, Math.PI / 2, 0x2563eb);
    addParkedCar(-51, 5, Math.PI / 2, 0xdc2626);
    addParkedCar(-51, 20, Math.PI / 2, 0xf8fafc);
    addParkedCar(-37, 14, Math.PI / 2, 0x16a34a);

    // Postes e Bancos no Pátio Central
    [[-16, 4], [16, 4], [-16, -14], [16, -14], [-14, 49], [14, 49]].forEach(([lx, lz]) => {
      const lamp = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 3.8, 6), matIron);
      pole.position.y = 1.9;
      lamp.add(pole);
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.34, 7, 7), new THREE.MeshBasicMaterial({ color: 0xffe49e }));
      globe.position.y = 3.95;
      lamp.add(globe);
      lamp.position.set(lx, 0, lz);
      group.add(lamp);
      world.circles.push({ x: lx, z: lz, r: 0.35, y: 0, active: true });
    });

    [[-11, 2, 0.4], [11, 2, -0.4], [-11, -11, Math.PI - 0.4], [11, -11, -Math.PI + 0.4]].forEach(([bx, bz, r]) => {
      const bench = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 0.78), matWood);
      seat.position.y = 0.55;
      bench.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.56, 0.14), matWood);
      back.position.set(0, 0.92, -0.32);
      bench.add(back);
      bench.position.set(bx, 0, bz);
      bench.rotation.y = r;
      group.add(bench);
      world.circles.push({ x: bx, z: bz, r: 0.95, y: 0, active: true });
    });

    // ==================== ARBORIZAÇÃO URBANA INSTANCIADA (60 FPS, SEM TAMPAR ESCRITAS!) ====================
    const treeSpecs = [];
    function queueTree(x, z, scale = 1.0, ornamental = true) {
      treeSpecs.push({ x, z, scale, ornamental });
      world.circles.push({ x, z, r: 0.7 * scale, y: 0, active: true });
    }

    [-52, -36, 36, 52].forEach((tx) => {
      queueTree(tx, 56.8, 1.15, true);
      queueTree(tx, -55.8, 1.15, true);
    });
    [-42, -18, 18, 42].forEach((tz) => {
      queueTree(-59.5, tz, 1.12, false);
      queueTree(59.5, tz, 1.12, false);
    });

    const pines = treeSpecs.filter((t) => !t.ornamental);
    const rounds = treeSpecs.filter((t) => t.ornamental);
    const dummy = new THREE.Object3D();

    const trunkInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.24, 0.36, 1.85, 6), matTrunk, treeSpecs.length);
    const treeShadowInst = new THREE.InstancedMesh(
      new THREE.CircleGeometry(1.45, 10),
      new THREE.MeshBasicMaterial({ color: 0x0a1a0d, transparent: true, opacity: 0.22, depthWrite: false }),
      treeSpecs.length
    );
    treeSpecs.forEach((t, idx) => {
      dummy.position.set(t.x, 0.92 * t.scale, t.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(t.scale);
      dummy.updateMatrix();
      trunkInst.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(t.x, 0.03, t.z);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.setScalar(t.scale);
      dummy.updateMatrix();
      treeShadowInst.setMatrixAt(idx, dummy.matrix);
    });
    group.add(trunkInst, treeShadowInst);

    const pineLowerInst = new THREE.InstancedMesh(new THREE.ConeGeometry(1.45, 2.15, 6), matLeaves1, pines.length);
    const pineUpperInst = new THREE.InstancedMesh(new THREE.ConeGeometry(1.0, 1.8, 6), matLeaves2, pines.length);
    pines.forEach((t, idx) => {
      dummy.rotation.set(0, idx * 0.7, 0);
      dummy.scale.setScalar(t.scale);
      dummy.position.set(t.x, 2.35 * t.scale, t.z);
      dummy.updateMatrix();
      pineLowerInst.setMatrixAt(idx, dummy.matrix);
      dummy.position.set(t.x, 3.45 * t.scale, t.z);
      dummy.updateMatrix();
      pineUpperInst.setMatrixAt(idx, dummy.matrix);
    });
    group.add(pineLowerInst, pineUpperInst);

    const roundInst = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1.48, 0), matLeaves2, rounds.length);
    rounds.forEach((t, idx) => {
      dummy.rotation.set(0, idx * 0.9, 0);
      dummy.scale.setScalar(t.scale);
      dummy.position.set(t.x, 2.75 * t.scale, t.z);
      dummy.updateMatrix();
      roundInst.setMatrixAt(idx, dummy.matrix);
    });
    group.add(roundInst);

    // ==================== 5 DIPLOMAS NOS BLOCOS A (3 ANDARES), B E C ====================
    function addDiplomaChest(x, z, y, rotY, title, desc, buildingId) {
      const cGroup = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.78, 1.05), matWoodDark);
      base.position.y = 0.39;
      cGroup.add(base);
      const trim = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.14, 1.1), matGold);
      trim.position.y = 0.7;
      cGroup.add(trim);
      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, 0.78, -0.52);
      const lid = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.38, 1.06), matWood);
      lid.position.set(0, 0.19, 0.52);
      lidPivot.add(lid);
      cGroup.add(lidPivot);
      const glowOrb = createDiplomaMesh(0.85);
      glowOrb.position.set(0, 1.65, 0);
      cGroup.add(glowOrb);

      cGroup.position.set(x, y, z);
      cGroup.rotation.y = rotY;
      group.add(cGroup);
      world.circles.push({ x, z, r: 0.92, y, active: true });
      world.chests.push({ mesh: cGroup, lidPivot, glowOrb, x, z, y, buildingId, opened: false, openProgress: 0, rewardType: 'diploma', title, desc });
    }

    // 1. Biblioteca UNIGRAN (Bloco A — Térreo)
    addDiplomaChest(-14.5, 17.8, 0, 0, 'Diploma da Biblioteca UNIGRAN!', 'Você visitou a Biblioteca acessível no Térreo do Bloco A!', 'bloco_a');
    // 2. Auditório UNIGRAN (Bloco A — 1º Andar)
    addDiplomaChest(15.5, 15.2, FLOOR2_Y, 0, 'Diploma do Auditório UNIGRAN!', 'Você subiu ao 1º Andar do Bloco A e conheceu o Auditório e Salas de Aula!', 'bloco_a');
    // 3. Labs Engenharia de Software — 40 PCs (Bloco A — 2º Andar)
    addDiplomaChest(-3.0, 29.0, FLOOR3_Y, 0, 'Diploma de Engenharia de Software!', 'Você subiu ao 2º Andar do Bloco A com os 2 Labs de 40 Computadores e o Emerson!', 'bloco_a');
    // 4. Bloco B (Podcast / Arquitetura / Design — 2º Andar)
    addDiplomaChest(52.0, -6.5, FLOOR2_Y, 0, 'Diploma do Bloco B!', 'Você conheceu o Estúdio de Podcast, Arquitetura e Design no Bloco B!', 'bloco_b');
    // 5. Bloco C (Saúde & Microscópios — 2º Andar)
    addDiplomaChest(-31.5, -39.0, FLOOR2_Y, 0, 'Diploma do Bloco C (Saúde)!', 'Você visitou as salas de microscópios e clínicas no Bloco C!', 'bloco_c');

    // ==================== PLACAS DIRECIONAIS ====================
    function addSign(x, z, rotY, speaker, text) {
      const sGroup = new THREE.Group();
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 1.05, 6), matIron);
      post.position.y = 0.52;
      sGroup.add(post);
      const board = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.75, 0.14), matUnigranBlue);
      board.position.y = 1.15;
      sGroup.add(board);
      const border = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.6, 0.16), matCream);
      border.position.y = 1.15;
      sGroup.add(border);
      sGroup.position.set(x, 0, z);
      sGroup.rotation.y = rotY;
      group.add(sGroup);
      world.circles.push({ x, z, r: 0.45, y: 0, active: true });
      world.signs.push({ x, z, y: 0, speaker, text });
    }

    addSign(6.5, 48.0, -0.25, 'Entrada UNIGRAN Capital — Bloco A', 'Logo à frente está o BLOCO A (3 Andares): no Térreo ficam o Balcão de Informações, o EMAJUC/Direito à direita e a Biblioteca à frente; subindo a 1ª escada ficam Salas de Aula e Auditório; subindo a 2ª escada ficam os 2 Laboratórios de Engenharia de Software com 40 computadores jogáveis!');
    addSign(26.5, -4.0, -Math.PI / 2, 'Entrada do BLOCO B', 'BLOCO B (2 Andares): Térreo = Publicidade & Estúdio de Podcast ON AIR; 2º Andar = Arquitetura e Urbanismo (maquete) e Design de Interiores!');
    addSign(6.0, -19.5, 0, 'Entrada do BLOCO C & Ginásio', 'BLOCO C (2 Andares): Saúde, Biomedicina (microscópios), Fisioterapia, Enfermagem, Radiologia, Nutrição e Estética! Atravessando a Rua das Garças atrás do Bloco C está o GINÁSIO POLIESPORTIVO!');

    function addUnigranEntrancePortal(cx, cz, logoTex) {
      const arch = new THREE.Group();
      [-6.8, 6.8].forEach((px) => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.45, 5.5, 1.45), matUnigranBlue);
        pillar.position.set(px, 2.75, 0);
        arch.add(pillar);
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.35, 1.55), matGold);
        stripe.position.set(px, 5.15, 0);
        arch.add(stripe);
        world.circles.push({ x: cx + px, z: cz, r: 0.85, y: 0, active: true });
      });

      const beam = new THREE.Mesh(new THREE.BoxGeometry(15.2, 2.85, 1.3), matUnigranBlue);
      beam.position.set(0, 6.5, 0);
      arch.add(beam);

      const logoMat = new THREE.MeshBasicMaterial({ map: logoTex });
      const frontSign = new THREE.Mesh(new THREE.PlaneGeometry(14.0, 2.55), logoMat);
      frontSign.position.set(0, 6.5, 0.68);
      arch.add(frontSign);
      const backSign = new THREE.Mesh(new THREE.PlaneGeometry(14.0, 2.55), logoMat);
      backSign.rotation.y = Math.PI;
      backSign.position.set(0, 6.5, -0.68);
      arch.add(backSign);

      const crownLogo = createUnigran3DLogo(1.22, 0.24);
      crownLogo.position.set(0, 9.2, 0);
      arch.add(crownLogo);

      arch.position.set(cx, 0, cz);
      group.add(arch);
    }

    function addBasketballHoop(hx, hz, rotY) {
      const hGroup = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 4.2, 7), matIron);
      pole.position.y = 2.1;
      hGroup.add(pole);
      const board = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.35, 0.12), matMarble);
      board.position.set(0, 4.1, 0.35);
      hGroup.add(board);
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.06, 6, 12), matOrange);
      hoop.rotation.x = Math.PI / 2;
      hoop.position.set(0, 3.65, 0.85);
      hGroup.add(hoop);
      hGroup.position.set(hx, 0, hz);
      hGroup.rotation.y = rotY;
      group.add(hGroup);
      world.circles.push({ x: hx, z: hz, r: 0.45, y: 0, active: true });
    }

    const ffCount = 65;
    const ffPos = new Float32Array(ffCount * 3);
    for (let i = 0; i < ffCount; i++) {
      ffPos[i * 3] = (Math.random() - 0.5) * 145;
      ffPos[i * 3 + 1] = 1.0 + Math.random() * 4.5;
      ffPos[i * 3 + 2] = (Math.random() - 0.5) * 145;
    }
    const ffGeo = new THREE.BufferGeometry();
    ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
    const fireflies = new THREE.Points(ffGeo, new THREE.PointsMaterial({ color: 0xffe97d, size: 0.24, transparent: true, opacity: 0.6 }));
    group.add(fireflies);
    world.fireflies = { points: fireflies };

    // Ordena lajes da mais alta para a mais baixa para detecção precisa de 3 andares!
    world.upperSlabs.sort((a, b) => b.floorY - a.floorY);

    return world;
  }

  function getGroundHeight(world, x, z, currentY) {
    // 1. Verifica escadas compatíveis com a altura atual
    for (let i = 0; i < world.stairs.length; i++) {
      const st = world.stairs[i];
      if (currentY < st.minYTrigger || currentY > st.maxYTrigger) continue;
      if (x >= st.minX && x <= st.maxX && z >= st.minZ && z <= st.maxZ) {
        const coord = st.axis === 'z' ? z : x;
        const t = Math.max(0, Math.min(1, (coord - st.startCoord) / (st.endCoord - st.startCoord)));
        return st.yBottom + t * (st.yTop - st.yBottom);
      }
    }
    // 2. Verifica lajes superiores (da mais alta para a mais baixa)
    for (let i = 0; i < world.upperSlabs.length; i++) {
      const sl = world.upperSlabs[i];
      if (currentY < sl.floorY - 2.3) continue;
      if (x >= sl.minX - 0.4 && x <= sl.maxX + 0.4 && z >= sl.minZ - 0.4 && z <= sl.maxZ + 0.4) {
        if (sl.cutout && x >= sl.cutout.minX && x <= sl.cutout.maxX && z >= sl.cutout.minZ && z <= sl.cutout.maxZ) {
          continue;
        }
        return sl.floorY;
      }
    }
    return 0;
  }

  function resolveCollisions(world, pos, radius) {
    pos.x = Math.max(-world.limit, Math.min(world.limit, pos.x));
    pos.z = Math.max(-world.limit, Math.min(world.limit, pos.z));
    const py = pos.y || 0;

    for (let i = 0; i < world.circles.length; i++) {
      const c = world.circles[i];
      if (!c.active || Math.abs(py - (c.y || 0)) > 2.2) continue;
      const dx = pos.x - c.x;
      const dz = pos.z - c.z;
      const minDist = radius + c.r;
      const distSq = dx * dx + dz * dz;
      if (distSq < minDist * minDist && distSq > 0.00001) {
        const dist = Math.sqrt(distSq);
        const overlap = minDist - dist;
        pos.x += (dx / dist) * overlap;
        pos.z += (dz / dist) * overlap;
      }
    }

    for (let i = 0; i < world.boxes.length; i++) {
      const b = world.boxes[i];
      const bMinY = b.minY !== undefined ? b.minY : 0;
      const bMaxY = b.maxY !== undefined ? b.maxY : 4.0;
      if (py + 1.8 <= bMinY || py >= bMaxY - 0.15) continue;

      const closestX = Math.max(b.minX, Math.min(pos.x, b.maxX));
      const closestZ = Math.max(b.minZ, Math.min(pos.z, b.maxZ));
      const dx = pos.x - closestX;
      const dz = pos.z - closestZ;
      const distSq = dx * dx + dz * dz;
      if (distSq < radius * radius) {
        if (distSq > 0.00001) {
          const dist = Math.sqrt(distSq);
          const overlap = radius - dist;
          pos.x += (dx / dist) * overlap;
          pos.z += (dz / dist) * overlap;
        } else {
          pos.z += radius;
        }
      }
    }
  }

  function updateBuildingCutaways(world, playerPos, npcs) {
    let insideId = null;
    let maxVisibleY = 999;

    for (let i = 0; i < world.buildings.length; i++) {
      const b = world.buildings[i];
      const inside =
        playerPos.x >= b.minX - 0.8 &&
        playerPos.x <= b.maxX + 0.8 &&
        playerPos.z >= b.minZ - 0.8 &&
        playerPos.z <= b.maxZ + 0.8;

      b.roofGroup.visible = !inside;
      b.southUpperWall.visible = !inside;

      if (inside) {
        insideId = b.id;
        if (playerPos.y < 2.2) {
          if (b.floor2Group) b.floor2Group.visible = false;
          if (b.floor3Group) b.floor3Group.visible = false;
          maxVisibleY = 2.2;
        } else if (playerPos.y < 6.4) {
          if (b.floor2Group) b.floor2Group.visible = true;
          if (b.floor3Group) b.floor3Group.visible = false;
          maxVisibleY = 6.4;
        } else {
          if (b.floor2Group) b.floor2Group.visible = true;
          if (b.floor3Group) b.floor3Group.visible = true;
          maxVisibleY = 999;
        }
      } else {
        if (b.floor2Group) b.floor2Group.visible = true;
        if (b.floor3Group) b.floor3Group.visible = true;
      }
    }

    if (npcs) {
      for (let i = 0; i < npcs.length; i++) {
        const n = npcs[i];
        if (n.buildingId && n.buildingId === insideId) {
          n.group.visible = n.y < maxVisibleY;
        } else {
          n.group.visible = true;
        }
      }
    }
    for (let i = 0; i < world.chests.length; i++) {
      const ch = world.chests[i];
      if (ch.buildingId && ch.buildingId === insideId) {
        ch.mesh.visible = ch.y < maxVisibleY;
      } else {
        ch.mesh.visible = true;
      }
    }
  }

  function updateWorld(world, dt, elapsed) {
    for (let i = 0; i < world.chests.length; i++) {
      const ch = world.chests[i];
      if (!ch.opened) {
        ch.glowOrb.position.y = 1.65 + Math.sin(elapsed * 3.0 + i) * 0.16;
        ch.glowOrb.rotation.y += dt * 1.9;
      } else {
        ch.glowOrb.visible = false;
        if (ch.openProgress < 1) {
          ch.openProgress = Math.min(1, ch.openProgress + dt * 2.6);
          ch.lidPivot.rotation.x = -ch.openProgress * 1.75;
        }
      }
    }
    for (let i = 0; i < world.arcadeStations.length; i++) {
      const st = world.arcadeStations[i];
      if (st.beacon) {
        st.beacon.rotation.y += dt * 2.4;
        st.beacon.position.y = st.y + 1.55 + Math.sin(elapsed * 3.6 + i) * 0.14;
      }
    }
    for (let i = 0; i < world.pedestalDiplomas.length; i++) {
      const d = world.pedestalDiplomas[i];
      if (d.visible) {
        d.rotation.y += dt * 1.8;
        d.position.y = 1.55 + Math.sin(elapsed * 3 + i) * 0.12;
      }
    }
    if (world.centralLogo) {
      world.centralLogo.rotation.y += dt * 0.75;
      world.centralLogo.position.y = 3.4 + Math.sin(elapsed * 2.0) * 0.15;
    }
    if (world.fireflies) {
      world.fireflies.points.position.y = Math.sin(elapsed * 1.4) * 0.35;
    }
  }

  function getAreaName(world, x, z, y) {
    for (let i = 0; i < world.buildings.length; i++) {
      const b = world.buildings[i];
      if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) {
        if (b.id === 'ginasio') return 'Ginásio Poliesportivo UNIGRAN — Educação Física (R. das Garças)';
        if (b.id === 'bloco_a') {
          if (y >= 6.4) return 'BLOCO A (2º Andar) — Labs Eng. de Software (40 Computadores • Clique p/ Jogar!)';
          if (y >= 2.2) return 'BLOCO A (1º Andar) — Auditório & Salas de Aula';
          return 'BLOCO A (Térreo) — Balcão de Informações, EMAJUC & Biblioteca';
        }
        if (b.id === 'bloco_b') {
          return y >= 2.2
            ? 'BLOCO B (2º Andar) — Arquitetura e Urbanismo & Design de Interiores'
            : 'BLOCO B (Térreo) — Publicidade & Estúdio de Podcast ON AIR';
        }
        return y >= 2.2
          ? 'BLOCO C (2º Andar) — Microscopia 2, Nutrição & Estética'
          : 'BLOCO C (Térreo) — Biomedicina, Fisioterapia, Enfermagem & Radiologia';
      }
    }
    if (z >= 56) return 'Rua Abrão Júlio Rahe, 325 • Entrada UNIGRAN Capital';
    if (z <= -55 && z >= -75) return 'Rua das Garças • Entre o Bloco C e o Ginásio';
    if (z < -75) return 'Entorno do Ginásio Poliesportivo • Rua das Garças';
    if (x <= -61) return 'Rua José Antônio • Lateral Oeste';
    if (x >= 61) return 'Rua Padre João Crippa • Lateral Leste';
    if (x <= -32 && z >= -18 && z <= 36) return 'Estacionamento Interno • UNIGRAN Capital';
    return 'Pátio Central • UNIGRAN Capital (Blocos A, B e C)';
  }

  return {
    FLOOR2_Y,
    FLOOR3_Y,
    createDiplomaMesh,
    buildWorld,
    getGroundHeight,
    resolveCollisions,
    updateBuildingCutaways,
    updateWorld,
    getAreaName
  };
})();
