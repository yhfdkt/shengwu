"use strict";

const course = (() => {
  const template = "TACCGAAAGATT";
  const pairing = { A: "U", T: "A", C: "G", G: "C" };
  const rna = [...template].map(base => pairing[base]).join("");
  const codons = rna.match(/.{3}/g);
  const code = {
    AUG: { name: "甲硫氨酸", short: "Met" },
    GCU: { name: "丙氨酸", short: "Ala" },
    UUC: { name: "苯丙氨酸", short: "Phe" },
    UAA: { name: "终止" }
  };
  const stopCodons = ["UAA", "UAG", "UGA"];
  const triplets = sequence => sequence.match(/.{3}/g).join(" ");
  const seq = {
    template, rna, codons, code, stopCodons,
    coding: [...template].map(base => ({ A: "T", T: "A", C: "G", G: "C" })[base]).join(""),
    templateText: `3′–${triplets(template)}–5′`,
    rnaText: `5′–${triplets(rna)}–3′`,
    peptide: codons.filter(codon => !stopCodons.includes(codon)).map(codon => code[codon])
  };

  const scenes = [
    {
      label: "进入细胞", sub: "定位遗传信息", key: "CELL MAP", title: "DNA 上的信息怎样到达核糖体？",
      location: "真核细胞", scale: "细胞剖面", kind: "结构探查",
      heading: "先找到两个地点",
      intro: "转录主要发生在细胞核内。翻译在细胞质中的核糖体上进行。跟着 mRNA，看看两个地点怎样连起来。",
      prompt: "点选结构，放大观察",
      choices: [
        { id: "nucleus", text: "细胞核", feedback: "这里有 DNA。RNA 聚合酶在核内以 DNA 的一条链为模板合成 RNA。" },
        { id: "ribosome", text: "核糖体", feedback: "核糖体沿 mRNA 读取密码子。tRNA 带来氨基酸，核糖体催化肽键形成。" }
      ],
      note: "也可直接点击画面中的结构标签。再次点击恢复全景。",
      facts: [["转录", "细胞核"], ["翻译", "细胞质中的核糖体"], ["携带信息", "mRNA"]],
      frames: [
        [0, "定位结构", "从细胞剖面开始。点击细胞核或核糖体，观察它们各自的位置。"],
        [2.2, "细胞核内", "DNA 位于细胞核内，其中一条链可作为转录模板。"],
        [4.6, "信息出核", "加工成熟的 mRNA 携带信息穿过核孔。"],
        [7.6, "到达核糖体", "mRNA 到达细胞质中的核糖体，为翻译提供模板。"]
      ]
    },
    {
      label: "DNA 转录", sub: "以 DNA 为模板", key: "TRANSCRIPTION", title: "沿着 DNA 写出一条 RNA",
      location: "细胞核内", scale: "转录局部放大", kind: "碱基配对",
      heading: "选中互补碱基",
      intro: "RNA 聚合酶局部打开 DNA 双链，沿模板链 3′→5′ 读取，同时将 RNA 链向 5′→3′ 延长。",
      prompt: "模板链上的 A，应该与哪种 RNA 碱基配对？",
      choices: [
        { id: "A", text: "A", feedback: "A 和 A 不能互补。在 RNA 中找能与模板 A 配对的碱基。" },
        { id: "U", text: "U", correct: true, feedback: "正确。模板 A 与 RNA 的 U 配对，U 将接入正在延伸的 RNA 链。" },
        { id: "C", text: "C", feedback: "RNA 的 C 与模板 G 配对。再看看模板 A 的互补碱基。" },
        { id: "G", text: "G", feedback: "RNA 的 G 与模板 C 配对。再试一次。" }
      ],
      note: "播放或单步到达配对点后作答。",
      compact: true, gate: 2,
      facts: [["DNA 模板", seq.templateText], ["RNA 编码片段", seq.rnaText]],
      frames: [
        [0, "结合", "RNA 聚合酶向 DNA 靠近。画面只截取转录本的一小段编码序列。"],
        [2, "局部解开", "DNA 只在 RNA 聚合酶附近局部解开，模板链逐个露出碱基。"],
        [4, "碱基配对", "暂停观察。RNA 已接入第一个 A。第二个模板碱基是 A，请选择互补碱基。"],
        [5.35, "接入 U", "U 接入 RNA 链。RNA 聚合酶继续沿模板链向前移动。"],
        [10.6, "片段合成", "示例编码片段已完整写出。RNA 链的 5′ 端先形成，新的碱基接到 3′ 端。"],
        [13.2, "释放 RNA", "转录产物离开 DNA。此处标出的只是编码片段，完整转录本还有其他区域。"]
      ]
    },
    {
      label: "RNA 加工", sub: "剪接前体 RNA", key: "RNA PROCESSING", title: "剪去内含子，连接外显子",
      location: "细胞核内", scale: "前体 RNA 结构示意", kind: "剪接操作",
      heading: "保留哪些片段？",
      intro: "以含一个内含子的真核基因为例。前体 RNA 剪接时，内含子被移除，两侧的外显子连接。",
      prompt: "在画面或下方点选需要移除的片段。",
      choices: [
        { id: "exon1", text: "外显子 1", feedback: "外显子 1 保留下来，并与外显子 2 连接。" },
        { id: "intron", text: "内含子", correct: true, feedback: "正确。观察内含子先形成套索，再与 RNA 分离。" },
        { id: "exon2", text: "外显子 2", feedback: "外显子 2 是成熟 mRNA 保留的片段。试试两个外显子之间的片段。" }
      ],
      note: "外显子和内含子只表示相对位置。",
      gate: 1,
      facts: [["剪接前", "前体 RNA"], ["剪接后", "外显子相连"]],
      details: [
        ["5′ 端加帽", "在转录早期，前体 RNA 的 5′ 端可加上帽结构，有助于 RNA 稳定，也参与之后的翻译起始。"],
        ["3′ 端加尾", "许多真核 mRNA 的 3′ 端经切割后加上 poly(A) 尾，有助于稳定、出核和翻译。"]
      ],
      frames: [
        [0, "观察前体 RNA", "画面用不同形状标出两个外显子和中间的内含子。"],
        [2, "选择剪接片段", "选择应被移除的片段，观察连接处发生怎样的变化。"],
        [4.25, "形成套索", "内含子形成套索状中间结构，随后被切除。"],
        [6.8, "移除内含子", "内含子已经分离，相邻外显子靠拢并连接。"],
        [9.2, "成熟 mRNA", "外显子已经连接。画面同时标出了典型成熟 mRNA 的 5′ 帽和 3′ poly(A) 尾。"]
      ]
    },
    {
      label: "mRNA 出核", sub: "穿过核孔", key: "NUCLEAR EXPORT", title: "信息怎样离开细胞核？",
      location: "核膜", scale: "核孔局部放大", kind: "路径探索",
      heading: "找到核孔",
      intro: "加工成熟的 mRNA 与蛋白质结合，通过核孔复合体输出到细胞质。基因对应的 DNA 仍在细胞核内。",
      prompt: "点击画面中央的核孔，让 mRNA 出核。",
      choices: [{ id: "pore", text: "启动出核演示", correct: true, feedback: "已找到核孔。观察 mRNA 经过核孔，注意 DNA 的位置。" }],
      note: "画面聚焦 mRNA 的移动路径，省略伴随运输的蛋白质。",
      gate: 1,
      facts: [["出口", "核孔复合体"], ["移动", "成熟 mRNA"], ["保留在核内", "DNA"]],
      frames: [
        [0, "核孔定位", "放大核膜的一段。双层核膜在核孔处相接。"],
        [1.6, "等待出核", "成熟 mRNA 到达核孔附近。点击核孔启动演示。"],
        [4.1, "穿过核孔", "mRNA 穿过核孔，从细胞核内到达细胞质。"],
        [7.8, "返回细胞全景", "视野回到整个细胞。mRNA 在核外，DNA 仍在细胞核内。"]
      ]
    },
    {
      label: "翻译延伸", sub: "读取密码子", key: "TRANSLATION", title: "三个碱基，读出一个密码子",
      location: "核糖体", scale: "翻译局部放大", kind: "读码挑战",
      heading: "为 GCU 配对",
      intro: "核糖体从 AUG 起始，以三个碱基为一组读取 mRNA。携带氨基酸的 tRNA 用反密码子与密码子配对。",
      prompt: "mRNA 的 5′–GCU–3′ 对应哪条反密码子？",
      choices: [
        { id: "CGA", text: "3′–CGA–5′", correct: true, feedback: "正确。携带丙氨酸的 tRNA 进入，随后丙氨酸通过肽键接入多肽链。" },
        { id: "GCU", text: "3′–GCU–5′", feedback: "这组字母与密码子相同。请按 G↔C、C↔G、U↔A 依次配对。" },
        { id: "CGU", text: "3′–CGU–5′", feedback: "前两个碱基正确。mRNA 的最后一位 U 应与 A 配对。" }
      ],
      note: "示例使用互补配对，省略部分密码子第三位可发生的摆动配对。",
      gate: 3,
      facts: [["mRNA 编码片段", seq.rnaText], ["三个氨基酸", seq.peptide.map(item => item.short).join("–")]],
      frames: [
        [0, "起始前", "mRNA 和核糖体小亚基靠近，寻找本例的起始密码子 AUG。"],
        [1.8, "识别 AUG", "携带甲硫氨酸的起始 tRNA 与 AUG 配对，位于 P 位。"],
        [3.1, "组装核糖体", "核糖体大亚基加入。下一个密码子 GCU 位于 A 位。"],
        [4.4, "读码 · GCU", "暂停读码。为 GCU 选择与它反向互补的 tRNA 反密码子。"],
        [6, "配对 · tRNA 进入", "携带丙氨酸的 tRNA 到达 A 位。"],
        [7.6, "接入 · 形成肽键", "甲硫氨酸转移到 A 位的 tRNA 上，与丙氨酸相连。"],
        [9.3, "移位 · 前进一组", "核糖体沿 mRNA 向 3′ 端移动一个密码子，携带短肽的 tRNA 转到 P 位。"],
        [11, "配对 · UUC", "携带苯丙氨酸的 tRNA 与下一个密码子 UUC 配对。"],
        [12.8, "接入 · 链再延长", "苯丙氨酸接入，多肽含三个氨基酸。"],
        [14.6, "移位 · 读到 UAA", "核糖体再移动一个密码子。现在 A 位是 UAA。"]
      ]
    },
    {
      label: "翻译终止", sub: "释放多肽链", key: "TERMINATION", title: "读到终止密码子之后",
      location: "核糖体", scale: "翻译终止局部", kind: "机制判断",
      heading: "谁来识别 UAA？",
      intro: "在标准遗传密码中，UAA、UAG、UGA 是终止密码子。读到它们时，核糖体停止延长多肽链。",
      prompt: "读到 UAA 后，谁进入核糖体的 A 位？",
      choices: [
        { id: "trna", text: "携带氨基酸的 tRNA", feedback: "UAA 是终止信号，标准翻译中没有携带氨基酸的 tRNA 对应它。" },
        { id: "factor", text: "释放因子", correct: true, feedback: "正确。释放因子识别 UAA，促使新合成的多肽从 tRNA 上释放。" }
      ],
      note: "观察释放前后，多肽中氨基酸的数目。",
      gate: 1,
      facts: [["终止密码子", seq.stopCodons.join(" / ")], ["本例产物", seq.peptide.map(item => item.short).join("–")]],
      frames: [
        [0, "到达 UAA", "核糖体已移动到终止密码子 UAA。A 位空着，P 位的 tRNA 携带多肽。"],
        [1.8, "识别终止信号", "暂停思考。A 位的 UAA 会被哪类分子识别？"],
        [3.7, "释放因子结合", "释放因子进入 A 位并识别 UAA。"],
        [6.1, "多肽释放", "多肽从 tRNA 上脱离，氨基酸的数目保持不变。"],
        [9.2, "核糖体解离", "大小亚基分开，mRNA 和 tRNA 离开核糖体。"]
      ]
    },
    {
      label: "多肽折叠", sub: "形成空间结构", key: "PROTEIN FOLDING", title: "从一条链到空间结构",
      location: "多肽模型", scale: "折叠模型 · 非实测结构", kind: "模型控制",
      heading: "比较伸展与折叠",
      intro: "这里换用一条较长的多肽作示意。折叠中氨基酸的排列顺序保持不变，链的空间形态发生变化。",
      prompt: "拖动滑块，观察同一条多肽改变形态。",
      note: "滑块表示形态过渡。真实折叠可在翻译过程中开始，部分蛋白质还需要加工或组装。",
      facts: [["保持不变", "氨基酸排列顺序"], ["发生变化", "多肽的空间形态"]],
      flow: [["DNA · 转录", 1], ["RNA · 加工", 2], ["多肽 · 翻译", 4], ["蛋白质 · 折叠", 6]],
      frames: [
        [0, "伸展的长链", "追踪带编号的首尾。当前是一条较长多肽的简化模型。"],
        [2.8, "局部弯曲", "多肽不同区段开始靠近，链的连接顺序保持不变。"],
        [5.8, "形成较紧凑的结构", "多肽链折叠后占据的空间改变。图中只示意形态变化。"],
        [8.2, "回顾信息传递", "从 DNA 到 RNA，再到多肽及蛋白质。点击右侧流程节点可复习相应场景。"]
      ]
    }
  ];

  for (const scene of scenes) {
    scene.frames = scene.frames.map(([at, label, caption]) => ({ at, label, caption }));
    scene.duration = scene.frames.at(-1).at;
  }
  return { scenes, seq };
})();
