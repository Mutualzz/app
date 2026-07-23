import { PostCommentsPanel } from "@components/Post/PostCommentsPanel";
import { useCloseCommentsOnScrollAway } from "@hooks/useCloseCommentsOnScrollAway";
import { useAppStore } from "@hooks/useStores";
import { Stack } from "@mutualzz/ui-web";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import { observer } from "mobx-react-lite";

interface FeedCommentsContextValue {
  commentsPostId: string | null;
  openComments: (postId: string, ref: HTMLElement | null) => void;
}

const FeedCommentsContext = createContext<FeedCommentsContextValue | null>(null);

export function useFeedComments() {
  const ctx = useContext(FeedCommentsContext);
  if (!ctx) {
    throw new Error("useFeedComments must be used within FeedCommentsLayout");
  }
  return ctx;
}

interface Props extends PropsWithChildren {
  scrollRootId?: string;
  defaultCommentsPostId?: string | null;
  pinComments?: boolean;
}

export const FeedCommentsLayout = observer(
  ({
    children,
    scrollRootId = "post-list-scroll",
    defaultCommentsPostId = null,
    pinComments = false
  }: Props) => {
    const app = useAppStore();
    const [commentsPostId, setCommentsPostId] = useState<string | null>(
      defaultCommentsPostId
    );
    const activePostRef = useRef<HTMLElement | null>(null);

    const commentsPost = commentsPostId
      ? app.posts.get(commentsPostId)
      : undefined;

    useCloseCommentsOnScrollAway(
      activePostRef,
      !!commentsPostId,
      () => setCommentsPostId(null),
      !pinComments,
      scrollRootId
    );

    useEffect(() => {
      setCommentsPostId(defaultCommentsPostId ?? null);
    }, [defaultCommentsPostId]);

    const openComments = (postId: string, ref: HTMLElement | null) => {
      if (commentsPostId === postId) {
        setCommentsPostId(null);
        return;
      }
      activePostRef.current = ref;
      setCommentsPostId(postId);
    };

    return (
      <FeedCommentsContext.Provider
        value={{
          commentsPostId,
          openComments
        }}
      >
        <Stack direction="row" width="100%" height="100%" css={{ minHeight: 0 }}>
          <Stack flex={1} css={{ minWidth: 0, minHeight: 0 }}>
            {children}
          </Stack>
          {commentsPost && (
            <PostCommentsPanel
              post={commentsPost}
              onClose={() => setCommentsPostId(null)}
            />
          )}
        </Stack>
      </FeedCommentsContext.Provider>
    );
  }
);
