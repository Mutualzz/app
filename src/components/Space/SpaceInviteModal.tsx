import { SpaceCreate } from "@components/Space/SpaceCreate";
import { SpaceJoin } from "@components/Space/SpaceJoin";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export const SpaceInviteModal = observer(() => {
    const [creating, setCreating] = useState(false);

    if (creating) return <SpaceCreate setCreating={setCreating} />;

    return <SpaceJoin setCreating={setCreating} />;
});
