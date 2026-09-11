
export interface CombatTip {
  text: string;
  relatedCharacterId?: string;
}

export const COMBAT_TIPS: CombatTip[] = [
  { text: "Luffy's Gear 5 allows him to turn the environment into rubber. Watch out for unpredictable bounces!" },
  { text: "Zoro's Ashura style creates an illusion of nine blades, making his attacks extremely difficult to dodge.", relatedCharacterId: 'zoro_king_of_hell' },
  { text: "Shanks is a master of 'Observation Killer' Haki, which can prevent opponents from seeing the future.", relatedCharacterId: 'shanks_yonko' },
  { text: "Kaido's dragon scales provide immense defense. You'll need high-tier Ryuo to deal significant damage.", relatedCharacterId: 'kaido_beast' },
  { text: "Whitebeard's Gura Gura no Mi can crack the very atmosphere, creating shockwaves that ignore traditional guards.", relatedCharacterId: 'whitebeard_legend' },
  { text: "Blackbeard's darkness can nullify Devil Fruit powers. Keep your distance if you rely on your fruit!", relatedCharacterId: 'blackbeard_teach' },
  { text: "Akainu's magma is so hot it can burn even fire itself. Physical contact is highly dangerous.", relatedCharacterId: 'akainu_sakazuki' },
  { text: "Mihawk's 'Hawk-Eyes' can track even the fastest speedsters. Precision is his greatest weapon.", relatedCharacterId: 'mihawk_dracule' },
  { text: "Kizaru can move at the speed of light. If you can't see him, use Observation Haki to anticipate his kicks.", relatedCharacterId: 'kizaru_borsalino' },
  { text: "Garp doesn't need a Devil Fruit; his 'Fist of Love' is powered by pure, concentrated Haki.", relatedCharacterId: 'garp_legend' },
  { text: "Advanced Conqueror's Haki can be used to coat attacks, allowing for damage without even making physical contact." },
  { text: "The 'Voice of All Things' allows legendary figures like Roger to sense their surroundings beyond normal Haki." },
  { text: "Super Meter builds up as you deal and take damage. Save it for a Combo Finisher when your opponent is low!" },
  { text: "Perfect Dodging restores a small amount of Super Meter and provides a brief opening for a counter-attack." },
  { text: "Marineford's frozen sea can be cracked by heavy impacts, creating hazardous terrain." },
  { text: "Onigashima's rooftop is a battlefield for the strongest. Haki clashes here can split the heavens." },
  { text: "Law's ROOM allows him to manipulate anything within his sphere. Don't let him catch you inside!", relatedCharacterId: 'law_trafalgar' },
  { text: "Katakuri's Future Sight is so advanced he can see seconds into the future. You'll need to overwhelm his focus.", relatedCharacterId: 'katakuri_charlotte' },
  { text: "Big Mom's Soul Pocus can steal the lifespan of those who show even a hint of fear.", relatedCharacterId: 'big_mom_linlin' },
  { text: "Enel's Mantra is an early form of Observation Haki, amplified by his lightning abilities.", relatedCharacterId: 'enel_god' },
  { text: "Buggy may seem weak, but his 'Bara Bara' powers make him immune to all slashing attacks!", relatedCharacterId: 'buggy_emperor' },
  { text: "Law's ROOM allows him to perform 'Amputation' which ignores physical durability.", relatedCharacterId: 'law_trafalgar' },
  { text: "Jinbe's Fish-man Karate uses the water in the opponent's body, making it effective even against Logia users.", relatedCharacterId: 'jinbe_knight' },
  { text: "Doflamingo's 'Birdcage' is a lethal trap. Overwhelm him quickly to force its collapse.", relatedCharacterId: 'doflamingo_joker' },
  { text: "Katakuri's Mochi is extremely sticky. If you get caught, use heat or strong Haki to escape.", relatedCharacterId: 'katakuri_charlotte' },
  { text: "Sanji's Ifrit Jambe combines exoskeleton durability with high-temperature flames for maximum impact.", relatedCharacterId: 'sanji_vinsmoke' },
  { text: "Rob Lucci's Rokuogan is an internal destruction technique. Even the toughest guards can't fully block it.", relatedCharacterId: 'lucci_rob' },
  { text: "Big Mom's 'Ikoku Sovereignty' is a giant shockwave that can split entire islands. Dodge at all costs!", relatedCharacterId: 'big_mom_linlin' },
  { text: "King's Lunarian fire grants him near-invincibility. Wait for the flame on his back to go out before attacking.", relatedCharacterId: 'king_conflagration' },
  { text: "Magellan's poison is so lethal that even touching him can be a death sentence without the right protection.", relatedCharacterId: 'magellan_warden' },
  { text: "Aokiji's 'Ice Age' can freeze the entire ocean. Keep moving to prevent your joints from locking up.", relatedCharacterId: 'aokiji_kuzan' },
  { text: "Oden's dual-sword style is the only one known to have permanently scarred the 'Strongest Creature'.", relatedCharacterId: 'oden_kozuki' },
  { text: "Imu-sama's power is shrouded in mystery, but it seems to control the very shadows of the world.", relatedCharacterId: 'imu_sama' }
];

export const getTipsForCharacters = (fighterIds: string[]): string[] => {
  const specificTips = COMBAT_TIPS.filter(tip => tip.relatedCharacterId && fighterIds.includes(tip.relatedCharacterId));
  const genericTips = COMBAT_TIPS.filter(tip => !tip.relatedCharacterId);
  
  // Combine and shuffle
  const pool = [...specificTips.map(t => t.text), ...genericTips.map(t => t.text)];
  return pool.sort(() => Math.random() - 0.5);
};
