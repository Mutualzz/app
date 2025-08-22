import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react";
import type { PropsWithChildren } from "react";
import Updating from "./Updating";

const Updater = (props: PropsWithChildren) => {
    const { updaterStore } = useAppStore();

    if (updaterStore?.checking) return <Updating />;

    return <>{props.children}</>;
};

export default observer(Updater);
