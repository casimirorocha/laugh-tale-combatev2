import { Team } from '../types/fighter';
import { CHARACTERS_MAP } from './characters';

export const PREMADE_TEAMS: Team[] = [
  {
    id: 'team_strawhat',
    name: 'Team Straw Hat Alliance',
    bannerColor: '#ef4444',
    crestEmoji: '👒',
    fighters: [
      CHARACTERS_MAP['zoro_king_of_hell'],
      CHARACTERS_MAP['law_trafalgar'],
      CHARACTERS_MAP['luffy'],
    ],
  },
  {
    id: 'team_yonko',
    name: 'Team Four Emperors (Yonko)',
    bannerColor: '#7c3aed',
    crestEmoji: '👑',
    fighters: [
      CHARACTERS_MAP['blackbeard_teach'],
      CHARACTERS_MAP['kaido_beast'],
      CHARACTERS_MAP['shanks_yonko'],
    ],
  },
  {
    id: 'team_marines',
    name: 'Team Marine Absolute Justice',
    bannerColor: '#1d4ed8',
    crestEmoji: '⚓',
    fighters: [
      CHARACTERS_MAP['kizaru_borsalino'],
      CHARACTERS_MAP['akainu_sakazuki'],
      CHARACTERS_MAP['garp_legend'],
    ],
  },
  {
    id: 'team_legends',
    name: 'Team Old Era Gods',
    bannerColor: '#eab308',
    crestEmoji: '🔱',
    fighters: [
      CHARACTERS_MAP['whitebeard_legend'],
      CHARACTERS_MAP['garp_legend'],
      CHARACTERS_MAP['roger_pirate_king'],
    ],
  },
  {
    id: 'team_cross_guild',
    name: 'Team Cross Guild & Sweet Commanders',
    bannerColor: '#ea580c',
    crestEmoji: '🤡',
    fighters: [
      CHARACTERS_MAP['buggy_emperor'],
      CHARACTERS_MAP['katakuri_charlotte'],
      CHARACTERS_MAP['mihawk_dracule'],
    ],
  },
  {
    id: 'team_swordsmen',
    name: 'Team Supreme Blade Masters',
    bannerColor: '#16a34a',
    crestEmoji: '⚔️',
    fighters: [
      CHARACTERS_MAP['zoro_king_of_hell'],
      CHARACTERS_MAP['shanks_yonko'],
      CHARACTERS_MAP['mihawk_dracule'],
    ],
  },
  {
    id: 'team_warlords',
    name: 'Team Seven Warlords of the Sea',
    bannerColor: '#9333ea',
    crestEmoji: '🐚',
    fighters: [
      CHARACTERS_MAP['crocodile_sir'],
      CHARACTERS_MAP['jinbe_knight'],
      CHARACTERS_MAP['doflamingo_joker'],
    ],
  },
  {
    id: 'team_brothers',
    name: 'Team ASL & Black Leg',
    bannerColor: '#f97316',
    crestEmoji: '🍶',
    fighters: [
      CHARACTERS_MAP['sanji_vinsmoke'],
      CHARACTERS_MAP['ace_portgas'],
      CHARACTERS_MAP['luffy'],
    ],
  },
  {
    id: 'team_world_gov',
    name: 'Team Absolute Enforcers',
    bannerColor: '#475569',
    crestEmoji: '⚖️',
    fighters: [
      CHARACTERS_MAP['lucci_rob'],
      CHARACTERS_MAP['aokiji_kuzan'],
      CHARACTERS_MAP['akainu_sakazuki'],
    ],
  },
  {
    id: 'team_mythic_legends',
    name: 'Team Mythic Conquerors',
    bannerColor: '#f43f5e',
    crestEmoji: '🎆',
    fighters: [
      CHARACTERS_MAP['enel_god'],
      CHARACTERS_MAP['oden_kozuki'],
      CHARACTERS_MAP['shiki_lion'],
    ],
  },
];
