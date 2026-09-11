export interface VictoryTaunt {
  id: string;
  text: string;
  textJP: string;
  tone: 'confident' | 'menacing' | 'playful';
}

export const CHARACTER_TAUNTS: Record<string, VictoryTaunt[]> = {
  // Katakuri
  'katakuri': [
    { id: 't1', text: "There is no point in struggling against an awakened future.", textJP: "未来を見据える者に死角はない", tone: 'menacing' },
    { id: 't2', text: "Your speed... is far too slow.", textJP: "お前のスピードは遅すぎる", tone: 'menacing' },
    { id: 't3', text: "A donut sounds wonderful right about now.", textJP: "ドーナツでも食うか", tone: 'playful' }
  ],
  // Luffy
  'luffy': [
    { id: 't1', text: "Shishishi! That was a fantastic match!", textJP: "ししし！すっげェ楽しかったな！", tone: 'playful' },
    { id: 't2', text: "I'm gonna be King of the Pirates!", textJP: "海賊王に俺はなる！", tone: 'confident' },
    { id: 't3', text: "Eaí BOGA!", textJP: "おい、バギー！", tone: 'playful' },
    { id: 't4', text: "BOGGA MELHOR DESISTIR!", textJP: "バギー、諦めた方がいいぞ！", tone: 'playful' }
  ],
  // Buggy
  'buggy': [
    { id: 'b1', text: "Filhote de seringueira!", textJP: "ゴムのガキめ！", tone: 'playful' },
    { id: 'b2', text: "Moleque dorme sujo!", textJP: "不潔なガキめ！", tone: 'playful' },
    { id: 'b3', text: "Borrachudo safado!", textJP: "生意気なゴム野郎！", tone: 'menacing' }
  ],
  'crocodile': [
    { id: 'c1', text: "Deserts don't forgive the weak.", textJP: "砂漠は弱者を許さない", tone: 'menacing' },
    { id: 'c2', text: "Now you're just another pile of sand.", textJP: "お前もただの砂屑だ", tone: 'menacing' }
  ],
  'doflamingo': [
    { id: 'd1', text: "Justice belongs to the winner!", textJP: "勝者こそが正義だ！", tone: 'confident' },
    { id: 'd2', text: "Everything is moving according to my plan.", textJP: "全ては私の計画通りだ", tone: 'confident' }
  ],
  'jinbe': [
    { id: 'j1', text: "Do not underestimate the power of the sea.", textJP: "海の力を侮るな", tone: 'confident' },
    { id: 'j2', text: "This victory is for my captain.", textJP: "この勝利を我が船長に捧ぐ", tone: 'confident' }
  ],
  'ace': [
    { id: 'a1', text: "Did you feel the heat?", textJP: "熱さを感じたか？", tone: 'confident' },
    { id: 'a2', text: "I'll keep blazing my own path!", textJP: "俺は俺の道を進むだけだ！", tone: 'confident' }
  ],
  'sanji': [
    { id: 's1', text: "I won't let any ingredient go to waste.", textJP: "素材の味を活かしてやったぜ", tone: 'playful' },
    { id: 's2', text: "Go back to the kitchen, you're not ready.", textJP: "出直してきな、修行不足だ", tone: 'confident' }
  ],
  'lucci': [
    { id: 'l1', text: "Justice has been served.", textJP: "正義は執行された", tone: 'menacing' },
    { id: 'l2', text: "Mission complete.", textJP: "任務完了だ", tone: 'menacing' }
  ],
  'enel': [
    { id: 'e1', text: "Fear is what keeps humans in line.", textJP: "恐怖こそが人間を律する", tone: 'menacing' },
    { id: 'e2', text: "Behold the power of God!", textJP: "神の力を見るがいい！", tone: 'confident' }
  ],
  'moria': [
    { id: 'm1', text: "Your shadow belongs to me now!", textJP: "お前の影は俺のものだ！", tone: 'menacing' },
    { id: 'm2', text: "Kishishishi! Another soul for my army.", textJP: "キシシシシ！また一人生贄が増えたな", tone: 'playful' }
  ],
  'oden': [
    { id: 'o1', text: "I am Oden! I was born to boil!", textJP: "おでんに候！煮えてなんぼのおでんに候！", tone: 'confident' },
    { id: 'o2', text: "Wano's future is bright!", textJP: "ワノ国の未来は明るいぞ！", tone: 'confident' }
  ],
  'shiki': [
    { id: 'sk1', text: "The sky is my domain.", textJP: "空は俺の領域だ", tone: 'confident' },
    { id: 'sk2', text: "I'll crush you from above!", textJP: "上空から叩き潰してやる！", tone: 'menacing' }
  ],
  'aokiji': [
    { id: 'ak1', text: "Cool down... literally.", textJP: "頭を冷やせ… 文字通りな", tone: 'confident' },
    { id: 'ak2', text: "Arara... that was a bit bothersome.", textJP: "あらら… 少し面倒だったね", tone: 'playful' }
  ],
  // Default fallback for any other character
  'default': [
    { id: 't1', text: "My blade/fists speak louder than words.", textJP: "我が拳のみが真実を語る", tone: 'confident' },
    { id: 't2', text: "Is that truly the limit of your power?", textJP: "お前の実力はその程度か", tone: 'menacing' },
    { id: 't3', text: "A worthy duel. But victory is mine!", textJP: "見事な戦いだったが、勝者は俺だ！", tone: 'confident' }
  ]
};

export function getTauntsForFighter(fighterId: string): VictoryTaunt[] {
  const normalized = fighterId.toLowerCase();
  for (const key of Object.keys(CHARACTER_TAUNTS)) {
    if (normalized.includes(key)) {
      return CHARACTER_TAUNTS[key];
    }
  }
  return CHARACTER_TAUNTS['default'];
}
