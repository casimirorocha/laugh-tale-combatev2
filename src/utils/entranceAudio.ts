// Dedicated KOF Fighter Entrance & Custom Taunt Audio Synthesizer
// Web Audio API custom sound designer replicating classic 90s/2000s arcade hardware (Neo Geo / CPS2)
// Combines synthesized sound effects (whoosh, metal clash, thunder, magma, laser) with speech synthesis.

import { audioManager } from './AudioManager';

export interface CharacterTauntData {
  quoteEN: string;
  quoteJP: string;
  voiceTextJP: string;
  signatureSound: 'rubber' | 'katana' | 'conqueror' | 'dragon' | 'quake' | 'darkness' | 'magma' | 'blade' | 'laser' | 'brawler' | 'room' | 'clown' | 'future' | 'royal' | 'sand' | 'string' | 'water' | 'fire' | 'flame' | 'lightning' | 'shadow' | 'ice';
  pitch: number; // 0.6 to 1.4
  rate: number;  // 0.9 to 1.3
}

export const FIGHTER_TAUNT_DATABASE: Record<string, CharacterTauntData> = {
  luffy: {
    quoteEN: "Shishishi! I'm Monkey D. Luffy! The man who's gonna be King of the Pirates!",
    quoteJP: "ししし！海賊王に、おれはなる！",
    voiceTextJP: "ししし！かいぞくおうにおれはなる！",
    signatureSound: 'rubber',
    pitch: 1.25,
    rate: 1.15,
  },
  zoro_king_of_hell: {
    quoteEN: "I will become the King of Hell... Taste the edge of my three blades!",
    quoteJP: "おれは地獄の王になる！三刀流の切れ味、味わいな！",
    voiceTextJP: "おれはじごくのおうになる！さんとうりゅうのきれあじ、あじわいな！",
    signatureSound: 'katana',
    pitch: 0.82,
    rate: 1.05,
  },
  shanks_yonko: {
    quoteEN: "I have come to end this war! Are you ready to bet your life?",
    quoteJP: "この戦争を終わらせに来た！命を懸ける覚悟はあるか？",
    voiceTextJP: "このせんそうをおわらせにきた！いのちをかけるかくごはあるか？",
    signatureSound: 'conqueror',
    pitch: 0.90,
    rate: 1.02,
  },
  kaido_beast: {
    quoteEN: "Worororo! Only Haki transcends all! Show me what you got, brat!",
    quoteJP: "ウォロロロ！覇気だけが全てを凌駕する！見せてみろ小僧！",
    voiceTextJP: "ウォロロロ！はきだけがすべてをりょうがする！みせてみろこぞう！",
    signatureSound: 'dragon',
    pitch: 0.68,
    rate: 0.98,
  },
  roger_pirate_king: {
    quoteEN: "I left everything this world has to offer in that place! Come at me!",
    quoteJP: "この世の全てをそこに置いてきた！かかってこい！",
    voiceTextJP: "このよのすべてをそこにおいてきた！かかってこい！",
    signatureSound: 'royal',
    pitch: 0.95,
    rate: 1.10,
  },
  whitebeard_legend: {
    quoteEN: "Gurararara! You're a hundred years too early to challenge me!",
    quoteJP: "グララララ！おれに挑むなど、百年前だ小僧！",
    voiceTextJP: "グララララ！おれにいどむなど、ひゃくねんまえだこぞう！",
    signatureSound: 'quake',
    pitch: 0.70,
    rate: 0.95,
  },
  blackbeard_teach: {
    quoteEN: "Zehahaha! A man's dream will never die! Darkness swallows everything!",
    quoteJP: "ゼハハハ！人の夢は終わらねぇ！闇が全てを飲み込む！",
    voiceTextJP: "ゼハハハ！ひとのゆめはおわらねえ！やみがすべてをのみこむ！",
    signatureSound: 'darkness',
    pitch: 0.78,
    rate: 1.05,
  },
  akainu_sakazuki: {
    quoteEN: "Absolute Justice will eradicate all evil! Not a single cinder shall remain!",
    quoteJP: "絶対的正義のもとに悪を根絶やしにする！灰も残さん！",
    voiceTextJP: "ぜったいてきせいぎのもとに、あくをねだやしにする！はいものこさん！",
    signatureSound: 'magma',
    pitch: 0.76,
    rate: 1.0,
  },
  mihawk_dracule: {
    quoteEN: "Pitiful soul... Let this Black Blade test the depth of your conviction.",
    quoteJP: "憐れな奴め… この黒刀でお前の覚悟を測ってやろう。",
    voiceTextJP: "あわれなやつめ… このこくとうでおまえのかくごをはかってやろう。",
    signatureSound: 'blade',
    pitch: 0.85,
    rate: 0.96,
  },
  kizaru_borsalino: {
    quoteEN: "Moshi mosh~ Have you ever been kicked at the speed of light, hmm?",
    quoteJP: "もしも〜し、光の速度で蹴られたことはあるかい〜？",
    voiceTextJP: "もしも〜し、ひかりのそくどでけられたことはあるかい〜？",
    signatureSound: 'laser',
    pitch: 0.92,
    rate: 0.88,
  },
  garp_legend: {
    quoteEN: "Gahaha! Do you know who you're picking a fight with?! Fist of Love!",
    quoteJP: "ガハハ！誰に喧嘩売ってんのか分かってんのか！愛の拳骨だ！",
    voiceTextJP: "ガハハ！だれにけんかうってんのかわかってんのか！あいのげんこつだ！",
    signatureSound: 'brawler',
    pitch: 0.82,
    rate: 1.12,
  },
  law_trafalgar: {
    quoteEN: "ROOM. Your heart is already within the palm of my hand.",
    quoteJP: "ROOM… お前の心臓は、すでに俺の手の中にある。",
    voiceTextJP: "ルーム… おまえのしんぞうは、すでにおれのてのなかにある。",
    signatureSound: 'room',
    pitch: 0.88,
    rate: 1.02,
  },
  buggy_emperor: {
    quoteEN: "Gyahaha! Fear the flashy greatness of the legendary Genius Jester Buggy!",
    quoteJP: "ギャハハ！この伝説の千両道化バギー様の派手な強さを恐れろ！",
    voiceTextJP: "ギャハハ！このでんせつのせんりょうどうかバギーさまのはでなつよさをおそれろ！",
    signatureSound: 'clown',
    pitch: 1.30,
    rate: 1.22,
  },
  katakuri_charlotte: {
    quoteEN: "I can see five seconds into the future... and in it, you are defeated.",
    quoteJP: "未来が見える… その未来で、お前はすでに地に伏している。",
    voiceTextJP: "みらいがみえる… そのみらいで、おまえはすでにちにふしている。",
    signatureSound: 'future',
    pitch: 0.79,
    rate: 0.98,
  },
  crocodile_sir: {
    quoteEN: "Do you think you can survive the desert? Everything withers before me.",
    quoteJP: "砂漠で生き残れると思うか？俺の前では全てが枯れる。",
    voiceTextJP: "さばくでいきのこれるとおもうか？おれのマえではすべてがかれる。",
    signatureSound: 'sand',
    pitch: 0.72,
    rate: 0.95,
  },
  doflamingo_joker: {
    quoteEN: "Fuffuffuffu! The strings of fate are in my hands. Justice is whoever wins!",
    quoteJP: "フッフッフッフ！運命の糸は俺の手の中だ。勝者こそが正義だ！",
    voiceTextJP: "フッフッフッフ！うんめいのいとはおれのてのなかだ。しょうしゃこそがせいぎだ！",
    signatureSound: 'string',
    pitch: 1.15,
    rate: 1.10,
  },
  jinbe_knight: {
    quoteEN: "For the future of my captain, I shall stand as your wall!",
    quoteJP: "わが船長の未来のため、わしが盾となろう！",
    voiceTextJP: "わがせんちょうのみらいのため、わしがたてとなろう！",
    signatureSound: 'water',
    pitch: 0.78,
    rate: 0.92,
  },
  ace_portgas: {
    quoteEN: "You can't handle the heat! Hiken!",
    quoteJP: "火遊びは火傷するぜ！火拳！",
    voiceTextJP: "ひあそびはやけどするぜ！ひけん！",
    signatureSound: 'fire',
    pitch: 1.10,
    rate: 1.15,
  },
  sanji_vinsmoke: {
    quoteEN: "Compliments to the chef. I'll kick you into the next week!",
    quoteJP: "クソお世話になりました！次の一撃で沈めてやる！",
    voiceTextJP: "くそおせわになりました！つぎのいちげきでしずめてやる！",
    signatureSound: 'fire',
    pitch: 1.05,
    rate: 1.10,
  },
  lucci_rob: {
    quoteEN: "Dark Justice requires sacrifice. You are next.",
    quoteJP: "闇の正義には犠牲が必要だ。次はお前だ。",
    voiceTextJP: "やみのせいぎにはぎせいが必要だ。つぎはおまえだ。",
    signatureSound: 'brawler',
    pitch: 0.75,
    rate: 1.0,
  },
  enel_god: {
    quoteEN: "I am God. Judgment descends upon you!",
    quoteJP: "我は神なり。裁きを授けよう！",
    voiceTextJP: "われはかみなり。さばきをさずけよう！",
    signatureSound: 'lightning',
    pitch: 1.20,
    rate: 1.05,
  },
  moria_gecko: {
    quoteEN: "Kishishishi! Join my army of the dead!",
    quoteJP: "キシシシシ！俺の死者の軍団に加われ！",
    voiceTextJP: "きしししし！おれのししゃのぐんだんにくわわれ！",
    signatureSound: 'shadow',
    pitch: 0.65,
    rate: 0.9,
  },
  oden_kozuki: {
    quoteEN: "I am Oden! I was born to boil! Wano will be free!",
    quoteJP: "おでんに候！煮えてなんぼのおでんに候！ワノ国を開国せよ！",
    voiceTextJP: "おでんにそうろう！にえてなんぼのおでんにそうろう！ワノくにをかいこくせよ！",
    signatureSound: 'katana',
    pitch: 0.85,
    rate: 1.1,
  },
  shiki_lion: {
    quoteEN: "A pirate rules the sea, but I rule the sky!",
    quoteJP: "海を支配するのが海賊だが、空を支配するのは俺だ！",
    voiceTextJP: "うみをしはいするのがかいぞくだが、そらをしはいするのはおれだ！",
    signatureSound: 'royal',
    pitch: 0.70,
    rate: 0.95,
  },
  aokiji_kuzan: {
    quoteEN: "Ice Age. The world is better when it's quiet and cold.",
    quoteJP: "氷河時代（アイス・エイジ）。世界は静かで冷たいほうがいい。",
    voiceTextJP: "アイスエイジ。せかいはしずかでつめたいほうがいい。",
    signatureSound: 'ice',
    pitch: 0.80,
    rate: 0.85,
  },
};

