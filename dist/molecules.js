"use strict";

const molecules = (() => {
  const { seq } = course;
  const c = {
    dna: "#73e7ef", rna: "#c7abff", peptide: "#ffb59f", enzyme: "#8feacb",
    ink: "#edf6ff", muted: "#adc5dc", amber: "#ffdc8b"
  };
  const clamp = n => Math.min(1, Math.max(0, n));
  const mix = (a, b, k) => a + (b - a) * k;
  const smooth = n => clamp(n) ** 2 * (3 - 2 * clamp(n));
  const segment = (scene, t, a, b) => clamp((t - scene.frames[a].at) / (scene.frames[b].at - scene.frames[a].at));
  const tween = (scene, t, a, b) => smooth(segment(scene, t, a, b));
  const f = n => Number(n.toFixed(2));
  const group = (content, attrs = "") => `<g ${attrs}>${content}</g>`;
  const move = (x, y, content, scale = 1) => group(content, `transform="translate(${f(x)} ${f(y)}) scale(${f(scale)})"`);
  const fade = (opacity, content) => opacity <= 0 ? "" : group(content, `opacity="${f(opacity)}"`);
  const line = (x1, y1, x2, y2, stroke, width = 2, extra = "") =>
    `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" ${extra}/>`;
  const circle = (x, y, r, fill, extra = "") =>
    `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${fill}" ${extra}/>`;
  const rect = (x, y, w, h, rx, fill, extra = "") =>
    `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}" fill="${fill}" ${extra}/>`;
  const path = (d, stroke, width = 2, fill = "none", extra = "") =>
    `<path d="${d}" stroke="${stroke}" stroke-width="${width}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const text = (x, y, value, fill = c.ink, size = 16, anchor = "middle", css = "diagram-label") =>
    `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" dominant-baseline="middle" fill="${fill}" font-size="${size}" class="${css}" font-weight="650">${value}</text>`;
  const pointsPath = points => points.map(([x, y], i) => `${i ? "L" : "M"}${f(x)} ${f(y)}`).join(" ");
  const dash = 'stroke-dasharray="5 6"';
  const arrow = 'marker-end="url(#arrow)"';
  const button = (action, label, content) => group(content, `data-action="${action}" role="button" tabindex="0" aria-label="${label}"`);

  const defs = `<defs>
    <radialGradient id="cell-fill" cx=".45" cy=".36" r=".75">
      <stop stop-color="#1b4862"/><stop offset=".7" stop-color="#123045"/><stop offset="1" stop-color="#0e2236"/>
    </radialGradient>
    <radialGradient id="nucleus-fill" cx=".35" cy=".34" r=".8">
      <stop stop-color="#2e456e"/><stop offset="1" stop-color="#192b4c"/>
    </radialGradient>
    <linearGradient id="membrane" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#8bf7f4"/><stop offset=".48" stop-color="#3da9be"/><stop offset="1" stop-color="#26778e"/>
    </linearGradient>
    <linearGradient id="ribo-top" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#3e9f9d"/><stop offset="1" stop-color="#194d60"/>
    </linearGradient>
    <linearGradient id="ribo-bottom" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#367e9d"/><stop offset="1" stop-color="#193c59"/>
    </linearGradient>
    <linearGradient id="mito-fill" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#935979"/><stop offset="1" stop-color="#422c4b"/>
    </linearGradient>
    <radialGradient id="bead" cx=".35" cy=".25" r=".8">
      <stop stop-color="#ffe2c0"/><stop offset=".6" stop-color="#f3a895"/><stop offset="1" stop-color="#a65878"/>
    </radialGradient>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 10 5 0 10 2 5Z" fill="#a9d1e5"/>
    </marker>
  </defs>`;

  function tag(x, y, label, color = c.dna, action = "") {
    const w = [...label].reduce((sum, ch) => sum + (ch.charCodeAt(0) > 255 ? 19 : 10), 22);
    const content = rect(x - w / 2, y - 14, w, 28, 6, "#101f32", `stroke="${color}" stroke-opacity=".72" class="hit-outline"`)
      + text(x, y + 1, label, color, 16);
    return action ? button(action, label, content) : content;
  }

  function callout(x1, y1, x2, y2, label, color, action) {
    return line(x1, y1, x2, y2, color, 1.5, 'opacity=".74"')
      + circle(x1, y1, 3.4, color)
      + tag(x2, y2, label, color, action);
  }

  function helix(length, amp, color = c.dna) {
    const n = 48;
    const strands = [1, -1].map(side => Array.from({length: n + 1}, (_, i) => [
      i * length / n, side * amp * Math.sin(i / n * Math.PI * 4)
    ]));
    const rungs = strands[0].map(([x, y], i) => i % 3 ? "" : line(x, y, x, -y, "#92c5f3", 1.6, 'opacity=".62"')).join("");
    return rungs + strands.map((points, i) => path(pointsPath(points), i ? "#a7c8ff" : color, 3.2)).join("");
  }

  function mito(x, y, angle, scale) {
    return group(
      path("M-58 7 C-63-13-37-26-11-24 C17-30 53-17 58 1 C65 20 37 30 10 26 C-21 30-51 26-58 7Z", "#e38ca2", 2, "url(#mito-fill)")
      + path("M-48 5 Q-41-15-33-6 T-21 8 Q-13 25-6 4 T9-6 Q16 12 22 10 T35-2 Q43-13 47 1", "#ffbba9", 2.5)
      + path("M-45 13 C-22 26 18 22 45 13", "#cc85ab", 1.2, "none", 'opacity=".56"'),
      `transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})"`
    );
  }

  function ribosomeMini(x, y, scale = 1) {
    return move(x, y,
      path("M-41 0C-42-12-27-20-14-17C-6-32 15-29 22-18C34-22 44-13 43-1C42 8 19 10 0 9C-14 9-38 10-41 0Z", "#a0f2dc", 1.8, "url(#ribo-top)")
      + path("M-40 10Q-12 14 0 12T41 9Q46 25 11 25Q-32 28-40 10Z", "#78cce9", 1.6, "url(#ribo-bottom)")
      + path("M-28-5Q-18-13-8-9M2-16Q16-20 24-11", "#8bd8d3", 1.4, "none", 'opacity=".65"'), scale);
  }

  const outer = "M117 213C121 122 223 66 350 73C437 57 530 74 595 116C671 163 713 239 669 301C634 357 520 379 403 368C320 381 209 353 156 308C128 285 113 256 117 213Z";
  const nuclear = "M169 214C167 148 218 113 283 117C351 118 386 153 389 211C395 272 352 312 278 316C216 317 171 275 169 214Z";
  const poreX = 383;
  const poreY = 184;

  function pore(x, y, scale = 1, action = "") {
    const parts = rect(-22, -32, 44, 64, 11, "#163345", 'stroke="#84e5e3" stroke-width="2" class="hit-outline"')
      + rect(-28, -28, 56, 16, 7, "#2f6d78", 'stroke="#9ce3e4" stroke-width="1.8"')
      + rect(-28, 12, 56, 16, 7, "#2f6d78", 'stroke="#9ce3e4" stroke-width="1.8"')
      + line(-16, 0, 16, 0, "#a9d1e5", 1.5, arrow);
    return move(x, y, action ? button(action, "核孔", parts) : parts, scale);
  }

  function cellSketch({ labels = true, interactive = false, focus = "", focusBlend = 0, route = 0, exported = false } = {}) {
    const dots = Array.from({length: 68}, (_, i) => {
      const theta = i * 2.399963;
      const r = 0.14 + (i % 13) * .059;
      return circle(402 + Math.cos(theta) * r * 290, 220 + Math.sin(theta) * r * 151, i % 5 === 0 ? 3 : 1.8, i % 5 === 0 ? "#82d9d1" : "#6c9fba", `opacity="${i % 5 === 0 ? ".5" : ".36"}"`);
    }).join("");
    const membrane = path(outer, "#65dce657", 11)
      + path(outer, "url(#membrane)", 4, "url(#cell-fill)")
      + path(outer, "#86e3e0", 1, "none", 'transform="translate(9 5) scale(.978)" opacity=".56"');
    const interior = mito(525, 131, 13, .76) + mito(221, 327, 22, .58) + mito(600, 276, -21, .68)
      + path("M443 274Q490 246 543 273M435 290Q485 260 554 287M439 306Q490 279 557 299M454 319Q498 300 548 311", "#72a9dc", 4.6, "none", 'opacity=".5"')
      + path("M291 337Q336 350 388 335M276 346Q333 360 375 346", "#77c8db", 2, "none", 'opacity=".43"')
      + ribosomeMini(613, 176, .35) + ribosomeMini(464, 139, .32) + ribosomeMini(364, 328, .36);
    const nucleus = path(nuclear, focus === "nucleus" ? "#99f6fb" : "#8cb8ed", focus === "nucleus" ? 4 : 2.8, "url(#nucleus-fill)")
      + path(nuclear, "#91b6ef", 1.4, "none", 'transform="translate(11 9) scale(.96)" opacity=".66"')
      + group(helix(146, 17), 'transform="translate(210 251) rotate(-29)"')
      + pore(poreX, poreY, .37)
      + circle(220, 180, 11, "#6683bd", 'opacity=".54"')
      + circle(234, 175, 4, "#8eb9e6", 'opacity=".67"');
    const markerX = mix(313, 555, route);
    const markerY = route < .42 ? mix(212, 185, route / .42) : mix(185, 223, (route - .42) / .58);
    const routeLine = path("M304 214Q347 210 383 184T544 220", "#bca5f5", 1.8, "none", `${dash} ${arrow} opacity=".63"`);
    const rnaMarker = move(markerX, markerY, path("M-17 4 Q-9-9 0 0T18-1", c.rna, 3.6));
    const ribosome = ribosomeMini(555, 224, .86)
      + (focus === "ribosome" ? circle(555, 221, 49, "none", 'stroke="#a3f7df" stroke-width="2" stroke-dasharray="4 4"') : "");
    const labelSet = labels ? (
      callout(177, 187, 130, 130, "细胞核", c.dna, interactive ? "nucleus" : "")
      + callout(274, 229, 249, 284, "DNA", c.dna)
      + callout(poreX, poreY, 417, 111, "核孔", c.dna)
      + callout(551, 223, 635, 221, "核糖体", c.enzyme, interactive ? "ribosome" : "")
      + callout(480, 332, 600, 345, "细胞质", c.muted)
      + callout(markerX, markerY, 451, exported ? 154 : 164, "mRNA", c.rna)
    ) : "";
    const hot = interactive
      ? group(
        `<path data-action="nucleus" d="${nuclear}" fill="transparent" aria-hidden="true"/>`
        + circle(551, 220, 46, "transparent", 'data-action="ribosome" aria-hidden="true"')
      ) : "";
    const scale = 1 + .19 * focusBlend;
    const offsetX = (focus === "ribosome" ? -142 : 48) * focusBlend;
    const content = membrane + dots + interior + nucleus + routeLine + rnaMarker + ribosome + hot + labelSet;
    return move(400 + offsetX - 400 * scale, 220 - 220 * scale, content, scale);
  }

  function cell(scene, t, state) {
    const route = tween(scene, t, 1, 3);
    return cellSketch({ interactive: true, focus: state.focus, focusBlend: state.focusBlend, route });
  }

  function tile(x, y, base, color, selected = false) {
    return rect(x - 15, y - 15, 30, 30, 5, selected ? "#3a3c48" : "#12283b",
      `stroke="${selected ? c.amber : color}" stroke-opacity="${selected ? 1 : .69}" stroke-width="${selected ? 2 : 1}"`)
      + text(x, y + 1, base, selected ? c.amber : color, 16, "middle", "mono");
  }

  function transcription(scene, t) {
    const x = i => 142 + i * 46;
    const open = tween(scene, t, 0, 1) * (1 - tween(scene, t, 4, 5));
    const polIndex = mix(-.48, 1, tween(scene, t, 0, 2)) + 10 * segment(scene, t, 3, 4);
    const release = tween(scene, t, 4, 5);
    const polX = x(polIndex);
    const gap = i => 26 * open * Math.exp(-((i - polIndex) ** 2) / 3);
    const upper = i => 179 - gap(i);
    const lower = i => 215 + gap(i);
    const yRna = 272 + 45 * release;
    const polY = 197 - 92 * (1 - tween(scene, t, 0, 1)) - 62 * release;
    const made = t < scene.frames[2].at ? Number(t > 3.1) : t < scene.frames[3].at ? 1 : Math.min(12, 2 + Math.floor(10.00001 * segment(scene, t, 3, 4)));
    const segments = [...seq.template].map((base, i) => {
      const selected = made === 1 && i === 1 && t >= scene.frames[2].at;
      return line(x(i), upper(i) + 15, x(i), lower(i) - 15, "#83b6d3", 1.4, dash)
        + tile(x(i), upper(i), seq.coding[i], "#89b9ef")
        + tile(x(i), lower(i), base, c.dna, selected);
    }).join("");
    const backbone = [-.65, ...Array.from({length: 12}, (_, i) => i), 11.65];
    const strands = [upper, lower].map((y, i) => path(pointsPath(backbone.map(k => [x(k), y(k)])), i ? c.dna : "#8bb1e7", 3)).join("");
    const polymerase = move(polX, polY,
      path("M-56-24C-48-56-5-59 24-45Q63-40 61-7Q64 15 39 25L22 14L-23 25Q-58 15-56-24Z", "#a4ebd8", 2.3, "url(#ribo-top)")
      + path("M-43-25Q-26-45-5-37M18-35Q45-31 49-14", "#acebd6", 2, "none", 'opacity=".62"')
      + text(0, -20, "RNA 聚合酶", c.ink, 15)
    );
    const rnaTiles = [...seq.rna].slice(0, made).map((base, i) => tile(x(i), yRna, base, c.rna)).join("");
    const chain = made ? line(x(0), yRna, x(made - 1), yRna, c.rna, 4)
      + rnaTiles + text(102, yRna, "5′", c.rna, 15) + text(x(made - 1) + 30, yRna, "3′", c.rna, 15) : "";
    const gateStart = scene.frames[2].at;
    const uMotion = tween(scene, t, 2, 3);
    const incomingU = t > gateStart && uMotion < 1
      ? tile(mix(245, x(1), uMotion), mix(353, yRna, uMotion), seq.rna[1], c.rna, true) : "";
    const pairLine = t >= gateStart && made === 1 ? line(x(1), lower(1) + 20, x(1), yRna + 18, c.amber, 2, dash) : "";
    return tag(400, 76, "DNA 模板链  3′ → 5′", c.dna)
      + line(139, 107, 661, 107, "#a9d1e5", 1.4, arrow)
      + fade(1 - .5 * release, polymerase) + strands + segments
      + text(91, upper(0), "5′", c.muted) + text(710, upper(11), "3′", c.muted)
      + text(91, lower(0), "3′", c.dna) + text(710, lower(11), "5′", c.dna)
      + pairLine + chain + incomingU
      + (made ? tag(414, 369, "RNA  5′ → 3′", c.rna) : tag(400, 323, "等待 RNA 链形成", c.muted));
  }

  function processing(scene, t, state) {
    const gate = scene.frames[scene.gate].at;
    const loop = tween(scene, t, 1, 2);
    const remove = tween(scene, t, 2, 3);
    const join = tween(scene, t, 3, 4);
    const y = 212;
    const x1 = mix(106, 212, join);
    const x2 = mix(511, 390, join);
    const w = 178;
    const exon = (x, label, color, id) => {
      const block = rect(x, y - 29, w, 58, 9, "#193b50", `stroke="${color}" stroke-width="2" class="hit-outline"`)
        + line(x + 12, y + 16, x + w - 12, y + 16, color, 2, 'opacity=".51"')
        + text(x + w / 2, y - 4, label, color, 20);
      return !state.solved && t >= gate ? button(id, label, block) : block;
    };
    const intronCurve = path(`M284 212 C330 ${mix(212, 210, loop)} 358 ${mix(212, 91, loop)} 399 ${mix(212, 92, loop)} C456 ${mix(212, 95, loop)} 455 ${mix(212, 165, loop)} 407 ${mix(212, 172, loop)} C368 ${mix(212, 183, loop)} 458 212 511 212`, c.rna, 5, "none", 'class="hit-outline"');
    const intronLabel = tag(397, loop > .7 ? 133 : 167, "内含子", c.rna);
    const intron = !state.solved && t >= gate ? button("intron", "内含子",
      rect(285, 147, 224, 85, 10, "transparent") + intronCurve + intronLabel
    ) : intronCurve + intronLabel;
    const lariat = move(400, mix(168, 329, remove),
      path("M-62 18C-29 21-22-41 19-38C59-39 63-2 33 8C-11 25-13-13 18-12C30-10 45 1 59 10", c.rna, 4)
      + text(0, 36, "已移除的内含子", c.rna, 15)
    );
    const cap = fade(join, circle(x1 - 15, y, 12, c.enzyme)
      + line(x1 - 12, y, x1, y, c.enzyme, 3)
      + callout(x1 - 15, y, x1 - 40, 147, "5′ 帽", c.enzyme));
    const tailX = x2 + w;
    const tail = fade(join, line(tailX, y, tailX + 90, y, c.amber, 3)
      + Array.from({length: 6}, (_, i) => circle(tailX + 13 * (i + 1), y, 5, c.amber)).join("")
      + callout(tailX + 50, y, tailX + 63, 146, "poly(A) 尾", c.amber));
    return tag(400, 68, join >= 1 ? "成熟 mRNA" : "前体 RNA · 片段结构", c.muted)
      + fade(1 - remove, intron)
      + fade(remove * (1 - .65 * join), lariat)
      + exon(x1, "外显子 1", c.dna, "exon1") + exon(x2, "外显子 2", c.enzyme, "exon2")
      + fade(1 - join, text(x1 - 24, y, "5′", c.muted) + text(x2 + w + 25, y, "3′", c.muted))
      + cap + tail;
  }

  function exportRna(scene, t, state) {
    const start = tween(scene, t, 0, 1);
    const cross = tween(scene, t, 1, 2);
    const zoom = tween(scene, t, 2, 3);
    const y = 220;
    const x = 232 + 88 * start + 224 * cross;
    const shape = path("M-57 0Q-48-13-36 0T-15 0T7 0T29 0T51 0", c.rna, 4.4)
      + circle(-57, 0, 6.5, c.enzyme) + circle(54, 0, 3.3, c.amber);
    const cutaway = rect(71, 82, 337, 276, 12, "#263963", 'opacity=".43"')
      + rect(410, 82, 315, 276, 12, "#153b43", 'opacity=".39"')
      + path("M391 82V179Q391 195 404 202M421 82V179Q421 195 408 202M391 358V261Q391 245 404 238M421 358V261Q421 245 408 238", "#83d4df", 4)
      + line(235, y, 590, y, "#9ebed1", 1.5, `${dash} ${arrow} opacity=".56"`)
      + tag(190, 103, "细胞核内", c.dna) + tag(592, 103, "细胞质", c.enzyme)
      + move(140, 301, helix(114, 12)) + tag(196, 339, "DNA", c.dna)
      + move(x, y, shape, .95 - Math.sin(cross * Math.PI) * .28)
      + tag(x, 173, "成熟 mRNA", c.rna)
      + pore(406, y, 1.1, state.solved ? "" : "pore")
      + callout(412, 254, 432, 302, "核孔", c.dna, state.solved ? "" : "pore");
    return fade(1 - zoom, move(400 * .24 * zoom, 220 * .24 * zoom, cutaway, 1 - .24 * zoom))
      + fade(zoom, cellSketch({ exported: true, route: .83 }));
  }

  function trna(x, y, anti, color = c.enzyme) {
    const body = path("M-1-89V-64Q-1-52-17-50Q-31-48-27-37Q-24-29-8-35L-8-17Q-8-7 0-6Q8-7 8-17L8-35Q26-29 29-42Q30-53 15-53Q5-55 5-65V-89Z", color, 2.4, "#1e5365");
    const bases = [...anti].map((base, i) => {
      const bx = i * 16 - 16;
      return rect(bx - 7, -7, 14, 15, 3, "#143441", `stroke="${color}" stroke-width="1"`)
        + text(bx, 1, base, color, 11, "middle", "mono");
    }).join("");
    return move(x, y, body + line(2, -88, 2, -101, color, 2) + bases);
  }

  const codonX = i => 206 + 113 * i;
  const complement = { A: "U", U: "A", C: "G", G: "C" };
  const anti = index => [...seq.codons[index]].map(base => complement[base]).join("");
  const trnaY = 269;
  const chainY = 161;

  function codonStrip(y, selected = -1, stop = false) {
    return line(116, y, 645, y, c.rna, 3, arrow)
      + seq.codons.map((codon, i) => {
        const ink = i === selected ? stop ? c.peptide : c.amber : c.rna;
        return rect(codonX(i) - 41, y - 18, 82, 36, 6, i === selected ? "#433b4a" : "#29233e", `stroke="${ink}" stroke-width="${i === selected ? 2 : 1.1}"`)
          + text(codonX(i), y + 1, codon, ink, 22, "middle", "mono");
      }).join("")
      + text(88, y, "5′", c.rna) + text(679, y, "3′", c.rna)
      + tag(680, y + 42, "mRNA", c.rna);
  }

  function ribosome(center, big = 1, split = 0, siteOpacity = 1, small = 1) {
    const top = path("M-126 252C-148 226-129 197-108 189C-96 153-61 144-41 159C-10 135 24 139 44 155C72 146 104 161 106 183C143 187 160 222 143 245C128 265 86 267 57 256Q-8 269-58 258Q-101 271-126 252Z", "#82d8c9", 2.6, "url(#ribo-top)")
      + path("M-113 229Q-94 198-69 207M-73 177Q-56 166-32 176M-15 165Q10 153 33 170M66 178Q91 180 97 202M105 218Q128 209 138 227", "#83c7c8", 1.8, "none", 'opacity=".48"');
    const bottom = path("M-124 320Q-98 309-58 317T11 317T68 317T136 316C140 334 114 349 71 349Q20 357-30 350C-79 352-130 344-124 320Z", "#73b9df", 2.3, "url(#ribo-bottom)")
      + path("M-100 332Q-65 337-31 333M8 337Q48 341 91 335", "#92c9e9", 1.5, "none", 'opacity=".64"');
    return fade(big, move(center + 24 * split, -42 * (1 - big) - 64 * split, top))
      + fade(small, move(center - 16 * split, 27 * (1 - small) + 34 * split, bottom))
      + fade(siteOpacity * big * (1 - split), text(center - 110, 231, "E", "#b1d9ec", 14, "middle", "mono")
        + text(center + 29, 218, "P", "#d2f4ef", 15, "middle", "mono")
        + text(center + 113, 231, "A", "#ffe3aa", 15, "middle", "mono"));
  }

  function peptide(x, y, n, opacity = 1, lift = 0) {
    if (!n || opacity <= 0) return "";
    const coords = Array.from({length: n}, (_, i) => [x - (n - i - 1) * 30, y - (n - i - 1) * (14 + lift)]);
    const link = path(pointsPath(coords), "#ffd8b1", 4);
    const units = coords.map(([cx, cy], i) =>
      circle(cx, cy, 10, "url(#bead)", 'stroke="#ffdcc5" stroke-width="1.1"')
      + text(cx, cy - 17, seq.peptide[i].short, c.peptide, 13, "middle", "mono")
    ).join("");
    return fade(opacity, group(link + units, `data-peptide-length="${n}"`));
  }

  function translation(scene, t, state) {
    const start = tween(scene, t, 0, 1);
    const assemble = tween(scene, t, 1, 2);
    const enter = tween(scene, t, 3, 4);
    const firstBond = tween(scene, t, 4, 5);
    const firstShift = tween(scene, t, 5, 6);
    const pheEnter = tween(scene, t, 6, 7);
    const secondBond = tween(scene, t, 7, 8);
    const secondShift = tween(scene, t, 8, 9);
    const center = codonX(firstShift + secondShift);
    const selected = t < scene.frames[2].at ? 0 : secondShift >= 1 ? 3 : firstShift >= 1 ? 2 : 1;
    const met = fade(1 - firstShift, trna(codonX(0) - 42 * firstShift, trnaY - 79 * (1 - start) - 43 * firstShift, anti(0)));
    const alaX = codonX(1) + 54 * (1 - enter) - 28 * secondShift;
    const alaY = trnaY - 93 * (1 - enter) - 42 * secondShift;
    const pheX = codonX(2) + 46 * (1 - pheEnter);
    const pheY = trnaY - 89 * (1 - pheEnter);
    const ala = state.solved && t >= scene.frames[scene.gate].at
      ? fade((.38 + .62 * enter) * (1 - secondShift), trna(alaX, alaY, anti(1), "#a9f1c1")) : "";
    const phe = fade(pheEnter, trna(pheX, pheY, anti(2), "#a5edc8"));
    const incoming = (x, y, index, opacity) => fade(opacity,
      circle(x, y, 9, "url(#bead)") + text(x, y - 16, seq.peptide[index].short, c.peptide, 13));
    const chain = secondBond >= 1 ? peptide(codonX(2), chainY, 3)
      : firstBond >= 1 ? peptide(mix(codonX(1), codonX(2), secondBond), chainY, 2)
        + incoming(pheX, pheY - (trnaY - chainY), 2, pheEnter * (1 - secondBond))
      : peptide(mix(codonX(0), codonX(1), firstBond), chainY - 79 * (1 - start), 1, .45 + .55 * start)
        + incoming(alaX, alaY - (trnaY - chainY), 1, ala ? (.38 + .62 * enter) * (1 - firstBond) : 0);
    const challenge = !state.solved && t >= scene.frames[scene.gate].at
      ? callout(codonX(1), 254, 485, 110, "为 GCU 选反密码子", c.amber)
      : tag(400, 75, selected === 3 ? "A 位读到 UAA" : "核糖体沿 mRNA  5′ → 3′", c.muted);
    return challenge + ribosome(center, assemble, 0, 1, .64 + .36 * start)
      + met + ala + phe + chain + codonStrip(296, selected, selected === 3)
      + tag(149, 391, "核糖体", c.enzyme) + tag(260, 391, "tRNA", c.enzyme)
      + tag(375, 391, "多肽链", c.peptide);
  }

  function termination(scene, t) {
    const bind = tween(scene, t, 1, 2);
    const release = tween(scene, t, 2, 3);
    const split = tween(scene, t, 3, 4);
    const center = codonX(2);
    const fx = codonX(3) + 73 * (1 - bind) + 47 * split;
    const fy = 225 - 105 * (1 - bind) + 14 * split;
    const factor = move(fx, fy,
      path("M-23-25L2-41 28-21 27 8 10 22 6 49-6 49-13 18-27 7Z", "#ffe5a0", 2.2, "#8c6541")
      + path("M-17-23L1-33 18-21 18-3", "#f5bc7c", 2));
    const released = peptide(center + 147 * release, chainY - 60 * release, 3, 1, 9 * release);
    return tag(400, 69, "终止信号 · UAA / UAG / UGA", c.amber)
      + ribosome(center, 1, split)
      + fade(1 - .78 * split, trna(center - 58 * split, trnaY - 64 * split, anti(2)))
      + fade(bind * (1 - .8 * split), factor)
      + released + codonStrip(296 + split * 30, 3, true)
      + (bind > .62 ? fade(1 - .8 * split, callout(fx, fy - 21, 670, 167, "释放因子", c.amber)) : "")
      + (release > .58 ? callout(center + 107 * release, chainY - 60 * release - 3, 647, 81, "多肽已释放", c.peptide) : "")
      + tag(306, 391, split > .8 ? "大小亚基分开" : "A 位 · UAA", c.muted);
  }

  const folded = [
    [265, 269], [253, 244], [263, 219], [288, 208], [309, 219], [310, 242],
    [294, 257], [315, 277], [346, 274], [370, 249], [356, 225], [340, 204],
    [351, 175], [372, 162], [391, 176], [396, 200], [424, 209], [450, 192],
    [447, 167], [465, 146], [493, 149], [509, 172], [496, 196], [516, 214],
    [546, 218], [560, 246], [543, 267], [516, 271], [490, 250], [462, 258], [451, 284]
  ];

  function folding(scene, t) {
    const amount = smooth(t / scene.duration);
    const positions = folded.map(([x, y], i) => [
      mix(112 + 19.2 * i, x, amount),
      mix(224 + 24 * Math.sin(i * .67), y, amount)
    ]);
    const beads = positions.map(([x, y], i) => circle(x, y, i === 0 || i === positions.length - 1 ? 8 : 6.3,
      i < 8 ? "#8ce4d1" : i < 16 ? "#a5bcf6" : i < 23 ? "#c1a6ef" : "#ffb49d",
      'stroke="#102538" stroke-width="1.15"')).join("");
    const start = positions[0];
    const end = positions.at(-1);
    return tag(400, 76, "较长多肽模型", c.muted)
      + path(pointsPath(positions), "#395774", 18, "none", 'opacity=".56"')
      + path(pointsPath(positions), "#b1c9df", 5.4)
      + beads
      + callout(start[0], start[1], start[0] - 35, start[1] + 55, "1 · N 端", c.enzyme)
      + callout(end[0], end[1], end[0] + 40, end[1] + 62, "31 · C 端", c.peptide)
      + tag(400, 379, "氨基酸连接顺序保持不变", c.muted);
  }

  const draw = [cell, transcription, processing, exportRna, translation, termination, folding];
  return {
    render(index, scene, time, state) {
      return defs + draw[index](scene, time, state);
    }
  };
})();
