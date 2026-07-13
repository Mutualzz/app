export interface GameArgMatcher {
  exe: string;
  includes: string[];
}

export interface GameCatalogEntry {
  id: string;
  name: string;
  exes: string[];
  argMatchers?: GameArgMatcher[];
}

export interface CustomGameCatalogEntry {
  id: string;
  name: string;
  exes: string[];
  createdAt: number;
}