export const getMatchupTaunt = (fighterId: string, opponentId: string): string | null => {
  if (fighterId === 'buggy_emperor' && opponentId === 'luffy') {
    const buggyToLuffy = [
      "Filhote de seringueira!",
      "Moleque dorme sujo!",
      "Borrachudo safado!"
    ];
    return buggyToLuffy[Math.floor(Math.random() * buggyToLuffy.length)];
  } else if (fighterId === 'luffy' && opponentId === 'buggy_emperor') {
    const luffyToBuggy = [
      "Eaí BOGA!",
      "BOGGA MELHOR DESISTIR!"
    ];
    return luffyToBuggy[Math.floor(Math.random() * luffyToBuggy.length)];
  } else if (fighterId === 'sanji_vinsmoke' && opponentId === 'zoro_king_of_hell') {
    return "Marimo de merda! Vou te mostrar quem manda aqui!";
  } else if (fighterId === 'zoro_king_of_hell' && opponentId === 'sanji_vinsmoke') {
    return "Cozinheiro de merda! Já preparou seu próprio funeral?";
  } else if (fighterId === 'crocodile_sir' && opponentId === 'luffy') {
    return "Você nunca aprende, né moleque? Desta vez, não haverá água para te salvar.";
  } else if (fighterId === 'doflamingo_joker' && opponentId === 'luffy') {
    return "Fuffuffuffu! O trono pertence aos dragões, não a macacos como você!";
  } else if (fighterId === 'ace_portgas' && opponentId === 'luffy') {
    return "Ei Luffy! Cuide bem desse chapéu, ou eu mesmo vou pegá-lo!";
  } else if (fighterId === 'luffy' && opponentId === 'ace_portgas') {
    return "ACE! Desta vez eu vou te superar de verdade! Shishishi!";
  } else if (fighterId === 'jinbe_knight' && opponentId === 'luffy') {
    return "Luffy-kun, é uma honra testar sua força antes da nossa jornada!";
  }
  return null;
};

class KOFEntranceAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public volume: number = 0.55;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 1. Team Banner Clash Impact: Heavy metallic slam with low rumble and arcade chime
  public playBannerClash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Sub rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.5);
    subGain.gain.setValueAtTime(this.volume * 0.9, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.5);

    // Metal crash
    const metalOsc = this.ctx.createOscillator();
    const metalGain = this.ctx.createGain();
    metalOsc.type = 'sawtooth';
    metalOsc.frequency.setValueAtTime(480, now);
    metalOsc.frequency.exponentialRampToValueAtTime(90, now + 0.35);
    metalGain.gain.setValueAtTime(this.volume * 0.7, now);
    metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    metalOsc.connect(metalGain);
    metalGain.connect(this.ctx.destination);
    metalOsc.start(now);
    metalOsc.stop(now + 0.35);

    // Arcade whoosh
    this.playNoiseWhoosh(now, 0.25, 600);
  }

  // 2. Character Portrait Sliding in with Mach speed
  public playPortraitSlide() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.18);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.6, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);

    this.playNoiseWhoosh(now, 0.18, 1200);
  }

  // 3. Kanji Name Stamp ("DON!" / Hanko seal slam)
  public playKanjiStamp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Taiko boom
    const boom = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(160, now);
    boom.frequency.exponentialRampToValueAtTime(45, now + 0.4);
    boomGain.gain.setValueAtTime(this.volume * 0.95, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    boom.connect(boomGain);
    boomGain.connect(this.ctx.destination);
    boom.start(now);
    boom.stop(now + 0.4);

    // Wooden / metal strike snap
    const snap = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snap.type = 'square';
    snap.frequency.setValueAtTime(520, now);
    snap.frequency.exponentialRampToValueAtTime(120, now + 0.08);
    snapGain.gain.setValueAtTime(this.volume * 0.7, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    snap.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snap.start(now);
    snap.stop(now + 0.08);
  }

  // 4. Center Versus Emblem impact
  public playVersusImpact() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Power chord triad
    const freqs = [330, 495, 660, 990];
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now + idx * 0.02);
      osc.frequency.exponentialRampToValueAtTime(f * 0.7, now + 0.45);
      gain.gain.setValueAtTime(this.volume * 0.4, now + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.02);
      osc.stop(now + 0.5);
    });

    // Thunder boom
    this.playNoiseWhoosh(now, 0.35, 450);
  }

  // 5. Classic KOF "ROUND 1... READY... GO!" sequence fanfare
  public playReadyGoFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Ascending brass fanfares
    const notes = [
      { f: 440.0, d: 0.12, t: 0 },
      { f: 554.37, d: 0.12, t: 0.14 },
      { f: 659.25, d: 0.15, t: 0.28 },
      { f: 880.0, d: 0.45, t: 0.44 },
    ];

    notes.forEach((n) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(this.volume * 0.6, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  }

  // 5b. Grand Line Champion Victory Fanfare & Crowd Roar Synth
  public playVictoryCheer() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Majestic triumphant brass chords: D major -> G major -> A major -> D high triumph
    const chords = [
      { notes: [293.66, 369.99, 440.0], t: 0, d: 0.25 },
      { notes: [392.0, 493.88, 587.33], t: 0.22, d: 0.28 },
      { notes: [440.0, 554.37, 659.25], t: 0.48, d: 0.35 },
      { notes: [587.33, 739.99, 880.0, 1174.66], t: 0.8, d: 0.85 },
    ];

    chords.forEach((chord) => {
      chord.notes.forEach((f) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + chord.t);
        gain.gain.setValueAtTime(this.volume * 0.35, now + chord.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + chord.t + chord.d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + chord.t);
        osc.stop(now + chord.t + chord.d);
      });
    });

    // Crowd cheer noise sweep
    this.playNoiseWhoosh(now + 0.1, 1.2, 900);
    this.playNoiseWhoosh(now + 0.4, 0.9, 1400);
  }

  // 5c. Victory Pose Finishing Strike Impact
  public playPoseFinisherHit() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Sub bass drop
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(220, now);
    sub.frequency.exponentialRampToValueAtTime(30, now + 0.6);
    subGain.gain.setValueAtTime(this.volume * 0.9, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(now);
    sub.stop(now + 0.6);

    // High shimmer / chime
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'triangle';
    chime.frequency.setValueAtTime(1320, now);
    chime.frequency.exponentialRampToValueAtTime(2640, now + 0.15);
    chimeGain.gain.setValueAtTime(this.volume * 0.6, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    chime.connect(chimeGain);
    chimeGain.connect(this.ctx.destination);
    chime.start(now);
    chime.stop(now + 0.4);

    this.playNoiseWhoosh(now, 0.3, 1600);
  }

  // 6. Custom Fighter Taunt Audio Synthesizer (Signature sounds)
  public playSignatureSound(soundType: CharacterTauntData['signatureSound']) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    switch (soundType) {
      case 'rubber': {
        // Luffy: Elastic stretch twang + cartoon snap
        const twang = this.ctx.createOscillator();
        const tGain = this.ctx.createGain();
        twang.type = 'sine';
        twang.frequency.setValueAtTime(180, now);
        twang.frequency.exponentialRampToValueAtTime(760, now + 0.15);
        twang.frequency.exponentialRampToValueAtTime(240, now + 0.3);
        tGain.gain.setValueAtTime(this.volume * 0.7, now);
        tGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        twang.connect(tGain);
        tGain.connect(this.ctx.destination);
        twang.start(now);
        twang.stop(now + 0.32);
        break;
      }
      case 'katana': {
        // Zoro: Metallic blade unsheathe ring + sharp razor air cut
        const ring = this.ctx.createOscillator();
        const rGain = this.ctx.createGain();
        ring.type = 'sawtooth';
        ring.frequency.setValueAtTime(1800, now);
        ring.frequency.exponentialRampToValueAtTime(2400, now + 0.1);
        ring.frequency.exponentialRampToValueAtTime(900, now + 0.4);
        rGain.gain.setValueAtTime(this.volume * 0.5, now);
        rGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        ring.connect(rGain);
        rGain.connect(this.ctx.destination);
        ring.start(now);
        ring.stop(now + 0.45);
        this.playNoiseWhoosh(now + 0.05, 0.2, 2200);
        break;
      }
      case 'conqueror': {
        // Shanks: Deep sub-harmonic hum + red lightning crackle
        const hum = this.ctx.createOscillator();
        const hGain = this.ctx.createGain();
        hum.type = 'sawtooth';
        hum.frequency.setValueAtTime(90, now);
        hum.frequency.exponentialRampToValueAtTime(45, now + 0.6);
        hGain.gain.setValueAtTime(this.volume * 0.85, now);
        hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        hum.connect(hGain);
        hGain.connect(this.ctx.destination);
        hum.start(now);
        hum.stop(now + 0.65);
        this.playNoiseWhoosh(now, 0.3, 400);
        break;
      }
      case 'dragon': {
        // Kaido: Heavy iron club slam + thunderous growl
        const club = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        club.type = 'sawtooth';
        club.frequency.setValueAtTime(140, now);
        club.frequency.exponentialRampToValueAtTime(30, now + 0.5);
        cGain.gain.setValueAtTime(this.volume * 0.9, now);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        club.connect(cGain);
        cGain.connect(this.ctx.destination);
        club.start(now);
        club.stop(now + 0.5);
        break;
      }
      case 'quake': {
        // Whitebeard: Atmospheric shatter vibration
        const q1 = this.ctx.createOscillator();
        const qGain = this.ctx.createGain();
        q1.type = 'triangle';
        q1.frequency.setValueAtTime(80, now);
        q1.frequency.setValueAtTime(110, now + 0.1);
        q1.frequency.exponentialRampToValueAtTime(25, now + 0.7);
        qGain.gain.setValueAtTime(this.volume * 0.95, now);
        qGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        q1.connect(qGain);
        qGain.connect(this.ctx.destination);
        q1.start(now);
        q1.stop(now + 0.7);
        break;
      }
      case 'darkness': {
        // Blackbeard: Gravitational void vortex
        const vortex = this.ctx.createOscillator();
        const vGain = this.ctx.createGain();
        vortex.type = 'sawtooth';
        vortex.frequency.setValueAtTime(280, now);
        vortex.frequency.exponentialRampToValueAtTime(50, now + 0.45);
        vGain.gain.setValueAtTime(this.volume * 0.75, now);
        vGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        vortex.connect(vGain);
        vGain.connect(this.ctx.destination);
        vortex.start(now);
        vortex.stop(now + 0.5);
        break;
      }
      case 'magma': {
        // Akainu: Volcanic sizzle & detonation
        this.playNoiseWhoosh(now, 0.4, 300);
        const lava = this.ctx.createOscillator();
        const lGain = this.ctx.createGain();
        lava.type = 'sawtooth';
        lava.frequency.setValueAtTime(120, now);
        lava.frequency.exponentialRampToValueAtTime(35, now + 0.35);
        lGain.gain.setValueAtTime(this.volume * 0.8, now);
        lGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        lava.connect(lGain);
        lGain.connect(this.ctx.destination);
        lava.start(now);
        lava.stop(now + 0.35);
        break;
      }
      case 'blade': {
        // Mihawk: Pristine steel resonance
        const steel = this.ctx.createOscillator();
        const sGain = this.ctx.createGain();
        steel.type = 'sine';
        steel.frequency.setValueAtTime(2200, now);
        steel.frequency.exponentialRampToValueAtTime(1400, now + 0.4);
        sGain.gain.setValueAtTime(this.volume * 0.6, now);
        sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        steel.connect(sGain);
        sGain.connect(this.ctx.destination);
        steel.start(now);
        steel.stop(now + 0.4);
        break;
      }
      case 'laser': {
        // Kizaru: Photonic frequency slide
        const laser = this.ctx.createOscillator();
        const lGain = this.ctx.createGain();
        laser.type = 'sawtooth';
        laser.frequency.setValueAtTime(300, now);
        laser.frequency.exponentialRampToValueAtTime(2800, now + 0.25);
        laser.frequency.exponentialRampToValueAtTime(400, now + 0.4);
        lGain.gain.setValueAtTime(this.volume * 0.55, now);
        lGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        laser.connect(lGain);
        lGain.connect(this.ctx.destination);
        laser.start(now);
        laser.stop(now + 0.45);
        break;
      }
      case 'brawler': {
        // Garp: Knuckle pop + heavy fist impact
        const b = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        b.type = 'triangle';
        b.frequency.setValueAtTime(240, now);
        b.frequency.exponentialRampToValueAtTime(60, now + 0.25);
        bGain.gain.setValueAtTime(this.volume * 0.85, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        b.connect(bGain);
        bGain.connect(this.ctx.destination);
        b.start(now);
        b.stop(now + 0.25);
        break;
      }
      case 'room': {
        // Law: Spatial sphere activation pulse
        const room = this.ctx.createOscillator();
        const rGain = this.ctx.createGain();
        room.type = 'sine';
        room.frequency.setValueAtTime(440, now);
        room.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        room.frequency.exponentialRampToValueAtTime(660, now + 0.35);
        rGain.gain.setValueAtTime(this.volume * 0.65, now);
        rGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        room.connect(rGain);
        rGain.connect(this.ctx.destination);
        room.start(now);
        room.stop(now + 0.4);
        break;
      }
      case 'clown': {
        // Buggy: Circus horn flourish + pop
        const horn = this.ctx.createOscillator();
        const hGain = this.ctx.createGain();
        horn.type = 'sawtooth';
        horn.frequency.setValueAtTime(587.33, now); // D5
        horn.frequency.setValueAtTime(783.99, now + 0.08); // G5
        hGain.gain.setValueAtTime(this.volume * 0.55, now);
        hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        horn.connect(hGain);
        hGain.connect(this.ctx.destination);
        horn.start(now);
        horn.stop(now + 0.3);
        break;
      }
      case 'future': {
        // Katakuri: Future sight bell chime
        const chime = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(987.77, now);
        chime.frequency.exponentialRampToValueAtTime(1318.51, now + 0.1);
        cGain.gain.setValueAtTime(this.volume * 0.6, now);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        chime.connect(cGain);
        cGain.connect(this.ctx.destination);
        chime.start(now);
        chime.stop(now + 0.38);
        break;
      }
      case 'royal': {
        // Roger: Regal gold chime
        const r1 = this.ctx.createOscillator();
        const rGain = this.ctx.createGain();
        r1.type = 'triangle';
        r1.frequency.setValueAtTime(523.25, now);
        r1.frequency.setValueAtTime(659.25, now + 0.08);
        r1.frequency.setValueAtTime(1046.5, now + 0.18);
        rGain.gain.setValueAtTime(this.volume * 0.7, now);
        rGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        r1.connect(rGain);
        rGain.connect(this.ctx.destination);
        r1.start(now);
        r1.stop(now + 0.5);
        break;
      }
      case 'sand': {
        // Crocodile: Granular sand sweep
        this.playNoiseWhoosh(now, 0.5, 400);
        this.playNoiseWhoosh(now + 0.1, 0.4, 600);
        break;
      }
      case 'string': {
        // Doflamingo: High tension string pluck
        const p = this.ctx.createOscillator();
        const pg = this.ctx.createGain();
        p.type = 'triangle';
        p.frequency.setValueAtTime(880, now);
        p.frequency.exponentialRampToValueAtTime(1760, now + 0.05);
        p.frequency.exponentialRampToValueAtTime(440, now + 0.2);
        pg.gain.setValueAtTime(this.volume * 0.5, now);
        pg.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        p.connect(pg);
        pg.connect(this.ctx.destination);
        p.start(now);
        p.stop(now + 0.2);
        break;
      }
      case 'water': {
        // Jinbe: Liquid bubble burst
        const b = this.ctx.createOscillator();
        const bg = this.ctx.createGain();
        b.type = 'sine';
        b.frequency.setValueAtTime(600, now);
        b.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        bg.gain.setValueAtTime(this.volume * 0.6, now);
        bg.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        b.connect(bg);
        bg.connect(this.ctx.destination);
        b.start(now);
        b.stop(now + 0.15);
        this.playNoiseWhoosh(now, 0.3, 1200);
        break;
      }
      case 'fire':
      case 'flame': {
        // Ace/Sanji: Flame burst
        this.playNoiseWhoosh(now, 0.4, 1500);
        const f = this.ctx.createOscillator();
        const fg = this.ctx.createGain();
        f.type = 'sawtooth';
        f.frequency.setValueAtTime(100, now);
        f.frequency.exponentialRampToValueAtTime(400, now + 0.3);
        fg.gain.setValueAtTime(this.volume * 0.7, now);
        fg.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        f.connect(fg);
        fg.connect(this.ctx.destination);
        f.start(now);
        f.stop(now + 0.4);
        break;
      }
      case 'lightning': {
        // Enel: High voltage crackle
        const l = this.ctx.createOscillator();
        const lg = this.ctx.createGain();
        l.type = 'square';
        l.frequency.setValueAtTime(1000, now);
        l.frequency.setValueAtTime(1500, now + 0.05);
        l.frequency.setValueAtTime(800, now + 0.1);
        lg.gain.setValueAtTime(this.volume * 0.4, now);
        lg.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        l.connect(lg);
        lg.connect(this.ctx.destination);
        l.start(now);
        l.stop(now + 0.2);
        this.playNoiseWhoosh(now, 0.15, 3000);
        break;
      }
      case 'shadow': {
        // Moria: Deep eerie void hum
        const s = this.ctx.createOscillator();
        const sg = this.ctx.createGain();
        s.type = 'sawtooth';
        s.frequency.setValueAtTime(60, now);
        s.frequency.exponentialRampToValueAtTime(40, now + 0.6);
        sg.gain.setValueAtTime(this.volume * 0.8, now);
        sg.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        s.connect(sg);
        sg.connect(this.ctx.destination);
        s.start(now);
        s.stop(now + 0.6);
        break;
      }
      case 'ice': {
        // Aokiji: Freezing crystalline chime
        const i = this.ctx.createOscillator();
        const ig = this.ctx.createGain();
        i.type = 'sine';
        i.frequency.setValueAtTime(1500, now);
        i.frequency.exponentialRampToValueAtTime(2500, now + 0.1);
        ig.gain.setValueAtTime(this.volume * 0.5, now);
        ig.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        i.connect(ig);
        ig.connect(this.ctx.destination);
        i.start(now);
        i.stop(now + 0.4);
        this.playNoiseWhoosh(now, 0.4, 2500);
        break;
      }
      default:
        this.playNoiseWhoosh(now, 0.2, 800);
        break;
    }
  }

  // Play Speech Voice Taunt for fighter
  public playVoiceTaunt(
    fighterId: string,
    fighterName: string,
    lang: 'ja' | 'en' = 'ja',
    onEnd?: () => void,
    opponentId?: string
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      // 1. Check for special matchup taunts
      const specialQuote = getMatchupTaunt(fighterId, opponentId || '');

      const data = FIGHTER_TAUNT_DATABASE[fighterId] || {
        quoteEN: `Prepare yourself, I won't hold back!`,
        quoteJP: `覚悟しろ！手加減はせんぞ！`,
        voiceTextJP: `かくごしろ！てかげんはせんぞ！`,
        signatureSound: 'brawler' as const,
        pitch: 0.9,
        rate: 1.05,
      };

      // Also trigger signature sound effect
      this.playSignatureSound(data.signatureSound);

      // Check for custom MP3 taunt audio file
      const playedCustomTaunt = audioManager.playCustomTauntSfx(fighterId, fighterName);
      if (playedCustomTaunt) {
        setTimeout(() => {
          onEnd?.();
          resolve();
        }, 1800);
        return;
      }

      if (typeof window === 'undefined' || !('speechSynthesis' in window) || this.isMuted) {
        setTimeout(() => {
          onEnd?.();
          resolve();
        }, 1200);
        return;
      }

      try {
        // Use special quote if available, otherwise fallback to database
        const textToSpeak = specialQuote || (lang === 'ja' ? data.voiceTextJP : data.quoteEN);
        const utterance = new SpeechSynthesisUtterance(textToSpeak);

        const voices = window.speechSynthesis.getVoices();
        
        // If we have a special quote (PT), try to find a PT voice if lang is not specifically requested or if it's PT
        if (specialQuote) {
          const ptVoices = voices.filter(v => v.lang.startsWith('pt'));
          if (ptVoices.length > 0) {
            utterance.voice = ptVoices.find(v => v.name.toLowerCase().includes('brazil') || v.name.toLowerCase().includes('portuguese')) || ptVoices[0];
            utterance.lang = 'pt-BR';
          } else {
            // Fallback to EN or JA voice but it might sound weird
            utterance.lang = lang === 'ja' ? 'ja-JP' : 'en-US';
          }
        } else if (lang === 'ja') {
          const jaVoices = voices.filter((v) => v.lang.startsWith('ja'));
          const maleVoice = jaVoices.find(
            (v) =>
              v.name.toLowerCase().includes('ichiro') ||
              v.name.toLowerCase().includes('kenji') ||
              v.name.toLowerCase().includes('keita') ||
              v.name.toLowerCase().includes('male') ||
              v.name.toLowerCase().includes('google 日本語')
          );
          utterance.voice = maleVoice || jaVoices[0] || null;
          utterance.lang = 'ja-JP';
        } else {
          const enVoices = voices.filter((v) => v.lang.startsWith('en'));
          const maleVoice = enVoices.find((v) => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david'));
          utterance.voice = maleVoice || enVoices[0] || null;
          utterance.lang = 'en-US';
        }

        utterance.pitch = data.pitch;
        utterance.rate = data.rate;
        utterance.volume = this.volume;

        let finished = false;
        const complete = () => {
          if (!finished) {
            finished = true;
            onEnd?.();
            resolve();
          }
        };

        utterance.onend = complete;
        utterance.onerror = complete;

        // Safety fallback timeout
        setTimeout(complete, 3000);

        window.speechSynthesis.speak(utterance);
      } catch {
        onEnd?.();
        resolve();
      }
    });
  }

  public speakText(text: string, lang: 'ja' | 'en' = 'ja'): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      if (lang === 'ja') {
        const jaVoices = voices.filter((v) => v.lang.startsWith('ja'));
        utterance.voice = jaVoices[0] || null;
        utterance.lang = 'ja-JP';
        utterance.pitch = 0.95;
        utterance.rate = 1.05;
      } else {
        const enVoices = voices.filter((v) => v.lang.startsWith('en'));
        utterance.voice = enVoices[0] || null;
        utterance.lang = 'en-US';
        utterance.pitch = 0.95;
        utterance.rate = 1.05;
      }
      utterance.volume = this.volume;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis failures
    }
  }

  private playNoiseWhoosh(start: number, duration: number, cutoff = 800) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(cutoff, start);
    filter.frequency.exponentialRampToValueAtTime(120, start + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.45, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(start);
  }
}

export const entranceAudio = new KOFEntranceAudioEngine();
