import { SpaceCreate } from "@components/Space/SpaceCreate.tsx";
import { SpaceJoin } from "@components/Space/SpaceJoin.tsx";
import { observer } from "mobx-react";
import { useState } from "react";

export const SpaceInviteModal = observer(() => {
    const [creating, setCreating] = useState(true);

    if (creating) return <SpaceCreate setCreating={setCreating} />;

    return <SpaceJoin setCreating={setCreating} />;
});
