import { useAppStore } from "@hooks/useStores";
import { Paper, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react";

interface SpacesChannelList {
    skeleton?: boolean;
}

export const SpacesChannelList = observer(({ skeleton }: SpacesChannelList) => {
    const app = useAppStore();

    const skeletonComp = (
        <Paper elevation={4} p={20} maxWidth="15rem" width="100%" />
    );

    if (skeleton || !app.spaces.active) return skeletonComp;

    return (
        <Paper elevation={4} maxWidth="15rem" width="100%">
            <Paper
                elevation={5}
                width="100%"
                maxHeight="3rem"
                height="100%"
                alignItems="center"
                p={20}
            >
                <Typography level="body-sm">
                    {app.spaces.active?.name}
                </Typography>
            </Paper>
        </Paper>
    );
});
