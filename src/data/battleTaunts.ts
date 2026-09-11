import { BattleTauntAnimation } from '../types/battleTaunts';

export const BATTLE_TAUNT_LIBRARY: BattleTauntAnimation[] = [
  // ==========================================
  // MONKEY D. LUFFY (GEAR 5 / SUN GOD NIKA)
  // ==========================================
  {
    id: 'luffy_giggle',
    fighterId: 'luffy',
    name: 'Gear 5 Joyful Nika Giggle',
    nameJP: 'ニカの歓喜大爆笑',
    category: 'signature',
    quoteEN: "Shishishi! This is the peak of what I can do!!",
    quoteJP: 'ししし！これが俺の最高地点だ！',
    quotePT: 'Shishishi! Este é o ápice do que posso fazer!',
    motion: 'bounce_joy',
    primaryColor: '#fbbf24',
    secondaryColor: '#ffffff',
    crowdReaction: 'cheer_hype',
    crowdShoutText: 'NIKA! NIKA! SHISHISHI!! WOOOOAH!!',
    crowdReactionLabel: 'STADIUM HYPED ROAR & CHANTS',
    visualProp: '✨',
    badge: 'SUN GOD JOY',
    focusDrain: 35,
    meterGain: 45,
    crowdExcitementBoost: 25,
  },
  {
    id: 'luffy_meat_feast',
    fighterId: 'luffy',
    name: 'Pirate King Meat Feast',
    nameJP: '海賊王の巨大骨付き肉喰らい',
    category: 'humorous',
    quoteEN: "MEAT!! Now I have infinite power to knock you out!",
    quoteJP: '肉ゥゥ！これで力100倍だぞ！',
    quotePT: 'CARNEEE! Agora tenho 100x mais poder pra te derrubar!',
    motion: 'bounce_joy',
    primaryColor: '#ef4444',
    secondaryColor: '#f59e0b',
    crowdReaction: 'laughter_amused',
    crowdShoutText: 'HE IS EATING A GIANT CHUCK OF MEAT MID-BATTLE?!',
    crowdReactionLabel: 'SPECTATOR AMUSED LAUGHTER',
    visualProp: '🍖',
    badge: 'MEAT LOVER',
    focusDrain: 30,
    meterGain: 50,
    crowdExcitementBoost: 20,
  },
  {
    id: 'luffy_king_declaration',
    fighterId: 'luffy',
    name: 'Pirate King Declaration',
    nameJP: '海賊王への宣言',
    category: 'legendary',
    quoteEN: "I am Monkey D. Luffy! The man who will become King of the Pirates!",
    quoteJP: '海賊王に、俺はなる！！！',
    quotePT: 'Eu sou Monkey D. Luffy! O homem que será o Rei dos Piratas!',
    motion: 'haki_flare',
    primaryColor: '#dc2626',
    secondaryColor: '#fbbf24',
    crowdReaction: 'chants_stadium',
    crowdShoutText: 'MUGIWARA!! MUGIWARA!! KAISOKU-O!!',
    crowdReactionLabel: 'COLOSSAL STADIUM NAME CHANT',
    visualProp: '👒',
    badge: 'FUTURE KING',
    focusDrain: 40,
    meterGain: 55,
    crowdExcitementBoost: 30,
  },

  // ==========================================
  // RORONOA ZORO (KING OF HELL)
  // ==========================================
  {
    id: 'zoro_bandana_tighten',
    fighterId: 'zoro_king_of_hell',
    name: 'King of Hell Bandana Tighten',
    nameJP: '閻王三刀流・覚悟の黒鉢巻き',
    category: 'signature',
    quoteEN: "I promised my captain and my best friend... I'll never lose again!",
    quoteJP: '二度と敗けねェから！閻王となってやる！',
    quotePT: 'Prometi ao meu capitão e ao meu melhor amigo... Nunca mais vou perder!',
    motion: 'sheath_stance',
    primaryColor: '#22c55e',
    secondaryColor: '#15803d',
    crowdReaction: 'cheer_hype',
    crowdShoutText: 'THE PIRATE HUNTER TIED HIS BANDANA!! HE IS SERIOUS!!',
    crowdReactionLabel: 'FEROCIOUS CROWD OVATION',
    visualProp: '🗡️',
    badge: 'KING OF HELL',
    focusDrain: 40,
    meterGain: 45,
    crowdExcitementBoost: 26,
  },
  {
    id: 'zoro_lost_smirk',
    fighterId: 'zoro_king_of_hell',
    name: 'Directionless Swagger & Scowl',
    nameJP: '方向音痴の不敵な嘲笑',
    category: 'humorous',
    quoteEN: "Hey... did you move the arena, or did you just get in my way?",
    quoteJP: 'おい…リングが勝手に回ったのか？邪魔だ、斬るぞ。',
    quotePT: 'Ei... a arena se moveu sozinha ou você só entrou no meu caminho?',
    motion: 'sheath_stance',
    primaryColor: '#10b981',
    secondaryColor: '#f59e0b',
    crowdReaction: 'laughter_amused',
    crowdShoutText: 'ZORO IS FACING THE WRONG DIRECTION AGAIN!!',
    crowdReactionLabel: 'ARENA CHUCKLES & CATCALLS',
    visualProp: '🧭',
    badge: 'LOST BLADESMAN',
    focusDrain: 30,
    meterGain: 40,
    crowdExcitementBoost: 18,
  },

  // ==========================================
  // VINSMOKE SANJI (BLACK LEG)
  // ==========================================
  {
    id: 'sanji_cigarette_spark',
    fighterId: 'sanji_vinsmoke',
    name: 'Diable Jambe Cigarette Spark',
    nameJP: '悪魔風脚の一服と点火',
    category: 'signature',
    quoteEN: "Thanks... I needed a light.",
    quoteJP: '…タバコの火ィ、欲しかったところだ。',
    quotePT: 'Obrigado... eu estava precisando de um fogo.',
    motion: 'cigar_flame',
    primaryColor: '#f97316',
    secondaryColor: '#3b82f6',
    crowdReaction: 'cheer_hype',
    crowdShoutText: 'BLACK LEG SANJI! THAT CIGARETTE LIGHT WAS PURE COLD STYLE!',
    crowdReactionLabel: 'THUNDEROUS APPLAUSE & CHEERS',
    visualProp: '🚬',
    badge: 'DIABLE CHEF',
    focusDrain: 35,
    meterGain: 45,
    crowdExcitementBoost: 22,
  },
  {
    id: 'sanji_mellorine_spin',
    fighterId: 'sanji_vinsmoke',
    name: 'Mellorine Love Tornado',
    nameJP: '愛の旋風メロリンステップ',
    category: 'humorous',
    quoteEN: "A true gentleman fights with culinary precision and flaming chivalry!",
    quoteJP: 'レディの笑顔のためなら地獄の業火も愛の炎よ！',
    quotePT: 'Um verdadeiro cavalheiro luta com precisão culinária e paixão ardente!',
    motion: 'cigar_flame',
    primaryColor: '#ec4899',
    secondaryColor: '#f43f5e',
    crowdReaction: 'whistle_boos',
    crowdShoutText: 'SIMP CHEF!! LADY KILLER CATCALLS & WHISTLES!!',
    crowdReactionLabel: 'SPECTATOR WHISTLES & CATCALLS',
    visualProp: '💖',
    badge: 'PASSIONATE FLAME',
    focusDrain: 30,
    meterGain: 50,
    crowdExcitementBoost: 20,
  },

  // ==========================================
  // "RED HAIR" SHANKS (EMPEROR)
  // ==========================================
  {
    id: 'shanks_conqueror_smirk',
    fighterId: 'shanks_yonko',
    name: "Emperor's Crimson Conqueror Smirk",
    nameJP: '赤髪の覇気・不敵なる微笑み',
    category: 'legendary',
    quoteEN: "I came to put an end to this foolish war. Still want to dance?",
    quoteJP: 'この戦争を終わらせに来た。…まだ暴れ足りねェ奴はいるか？',
    quotePT: 'Vim para pôr um fim a esta guerra tola. Ainda quer dançar?',
    motion: 'haki_flare',
    primaryColor: '#dc2626',
    secondaryColor: '#7f1d1d',
    crowdReaction: 'gasp_shock',
    crowdShoutText: 'SHADOW OF THE RED HAIR EMPEROR!! HIS CONQUEROR HAKI IS CRACKING THE SKY!!',
    crowdReactionLabel: 'STUNNED GASP & COLLECTIVE AWE',
    visualProp: '⚡',
    badge: 'RED EMPEROR',
    focusDrain: 45,
    meterGain: 55,
    crowdExcitementBoost: 30,
  },
  {
    id: 'shanks_sake_toast',
    fighterId: 'shanks_yonko',
    name: 'One-Armed Pirate Sake Toast',
    nameJP: '大海賊の酒盛り杯',
    category: 'signature',
    quoteEN: "Pour a drink! The new era is already upon us.",
    quoteJP: '西の海の酒を飲め！新しい時代に賭けてきたんだ。',
    quotePT: 'Sirva uma bebida! A nova era já começou.',
    motion: 'haki_flare',
    primaryColor: '#b91c1c',
    secondaryColor: '#fbbf24',
    crowdReaction: 'cheer_hype',
    crowdShoutText: 'AKAGAMI NO SHANKS!! TOAST TO THE NEW ERA!!',
    crowdReactionLabel: 'ROARING STADIUM APPLAUSE',
    visualProp: '🍶',
    badge: 'NEW ERA BETTOR',
    focusDrain: 35,
    meterGain: 45,
    crowdExcitementBoost: 24,
  },

  // ==========================================
  // KAIDO OF THE BEASTS (STRONGEST CREATURE)
  // ==========================================
  {
    id: 'kaido_sake_roar',
    fighterId: 'kaido_beast',
    name: 'Drunken Dragon King Gourd Swig',
    nameJP: '酒龍八卦・大瓢箪の一気呑み',
    category: 'signature',
    quoteEN: "WORORORO!! You dare challenge the Strongest Creature alive?!",
    quoteJP: 'ウォロロロ！俺とタイマン張ろうってのかァ？！身の程を知れ！',
    quotePT: 'WORORORO!! Você ousa desafiar a Criatura Mais Forte do mundo?!',
    motion: 'sake_gourd',
    primaryColor: '#854d0e',
    secondaryColor: '#3b82f6',
    crowdReaction: 'gasp_shock',
    crowdShoutText: 'THE EMPEROR IS CHUGGING SAKE MID-COMBAT!! RUN FOR YOUR LIVES!!',
    crowdReactionLabel: 'TERRIFIED AUDIENCE GASP',
    visualProp: '🍶',
    badge: 'STRONGEST BEAST',
    focusDrain: 45,
    meterGain: 50,
    crowdExcitementBoost: 28,
  },
  {
    id: 'kaido_worororo_contempt',
    fighterId: 'kaido_beast',
    name: 'Emperor Contempt Worororo',
    nameJP: '四皇の咆哮・ウォロロロ！',
    category: 'provocation',
    quoteEN: "Only Haki transcends all! Your tricks mean nothing to me!",
    quoteJP: '覇気だけが全てを凌駕する！貴様の小細工など砕いてくれるわ！',
    quotePT: 'Apenas o Haki transcende tudo! Seus truques não significam nada para mim!',
    motion: 'sake_gourd',
    primaryColor: '#1e3a8a',
    secondaryColor: '#dc2626',
    crowdReaction: 'chants_stadium',
    crowdShoutText: 'WORORORO!! KAIDO!! WORORORO!!',
    crowdReactionLabel: 'EARTH-SHAKING CROWD RUMBLE',
    visualProp: '🐉',
    badge: 'DRAGON SOVEREIGN',
    focusDrain: 40,
    meterGain: 55,
    crowdExcitementBoost: 26,
  },

  // ==========================================
  // EDWARD NEWGATE (WHITEBEARD)
  // ==========================================
  {
    id: 'whitebeard_earthquake_grin',
    fighterId: 'whitebeard_legend',
    name: 'Gura Gura Seismic Fist Flex',
    nameJP: 'グラグラの力・天を割る大拳',
    category: 'legendary',
    quoteEN: "Gurara! Brat... you think you can stand against the Whitebeard?!",
    quoteJP: 'グララララ！小僧…俺の前に立つには百年早ェ！',
    quotePT: 'Gurara! Moleque... acha que pode enfrentar o Barba Branca?!',
    motion: 'tremor_ground',
    primaryColor: '#0284c7',
    secondaryColor: '#facc15',
    crowdReaction: 'gasp_shock',
    crowdShoutText: 'THE AIR ITSELF IS CRACKING!! OYAJI IS SHAKING THE CONTINENTS!!',
    crowdReactionLabel: 'BREATHTAKING SEISMIC GASP',
    visualProp: '💥',
    badge: 'MAN OF EARTHQUAKES',
    focusDrain: 45,
    meterGain: 55,
    crowdExcitementBoost: 30,
  },
  {
    id: 'whitebeard_gurara_laugh',
    fighterId: 'whitebeard_legend',
    name: 'Pops Family Battle Cry',
    nameJP: '大海賊エドワード・ニューゲートの誇り',
    category: 'signature',
    quoteEN: "I have no regrets in my life! The sea belongs to my sons!",
    quoteJP: '俺の誇り高き息子たちに手を出すなァ！',
    quotePT: 'Não tenho arrependimentos na minha vida! O mar pertence aos meus filhos!',
    motion: 'tremor_ground',
    primaryColor: '#0369a1',
    secondaryColor: '#ffffff',
    crowdReaction: 'chants_stadium',
    crowdShoutText: 'OYAJI!! OYAJI!! SHIROHIGE!! WOOOOAH!!',
    crowdReactionLabel: 'THUNDEROUS BLEACHER CHANT',
    visualProp: '🌊',
    badge: 'GREAT PIRATE POPS',
    focusDrain: 40,
    meterGain: 50,
    crowdExcitementBoost: 28,
  },

  // ==========================================
  // MARSHALL D. TEACH (BLACKBEARD)
  // ==========================================
  {
    id: 'blackbeard_zehahaha_vortex',
    fighterId: 'blackbeard_teach',
    name: 'Dark Hole Gravitational Vortex Laugh',
    nameJP: '闇穴道・ゼハハハ狂気の哄笑',
    category: 'disrespect',
    quoteEN: "ZEHAHAHA! Darkness swallows everything! Your powers are useless against me!",
    quoteJP: 'ゼハハハハ！闇は全てを引きずり込む！貴様に逃げ場はねェ！',
    quotePT: 'ZEHAHAHA! A escuridão engole tudo! Seus poderes são inúteis contra mim!',
    motion: 'dark_vortex',
    primaryColor: '#581c87',
    secondaryColor: '#09090b',
    crowdReaction: 'whistle_boos',
    crowdShoutText: 'BOOOOOO!! YOU DIRTY TRAITOR BLACKBEARD!! BOOOOO!!',
    crowdReactionLabel: 'RESOUNDING STADIUM BOOS & WHISTLES',
    visualProp: '🌑',
    badge: 'DARK GRAVITY',
    focusDrain: 45,
    meterGain: 50,
    crowdExcitementBoost: 26,
  },
  {
    id: 'blackbeard_cherry_pie',
    fighterId: 'blackbeard_teach',
    name: 'Endless Dreams & Cherry Pie',
    nameJP: '人の夢は終わらねェ！チェリーパイ',
    category: 'provocation',
    quoteEN: "A man's dream will never die! Am I right?! ZEHAHAHA!",
    quoteJP: '人の夢は！！！終わらねェ！！！！そうだろォ？！',
    quotePT: 'O sonho de um homem nunca vai morrer! Não é verdade?! ZEHAHAHA!',
    motion: 'dark_vortex',
    primaryColor: '#9333ea',
    secondaryColor: '#b45309',
    crowdReaction: 'gasp_shock',
    crowdShoutText: 'A MAN\'S DREAM NEVER DIES!! ZEHAHAHA!!',
    crowdReactionLabel: 'CHILLED AWE & SPECTATOR MURMUR',
    visualProp: '🥧',
    badge: 'ETERNAL DREAMER',
    focusDrain: 35,
    meterGain: 45,
    crowdExcitementBoost: 22,
  },

  // ==========================================
  // TRAFALGAR D. WATER LAW (SURGEON OF DEATH)
  // ==========================================
  {
    id: 'law_shambles_snap',
    fighterId: 'law_trafalgar',
    name: 'Room Shambles Finger Snap',
    nameJP: '死の外科医のROOM展開と指鳴らし',
    category: 'signature',
    quoteEN: "ROOM. The weak do not get to decide anything, not even how they die.",
    quoteJP: 'ROOM。弱ぇ奴は死に方も選べねェ。',
    quotePT: 'ROOM. Os fracos não decidem nada, nem mesmo como morrem.',
    motion: 'room_snap',
    primaryColor: '#06b6d4',
    secondaryColor: '#0891b2',
    crowdReaction: 'cheer_hype',
    crowdShoutText: 'ROOM!! SURGEON OF DEATH SNAP!! HE COMMANDS THE ENTIRE ARENA!!',
    crowdReactionLabel: 'ECSTATIC ARENA APPLAUSE',
    visualProp: '💠',
    badge: 'SURGEON OF DEATH',
    focusDrain: 40,
    meterGain: 50,
    crowdExcitementBoost: 25,
  },
  {
    id: 'law_kikoku_rest',
    fighterId: 'law_trafalgar',
    name: 'Kikoku Blade Shoulder Slant',
    nameJP: '妖刀・鬼哭を担ぐ冷徹な眼光',
    category: 'provocation',
    quoteEN: "I hate bread, and I hate noisy pests like you. Disappear.",
    quoteJP: 'パンも貴様のようなうるせェ奴も大嫌いだ。消えろ。',
    quotePT: 'Odeio pão e odeio pragas barulhentas como você. Desapareça.',
    motion: 'room_snap',
    primaryColor: '#0284c7',
    secondaryColor: '#e11d48',
    crowdReaction: 'gasp_shock',
    crowdShoutText: 'TRAFALGAR LAW COLD DISRESPECT!! CHILLS!!',
    crowdReactionLabel: 'SPECTATOR GASP & SHOCK',
    visualProp: '⚡',
    badge: 'COLD TACTICIAN',
    focusDrain: 35,
    meterGain: 45,
    crowdExcitementBoost: 20,
  },

  // ==========================================
  // CHARLOTTE KATAKURI (BIG MOM PIRATES)
  // ==========================================
  {
    id: 'katakuri_donut_glint',
    fighterId: 'katakuri_charlotte',
    name: 'Peerless Doughnut & Future Sight Glint',
    nameJP: '無敗のドーナツタイムと未来予知の赤光',
    category: 'signature',
    quoteEN: "Delicious doughnuts... Ah, you saw that? Then you cannot leave alive.",
    quoteJP: 'うましドーナツ…見たな？ならば生かしてはおけん。',
    quotePT: 'Deliciosos donuts... Ah, você viu isso? Então não pode sair vivo.',
    motion: 'donut_snack',
    primaryColor: '#ec4899',
    secondaryColor: '#ef4444',
    crowdReaction: 'gasp_shock',
    crowdShoutText: 'DID KATAKURI JUST EAT A DOUGHNUT IN 5 SECONDS?! HIS EYES ARE GLOWING RED!!',
    crowdReactionLabel: 'INTENSE SHOCKED ARENA GASP',
    visualProp: '🍩',
    badge: 'FUTURE SIGHT',
    focusDrain: 45,
    meterGain: 50,
    crowdExcitementBoost: 28,
  },
  {
    id: 'katakuri_unbeaten_wall',
    fighterId: 'katakuri_charlotte',
    name: 'Unbeaten Man Pride Arms Crossed',
    nameJP: '背中を地に着けぬ男の誇り',
    category: 'legendary',
    quoteEN: "My back has never touched the ground. And you won't be the one to do it.",
    quoteJP: '俺の背中は一度たりとも地についたことはない。貴様如きにな。',
    quotePT: 'Minhas costas nunca tocaram o chão. E não será você quem fará isso.',
    motion: 'donut_snack',
    primaryColor: '#be185d',
    secondaryColor: '#475569',
    crowdReaction: 'chants_stadium',
    crowdShoutText: 'KATAKURI-SAMA!! UNBEATEN HERO OF WHOLE CAKE!!',
    crowdReactionLabel: 'SYNCHRONIZED STADIUM CHANT',
    visualProp: '🔱',
    badge: 'UNBEATEN WALL',
    focusDrain: 40,
    meterGain: 45,
    crowdExcitementBoost: 24,
  },

  // ==========================================
  // DONQUIXOTE DOFLAMINGO (HEAVENLY DEMON)
  // ==========================================
  {
    id: 'doflamingo_string_puppet',
    fighterId: 'doflamingo_joker',
    name: 'Parasite Puppet Master Twitch',
    nameJP: '寄生糸（パラサイト）・天夜叉の操り人形',
    category: 'disrespect',
    quoteEN: "FUFFUFFU! Dance for me like the obedient puppet you are!",
    quoteJP: 'フッフッフッフッ！踊れ！俺の手のひらの上でなァ！',
    quotePT: 'FUFFUFFU! Dance para mim como o fantoche obediente que você é!',
    motion: 'puppet_dance',
    primaryColor: '#d946ef',
    secondaryColor: '#f43f5e',
    crowdReaction: 'whistle_boos',
    crowdShoutText: 'BOOOOO!! HEAVENLY DEMON DOFLAMINGO!! CUT THOSE STRINGS!!',
    crowdReactionLabel: 'FRENZIED JEERING BOOS & WHISTLES',
    visualProp: '🪆',
    badge: 'PUPPET MASTER',
    focusDrain: 45,
    meterGain: 45,
    crowdExcitementBoost: 26,
  },
  {
    id: 'doflamingo_fuffuffu_laugh',
    fighterId: 'doflamingo_joker',
    name: 'Justice Belongs To The Winner',
    nameJP: '勝者だけが正義だ！高笑い',
    category: 'signature',
    quoteEN: "Pirates are evil? Marines are righteous? Whoever wins becomes justice!",
    quoteJP: '海賊が悪？！海軍が正義？！勝者だけが正義だ！！！',
    quotePT: 'Piratas são maus? Marinheiros são justos? Quem vencer se torna a justiça!',
    motion: 'puppet_dance',
    primaryColor: '#ec4899',
    secondaryColor: '#facc15',
    crowdReaction: 'cheer_hype',
    crowdShoutText: 'JUSTICE BELONGS TO THE WINNER!! FUFFUFFUFFU!!',
    crowdReactionLabel: 'STADIUM HYPED ROAR',
    visualProp: '🕶️',
    badge: 'JOKER OF DRESSROSA',
    focusDrain: 35,
    meterGain: 50,
    crowdExcitementBoost: 24,
  },

  // ==========================================
  // DRACULE MIHAWK (HAWK EYES)
  // ==========================================
  {
    id: 'mihawk_golden_hawk_glare',
    fighterId: 'mihawk_dracule',
    name: 'World Strongest Golden Hawk Glare',
    nameJP: '世界最強の剣士・鷹の眼の静寂',
    category: 'legendary',
    quoteEN: "It has been far too long since anyone gave me a reason to draw my blade.",
    quoteJP: '退屈を紛らわせるだけの気骨はあるのか？',
    quotePT: 'Faz muito tempo desde que alguém me deu um motivo para desembainhar minha lâmina.',
    motion: 'hawk_glance',
    primaryColor: '#eab308',
    secondaryColor: '#172554',
    crowdReaction: 'gasp_shock',
    crowdShoutText: 'HAWK EYES!! THOSE GOLDEN EYES CAN PIERCE SOULS!!',
    crowdReactionLabel: 'CHILLED SILENT GASP',
    visualProp: '🦅',
    badge: 'WORLD STRONGEST SWORD',
    focusDrain: 45,
    meterGain: 50,
    crowdExcitementBoost: 27,
  },
  {
    id: 'mihawk_pocket_knife',
    fighterId: 'mihawk_dracule',
    name: 'Small Cross Dagger Contempt',
    nameJP: '小刀十字架の洗礼',
    category: 'disrespect',
    quoteEN: "I am not the kind of beast who uses a cannon to hunt a rabbit.",
    quoteJP: 'あいにくウサギを狩るのに大砲を使うような野蛮な真似はせん。',
    quotePT: 'Não sou o tipo de fera que usa um canhão para caçar um coelho.',
    motion: 'hawk_glance',
    primaryColor: '#ca8a04',
    secondaryColor: '#78716c',
    crowdReaction: 'laughter_amused',
    crowdShoutText: 'HE IS THREATENING HIM WITH A POCKET KNIFE PENDANT!! INSANE DISRESPECT!!',
    crowdReactionLabel: 'SPECTATOR CHUCKLES & ROARS',
    visualProp: '🗡️',
    badge: 'SUPREME DISRESPECT',
    focusDrain: 40,
    meterGain: 45,
    crowdExcitementBoost: 25,
  },

  // ==========================================
  // SIR CROCODILE (DESERT KING)
  // ==========================================
  {
    id: 'crocodile_desert_cigar',
    fighterId: 'crocodile_sir',
    name: 'Desert Sables Golden Hook & Cigar',
    nameJP: '砂漠の王・黄金の鉤爪と葉巻',
    category: 'signature',
    quoteEN: "Kuahaha... Dogs who bark the loudest are always the first to dry up in my desert.",
    quoteJP: 'クハハハ…威勢のいい野良犬ほど、砂漠では早く干涸らびるもんだ。',
    quotePT: 'Kuahaha... Cães que latem mais alto são sempre os primeiros a secar no meu deserto.',
    motion: 'sand_whirl',
    primaryColor: '#d97706',
    secondaryColor: '#78350f',
    crowdReaction: 'whistle_boos',
    crowdShoutText: 'CROCODILE!! COLD-BLOODED DESERT TYRANT!!',
    crowdReactionLabel: 'JEERING BLEACHER WHISTLES',
    visualProp: '🐊',
    badge: 'DESERT KING',
    focusDrain: 40,
    meterGain: 45,
    crowdExcitementBoost: 22,
  },

  // ==========================================
  // PORTGAS D. ACE (FIRE FIST)
  // ==========================================
  {
    id: 'ace_fire_salute',
    fighterId: 'ace_portgas',
    name: 'Spade Hat Brim Flame Salute',
    nameJP: '火拳のエース・指先点火の敬礼',
    category: 'signature',
    quoteEN: "Once I take on a fight, I never turn my back and run!",
    quoteJP: '一度受けて立った勝負から、俺は絶対に逃げねェ！',
    quotePT: 'Assim que aceito uma luta, nunca viro as costas e fujo!',
    motion: 'fire_fingers',
    primaryColor: '#ea580c',
    secondaryColor: '#f97316',
    crowdReaction: 'cheer_hype',
    crowdShoutText: 'FIRE FIST ACE!! BLAZING NOBLE WARRIOR!! WOOOAH!!',
    crowdReactionLabel: 'BLAZING STADIUM OVATION',
    visualProp: '🔥',
    badge: 'FIRE FIST',
    focusDrain: 35,
    meterGain: 50,
    crowdExcitementBoost: 26,
  },

  // ==========================================
  // JINBE (FIRST SON OF THE SEA)
  // ==========================================
  {
    id: 'jinbe_gyojin_bow',
    fighterId: 'jinbe_knight',
    name: 'Knight of the Sea Formal Bow',
    nameJP: '海侠のジンベエ・魚人空手礼節の構え',
    category: 'signature',
    quoteEN: "What good is honor if it costs your life? Still, a warrior's resolve never wavers!",
    quoteJP: '我が命、我が信じる船長に捧げた身！退く理由などない！',
    quotePT: 'De que serve a honra se custa sua vida? Ainda assim, a determinação de um guerreiro nunca vacila!',
    motion: 'water_focus',
    primaryColor: '#0284c7',
    secondaryColor: '#0369a1',
    crowdReaction: 'cheer_hype',
    crowdShoutText: 'KNIGHT OF THE SEA JINBE!! HONORABLE GYÖJIN WARRIOR!!',
    crowdReactionLabel: 'RESPECTFUL STADIUM CHEER',
    visualProp: '🥋',
    badge: 'KNIGHT OF SEA',
    focusDrain: 30,
    meterGain: 45,
    crowdExcitementBoost: 20,
  },

  // ==========================================
  // GOD ENEL (THUNDER GOD)
  // ==========================================
  {
    id: 'enel_god_laugh',
    fighterId: 'enel_god',
    name: "Yahahaha! God's Earlobe Thunder Jolt",
    nameJP: 'ヤハハハ！雷神エネルの神罰予告',
    category: 'disrespect',
    quoteEN: "YAHAHAHA! Humans do not fight gods... gods simply pass judgment!",
    quoteJP: 'ヤハハハハ！人は神に勝てん…神はただ恐怖を与えるのみ！',
    quotePT: 'YAHAHAHA! Humanos não lutam contra deuses... deuses simplesmente julgam!',
    motion: 'god_throne',
    primaryColor: '#facc15',
    secondaryColor: '#eab308',
    crowdReaction: 'gasp_shock',
    crowdShoutText: 'YAHAHAHA!! 200 MILLION VOLTS ARE CHARGING UP!! HIDE!!',
    crowdReactionLabel: 'TERRIFIED AUDIENCE GASP',
    visualProp: '⚡',
    badge: 'THUNDER DEITY',
    focusDrain: 45,
    meterGain: 55,
    crowdExcitementBoost: 27,
  },

  // ==========================================
  // MONKEY D. GARP (HERO OF THE MARINES)
  // ==========================================
  {
    id: 'garp_iron_cracker',
    fighterId: 'garp_legend',
    name: 'Fist of Love Rice Cracker Crunch',
    nameJP: '海軍の英雄・愛の拳骨と煎餅喰らい',
    category: 'humorous',
    quoteEN: "BWAHAHAHA! Sleepy already, brat?! Let Grandpa wake you up with love!",
    quoteJP: 'ぶわっはっはっは！もうバテたか小僧！愛ある拳骨を喰らわしてやる！',
    quotePT: 'BWAHAHAHA! Já está cansado, moleque?! Vovô vai te acordar com amor!',
    motion: 'fist_crack',
    primaryColor: '#3b82f6',
    secondaryColor: '#f59e0b',
    crowdReaction: 'laughter_amused',
    crowdShoutText: 'HERO OF THE MARINES IS CRUNCHING SENBEI CRACKERS MID-FIGHT!!',
    crowdReactionLabel: 'ROARING STADIUM CHUCKLES',
    visualProp: '🍘',
    badge: 'FIST OF LOVE',
    focusDrain: 35,
    meterGain: 45,
    crowdExcitementBoost: 24,
  },

  // ==========================================
  // FLEET ADMIRAL SAKAZUKI (AKAINU)
  // ==========================================
  {
    id: 'akainu_absolute_scowl',
    fighterId: 'akainu_sakazuki',
    name: 'Absolute Justice Magma Fume Scowl',
    nameJP: '徹底的な正義・灼熱の怒号',
    category: 'provocation',
    quoteEN: "Evil will be completely eradicated! Even a single drop of malice is treason!",
    quoteJP: '悪を根絶やしにする！一片の容赦もせん！徹底的な正義だ！',
    quotePT: 'O mal será completamente erradicado! Nem uma única gota de malícia é tolerada!',
    motion: 'magma_fume',
    primaryColor: '#b91c1c',
    secondaryColor: '#7f1d1d',
    crowdReaction: 'whistle_boos',
    crowdShoutText: 'FLEET ADMIRAL SAKAZUKI!! MERCILESS MAGMA TYRANT!!',
    crowdReactionLabel: 'HARSH STADIUM WHISTLES & BOOS',
    visualProp: '🌋',
    badge: 'ABSOLUTE JUSTICE',
    focusDrain: 45,
    meterGain: 50,
    crowdExcitementBoost: 26,
  },

  // ==========================================
  // BUGGY THE STAR CLOWN (GENIUS JESTER)
  // ==========================================
  {
    id: 'buggy_flashy_nose',
    fighterId: 'buggy_emperor',
    name: 'Flashy Bara Bara Red Nose Dance',
    nameJP: '千両道化バギー・ド派手な赤鼻ステップ',
    category: 'humorous',
    quoteEN: "WHO ARE YOU CALLING BIG RED NOSE?! I'll blow you to smithereens with a Flashy Special Muggy Ball!",
    quoteJP: '誰が赤くてド派手な団子っ鼻だァァ？！特製マギー玉で吹っ飛ばすぞ！',
    quotePT: 'QUEM VOCÊ TÁ CHAMANDO DE NARIZÃO VERMELHO?! Vou te explodir com a Muggy Ball!',
    motion: 'flashy_split',
    primaryColor: '#ef4444',
    secondaryColor: '#3b82f6',
    crowdReaction: 'laughter_amused',
    crowdShoutText: 'BUGGY-SAMA!! THE GENIUS JESTER EMPEROR!! FLASHY!!',
    crowdReactionLabel: 'HILARIOUS ARENA ROAR & CHANTS',
    visualProp: '🤡',
    badge: 'GENIUS JESTER',
    focusDrain: 30,
    meterGain: 55,
    crowdExcitementBoost: 28,
  },

  // ==========================================
  // GOL D. ROGER (KING OF THE PIRATES)
  // ==========================================
  {
    id: 'roger_pirate_king_laugh',
    fighterId: 'roger_pirate_king',
    name: 'Divine King of the Pirates Laugh',
    nameJP: '海賊王ゴール・D・ロジャーの豪笑',
    category: 'legendary',
    quoteEN: "Wahahaha! A magnificent clash! Let's party until dawn after this!",
    quoteJP: 'わはははは！見事な勝負だ！終わったら宴にしようぜ！',
    quotePT: 'Wahahaha! Um combate magnífico! Vamos festejar até o amanhecer!',
    motion: 'haki_flare',
    primaryColor: '#e11d48',
    secondaryColor: '#fbbf24',
    crowdReaction: 'chants_stadium',
    crowdShoutText: 'GOL D. ROGER!! THE GREATEST PIRATE IN HISTORY!! WOOOOAH!!',
    crowdReactionLabel: 'LEGENDARY STADIUM OVATION',
    visualProp: '👑',
    badge: 'KING OF PIRATES',
    focusDrain: 50,
    meterGain: 60,
    crowdExcitementBoost: 30,
  },

  // ==========================================
  // UNIVERSAL & CUSTOM FIGHTER TAUNTS
  // ==========================================
  {
    id: 'custom_combat_provocation',
    fighterId: '*',
    name: 'Combat Swagger & Finger Wag',
    nameJP: '戦闘挑発・手招きの構え',
    category: 'provocation',
    quoteEN: "Come on! Show me what you've got before this fight is over!",
    quoteJP: 'かかってこい！貴様の全力はその程度か？！',
    quotePT: 'Venha! Me mostre o que você tem antes que esta luta termine!',
    motion: 'generic_flex',
    primaryColor: '#f59e0b',
    secondaryColor: '#dc2626',
    crowdReaction: 'cheer_hype',
    crowdShoutText: 'WHAT A PROVOCATION!! THE FIGHTER IS WAVING THEM OVER!!',
    crowdReactionLabel: 'ROARING COMBAT CHEER',
    visualProp: '👊',
    badge: 'COMBAT SWAGGER',
    focusDrain: 30,
    meterGain: 40,
    crowdExcitementBoost: 20,
  },
  {
    id: 'custom_haki_surge',
    fighterId: 'custom',
    name: 'Iron Will Haki Flare',
    nameJP: '不屈の覇気・威圧の一閃',
    category: 'signature',
    quoteEN: "My will cannot be broken! Witness true determination!",
    quoteJP: '我が意志は砕けぬ！本物の覚悟を目に焼き付けろ！',
    quotePT: 'Minha vontade não pode ser quebrada! Testemunhe a verdadeira determinação!',
    motion: 'haki_flare',
    primaryColor: '#a855f7',
    secondaryColor: '#3b82f6',
    crowdReaction: 'gasp_shock',
    crowdShoutText: 'AN ENORMOUS WAVE OF WILLPOWER RADIATES THROUGH THE ARENA!!',
    crowdReactionLabel: 'CHILLED SILENT GASP',
    visualProp: '⚡',
    badge: 'IRON WILL',
    focusDrain: 35,
    meterGain: 45,
    crowdExcitementBoost: 22,
  },
  {
    id: 'custom_mocking_laugh',
    fighterId: '*',
    name: 'Mocking Battle Chuckle',
    nameJP: '余裕の哄笑と首振り',
    category: 'disrespect',
    quoteEN: "Is that really the best you can do? I haven't even broken a sweat!",
    quoteJP: 'その程度か？まだ準備体操すら終わってねェぜ！',
    quotePT: 'Isso é realmente o melhor que você pode fazer? Nem comecei a suar!',
    motion: 'generic_flex',
    primaryColor: '#ec4899',
    secondaryColor: '#f43f5e',
    crowdReaction: 'whistle_boos',
    crowdShoutText: 'THE DISRESPECT!! SPECTATORS ARE HOOTING AND BOOING!!',
    crowdReactionLabel: 'SPECTATOR WHISTLES & BOOS',
    visualProp: '😏',
    badge: 'SHADOW SMIRK',
    focusDrain: 35,
    meterGain: 45,
    crowdExcitementBoost: 20,
  },
];

