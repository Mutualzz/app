import { MobXProviderContext } from "mobx-react";
import { useContext } from "react";
import { type AppStore } from "../stores/App.store";

export function useStores() {
    return useContext(MobXProviderContext) as {
        appStore: AppStore;
    };
}
