import { useAppStore } from "@hooks/useStores";
import { invoke } from "@tauri-apps/api/core";
import { isTauri } from "@utils/index";
import { observer } from "mobx-react";
import type { PropsWithChildren } from "react";
import Loading from "./Loading";

const Loader = (props: PropsWithChildren) => {
    const app = useAppStore();

    if (!app.isReady) return <Loading />;

    if (isTauri) invoke("close_splashscreen");

    return <>{props.children}</>;
};

export default observer(Loader);