// Runtime custom taunts storage for user creations
const registeredCustomTaunts: BattleTauntAnimation[] = [];

/**
 * Register a user or modded custom taunt animation into the runtime library
 */
export function registerCustomBattleTaunt(taunt: BattleTauntAnimation) {
  const existingIdx = registeredCustomTaunts.findIndex((t) => t.id === taunt.id);
  if (existingIdx >= 0) {
    registeredCustomTaunts[existingIdx] = taunt;
  } else {
    registeredCustomTaunts.push(taunt);
  }
}

/**
 * Retrieves all taunts that match a fighter (either exact ID, prefix match, or universal)
 */
export function getFighterTaunts(fighterId?: string): BattleTauntAnimation[] {
  if (!fighterId) {
    return BATTLE_TAUNT_LIBRARY.filter((t) => t.fighterId === '*');
  }

  const normalized = fighterId.toLowerCase();
  const all = [...BATTLE_TAUNT_LIBRARY, ...registeredCustomTaunts];

  // 1. Exact match
  const exact = all.filter((t) => t.fighterId.toLowerCase() === normalized);

  // 2. Prefix / character family match (e.g. 'luffy', 'zoro', 'sanji', 'shanks', etc.)
  const familyPrefix = normalized.split('_')[0];
  const familyMatches = all.filter(
    (t) =>
      t.fighterId.toLowerCase().startsWith(familyPrefix) &&
      !exact.some((e) => e.id === t.id)
  );

  // 3. Universals fallback
  const universals = all.filter(
    (t) => t.fighterId === '*' && !exact.some((e) => e.id === t.id) && !familyMatches.some((f) => f.id === t.id)
  );

  return [...exact, ...familyMatches, ...universals];
}

/**
 * Returns the primary/default signature taunt animation for a fighter
 */
export function getDefaultTauntForFighter(
  fighterId?: string,
  fighterName?: string
): BattleTauntAnimation {
  const list = getFighterTaunts(fighterId);
  if (list.length > 0) {
    const signature = list.find((t) => t.category === 'signature') || list[0];
    return signature;
  }

  // Safe fallback
  return BATTLE_TAUNT_LIBRARY[BATTLE_TAUNT_LIBRARY.length - 1];
}

/**
 * Returns the entire expandable library of all available battle taunts
 */
export function getAllBattleTaunts(): BattleTauntAnimation[] {
  return [...BATTLE_TAUNT_LIBRARY, ...registeredCustomTaunts];
}
