import { ListSection } from "@components/ListSection.tsx";
import { MemberListItem } from "@components/MemberList/MemberListItem.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { Paper } from "@mutualzz/ui-web";
import { autorun } from "mobx";
import { observer } from "mobx-react";
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
            elevation={4}
            direction="column"
            flex="0 0 240px"
            overflowX="hidden"
        >
            {list
                ? list.map((category, i) => (
                      <ListSection
                          key={i}
                          name={category.name}
                          items={category.items.map((x: any) => (
                              <MemberListItem member={x} />
                          ))}
                      />
                  ))
                : null}
        </Paper>
    );
});
