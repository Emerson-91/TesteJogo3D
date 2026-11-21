// Entidades 3D — Tour Interativo UNIGRAN Capital (Avatar Homem/Mulher/Cachorro + 15 Coordenadores de Cursos com Quiz)
window.GameEntities = (() => {
  const STORAGE_KEY = 'unigran_tour_avatar_v2';

  const DEFAULT_CUSTOM_DATA = {
    name: 'Visitante',
    species: 'man',       // 'man' | 'woman' | 'dog'
    hairStyle: 'short',   // 'short' | 'long' | 'ponytail' | 'curly' | 'spiky' | 'cap' | 'grad' | 'none'
    outfit: 'unigran',    // 'unigran' | 'labcoat' | 'jersey' | 'plain'
    beard: 'none',        // 'none' | 'full'
    glasses: 'none',      // 'none' | 'clear' | 'shades'
    skinColor: '#dc986a',
    hairColor: '#24150e',
    shirtColor: '#004274',
    pantsColor: '#1e293b',
    shoesColor: '#f1f5f9',
    portraitDataUrl: 'img/logo.png'
  };

  let customHeroData = loadCustomHeroData();

  function loadCustomHeroData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged = { ...DEFAULT_CUSTOM_DATA, ...parsed };
        if (!['man', 'woman', 'dog'].includes(merged.species)) merged.species = 'man';
        if (!['unigran', 'labcoat', 'jersey', 'plain'].includes(merged.outfit)) merged.outfit = 'unigran';
        return merged;
      }
    } catch (_) {}
    return { ...DEFAULT_CUSTOM_DATA };
  }

  function hexToInt(hexStr, fallback = 0x004274) {
    if (typeof hexStr === 'number') return hexStr;
    if (typeof hexStr === 'string') {
      const parsed = parseInt(hexStr.replace('#', ''), 16);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return fallback;
  }

  function saveCustomHeroData(newData) {
    customHeroData = { ...DEFAULT_CUSTOM_DATA, ...newData };
    customHeroData.name = (customHeroData.name || 'Visitante').trim() || 'Visitante';
    if (!['man', 'woman', 'dog'].includes(customHeroData.species)) customHeroData.species = 'man';
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customHeroData));
    } catch (_) {}
    return { ...customHeroData };
  }

  function getCustomHeroData() {
    return { ...customHeroData };
  }

  const sharedParticleGeo = new THREE.BoxGeometry(1, 1, 1);

  function createShirtLogoTexture(bgHex, ringYellow, ringBlue, centered = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 256, 256);

    const cx = centered ? 128 : 162;
    const cy = centered ? 120 : 108;
    const r = centered ? 48 : 34;

    ctx.lineWidth = centered ? 11 : 8;
    ctx.lineCap = 'round';
    ctx.strokeStyle = ringYellow;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 1.85);
    ctx.stroke();

    ctx.strokeStyle = ringBlue;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();

    ctx.fillStyle = ringBlue;
    ctx.font = `900 ${centered ? 52 : 36}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('U', cx, cy + 2);

    const tex = new THREE.CanvasTexture(canvas);
    if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  let cachedLogoImg = null;
  const logoListeners = [];
  (function preloadLogo() {
    const img = new Image();
    img.onload = () => {
      cachedLogoImg = img;
      while (logoListeners.length > 0) {
        const fn = logoListeners.shift();
        fn(img);
      }
    };
    img.src = 'img/logo.png';
  })();

  function createCustomShirtTexture(shirtColor, outfit) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const tex = new THREE.CanvasTexture(canvas);
    if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;

    function draw(logoImg) {
      if (outfit === 'labcoat') {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = shirtColor;
        ctx.fillRect(92, 0, 72, 256);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(92, 0);
        ctx.lineTo(92, 256);
        ctx.moveTo(164, 0);
        ctx.lineTo(164, 256);
        ctx.stroke();
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(176, 68, 54, 46);
        ctx.fillStyle = '#0d9488';
        ctx.fillRect(198, 76, 10, 30);
        ctx.fillRect(188, 86, 30, 10);
      } else {
        ctx.fillStyle = shirtColor;
        ctx.fillRect(0, 0, 256, 256);
        if (outfit === 'jersey') {
          ctx.fillStyle = 'rgba(255,255,255,0.22)';
          ctx.fillRect(0, 180, 256, 24);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(0, 206, 256, 16);
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 96px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('10', 128, 108);
        } else if (outfit === 'unigran' && logoImg) {
          ctx.drawImage(logoImg, 68, 56, 120, 120);
        }
      }
      tex.needsUpdate = true;
    }

    draw(cachedLogoImg);
    if (outfit === 'unigran' && !cachedLogoImg) {
      logoListeners.push(draw);
    }
    return tex;
  }

  const emersonShirtTex = createShirtLogoTexture('#1b2236', '#facc15', '#38bdf8', false);

  // ==================== MODELO 3D ORIGINAL: EMERSON (ENGENHARIA DE SOFTWARE) ====================
  function buildEmerson3D() {
    const rig = new THREE.Group();
    const parts = {
      bodyPivot: new THREE.Group(),
      head: new THREE.Group(),
      leftArm: new THREE.Group(),
      rightArm: new THREE.Group(),
      leftLeg: new THREE.Group(),
      rightLeg: new THREE.Group(),
      tail: null
    };
    rig.add(parts.bodyPivot);

    const matSkin = new THREE.MeshLambertMaterial({ color: 0xdc986a });
    const matHair = new THREE.MeshLambertMaterial({ color: 0x432415 });
    const matShirt = new THREE.MeshLambertMaterial({ color: 0x1b2236 });
    const matShirtFront = new THREE.MeshLambertMaterial({ map: emersonShirtTex });
    const matJeans = new THREE.MeshLambertMaterial({ color: 0x254f88 });
    const matShoe = new THREE.MeshLambertMaterial({ color: 0x1b1e24 });
    const matWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const matDark = new THREE.MeshBasicMaterial({ color: 0x121212 });

    const torsoMats = [matShirt, matShirt, matShirt, matShirt, matShirtFront, matShirt];
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.96, 0.56), torsoMats);
    torso.position.y = 1.44;
    parts.bodyPivot.add(torso);

    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.24, 0.52), matJeans);
    hips.position.y = 0.88;
    parts.bodyPivot.add(hips);

    parts.head.position.set(0, 2.02, 0.02);
    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.62, 0.56), matSkin);
    skull.position.y = 0.28;
    parts.head.add(skull);

    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.16, 0.59), matHair);
    hairTop.position.set(0, 0.58, -0.02);
    parts.head.add(hairTop);

    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.14), matHair);
    hairBack.position.set(0, 0.34, -0.25);
    parts.head.add(hairBack);

    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.34, 0.42), matHair);
    beard.position.set(0, 0.09, 0.13);
    parts.head.add(beard);

    const beardTip = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.34), matHair);
    beardTip.position.set(0, -0.1, 0.14);
    parts.head.add(beardTip);

    const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.06), matWhite);
    teeth.position.set(0, 0.14, 0.33);
    parts.head.add(teeth);

    [-0.14, 0.14].forEach((ex) => {
      const eyeW = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.05), matWhite);
      eyeW.position.set(ex, 0.35, 0.27);
      parts.head.add(eyeW);
      const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.06), matDark);
      pupil.position.set(ex, 0.35, 0.28);
      parts.head.add(pupil);
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, 0.06), matHair);
      brow.position.set(ex, 0.43, 0.28);
      brow.rotation.z = ex < 0 ? -0.22 : 0.22;
      parts.head.add(brow);
    });

    [-0.32, 0.32].forEach((ex) => {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.12), matSkin);
      ear.position.set(ex, 0.3, 0);
      parts.head.add(ear);
    });
    parts.bodyPivot.add(parts.head);

    function buildArm(side) {
      const armGroup = new THREE.Group();
      armGroup.position.set(side * 0.66, 1.78, 0.02);
      const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 0.36), matShirt);
      sleeve.position.y = -0.12;
      armGroup.add(sleeve);
      const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.44, 0.3), matSkin);
      forearm.position.set(0, -0.46, 0.04);
      armGroup.add(forearm);
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.28), matSkin);
      hand.position.set(0, -0.72, 0.06);
      armGroup.add(hand);
      return armGroup;
    }

    parts.leftArm = buildArm(-1);
    parts.rightArm = buildArm(1);
    parts.bodyPivot.add(parts.leftArm);
    parts.bodyPivot.add(parts.rightArm);

    function buildLeg(side) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.24, 0.82, 0);
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.66, 0.36), matJeans);
      leg.position.y = -0.32;
      legGroup.add(leg);
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.48), matShoe);
      shoe.position.set(0, -0.72, 0.06);
      legGroup.add(shoe);
      return legGroup;
    }

    parts.leftLeg = buildLeg(-1);
    parts.rightLeg = buildLeg(1);
    parts.bodyPivot.add(parts.leftLeg);
    parts.bodyPivot.add(parts.rightLeg);

    return { rig, parts };
  }

  // ==================== MODELO 3D CUSTOMIZÁVEL (HOMEM, MULHER OU CACHORRO) ====================
  function buildCustomHero3D(cfg = customHeroData) {
    const rig = new THREE.Group();
    const species = cfg.species || 'man';
    const isDog = species === 'dog';
    const isWoman = species === 'woman';
    const isLabCoat = cfg.outfit === 'labcoat';

    const parts = {
      bodyPivot: new THREE.Group(),
      head: new THREE.Group(),
      leftArm: new THREE.Group(),
      rightArm: new THREE.Group(),
      leftLeg: new THREE.Group(),
      rightLeg: new THREE.Group(),
      tail: isDog ? new THREE.Group() : null
    };
    rig.add(parts.bodyPivot);

    const matSkin = new THREE.MeshLambertMaterial({ color: hexToInt(cfg.skinColor, isDog ? 0x059be5 : 0xdc986a) });
    const matHair = new THREE.MeshLambertMaterial({ color: hexToInt(cfg.hairColor, 0x24150e) });
    const matShirtSide = new THREE.MeshLambertMaterial({ color: isLabCoat ? 0xf8fafc : hexToInt(cfg.shirtColor, 0x004274) });
    const shirtFrontTex = createCustomShirtTexture(cfg.shirtColor || '#004274', cfg.outfit || 'unigran');
    const matShirtFront = new THREE.MeshLambertMaterial({ map: shirtFrontTex });
    const matPants = new THREE.MeshLambertMaterial({ color: hexToInt(cfg.pantsColor, 0x1e293b) });
    const matShoe = new THREE.MeshLambertMaterial({ color: hexToInt(cfg.shoesColor, 0xf1f5f9) });
    const matBlack = new THREE.MeshLambertMaterial({ color: 0x111418 });
    const matGold = new THREE.MeshLambertMaterial({ color: 0xf7d426 });
    const matWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const matLips = new THREE.MeshBasicMaterial({ color: 0xc24158 });

    const torsoW = isWoman ? 0.78 : (isDog ? 0.84 : 0.92);
    const torsoH = isWoman ? 0.90 : 0.94;
    const torsoD = isWoman ? 0.46 : (isDog ? 0.50 : 0.54);
    const armOffsetX = isWoman ? 0.54 : (isDog ? 0.58 : 0.63);
    const armW = isWoman ? 0.25 : (isDog ? 0.28 : 0.32);
    const legOffsetX = isWoman ? 0.20 : 0.23;
    const legW = isWoman ? 0.28 : 0.33;

    const torsoMats = [matShirtSide, matShirtSide, matShirtSide, matShirtSide, matShirtFront, matShirtSide];
    const torso = new THREE.Mesh(new THREE.BoxGeometry(torsoW, torsoH, torsoD), torsoMats);
    torso.position.y = 1.44;
    parts.bodyPivot.add(torso);

    if (isLabCoat) {
      const coatHem = new THREE.Mesh(new THREE.BoxGeometry(torsoW + 0.04, 0.34, torsoD + 0.04), matShirtSide);
      coatHem.position.y = 0.86;
      parts.bodyPivot.add(coatHem);
    } else {
      const hips = new THREE.Mesh(new THREE.BoxGeometry(isWoman ? 0.82 : (torsoW - 0.04), 0.26, torsoD - 0.02), matPants);
      hips.position.y = 0.88;
      parts.bodyPivot.add(hips);
    }

    if (isDog && parts.tail) {
      parts.tail.position.set(0, 0.92, -0.28);
      const tailMesh = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.56, 7), matSkin);
      tailMesh.rotation.x = -Math.PI * 0.62;
      tailMesh.position.set(0, 0.14, -0.22);
      parts.tail.add(tailMesh);
      parts.bodyPivot.add(parts.tail);
    }

    parts.head.position.set(0, isWoman ? 1.98 : 2.0, 0.02);
    const headW = isWoman ? 0.54 : (isDog ? 0.56 : 0.58);
    const headH = isWoman ? 0.56 : 0.60;
    const headD = isWoman ? 0.50 : 0.54;

    const skull = new THREE.Mesh(new THREE.BoxGeometry(headW, headH, headD), matSkin);
    skull.position.y = 0.28;
    parts.head.add(skull);

    if (isDog) {
      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.3, 0.48), matSkin);
      snout.position.set(0, 0.24, 0.42);
      parts.head.add(snout);
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), matBlack);
      nose.position.set(0, 0.32, 0.66);
      parts.head.add(nose);
      [-0.17, 0.17].forEach((ex) => {
        const topEar = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 5), matSkin);
        topEar.position.set(ex, 0.68, -0.02);
        parts.head.add(topEar);
      });
      [-0.33, 0.33].forEach((ex) => {
        const flopEar = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.46, 0.22), matHair);
        flopEar.position.set(ex, 0.22, -0.06);
        flopEar.rotation.z = ex < 0 ? 0.18 : -0.18;
        parts.head.add(flopEar);
      });
    } else {
      const earX = headW * 0.5 + 0.02;
      [-earX, earX].forEach((ex) => {
        const ear = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.11), matSkin);
        ear.position.set(ex, 0.29, 0);
        parts.head.add(ear);
      });
    }

    const hs = cfg.hairStyle || 'short';
    if (hs === 'short') {
      const hTop = new THREE.Mesh(new THREE.BoxGeometry(headW + 0.05, 0.17, headD + 0.05), matHair);
      hTop.position.set(0, 0.57, -0.02);
      parts.head.add(hTop);
      const hBack = new THREE.Mesh(new THREE.BoxGeometry(headW + 0.03, 0.4, 0.14), matHair);
      hBack.position.set(0, 0.34, -(headD * 0.5) + 0.02);
      parts.head.add(hBack);
    } else if (hs === 'long') {
      const hTop = new THREE.Mesh(new THREE.BoxGeometry(headW + 0.08, 0.18, headD + 0.07), matHair);
      hTop.position.set(0, 0.56, -0.02);
      parts.head.add(hTop);
      const hLongBack = new THREE.Mesh(new THREE.BoxGeometry(headW + 0.10, 0.92, 0.18), matHair);
      hLongBack.position.set(0, 0.08, -(headD * 0.5) - 0.02);
      parts.head.add(hLongBack);
      [-1, 1].forEach((s) => {
        const strand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.78, 0.24), matHair);
        strand.position.set(s * (headW * 0.5 + 0.02), 0.14, -0.04);
        parts.head.add(strand);
      });
    } else if (hs === 'ponytail') {
      const hTop = new THREE.Mesh(new THREE.BoxGeometry(headW + 0.06, 0.18, headD + 0.06), matHair);
      hTop.position.set(0, 0.56, -0.02);
      parts.head.add(hTop);
      const hBack = new THREE.Mesh(new THREE.BoxGeometry(headW + 0.04, 0.42, 0.14), matHair);
      hBack.position.set(0, 0.34, -(headD * 0.5) + 0.02);
      parts.head.add(hBack);
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.14), matGold);
      band.position.set(0, 0.46, -(headD * 0.5) - 0.08);
      parts.head.add(band);
      const tailHair = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.68, 0.2), matHair);
      tailHair.position.set(0, 0.18, -(headD * 0.5) - 0.18);
      tailHair.rotation.x = 0.22;
      parts.head.add(tailHair);
    } else if (hs === 'curly') {
      [
        [0, 0.63, 0, 0.31], [-0.21, 0.57, 0.04, 0.23], [0.21, 0.57, 0.04, 0.23],
        [0, 0.53, -0.21, 0.27], [-0.2, 0.43, -0.19, 0.22], [0.2, 0.43, -0.19, 0.22],
        [0, 0.61, 0.15, 0.21]
      ].forEach(([cx, cy, cz, cr]) => {
        const p = new THREE.Mesh(new THREE.DodecahedronGeometry(cr, 0), matHair);
        p.position.set(cx, cy, cz);
        parts.head.add(p);
      });
    } else if (hs === 'spiky') {
      for (let k = -2; k <= 2; k++) {
        const sp = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 5), matHair);
        sp.position.set(k * 0.13, 0.71 - Math.abs(k) * 0.05, k % 2 === 0 ? 0.08 : -0.12);
        sp.rotation.z = -k * 0.18;
        parts.head.add(sp);
      }
      const hBase = new THREE.Mesh(new THREE.BoxGeometry(headW + 0.02, 0.14, headD + 0.02), matHair);
      hBase.position.set(0, 0.55, -0.02);
      parts.head.add(hBase);
    } else if (hs === 'cap') {
      const capMat = new THREE.MeshLambertMaterial({ color: 0x004274 });
      const capDome = new THREE.Mesh(new THREE.BoxGeometry(headW + 0.07, 0.24, headD + 0.06), capMat);
      capDome.position.set(0, 0.61, -0.02);
      parts.head.add(capDome);
      const brim = new THREE.Mesh(new THREE.BoxGeometry(headW + 0.04, 0.07, 0.32), matGold);
      brim.position.set(0, 0.52, headD * 0.5 + 0.1);
      parts.head.add(brim);
    } else if (hs === 'grad') {
      const baseCap = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.18, 8), matBlack);
      baseCap.position.set(0, 0.61, 0);
      parts.head.add(baseCap);
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.07, 0.9), matBlack);
      board.position.set(0, 0.71, 0);
      board.rotation.y = Math.PI / 4;
      parts.head.add(board);
      const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.36, 6), matGold);
      tassel.position.set(0.42, 0.55, 0.12);
      parts.head.add(tassel);
    }

    const faceZ = headD * 0.5;
    if (cfg.beard === 'full' && species === 'man') {
      const beard = new THREE.Mesh(new THREE.BoxGeometry(headW + 0.02, 0.30, 0.38), matHair);
      beard.position.set(0, 0.10, 0.13);
      parts.head.add(beard);
      const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.055, 0.06), matWhite);
      teeth.position.set(0, 0.14, faceZ + 0.04);
      parts.head.add(teeth);
    } else if (isWoman) {
      const smile = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.045, 0.04), matLips);
      smile.position.set(0, 0.14, faceZ + 0.01);
      parts.head.add(smile);
      const matBlush = new THREE.MeshBasicMaterial({ color: 0xf497a9 });
      [-0.18, 0.18].forEach((bx) => {
        const blush = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.03), matBlush);
        blush.position.set(bx, 0.24, faceZ + 0.008);
        parts.head.add(blush);
      });
    } else if (species === 'man') {
      const smile = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.04), matWhite);
      smile.position.set(0, 0.14, faceZ + 0.01);
      parts.head.add(smile);
    }

    const eyeY = isDog ? 0.42 : 0.34;
    const eyeX = isWoman ? 0.13 : 0.14;
    [-eyeX, eyeX].forEach((ex) => {
      const eyeW = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.05), matWhite);
      eyeW.position.set(ex, eyeY, faceZ - 0.005);
      parts.head.add(eyeW);
      const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), matBlack);
      pupil.position.set(ex, eyeY, faceZ + 0.008);
      parts.head.add(pupil);
      if (isWoman) {
        const lash = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.05), matBlack);
        lash.position.set(ex + (ex < 0 ? -0.02 : 0.02), eyeY + 0.05, faceZ + 0.008);
        parts.head.add(lash);
      } else if (species === 'man') {
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.05), matHair);
        brow.position.set(ex, eyeY + 0.075, faceZ + 0.008);
        parts.head.add(brow);
      }
    });

    if (cfg.glasses === 'clear' || cfg.glasses === 'shades') {
      const lensMat = cfg.glasses === 'shades'
        ? new THREE.MeshBasicMaterial({ color: 0x0f172a })
        : new THREE.MeshBasicMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.65 });
      [-eyeX, eyeX].forEach((ex) => {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.13, 0.06), matBlack);
        frame.position.set(ex, eyeY, faceZ + 0.025);
        parts.head.add(frame);
        const lens = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.095, 0.07), lensMat);
        lens.position.set(ex, eyeY, faceZ + 0.03);
        parts.head.add(lens);
      });
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.035, 0.06), matBlack);
      bridge.position.set(0, eyeY + 0.01, faceZ + 0.025);
      parts.head.add(bridge);
    }

    parts.bodyPivot.add(parts.head);

    function buildCustomArm(side) {
      const armGroup = new THREE.Group();
      armGroup.position.set(side * armOffsetX, 1.76, 0.02);
      const sleeve = new THREE.Mesh(new THREE.BoxGeometry(armW + 0.02, isLabCoat ? 0.58 : 0.34, armW + 0.02), matShirtSide);
      sleeve.position.y = isLabCoat ? -0.24 : -0.12;
      armGroup.add(sleeve);
      if (!isLabCoat) {
        const forearm = new THREE.Mesh(new THREE.BoxGeometry(armW - 0.03, 0.38, armW - 0.03), matSkin);
        forearm.position.set(0, -0.45, 0.03);
        armGroup.add(forearm);
      }
      const hand = new THREE.Mesh(new THREE.BoxGeometry(armW - 0.04, 0.22, armW - 0.04), matSkin);
      hand.position.set(0, -0.68, 0.05);
      armGroup.add(hand);
      return armGroup;
    }

    parts.leftArm = buildCustomArm(-1);
    parts.rightArm = buildCustomArm(1);
    parts.bodyPivot.add(parts.leftArm);
    parts.bodyPivot.add(parts.rightArm);

    function buildCustomLeg(side) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * legOffsetX, 0.8, 0);
      if (isDog) {
        const shortLeg = new THREE.Mesh(new THREE.BoxGeometry(legW, 0.24, legW + 0.02), matPants);
        shortLeg.position.y = -0.08;
        legGroup.add(shortLeg);
        const shin = new THREE.Mesh(new THREE.BoxGeometry(legW - 0.05, 0.46, legW - 0.03), matSkin);
        shin.position.y = -0.42;
        legGroup.add(shin);
        const paw = new THREE.Mesh(new THREE.BoxGeometry(legW - 0.02, 0.16, 0.44), matShoe);
        paw.position.set(0, -0.7, 0.08);
        legGroup.add(paw);
      } else {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(legW, 0.64, legW + 0.02), matPants);
        leg.position.y = -0.32;
        legGroup.add(leg);
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(legW + 0.02, 0.21, 0.45), matShoe);
        shoe.position.set(0, -0.7, 0.06);
        legGroup.add(shoe);
      }
      return legGroup;
    }

    parts.leftLeg = buildCustomLeg(-1);
    parts.rightLeg = buildCustomLeg(1);
    parts.bodyPivot.add(parts.leftLeg);
    parts.bodyPivot.add(parts.rightLeg);

    return { rig, parts };
  }

  function createVisitorActor(scene, cfg = customHeroData) {
    const group = new THREE.Group();
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.7, 16),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.04;
    group.add(shadow);

    const floorRing = new THREE.Mesh(
      new THREE.RingGeometry(0.64, 0.80, 20),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false })
    );
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.y = 0.055;
    group.add(floorRing);

    const modelRoot = new THREE.Group();
    group.add(modelRoot);

    const built = buildCustomHero3D(cfg);
    modelRoot.add(built.rig);
    scene.add(group);

    return {
      cfg: { ...cfg },
      group,
      modelRoot,
      rig: built.rig,
      parts: built.parts,
      shadow,
      floorRing,
      pos: group.position,
      dirX: 0,
      dirZ: -1,
      yaw: Math.PI,
      walkPhase: 0,
      baseSpeed: 11.4
    };
  }

  function rebuildVisitorActor(actor, newCfg) {
    actor.cfg = { ...newCfg };
    actor.modelRoot.remove(actor.rig);
    const built = buildCustomHero3D(newCfg);
    actor.rig = built.rig;
    actor.parts = built.parts;
    actor.modelRoot.add(actor.rig);
  }

  function animateHero3D(actor, dt, elapsed, state) {
    const { isMoving, isRunning } = state;
    const p = actor.parts;

    const targetYaw = Math.atan2(actor.dirX, actor.dirZ);
    let diff = targetYaw - actor.yaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    actor.yaw += diff * (1 - Math.exp(-16 * dt));
    actor.modelRoot.rotation.y = actor.yaw;

    if (isMoving) {
      actor.walkPhase += dt * (isRunning ? 16.5 : 11.5);
      const swing = Math.sin(actor.walkPhase);
      const hop = Math.abs(swing) * (isRunning ? 0.22 : 0.12);
      p.bodyPivot.position.y = hop;
      p.bodyPivot.rotation.x = isRunning ? 0.18 : 0.08;
      p.leftLeg.rotation.x = swing * (isRunning ? 0.85 : 0.65);
      p.rightLeg.rotation.x = -swing * (isRunning ? 0.85 : 0.65);
      p.leftArm.rotation.x = -swing * (isRunning ? 0.72 : 0.52);
      p.rightArm.rotation.x = swing * (isRunning ? 0.72 : 0.52);
      p.leftArm.rotation.z = 0.08;
      p.rightArm.rotation.z = -0.08;
      actor.shadow.scale.setScalar(1 - hop * 0.35);
    } else {
      const breath = Math.sin(elapsed * 3.4);
      p.bodyPivot.position.y = breath * 0.03;
      const relax = Math.exp(-10 * dt);
      p.bodyPivot.rotation.x *= relax;
      p.leftLeg.rotation.x *= relax;
      p.rightLeg.rotation.x *= relax;
      p.leftArm.rotation.x *= relax;
      p.rightArm.rotation.x *= relax;
      p.leftArm.rotation.z = 0.08 + breath * 0.03;
      p.rightArm.rotation.z = -0.08 - breath * 0.03;
      actor.shadow.scale.setScalar(1);
    }

    if (p.tail) {
      p.tail.rotation.y = Math.sin(elapsed * (isMoving ? 15 : 8)) * 0.42;
    }
  }

  // ==================== NPCs DO TOUR UNIGRAN (15 COORDENADORES DE CURSOS COM QUIZ + ALUNOS) ====================
  function buildHumanNPC(opts) {
    const {
      skin = 0xdc986a,
      hair = 0x24150e,
      shirt = 0x004274,
      pants = 0x1e293b,
      labCoat = false,
      glasses = false,
      beard = false,
      longHair = false,
      highlight = false
    } = opts;

    const g = new THREE.Group();
    const matSkin = new THREE.MeshLambertMaterial({ color: skin });
    const matHair = new THREE.MeshLambertMaterial({ color: hair });
    const matTop = new THREE.MeshLambertMaterial({ color: labCoat ? 0xf8fafc : shirt });
    const matInner = new THREE.MeshLambertMaterial({ color: shirt });
    const matPants = new THREE.MeshLambertMaterial({ color: pants });
    const matShoe = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const matDark = new THREE.MeshBasicMaterial({ color: 0x121212 });
    const matWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const bodyPivot = new THREE.Group();
    g.add(bodyPivot);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.92, 0.48), matTop);
    torso.position.y = 1.42;
    bodyPivot.add(torso);

    if (labCoat) {
      const inner = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.86, 0.5), matInner);
      inner.position.y = 1.44;
      bodyPivot.add(inner);
      const coatBottom = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.34, 0.5), matTop);
      coatBottom.position.y = 0.86;
      bodyPivot.add(coatBottom);
    }

    const head = new THREE.Group();
    head.position.set(0, 1.98, 0);
    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.56, 0.5), matSkin);
    skull.position.y = 0.28;
    head.add(skull);

    const hairMesh = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.18, 0.54), matHair);
    hairMesh.position.set(0, 0.56, -0.02);
    head.add(hairMesh);

    if (longHair) {
      const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.86, 0.16), matHair);
      hairBack.position.set(0, 0.10, -0.24);
      head.add(hairBack);
    } else {
      const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.38, 0.14), matHair);
      hairBack.position.set(0, 0.34, -0.22);
      head.add(hairBack);
    }

    if (beard) {
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.24, 0.34), matHair);
      bMesh.position.set(0, 0.12, 0.12);
      head.add(bMesh);
    }

    [-0.13, 0.13].forEach((ex) => {
      const eyeW = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.05), matWhite);
      eyeW.position.set(ex, 0.34, 0.25);
      head.add(eyeW);
      const pup = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.06), matDark);
      pup.position.set(ex, 0.34, 0.26);
      head.add(pup);
      if (glasses) {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.13, 0.05), matDark);
        frame.position.set(ex, 0.34, 0.28);
        head.add(frame);
      }
    });
    bodyPivot.add(head);

    [-0.56, 0.56].forEach((ax) => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.72, 0.24), matTop);
      arm.position.set(ax, 1.44, 0);
      bodyPivot.add(arm);
    });
    [-0.21, 0.21].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.68, 0.3), matPants);
      leg.position.set(lx, 0.52, 0);
      bodyPivot.add(leg);
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.42), matShoe);
      shoe.position.set(lx, 0.12, 0.06);
      bodyPivot.add(shoe);
    });

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.65, 14),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.04;
    g.add(shadow);

    let marker = null;
    if (highlight) {
      marker = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.28, 0),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      marker.position.y = 3.2;
      g.add(marker);
    }

    return { group: g, bodyPivot, marker };
  }

  function spawnCampusNPCs(scene) {
    const npcs = [];
    const F2 = GameWorld.FLOOR2_Y;
    const F3 = GameWorld.FLOOR3_Y;

    function addNPC(cfg) {
      let group, bodyPivot, marker;
      if (cfg.useEmersonModel) {
        group = new THREE.Group();
        const built = buildEmerson3D();
        group.add(built.rig);
        bodyPivot = built.parts.bodyPivot;
        const shadow = new THREE.Mesh(
          new THREE.CircleGeometry(0.7, 14),
          new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.04;
        group.add(shadow);
        marker = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.3, 0),
          new THREE.MeshBasicMaterial({ color: 0x38e8ff })
        );
        marker.position.y = 3.25;
        group.add(marker);
      } else {
        const built = buildHumanNPC(cfg.look || {});
        group = built.group;
        bodyPivot = built.bodyPivot;
        marker = built.marker;
      }

      group.position.set(cfg.x, cfg.y || 0, cfg.z);
      group.rotation.y = cfg.rotY || 0;
      scene.add(group);

      npcs.push({
        id: cfg.id,
        name: cfg.name,
        role: cfg.role,
        area: cfg.area || null,
        courseName: cfg.courseName || null,
        buildingId: cfg.buildingId || null,
        dialogue: cfg.dialogue,
        quiz: cfg.quiz || null,
        group,
        bodyPivot,
        marker,
        pos: group.position,
        y: cfg.y || 0,
        baseRotY: cfg.rotY || 0,
        highlight: !!cfg.highlight,
        talked: false,
        phase: Math.random() * Math.PI * 2
      });
    }

    // ==================== BALCÃO DE INFORMAÇÕES (TÉRREO BLOCO A) & PÁTIO ====================
    addNPC({
      id: 'guia_central',
      name: 'Balcão de Informações • UNIGRAN',
      role: 'Recepção • Bloco A (Térreo)',
      buildingId: 'bloco_a',
      x: 0.0, z: 34.4, y: 0, rotY: 0, highlight: true,
      look: { shirt: 0x004274, pants: 0x1e293b, hair: 0x3b2214, skin: 0xe0a882, longHair: true, highlight: true },
      dialogue: 'Olá! Bem-vindo ao Balcão de Informações do BLOCO A da UNIGRAN Capital (Rua Abrão Júlio Rahe, 325)! Aqui no Térreo: à direita fica o EMAJUC / Direito e logo à frente a Biblioteca UNIGRAN! Subindo a escada à esquerda você chega às Salas de Aula e ao Auditório, e subindo a 2ª escada chega aos 2 Laboratórios de Informática de Engenharia de Software com 40 computadores (clique nos PCs para jogar GameLuta ou Jogo de Fase!). Atrás do Bloco A ficam o Pátio Central, o Bloco B (Podcast/Arquitetura/Design), o Bloco C (Saúde) e o Ginásio do outro lado da Rua das Garças!'
    });
    addNPC({
      id: 'aluno_praca1',
      name: 'Lucas (Estudante)',
      role: 'Pátio Central UNIGRAN',
      x: 5.5, z: 2.0, y: 0, rotY: -0.6,
      look: { shirt: 0xfacc15, pants: 0x254f88, hair: 0x1a1412, skin: 0xd4966a },
      dialogue: 'Subiu até o 2º Andar do Bloco A? Lá nos 2 laboratórios de 40 computadores da Engenharia de Software você pode clicar nos PCs para jogar o GameLuta e o Jogo de Fase da UNIGRAN!'
    });

    // ==================== BLOCO A (2º ANDAR — 2 LABS COM 40 PCs!) — ENGENHARIA DE SOFTWARE ====================
    addNPC({
      id: 'coord_software',
      name: 'Emerson — Eng. de Software',
      role: 'Coordenador • Bloco A (2º Andar — 40 PCs)',
      area: 'exatas',
      courseName: 'Engenharia de Software',
      buildingId: 'bloco_a',
      x: -3.0, z: 24.5, y: F3, rotY: 0, highlight: true,
      useEmersonModel: true,
      dialogue: 'E aí, bem-vindo aos Laboratórios de Informática de Engenharia de Software aqui no 2º Andar do Bloco A! Temos 2 laboratórios completos totalizando 40 computadores (20 no Lab 1 à esquerda e 20 no Lab 2 à direita)! Clique nos computadores ou aperte E nos totens dos labs para jogar o GameLuta ou o Jogo de Fase UNIGRAN — e bora fazer o Quiz de Engenharia de Software!',
      quiz: {
        id: 'software',
        courseTag: 'BLOCO A (2º ANDAR) • ENG. DE SOFTWARE',
        title: 'Quiz com o Emerson',
        questions: [
          {
            q: 'O que um programa de computador faz?',
            options: ['Executa tarefas automaticamente', 'Desenha imagens na parede', 'Faz comida', 'Constrói prédios'],
            answer: 0,
            explain: 'Programas de computador executam instruções e tarefas de forma automatizada para resolver problemas reais!'
          },
          {
            q: 'Para que servem o mouse e o teclado?',
            options: ['Para interagir com o computador', 'Para decorar a mesa', 'Para guardar arquivos', 'Para imprimir documentos'],
            answer: 0,
            explain: 'São dispositivos de entrada que permitem controlar e enviar comandos ao computador.'
          },
          {
            q: 'O que é um arquivo digital?',
            options: ['Um documento guardado no computador', 'Uma folha de papel', 'Uma caixa de ferramentas', 'Um livro físico'],
            answer: 0,
            explain: 'Arquivos digitais armazenam dados, códigos, textos e imagens dentro de sistemas computacionais.'
          },
          {
            q: 'Qual destas opções é um exemplo de programa?',
            options: ['Calculadora do sistema', 'Caneta', 'Caderno', 'Mesa'],
            answer: 0,
            explain: 'A calculadora do computador ou celular é um software desenvolvido com lógica de programação!'
          }
        ]
      }
    });
    addNPC({
      id: 'dev_lab1',
      name: 'Marina (Lab 1 • GameLuta)',
      role: 'Lab 1 • Bloco A (2º Andar)',
      buildingId: 'bloco_a',
      x: -12.0, z: 27.6, y: F3, rotY: 0,
      look: { shirt: 0x1e293b, pants: 0x1d4ed8, hair: 0x2a1810, skin: 0xe6b18a, glasses: true, longHair: true },
      dialogue: 'Aqui no Lab 1 tem 20 computadores! Clique em qualquer PC aqui do Lab 1 (ou aperte E no totem laranja) para entrar direto no GameLuta!'
    });
    addNPC({
      id: 'dev_lab2',
      name: 'Rafael (Lab 2 • Jogo de Fase)',
      role: 'Lab 2 • Bloco A (2º Andar)',
      buildingId: 'bloco_a',
      x: 6.2, z: 27.6, y: F3, rotY: 0,
      look: { shirt: 0x0f766e, pants: 0x111827, hair: 0x18181b, skin: 0xc98a5e },
      dialogue: 'Aqui no Lab 2 são mais 20 computadores (40 no total)! Clique nos PCs do Lab 2 (ou aperte E no totem azul) para jogar o Jogo de Fase da UNIGRAN!'
    });

    // ==================== BLOCO B (2º ANDAR) — ARQUITETURA & DESIGN ====================
    addNPC({
      id: 'coord_arquitetura',
      name: 'Coord. de Arquitetura e Urbanismo',
      role: 'Coordenadora • Bloco B (2º Andar)',
      area: 'exatas',
      courseName: 'Arquitetura e Urbanismo',
      buildingId: 'bloco_b',
      x: 44.0, z: -12.2, y: F2, rotY: 0, highlight: true,
      look: { shirt: 0x0284c7, pants: 0x1e293b, hair: 0x3b2214, skin: 0xe2a882, glasses: true, longHair: true, highlight: true },
      dialogue: 'Oi! Aqui no 2º Andar do Bloco B desenhamos espaços e cidades mais bonitas, funcionais e sustentáveis em Arquitetura e Urbanismo! Dá uma olhada na nossa maquete 3D e bora responder o Quiz!',
      quiz: {
        id: 'arquitetura',
        courseTag: 'BLOCO B • ARQUITETURA E URBANISMO',
        title: 'Quiz de Arquitetura e Urbanismo',
        questions: [
          {
            q: 'O que representa uma planta baixa na Arquitetura?',
            options: ['Um jardim com plantas pequenas', 'O desenho técnico visto de cima mostrando cômodos e medidas', 'Uma fotografia do telhado', 'Um tipo de tijolo decorativo'],
            answer: 1,
            explain: 'A planta baixa é a representação técnica em escala que mostra a distribuição dos ambientes vistos de cima.'
          },
          {
            q: 'Para que serve uma maquete em projetos arquitetônicos?',
            options: ['Visualizar formas, volumes e proporções do projeto em 3D', 'Substituir o cimento da obra', 'Medir a temperatura da água', 'Apenas enfeitar vitrines'],
            answer: 0,
            explain: 'A maquete ajuda arquitetos e clientes a compreenderem o espaço e a insolação antes da construção!'
          },
          {
            q: 'O que busca o urbanismo sustentável nas cidades?',
            options: ['Eliminar todas as áreas verdes', 'Integrar mobilidade, conforto, acessibilidade e respeito ao meio ambiente', 'Construir prédios sem janelas', 'Aumentar o desperdício de energia'],
            answer: 1,
            explain: 'O urbanismo sustentável planeja cidades mais humanas, acessíveis, arborizadas e eficientes.'
          }
        ]
      }
    });

    addNPC({
      id: 'coord_design',
      name: 'Coord. de Design de Interiores',
      role: 'Coordenadora • Bloco B (2º Andar)',
      area: 'exatas',
      courseName: 'Design de Interiores',
      buildingId: 'bloco_b',
      x: 39.2, z: -2.5, y: F2, rotY: -Math.PI / 2, highlight: true,
      look: { shirt: 0x0ea5e9, pants: 0x0f172a, hair: 0x7c4a21, skin: 0xe6b490, longHair: true, highlight: true },
      dialogue: 'Seja bem-vindo ao Design de Interiores aqui no 2º Andar do Bloco B! Transformamos ambientes unindo conforto, estética, iluminação e uso inteligente do espaço. Vamos ao Quiz?',
      quiz: {
        id: 'design',
        courseTag: 'BLOCO B • DESIGN DE INTERIORES',
        title: 'Quiz de Design de Interiores',
        questions: [
          {
            q: 'Qual cor ajuda o ambiente a parecer maior e mais iluminado?',
            options: ['Cores claras', 'Cores muito escuras', 'Somente vermelho', 'Apenas preto'],
            answer: 0,
            explain: 'Cores claras refletem melhor a luz natural e artificial, ampliando visualmente o ambiente.'
          },
          {
            q: 'Para um cantinho de leitura confortável, o que mais ajuda?',
            options: ['Som alto e luz forte', 'Luz suave, poltrona e apoio para os pés', 'Cadeira dura e sem iluminação', 'Piso escorregadio'],
            answer: 1,
            explain: 'Conforto ergonômico e iluminação adequada tornam a leitura agradável sem cansar a vista.'
          },
          {
            q: 'Qual item simples traz sensação de vida e bem-estar ao ambiente?',
            options: ['Lâmpada que pisca', 'Paredes vazias e sem cor', 'Janelas sempre fechadas', 'Plantas naturais ou artificiais'],
            answer: 3,
            explain: 'O design biofílico usa plantas para trazer acolhimento, cor e sensação de bem-estar.'
          },
          {
            q: 'Em espaços pequenos, qual móvel é mais versátil?',
            options: ['Móvel multifuncional (ex.: sofá-cama, mesa dobrável)', 'Armário gigante que ocupa a parede toda', 'Mesa que não cabe na sala', 'Cama sem espaço para circulação'],
            answer: 0,
            explain: 'Móveis multifuncionais otimizam cada centímetro mantendo a circulação livre!'
          }
        ]
      }
    });

    // 4. CIÊNCIAS CONTÁBEIS (BLOCO A — 1º ANDAR, SALA DE AULA 102!)
    addNPC({
      id: 'coord_contabeis',
      name: 'Coord. de Ciências Contábeis',
      role: 'Sala 102 • Bloco A (1º Andar)',
      area: 'exatas',
      courseName: 'Ciências Contábeis',
      buildingId: 'bloco_a',
      x: -5.0, z: 16.2, y: F2, rotY: 0, highlight: true,
      look: { shirt: 0x004274, pants: 0x111827, hair: 0x1e293b, skin: 0xd4966a, glasses: true, beard: true, highlight: true },
      dialogue: 'Olá! Bem-vindo à Sala 102 no 1º Andar do Bloco A! Em Ciências Contábeis cuidamos das contas, auditoria e impostos para apoiar decisões seguras nas organizações. Bora fazer o Quiz?',
      quiz: {
        id: 'contabeis',
        courseTag: 'BLOCO A (1º ANDAR) • CIÊNCIAS CONTÁBEIS',
        title: 'Quiz de Ciências Contábeis',
        questions: [
          {
            q: 'Se você tem R$ 1000 e gasta R$ 250, quanto sobra?',
            options: ['R$ 750', 'R$ 800', 'R$ 650', 'R$ 1000'],
            answer: 0,
            explain: 'Controle de saldo básico: R$ 1000 menos R$ 250 resulta em R$ 750!'
          },
          {
            q: 'Na Contabilidade, Ativo é:',
            options: ['Obrigação', 'Bem ou direito', 'Despesa', 'Receita'],
            answer: 1,
            explain: 'O Ativo reúne todos os bens e direitos controlados por uma empresa ou pessoa.'
          },
          {
            q: 'A DRE (Demonstração do Resultado do Exercício) apresenta:',
            options: ['Resultado do período (lucro ou prejuízo)', 'Apenas lista de funcionários', 'Layout da fábrica', 'Inventário físico'],
            answer: 0,
            explain: 'A DRE confronta receitas, custos e despesas para mostrar o resultado financeiro do período.'
          },
          {
            q: 'Quando a empresa paga a conta de energia, isso é um(a):',
            options: ['Receita', 'Despesa', 'Ativo', 'Investimento'],
            answer: 1,
            explain: 'O consumo de energia para manter a empresa funcionando é registrado como despesa.'
          }
        ]
      }
    });

    // ==================== BLOCO C — BIOLÓGICAS / SAÚDE (6 CURSOS) + GINÁSIO (ED. FÍSICA) ====================
    addNPC({
      id: 'coord_biomedicina',
      name: 'Profa. Carla — Biomedicina',
      role: 'Coordenadora • Bloco C (Térreo)',
      area: 'biologicas',
      courseName: 'Biomedicina',
      buildingId: 'bloco_c',
      x: -21.5, z: -40.5, y: 0, rotY: 0, highlight: true,
      look: { shirt: 0x0d9488, pants: 0xf1f5f9, hair: 0x4a2c18, skin: 0xe2a882, labCoat: true, glasses: true, longHair: true, highlight: true },
      dialogue: 'Bem-vindo ao Bloco C da UNIGRAN Capital! Este é o bloco da Saúde — o mais movimentado do campus! Aqui na Biomedicina realizamos análises em microscópios no Térreo e no 2º Andar. Vamos responder o Quiz de Biomedicina?',
      quiz: {
        id: 'biomedicina',
        courseTag: 'BLOCO C • BIOMEDICINA',
        title: 'Quiz de Biomedicina',
        questions: [
          {
            q: 'Qual organela produz energia na célula?',
            options: ['Ribossomo', 'Complexo de Golgi', 'Mitocôndria', 'Lisossomo'],
            answer: 2,
            explain: 'A mitocôndria realiza a respiração celular, gerando energia (ATP) para a célula!'
          },
          {
            q: 'O exame de Hemograma avalia principalmente:',
            options: ['Sangue', 'Rim', 'Cérebro', 'Pulmão'],
            answer: 0,
            explain: 'O hemograma analisa as células sanguíneas (hemácias, leucócitos e plaquetas).'
          },
          {
            q: 'Qual é a unidade fundamental da vida?',
            options: ['Glicose', 'Célula', 'Potássio', 'Tecido'],
            answer: 1,
            explain: 'Todos os seres vivos são formados por células, estudadas de perto nos microscópios da Biomedicina!'
          },
          {
            q: 'O que é uma vacina?',
            options: ['Proteção imunológica contra doenças', 'Remédio para dor de cabeça', 'Exame de sangue', 'Tipo de bactéria'],
            answer: 0,
            explain: 'A vacina estimula o sistema imunológico a criar defesas contra agentes infecciosos.'
          }
        ]
      }
    });
    addNPC({
      id: 'saude_aluno1', name: 'Beatriz (Biomedicina)', role: 'Microscópio • Bloco C', buildingId: 'bloco_c',
      x: -26.5, z: -43.5, y: 0, rotY: Math.PI,
      look: { shirt: 0x14b8a6, pants: 0x1e293b, hair: 0x1f1410, skin: 0xd99a70, labCoat: true, longHair: true },
      dialogue: 'Estou analisando lâminas celulares no microscópio aqui no Bloco C! As práticas ajudam demais.'
    });
    addNPC({
      id: 'saude_aluno2', name: 'Gabriel (Saúde)', role: 'Laboratório • Bloco C', buildingId: 'bloco_c',
      x: -17.0, z: -43.5, y: 0, rotY: Math.PI,
      look: { shirt: 0x0284c7, pants: 0x334155, hair: 0x3a2112, skin: 0x9c6644, labCoat: true },
      dialogue: 'O Bloco C da UNIGRAN Capital reúne a área da Saúde com clínicas-escola e muitos laboratórios!'
    });
    addNPC({
      id: 'saude_aluno3', name: 'Fernanda (Saúde)', role: 'Aluna • Bloco C', buildingId: 'bloco_c',
      x: -13.0, z: -34.5, y: 0, rotY: -0.7,
      look: { shirt: 0x22c55e, pants: 0x1e293b, hair: 0x7c4a21, skin: 0xebb994, labCoat: true, longHair: true },
      dialogue: 'Suba pela escada à direita para ver o 2º Andar do Bloco C: Microscopia 2, Nutrição e Estética!'
    });
    addNPC({
      id: 'saude_aluno4', name: 'Thiago (Saúde)', role: 'Corredor • Bloco C', buildingId: 'bloco_c',
      x: -28.0, z: -34.5, y: 0, rotY: 0.8,
      look: { shirt: 0x0ea5e9, pants: 0x1e293b, hair: 0x18181b, skin: 0xd18e62, labCoat: true },
      dialogue: 'Os jalecos brancos dominam o Bloco C! Atravessando a Rua das Garças atrás daqui está o Ginásio!'
    });
    addNPC({
      id: 'saude_aluno5', name: 'Amanda (Biomedicina)', role: 'Lab 2 • Bloco C (2º Andar)', buildingId: 'bloco_c',
      x: -26.0, z: -43.2, y: F2, rotY: Math.PI,
      look: { shirt: 0x0d9488, pants: 0x1e293b, hair: 0x2e1a12, skin: 0xdca076, labCoat: true, glasses: true, longHair: true },
      dialogue: 'Aqui no 2º Andar do Bloco C realizamos análises de microbiologia nos microscópios. Pegue o Diploma ali à esquerda!'
    });
    addNPC({
      id: 'saude_aluno6', name: 'Dr. Marcos (Professor)', role: 'Microscopia • Bloco C (2º Andar)', buildingId: 'bloco_c',
      x: -16.5, z: -43.2, y: F2, rotY: -0.5,
      look: { shirt: 0x004274, pants: 0x1e293b, hair: 0x64748b, skin: 0xd89c74, labCoat: true, beard: true, glasses: true },
      dialogue: 'Excelente visita! A prática nos laboratórios de microscopia é um grande diferencial da UNIGRAN Capital.'
    });

    addNPC({
      id: 'coord_enfermagem',
      name: 'Coord. de Enfermagem',
      role: 'Coordenadora • Bloco C (Térreo)',
      area: 'biologicas',
      courseName: 'Enfermagem',
      buildingId: 'bloco_c',
      x: 10.0, z: -41.0, y: 0, rotY: 0, highlight: true,
      look: { shirt: 0x0f766e, pants: 0xf1f5f9, hair: 0x2a1810, skin: 0xdc986a, labCoat: true, longHair: true, highlight: true },
      dialogue: 'Seja bem-vindo à Enfermagem no Bloco C! Cuidar das pessoas em diferentes momentos da vida é técnica, empatia e responsabilidade. Quer testar no Quiz de Enfermagem?',
      quiz: {
        id: 'enfermagem',
        courseTag: 'BLOCO C • ENFERMAGEM',
        title: 'Quiz de Enfermagem',
        questions: [
          {
            q: 'Qual é o primeiro passo ao cuidar de um corte leve?',
            options: ['Ignorar o ferimento', 'Cobrir sem limpar', 'Higienizar/limpar o ferimento', 'Colocar curativo sem lavar'],
            answer: 2,
            explain: 'Higienizar o ferimento evita infecções antes de realizar qualquer curativo.'
          },
          {
            q: 'Os sinais vitais incluem:',
            options: ['Pressão, pulso, respiração e temperatura', 'Apenas massa corporal', 'Somente colesterol', 'Apenas peso e altura'],
            answer: 0,
            explain: 'Pressão arterial, frequência cardíaca, respiração e temperatura indicam o estado vital do paciente.'
          },
          {
            q: 'Antissepsia significa:',
            options: ['Reduzir microrganismos em tecidos vivos', 'Aumentar bactérias', 'Pintar o curativo', 'Apenas enfaixar'],
            answer: 0,
            explain: 'A antissepsia elimina ou reduz microrganismos na pele para prevenir infecções.'
          },
          {
            q: 'Qual é o foco principal da Enfermagem?',
            options: ['Administração de obras', 'Cuidado integral com a saúde humana', 'Construção civil', 'Programação de jogos'],
            answer: 1,
            explain: 'A Enfermagem atua na promoção, prevenção e assistência integral à saúde das pessoas!'
          }
        ]
      }
    });
    addNPC({
      id: 'enf_aluno', name: 'Larissa (Enfermagem)', role: 'Prática Clínica • Bloco C', buildingId: 'bloco_c',
      x: 14.5, z: -43.5, y: 0, rotY: -0.6,
      look: { shirt: 0x14b8a6, pants: 0xf1f5f9, hair: 0x3b2214, skin: 0xc98a5e, labCoat: true, longHair: true },
      dialogue: 'Treinamos aferição de sinais vitais e cuidados clínicos aqui nos leitos simulados do Bloco C!'
    });

    addNPC({
      id: 'coord_radiologia',
      name: 'Coord. de Radiologia',
      role: 'Coordenador • Bloco C (Térreo)',
      area: 'biologicas',
      courseName: 'Radiologia',
      buildingId: 'bloco_c',
      x: 19.5, z: -40.5, y: 0, rotY: -0.4, highlight: true,
      look: { shirt: 0x0284c7, pants: 0x1e293b, hair: 0x1f1916, skin: 0xd8966a, labCoat: true, glasses: true, highlight: true },
      dialogue: 'Oi! Aqui na ala de Radiologia do Bloco C usamos raio X, tomografia e ressonância para apoiar diagnósticos com total segurança! Vamos ao Quiz?',
      quiz: {
        id: 'radiologia',
        courseTag: 'BLOCO C • RADIOLOGIA',
        title: 'Quiz de Radiologia',
        questions: [
          {
            q: 'O exame de Raio-X utiliza:',
            options: ['Radiação ionizante', 'Luz visível comum', 'Apenas som', 'Ondas de rádio AM'],
            answer: 0,
            explain: 'O Raio-X usa radiação ionizante de forma controlada e segura para formar imagens internas do corpo.'
          },
          {
            q: 'A Tomografia Computadorizada produz imagens em:',
            options: ['Eco sonoro', 'Endoscopia óptica', 'Cortes seccionais (fatias) do corpo', 'Raio laser colorido'],
            answer: 2,
            explain: 'A tomografia gera cortes detalhados que permitem visualizar órgãos e ossos em alta precisão.'
          },
          {
            q: 'Na Radiologia, o que é contraste?',
            options: ['Substância usada para destacar estruturas nos exames de imagem', 'Um tipo de exame de sangue', 'Um medicamento para dor muscular', 'Um equipamento de proteção'],
            answer: 0,
            explain: 'O meio de contraste realça vasos e tecidos específicos para facilitar o diagnóstico médico.'
          }
        ]
      }
    });

    addNPC({
      id: 'coord_fisioterapia',
      name: 'Coord. de Fisioterapia',
      role: 'Clínica Escola • Bloco C (Térreo)',
      area: 'biologicas',
      courseName: 'Fisioterapia',
      buildingId: 'bloco_c',
      x: -4.0, z: -37.5, y: 0, rotY: 0, highlight: true,
      look: { shirt: 0x0d9488, pants: 0x1e293b, hair: 0x432415, skin: 0xdc986a, labCoat: true, beard: true, highlight: true },
      dialogue: 'Olá! Você está na Clínica Escola de Fisioterapia no Térreo do Bloco C, com acesso acessível pela Rua das Garças! Ajudamos na prevenção e reabilitação do movimento. Vamos ao Quiz?',
      quiz: {
        id: 'fisioterapia',
        courseTag: 'BLOCO C • FISIOTERAPIA',
        title: 'Quiz de Fisioterapia',
        questions: [
          {
            q: 'O que a fisioterapia ajuda a melhorar no dia a dia?',
            options: ['Movimento e alívio da dor', 'Som de TV', 'Receitas de cozinha', 'Velocidade do Wi-Fi'],
            answer: 0,
            explain: 'A fisioterapia previne lesões, alivia dores e recupera a mobilidade funcional!'
          },
          {
            q: 'Se você está com dor nas costas por muito tempo, qual é uma boa atitude?',
            options: ['Ignorar para ver se passa', 'Ficar totalmente imóvel sempre', 'Procurar um profissional e fazer exercícios orientados', 'Carregar peso sem cuidado'],
            answer: 2,
            explain: 'Avaliação profissional e exercícios terapêuticos tratam a causa da dor com segurança.'
          },
          {
            q: 'Qual hábito simples ajuda na postura ao usar o computador?',
            options: ['Curvar as costas para frente', 'Ajustar a altura da cadeira e apoiar os pés', 'Deitar no sofá com o notebook no colo por horas', 'Olhar para baixo o tempo todo'],
            answer: 1,
            explain: 'Ergonomia adequada protege a coluna cervical e lombar durante estudos e trabalho.'
          },
          {
            q: 'Após uma torção leve no tornozelo, qual cuidado inicial é mais indicado?',
            options: ['Descanso e gelo nos primeiros dias', 'Massagem forte imediatamente', 'Correr para esquentar', 'Ignorar e continuar atividades intensas'],
            answer: 0,
            explain: 'Repouso e compressa fria ajudam a reduzir o inchaço inicial antes da reabilitação.'
          }
        ]
      }
    });

    addNPC({
      id: 'coord_nutricao',
      name: 'Coord. de Nutrição',
      role: 'Coordenadora • Bloco C (2º Andar)',
      area: 'biologicas',
      courseName: 'Nutrição',
      buildingId: 'bloco_c',
      x: -3.5, z: -41.5, y: F2, rotY: 0, highlight: true,
      look: { shirt: 0x16a34a, pants: 0xf1f5f9, hair: 0x5c3317, skin: 0xe6b18a, labCoat: true, longHair: true, highlight: true },
      dialogue: 'Bem-vindo à Nutrição aqui no 2º Andar do Bloco C! Comer bem é sobre equilíbrio e escolhas possíveis para saúde, esporte e clínica. Bora fazer o Quiz?',
      quiz: {
        id: 'nutricao',
        courseTag: 'BLOCO C • NUTRIÇÃO',
        title: 'Quiz de Nutrição',
        questions: [
          {
            q: 'Qual grupo alimentar é a principal fonte de energia rápida?',
            options: ['Proteínas', 'Vitaminas', 'Carboidratos', 'Fibras'],
            answer: 2,
            explain: 'Os carboidratos fornecem glicose, o combustível principal e mais rápido do organismo.'
          },
          {
            q: 'Proteínas são importantes principalmente para:',
            options: ['Construção e reparo de tecidos', 'Substituir a água do corpo', 'Apenas dar cor ao alimento', 'Transporte de oxigênio no ar'],
            answer: 0,
            explain: 'As proteínas constroem e regeneram músculos, pele, enzimas e anticorpos.'
          },
          {
            q: 'Vitaminas e minerais atuam como:',
            options: ['Geradores diretos de gordura', 'Substitutos de proteínas', 'Reguladores do metabolismo', 'Apenas adoçantes naturais'],
            answer: 2,
            explain: 'Micronutrientes regulam reações vitais, imunidade e equilíbrio metabólico.'
          },
          {
            q: 'Fibras alimentares auxiliam principalmente na:',
            options: ['Saúde intestinal', 'Produção de calor externo', 'Contração muscular instantânea', 'Transmissão de rádio'],
            answer: 0,
            explain: 'As fibras melhoram o trânsito intestinal, a saciedade e a saúde da microbiota!'
          }
        ]
      }
    });

    addNPC({
      id: 'coord_estetica',
      name: 'Coord. de Estética e Cosmética',
      role: 'Coordenadora • Bloco C (2º Andar)',
      area: 'biologicas',
      courseName: 'Estética e Cosmética',
      buildingId: 'bloco_c',
      x: 13.0, z: -41.5, y: F2, rotY: 0, highlight: true,
      look: { shirt: 0xec4899, pants: 0xf1f5f9, hair: 0x3b2214, skin: 0xebb994, labCoat: true, longHair: true, highlight: true },
      dialogue: 'Olá! Aqui no 2º Andar do Bloco C fica Estética e Cosmética! Unimos cuidado com a pele, técnicas seguras e tecnologia a favor da autoestima. Vamos ao Quiz?',
      quiz: {
        id: 'estetica',
        courseTag: 'BLOCO C • ESTÉTICA E COSMÉTICA',
        title: 'Quiz de Estética e Cosmética',
        questions: [
          {
            q: 'Para pele oleosa, qual tipo de hidratante é mais adequado?',
            options: ['Hidratante oil free (livre de óleo)', 'Óleo mineral puro', 'Manteiga corporal pesada', 'Sabão em barra comum'],
            answer: 0,
            explain: 'Produtos oil free hidratam sem obstruir os poros nem aumentar a oleosidade.'
          },
          {
            q: 'A sigla FPS em protetores refere-se a:',
            options: ['Fator de Proteção Solar', 'Quadros por segundo', 'Frequência cardíaca', 'Peso corporal'],
            answer: 0,
            explain: 'FPS indica o nível de proteção da pele contra a radiação solar UVB!'
          },
          {
            q: 'A esfoliação suave ajuda a remover:',
            options: ['Células mortas da superfície da pele', 'Massa muscular', 'Ossos', 'Água do organismo'],
            answer: 0,
            explain: 'A esfoliação auxilia na renovação celular deixando a pele mais macia e uniforme.'
          },
          {
            q: 'O que é um cosmético?',
            options: ['Produto para cuidados pessoais, higiene e beleza', 'Remédio para dor aguda', 'Equipamento cirúrgico', 'Alimento industrializado'],
            answer: 0,
            explain: 'Cosméticos são formulações destinadas a limpar, proteger, perfumar e cuidar da pele e cabelos.'
          }
        ]
      }
    });

    // 11. EDUCAÇÃO FÍSICA (GINÁSIO POLIESPORTIVO — DO OUTRO LADO DA RUA DAS GARÇAS!)
    addNPC({
      id: 'coord_edfisica',
      name: 'Coord. de Educação Física',
      role: 'Coordenador • Ginásio (R. das Garças)',
      area: 'biologicas',
      courseName: 'Educação Física',
      buildingId: 'ginasio',
      x: 0.0, z: -83.0, y: 0, rotY: 0, highlight: true,
      look: { shirt: 0xea580c, pants: 0x1e293b, hair: 0x1a1412, skin: 0xc6865c, highlight: true },
      dialogue: 'Olá! Seja bem-vindo ao Ginásio Poliesportivo da UNIGRAN Capital, bem aqui do outro lado da Rua das Garças! Aqui acontecem as aulas práticas de Educação Física, treinos de basquete, futsal, vôlei e jogos universitários! Bora fazer o Quiz?',
      quiz: {
        id: 'edfisica',
        courseTag: 'GINÁSIO • EDUCAÇÃO FÍSICA',
        title: 'Quiz de Educação Física',
        questions: [
          {
            q: 'Qual destes exercícios é tipicamente aeróbico?',
            options: ['Corrida', 'Supino reto com carga máxima', 'Agachamento isométrico curto', 'Flexão de braço isolada'],
            answer: 0,
            explain: 'A corrida trabalha resistência cardiorrespiratória usando oxigênio de forma contínua!'
          },
          {
            q: 'Qual sistema capta o oxigênio do ar para ser levado aos músculos?',
            options: ['Digestivo', 'Nervoso', 'Respiratório', 'Urinário'],
            answer: 2,
            explain: 'O sistema respiratório realiza as trocas gasosas nos pulmões, abastecendo o sangue de oxigênio.'
          },
          {
            q: 'O treino HIIT é conhecido por ser um treino intervalado de:',
            options: ['Alta intensidade', 'Repouso absoluto', 'Apenas leitura', 'Sono profundo'],
            answer: 0,
            explain: 'HIIT significa High-Intensity Interval Training — alterna picos intensos com recuperações curtas.'
          },
          {
            q: 'Para que serve o aquecimento antes do treino?',
            options: ['Preparar músculos e articulações para a atividade física', 'Substituir a hidratação', 'Causar fadiga extrema', 'Apenas descansar após o jogo'],
            answer: 0,
            explain: 'Aquecer eleva gradualmente a temperatura muscular e ajuda a prevenir lesões!'
          }
        ]
      }
    });
    addNPC({
      id: 'gym_atleta1', name: 'Diego (Ed. Física)', role: 'Treino • Ginásio UNIGRAN', buildingId: 'ginasio',
      x: -8.5, z: -87.5, y: 0, rotY: 1.2,
      look: { shirt: 0xfacc15, pants: 0x1e293b, hair: 0x24150e, skin: 0xd4966a },
      dialogue: 'Atravessar a Rua das Garças para treinar no Ginásio Poliesportivo da UNIGRAN é clássico todo dia!'
    });
    addNPC({
      id: 'gym_atleta2', name: 'Luana (Basquete UNIGRAN)', role: 'Quadra • Ginásio UNIGRAN', buildingId: 'ginasio',
      x: 8.5, z: -86.5, y: 0, rotY: -1.1,
      look: { shirt: 0x004274, pants: 0x0f172a, hair: 0x3b2214, skin: 0xc98a5e, longHair: true },
      dialogue: 'Estamos aquecendo para o campeonato universitário aqui no Ginásio da UNIGRAN Capital!'
    });

    // ==================== PUBLICIDADE & PODCAST (BLOCO B — TÉRREO!) ====================
    addNPC({
      id: 'coord_pub',
      name: 'Coordenador de Publicidade',
      role: 'Coordenador • Bloco B (Térreo)',
      area: 'humanas',
      courseName: 'Publicidade',
      buildingId: 'bloco_b',
      x: 47.0, z: -9.5, y: 0, rotY: -0.6, highlight: true,
      look: { shirt: 0x6d28d9, pants: 0x111827, hair: 0x1f1916, skin: 0xd8966a, beard: true, glasses: true, highlight: true },
      dialogue: 'Bem-vindo à Publicidade no Bloco B! Aqui temos nosso Estúdio de Podcast ON AIR e a Agência Experimental onde criatividade e estratégia caminham juntas! Topa fazer o Quiz de Publicidade?',
      quiz: {
        id: 'publicidade',
        courseTag: 'BLOCO B • PUBLICIDADE & PODCAST',
        title: 'Quiz de Publicidade',
        questions: [
          {
            q: 'Qual slogan é mais chamativo para um energético?',
            options: ['Acorde sua energia', 'Beba líquido vermelho', 'É uma bebida', 'Produto em lata'],
            answer: 0,
            explain: 'Um bom slogan comunica o benefício de forma criativa, memorável e emocional!'
          },
          {
            q: 'Na Publicidade, Briefing é:',
            options: ['A logo final pronta', 'Um vídeo de TV', 'Documento com objetivos, público e requisitos da campanha', 'Apenas a nota fiscal'],
            answer: 2,
            explain: 'O briefing reúne todas as informações estratégicas que guiam a criação publicitária.'
          },
          {
            q: 'O que um KPI mede em marketing e campanhas?',
            options: ['Desempenho e resultados da campanha', 'Apenas a cor da logo', 'O tamanho do estúdio', 'O peso dos equipamentos'],
            answer: 0,
            explain: 'KPIs (Indicadores-Chave de Desempenho) mostram se a campanha atingiu suas metas.'
          },
          {
            q: 'O que é público-alvo?',
            options: ['Equipe interna de limpeza', 'Grupo de pessoas que a campanha deseja atingir', 'Apenas os concorrentes', 'Fornecedores de papel'],
            answer: 1,
            explain: 'Conhecer o público-alvo permite criar mensagens que realmente conectam com quem interessa!'
          }
        ]
      }
    });
    addNPC({
      id: 'podcast_host', name: 'Camila (Host do Podcast)', role: 'Estúdio ON AIR • Bloco B', buildingId: 'bloco_b',
      x: 41.5, z: -15.0, y: 0, rotY: 0,
      look: { shirt: 0xea580c, pants: 0x1e293b, hair: 0x2a140c, skin: 0xde9e74, longHair: true },
      dialogue: 'Psiu — luz vermelha ON AIR acesa! Estamos gravando mais um episódio do Podcast UNIGRAN Capital!'
    });
    addNPC({
      id: 'pub_designer', name: 'Vitor (Direção de Arte)', role: 'Agência • Bloco B', buildingId: 'bloco_b',
      x: 49.0, z: 1.5, y: 0, rotY: -0.6,
      look: { shirt: 0xfacc15, pants: 0x111827, hair: 0x18181b, skin: 0xa66a44 },
      dialogue: 'Aqui na Agência Experimental de Publicidade criamos identidade visual e campanhas digitais! Suba ao 2º Andar para conhecer Arquitetura e Design!'
    });

    // ==================== DIREITO / EMAJUC (DIREITA DO TÉRREO BLOCO A!), ADMINISTRAÇÃO & PSICOLOGIA ====================
    addNPC({
      id: 'coord_direito',
      name: 'Coord. de Direito (EMAJUC)',
      role: 'EMAJUC • Bloco A (Térreo — Direita)',
      area: 'humanas',
      courseName: 'Direito',
      buildingId: 'bloco_a',
      x: 18.0, z: 34.0, y: 0, rotY: -Math.PI / 2, highlight: true,
      look: { shirt: 0x1e293b, pants: 0x0f172a, hair: 0x475569, skin: 0xdeb08c, glasses: true, beard: true, highlight: true },
      dialogue: 'Seja bem-vindo ao EMAJUC e ao curso de Direito, logo à direita do Balcão de Informações no Térreo do Bloco A! Aqui atendemos a comunidade com prática jurídica. Vamos ao Quiz de Direito?',
      quiz: {
        id: 'direito',
        courseTag: 'BLOCO A (TÉRREO) • DIREITO / EMAJUC',
        title: 'Quiz de Direito',
        questions: [
          {
            q: 'Roubar é crime segundo a lei brasileira?',
            options: ['Sim, previsto no Código Penal', 'Não', 'Depende apenas do horário', 'Só em feriados'],
            answer: 0,
            explain: 'O roubo é crime contra o patrimônio previsto expressamente no Código Penal.'
          },
          {
            q: 'O Processo Civil trata principalmente de conflitos entre:',
            options: ['Particulares (cidadãos e empresas)', 'Apenas países em guerra', 'Somente policiais', 'Clubes de esportes'],
            answer: 0,
            explain: 'O Direito Civil e o Processo Civil regulam contratos, família, propriedade e disputas entre particulares.'
          },
          {
            q: 'O Habeas Corpus protege principalmente:',
            options: ['Propriedade de veículos', 'A liberdade de locomoção', 'Notas escolares', 'Sigilo de senhas de Wi-Fi'],
            answer: 1,
            explain: 'Habeas Corpus é uma garantia constitucional fundamental que protege o direito de ir e vir.'
          },
          {
            q: 'O que é a Constituição?',
            options: ['Lei de trânsito local', 'Contrato de aluguel', 'Regulamento de condomínio', 'A lei máxima e fundamental de um país'],
            answer: 3,
            explain: 'A Constituição organiza o Estado e garante os direitos e deveres fundamentais de todos os cidadãos!'
          }
        ]
      }
    });

    addNPC({
      id: 'coord_admin',
      name: 'Coord. de Administração',
      role: 'Coordenador • Bloco A (Térreo)',
      area: 'humanas',
      courseName: 'Administração',
      buildingId: 'bloco_a',
      x: -18.0, z: 21.5, y: 0, rotY: Math.PI / 2, highlight: true,
      look: { shirt: 0x1d4ed8, pants: 0x111827, hair: 0x24150e, skin: 0xd4966a, glasses: true, highlight: true },
      dialogue: 'Que bom te ver aqui no Térreo do Bloco A! Em Administração aprendemos a liderar pessoas, organizar processos e tomar boas decisões empresariais. Bora para o Quiz?',
      quiz: {
        id: 'administracao',
        courseTag: 'BLOCO A (TÉRREO) • ADMINISTRAÇÃO',
        title: 'Quiz de Administração',
        questions: [
          {
            q: 'O que é fluxo de caixa em uma empresa?',
            options: ['Controle de entrada e saída de dinheiro', 'Plano de decoração', 'Inventário de cadeiras', 'Lista de músicas do escritório'],
            answer: 0,
            explain: 'O fluxo de caixa registra todas as entradas e saídas financeiras para manter a saúde do negócio.'
          },
          {
            q: 'A sigla de Meta SMART significa:',
            options: [
              'Simples, Moderna, Ágil, Rápida, Tecnológica',
              'Específica, Mensurável, Atingível, Relevante, Temporal',
              'Segura, Modular, Acurada, Robusta, Testável',
              'Sustentável, Motivadora, Adaptável, Realista, Tangível'
            ],
            answer: 1,
            explain: 'Metas SMART tornam o planejamento claro, mensurável e com prazo definido!'
          },
          {
            q: 'Qual área da empresa é ligada diretamente à gestão de pessoas?',
            options: ['Recursos Humanos (RH)', 'Manutenção predial', 'Almoxarifado', 'Recepção externa'],
            answer: 0,
            explain: 'Recursos Humanos cuida de recrutamento, treinamento, cultura e desenvolvimento de equipes.'
          },
          {
            q: 'O que é empreendedorismo?',
            options: ['Criar e desenvolver um negócio ou projeto inovador', 'Apenas guardar moedas em casa', 'Evitar novos clientes', 'Fechar portas cedo'],
            answer: 0,
            explain: 'Empreender é identificar oportunidades e transformar ideias em soluções e negócios reais!'
          }
        ]
      }
    });

    addNPC({
      id: 'coord_psicologia',
      name: 'Coord. de Psicologia',
      role: 'Sala 101 • Bloco A (1º Andar)',
      area: 'humanas',
      courseName: 'Psicologia',
      buildingId: 'bloco_a',
      x: -17.5, z: 16.2, y: F2, rotY: 0, highlight: true,
      look: { shirt: 0x9333ea, pants: 0x1e293b, hair: 0x4a2c18, skin: 0xe0a882, glasses: true, longHair: true, highlight: true },
      dialogue: 'Olá! Bem-vindo à Sala 101 no 1º Andar do Bloco A! Em Psicologia estudamos pessoas, emoções e cuidados com a mente — tudo com carinho e ciência. Bora para o Quiz?',
      quiz: {
        id: 'psicologia',
        courseTag: 'BLOCO A (1º ANDAR) • PSICOLOGIA',
        title: 'Quiz de Psicologia',
        questions: [
          {
            q: 'O que é empatia nas relações humanas?',
            options: ['Ignorar o que o outro sente', 'Capacidade de se colocar no lugar do outro e compreender seus sentimentos', 'Falar sempre mais alto', 'Julgar sem ouvir'],
            answer: 1,
            explain: 'A empatia fortalece o acolhimento, o diálogo e os vínculos saudáveis.'
          },
          {
            q: 'Em quais áreas um psicólogo pode atuar?',
            options: ['Clínica, escolas, hospitais, empresas e projetos sociais', 'Apenas em laboratórios de química', 'Somente em tribunais', 'Apenas em academias'],
            answer: 0,
            explain: 'A Psicologia atua em diversos espaços promovendo saúde mental e desenvolvimento humano.'
          },
          {
            q: 'Por que a escuta ativa e o sigilo são fundamentais no atendimento psicológico?',
            options: ['Para criar um espaço seguro, ético e de confiança para o paciente', 'Porque o psicólogo não pode anotar nada', 'Apenas para encurtar a consulta', 'Não têm importância na prática'],
            answer: 0,
            explain: 'A ética e o sigilo profissional garantem segurança para que a pessoa se expresse livremente.'
          }
        ]
      }
    });

    // ==================== BIBLIOTECA (À FRENTE NO TÉRREO BLOCO A) & AUDITÓRIO (1º ANDAR BLOCO A) ====================
    addNPC({
      id: 'bibliotecaria',
      name: 'Sônia — Biblioteca UNIGRAN',
      role: 'Biblioteca • Bloco A (Térreo — Frente)',
      buildingId: 'bloco_a',
      x: -4.0, z: 19.0, y: 0, rotY: 0, highlight: true,
      look: { shirt: 0xb45309, pants: 0x1e293b, hair: 0x452214, skin: 0xe0a47c, glasses: true, longHair: true, highlight: true },
      dialogue: 'Bem-vindo à Biblioteca acessível da UNIGRAN Capital, bem aqui à frente do Balcão de Informações no Térreo do Bloco A! Temos milhares de livros físicos, computadores de pesquisa e o Diploma da Biblioteca esperando por você!'
    });
    addNPC({
      id: 'bib_aluno1', name: 'Pedro (Pesquisa)', role: 'Biblioteca • Bloco A', buildingId: 'bloco_a',
      x: 10.5, z: 24.0, y: 0, rotY: Math.PI,
      look: { shirt: 0x2563eb, pants: 0x1e293b, hair: 0x1a1412, skin: 0xc6865c },
      dialogue: 'Os computadores da Biblioteca no Térreo do Bloco A são ótimos para pesquisar artigos científicos!'
    });
    addNPC({
      id: 'reitor_unigran',
      name: 'Reitor UNIGRAN Capital',
      role: 'Auditório • Bloco A (1º Andar)',
      buildingId: 'bloco_a',
      x: 10.5, z: 16.5, y: F2, rotY: 0, highlight: true,
      look: { shirt: 0x004274, pants: 0x0f172a, hair: 0x94a3b8, skin: 0xdeb08c, beard: true, glasses: true, highlight: true },
      dialogue: 'Bem-vindo ao Auditório no 1º Andar do Bloco A! Suba a próxima escada aqui à direita para conhecer os 2 Laboratórios de Engenharia de Software com 40 computadores e o Emerson!'
    });

    return npcs;
  }

  // ==================== PARTÍCULAS FESTIVAS ====================
  const particleMatCache = Object.create(null);
  function getParticleMat(colorHex) {
    if (!particleMatCache[colorHex]) {
      particleMatCache[colorHex] = new THREE.MeshBasicMaterial({ color: colorHex });
    }
    return particleMatCache[colorHex];
  }

  function spawnBurst(scene, particles, x, y, z, colorHex, count = 8, speed = 4.5, size = 0.18) {
    const maxParticles = 55;
    const mat = getParticleMat(colorHex);
    const toSpawn = Math.min(count, 12);
    for (let i = 0; i < toSpawn; i++) {
      if (particles.length >= maxParticles) {
        const oldest = particles.shift();
        scene.remove(oldest.mesh);
      }
      const m = new THREE.Mesh(sharedParticleGeo, mat);
      m.scale.setScalar(size);
      m.position.set(x, y, z);
      scene.add(m);
      const angle = Math.random() * Math.PI * 2;
      const spd = (0.4 + Math.random() * 0.9) * speed;
      particles.push({
        mesh: m,
        baseSize: size,
        vx: Math.cos(angle) * spd,
        vy: 2.2 + Math.random() * 3.6,
        vz: Math.sin(angle) * spd,
        life: 0.28 + Math.random() * 0.28,
        maxLife: 0.56
      });
    }
  }

  return {
    getCustomHeroData,
    saveCustomHeroData,
    buildCustomHero3D,
    createVisitorActor,
    rebuildVisitorActor,
    animateHero3D,
    spawnCampusNPCs,
    spawnBurst
  };
})();
