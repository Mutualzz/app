import { Logo } from "@components/Logo";
import { LinearProgress, Stack } from "@mutualzz/ui";
import { observer } from "mobx-react";

const Updating = () => {
    return (
        <Stack
            direction="column"
            alignItems="center"
            height="100%"
            justifyContent="center"
        >
            <Logo
                css={{
                    width: 256,
                    height: 256,
                }}
            />
            <LinearProgress color="success" />
        </Stack>
    );
};

export default observer(Updating);
