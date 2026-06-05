import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "RecentEmojiStore";
const MAX_RECENT = 24;

export type RecentEmojiType = "standard" | "custom";

export interface RecentEmoji {
    type: RecentEmojiType;
    unified?: string;
    skinTone?: string | null;
    id?: string;
    name?: string;
    url?: string;
    animated?: boolean;
}

function loadRecent(): RecentEmoji[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveRecent(recents: RecentEmoji[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recents));
    } catch {}
}

export function useRecentEmojis() {
    const [recents, setRecents] = useState<RecentEmoji[]>(loadRecent);

    useEffect(() => {
        saveRecent(recents);
    }, [recents]);

    const addRecentStandard = useCallback(
        (unified: string, skinTone: string | null = null) => {
            setRecents((prev) => {
                const filtered = prev.filter(
                    (r) =>
                        !(
                            r.type === "standard" &&
                            r.unified === unified &&
                            r.skinTone === skinTone
                        )
                );
                return [
                    { type: "standard" as RecentEmojiType, unified, skinTone },
                    ...filtered
                ].slice(0, MAX_RECENT);
            });
        },
        []
    );

    const addRecentCustom = useCallback(
        (id: string, name: string, url: string, animated: boolean) => {
            setRecents((prev) => {
                const filtered = prev.filter(
                    (r) => !(r.type === "custom" && r.id === id)
                );
                return [
                    {
                        type: "custom" as RecentEmojiType,
                        id,
                        name,
                        url,
                        animated
                    },
                    ...filtered
                ].slice(0, MAX_RECENT);
            });
        },
        []
    );

    return { recents, addRecentStandard, addRecentCustom };
}
