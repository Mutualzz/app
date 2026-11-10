const FILTER_STORAGE_KEY = "inbox:mentionFilters";

export interface MentionFilters {
  includeEveryone: boolean;
  includeRoles: boolean;
  allSpaces: boolean;
}

export const DEFAULT_MENTION_FILTERS: MentionFilters = {
  includeEveryone: true,
  includeRoles: true,
  allSpaces: true
};

export const readMentionFilters = (): MentionFilters => {
  try {
    const raw = localStorage.getItem(FILTER_STORAGE_KEY);
    return raw
      ? { ...DEFAULT_MENTION_FILTERS, ...JSON.parse(raw) }
      : DEFAULT_MENTION_FILTERS;
  } catch {
    return DEFAULT_MENTION_FILTERS;
  }
};

export const writeMentionFilters = (filters: MentionFilters) => {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  } catch {
    return;
  }
};

export const isDefaultMentionFilters = (filters: MentionFilters) =>
  filters.includeEveryone === DEFAULT_MENTION_FILTERS.includeEveryone &&
  filters.includeRoles === DEFAULT_MENTION_FILTERS.includeRoles &&
  filters.allSpaces === DEFAULT_MENTION_FILTERS.allSpaces;
