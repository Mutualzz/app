import { CircularProgress, Stack } from "@mutualzz/ui";
import { observer } from "mobx-react";
import { Logo } from "./Logo";

const Loading = () => {
    return (
        <Stack
            direction="column"
            alignItems="center"
            height="100%"
            justifyContent="center"
        >
            <CircularProgress strokeWidth="lg" color="success" size={272}>
                <Logo
                    css={{
                        width: 256,
                        height: 256,
                    }}
                />
            </CircularProgress>
        </Stack>
    );
};

export default observer(Loading);
