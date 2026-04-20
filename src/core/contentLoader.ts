import type { Card, Industry } from './types';

export interface ContentPack {
  id: string;
  name: string;
  industry: Industry;
  cards: Card[];
}

export interface Manifest {
  packs: { id: string; file: string; enabled: boolean }[];
}

type Fetcher = (url: string) => Promise<unknown>;

export class ContentLoader {
  private allCards: Card[] = [];

  constructor(private fetcher: Fetcher) {}

  async loadAllEnabled(): Promise<Card[]> {
    const manifest = (await this.fetcher('/content/manifest.json')) as Manifest;
    const enabledPacks = manifest.packs.filter(p => p.enabled);
    const cards: Card[] = [];
    for (const entry of enabledPacks) {
      const pack = (await this.fetcher(`/content/${entry.file}`)) as ContentPack;
      cards.push(...pack.cards);
    }
    this.allCards = cards;
    return cards;
  }

  getAllCards(): Card[] { return this.allCards; }

  static getCardPool(cards: Card[], industry: Industry): Card[] {
    return cards.filter(c => c.ind === industry);
  }
}
