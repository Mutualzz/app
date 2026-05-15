import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";
import type { PropsWithChildren } from "react";
import Loading from "./Loading";

const Loader = (props: PropsWithChildren) => {
    const app = useAppStore();

    if (!app.isReady) return <Loading />;

    return <>{props.children}</>;
};

export default observer(Loader);
