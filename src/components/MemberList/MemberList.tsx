import { ListSection } from "@components/ListSection";
import { MemberListItem } from "@components/MemberList/MemberListItem";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";

export const MemberList = observer(() => {
    const app = useAppStore();
    const space = app.spaces.active;
    const channel = app.channels.active;

    const store =
        space && channel ? space.memberLists.get(channel.listId) : undefined;
    const list = store?.list ?? null;

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 5 : 0}
            direction="column"
            flex="0 0 240px"
            overflowX="hidden"
            borderTop="0 !important"
            borderRight="0 !important"
            borderBottom="0 !important"
        >
            {list
                ? list.map((category, i) => (
                      <ListSection
                          key={`${category.name}-${i}`}
                          name={category.name}
                          items={category.items.map((m: any) => (
                              <MemberListItem
                                  key={
                                      m.userId ??
                                      m.user?.id ??
                                      `${category.name}-${i}`
                                  }
                                  member={m}
                                  isOwner={
                                      (m.userId ?? m.user?.id) ===
                                      space?.ownerId
                                  }
                              />
                          ))}
                      />
                  ))
                : null}
        </Paper>
    );
});
