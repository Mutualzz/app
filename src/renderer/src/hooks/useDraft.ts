import { useEffect, useMemo, useRef, useState } from "react";

export const useDraft = <T extends Record<string, any>>(
    getInitial: () => T,
    deps: any[],
) => {
    const [base, setBase] = useState<T>(() => getInitial());
    const [draft, setDraft] = useState<T>(() => getInitial());

    const baseRef = useRef(base);
    const draftRef = useRef(draft);

    useEffect(() => {
        baseRef.current = base;
    }, [base]);
    useEffect(() => {
        draftRef.current = draft;
    }, [draft]);

    useEffect(() => {
        const next = getInitial();
        setBase(next);
        setDraft(next);
    }, deps);

    const dirty = useMemo(() => {
        const keys = Object.keys(base) as (keyof T)[];
        return keys.some((k) => base[k] !== draft[k]);
    }, [base, draft]);

    const reset = () => setDraft(base);

    const diffNow = (b: T, d: T) => {
        const out: Partial<T> = {};
        (Object.keys(b) as (keyof T)[]).forEach((k) => {
            if (b[k] !== d[k]) out[k] = d[k];
        });
        return out;
    };

    const diff = () => diffNow(baseRef.current, draftRef.current);

    const commitBase = (nextBase: T) => {
        setBase(nextBase);
        setDraft(nextBase);
    };

    return {
        base,
        draft,
        dirty,
        reset,
        setDraft,
        diff,
        commitBase,
        baseRef,
        draftRef,
    };
};
