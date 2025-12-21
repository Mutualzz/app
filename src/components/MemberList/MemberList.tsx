import { ListSection } from "@components/ListSection";
import { MemberListItem } from "@components/MemberList/MemberListItem";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { autorun } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

export const MemberList = observer(() => {
    const app = useAppStore();
    const [list, setList] = useState<any[] | null>(null);

    useEffect(() => {
        autorun(() => {
            if (!app.spaces.active || !app.channels.active) {
                setList(null);
                return;
            }

            const memberLists = app.spaces.active.memberLists;
            const store = memberLists.get(app.channels.active.listId);
            setList(store ? store.list : null);
        });
    }, []);

    return (
        <Paper
            elevation={app.preferEmbossed ? 5 : 0}
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
                          key={i}
                          name={category.name}
                          items={category.items.map((x: any) => (
                              <MemberListItem
                                  member={x}
                                  isOwner={
                                      x.userId === app.spaces.active?.ownerId
                                  }
                              />
                          ))}
                      />
                  ))
                : null}
        </Paper>
    );
});
