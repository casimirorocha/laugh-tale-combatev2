import { MatchResult, UserProfile } from '../types/fighter';

export type GalleryItemType = 'concept_art' | 'lore';

export interface GalleryItem {
  id: string;
  title: string;
  type: GalleryItemType;
  imageUrl?: string;
  content?: string;
  description: string;
  unlockRequirement: string;
  checkUnlock: (result: MatchResult, isUserWinner: boolean, profile: UserProfile) => boolean;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'monster_trio',
    title: 'Monster Trio Concept Art',
    type: 'concept_art',
    imageUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6ce846ce?auto=format&fit=crop&q=80&w=800',
    description: 'Early concept sketches of the iconic Monster Trio.',
    unlockRequirement: 'Win a match with Luffy, Zoro, and Sanji on your team.',
    checkUnlock: (result, isUserWinner) => {
      if (!isUserWinner || !result) return false;
      const team = result.team1?.isWinner ? result.team1 : result.team2;
      const required = ['Monkey D. Luffy', 'Roronoa Zoro', 'Sanji'];
      const fighters = team?.fighters || [];
      return required.every(name => fighters.some(f => (typeof f === 'string' ? f : (f as any)?.name || '').includes(name)));
    }
  },
  {
    id: 'yonko_lore',
    title: 'The Four Emperors - Lore',
    type: 'lore',
    content: 'The Four Emperors, or Yonko, are the four most notorious and powerful pirate captains in the world. They are not allies, nor are they strictly enemies; they simply co-exist, holding massive influence over the New World. Their power is such that the Marines and the Seven Warlords of the Sea were created largely to counterbalance their influence.',
    description: 'Detailed lore entry regarding the Emperor system.',
    unlockRequirement: 'Win a match with Shanks or Kaido.',
    checkUnlock: (result, isUserWinner) => {
      if (!isUserWinner || !result) return false;
      const team = result.team1?.isWinner ? result.team1 : result.team2;
      const fighters = team?.fighters || [];
      return fighters.some(f => {
        const name = typeof f === 'string' ? f : (f as any)?.name || '';
        return name.includes('Shanks') || name.includes('Kaido');
      });
    }
  },
  {
    id: 'worst_generation',
    title: 'Worst Generation Supernovas',
    type: 'concept_art',
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
    description: 'Art featuring the infamous rookie pirates.',
    unlockRequirement: 'Win a match with Law or Kid.',
    checkUnlock: (result, isUserWinner) => {
      if (!isUserWinner || !result) return false;
      const team = result.team1?.isWinner ? result.team1 : result.team2;
      const fighters = team?.fighters || [];
      return fighters.some(f => {
        const name = typeof f === 'string' ? f : (f as any)?.name || '';
        return name.includes('Trafalgar Law') || name.includes('Eustass Kid') || name.includes('Law') || name.includes('Kid');
      });
    }
  },
  {
    id: 'haki_lore',
    title: 'The Mystery of Haki',
    type: 'lore',
    content: 'Haki is a dormant power found in all living creatures in the world. It is not fundamentally different from the normal senses. However, most people do not notice it or fail to awaken it. There are three types of Haki: Observation, Armament, and Conqueror\'s.',
    description: 'A deep dive into the spiritual energy of Haki.',
    unlockRequirement: 'Win 5 matches overall.',
    checkUnlock: (result, isUserWinner, profile) => {
      return (profile?.stats?.matchesWon || 0) >= 5;
    }
  },
  {
    id: 'wano_concept',
    title: 'Wano Country Landscapes',
    type: 'concept_art',
    imageUrl: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=800',
    description: 'Concept art for the beautiful and isolated Wano Country.',
    unlockRequirement: 'Win a match with Kozuki Oden or Yamato.',
    checkUnlock: (result, isUserWinner) => {
      if (!isUserWinner || !result) return false;
      const team = result.team1?.isWinner ? result.team1 : result.team2;
      const fighters = team?.fighters || [];
      return fighters.some(f => {
        const name = typeof f === 'string' ? f : (f as any)?.name || '';
        return name.includes('Kozuki Oden') || name.includes('Yamato') || name.includes('Oden');
      });
    }
  }
];
