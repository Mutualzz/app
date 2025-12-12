import { TooltipWrapper } from "@components/TooltipWrapper";
import { styled } from "@mutualzz/ui-core";
import { Box, Stack, Tooltip, Typography } from "@mutualzz/ui-web";
import { Message, type MessageLike } from "@stores/objects/Message";
import { calendarStrings } from "@utils/i18n";
import dayjs from "dayjs";
import { observer } from "mobx-react";
import type { HTMLAttributes, PropsWithChildren } from "react";

interface Props extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
    header?: boolean;
}

export const MessageBase = styled("div")<Props>(({ header }) => ({
    display: "flex",
    overflow: "hidden",
    flexDirection: "row",
    ...(!header && {
        alignItems: "center",
    }),
    ...(header && {
        marginTop: 10,
    }),
    paddingTop: "0.2rem",
    paddingBottom: "0.2rem",

    ":hover": {
        "time, .edited": {
            opacity: 1,
        },
    },
}));

export const MessageInfo = styled("div")(({ theme }) => ({
    width: 62,
    display: "flex",
    flexShrink: 0,
    paddingTop: 2,
    flexDirection: "row",
    justifyContent: "center",

    "time, .edited": {
        opacity: 0,
        fontSize: 12,
        color: theme.typography.colors.muted,
    },
}));

export const MessageContent = styled("div")({
    position: "relative",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingRight: 48,
    wordWrap: "break-word",
    flex: 1,
});

export const MessageContentText = styled("div")<{
    sending?: boolean;
    failed?: boolean;
}>(({ theme, sending, failed }) => ({
    ...(sending && {
        opacity: 0.5,
    }),
    ...(failed && {
        color: theme.colors.danger,
    }),
    margin: "2px 0",
}));

export const DetailsBase = styled("div")(({ theme }) => ({
    flexShrink: 0,
    fontSize: 12,
    display: "inline-flex",
    color: theme.typography.colors.secondary,
    paddingLeft: 4,
    alignSelf: "center",

    ".edited": {
        cursor: "default",
        userSelect: "none",
    },
}));

export const MessageDetails = observer(
    ({
        message,
        position,
    }: {
        message: MessageLike;
        position: "left" | "top";
    }) => {
        if (position === "left") {
            if (message instanceof Message && message.edited) {
                return (
                    <Stack direction="column">
                        <Tooltip
                            placement="top"
                            content={
                                <TooltipWrapper>
                                    {dayjs(message.createdAt).format(
                                        "dddd, MMMM D, YYYY h:mm A",
                                    )}
                                </TooltipWrapper>
                            }
                        >
                            <time
                                className="copyTime"
                                dateTime={message.createdAt.toISOString()}
                            >
                                {dayjs(message.createdAt).format("h:mm A")}
                            </time>
                        </Tooltip>
                        <Box className="edited">
                            <Tooltip
                                placement="top"
                                content={
                                    <TooltipWrapper>
                                        {dayjs(message.updatedAt).format(
                                            "dddd, MMMM D, YYYY h:mm A",
                                        )}
                                    </TooltipWrapper>
                                }
                            >
                                <Typography textColor="muted">
                                    (edited)
                                </Typography>
                            </Tooltip>
                        </Box>
                    </Stack>
                );
            }

            return (
                <Tooltip
                    placement="left"
                    content={
                        <TooltipWrapper>
                            {dayjs(message.createdAt).format(
                                "dddd, MMMM D, YYYY h:mm A",
                            )}
                        </TooltipWrapper>
                    }
                >
                    <time dateTime={message.createdAt.toISOString()}>
                        {dayjs(message.createdAt).format("h:mm A")}
                    </time>
                </Tooltip>
            );
        }

        return (
            <DetailsBase>
                <Tooltip
                    placement="top"
                    content={
                        <TooltipWrapper>
                            {dayjs(message.createdAt).format(
                                "dddd, MMMM D, YYYY h:mm A",
                            )}
                        </TooltipWrapper>
                    }
                >
                    <time
                        className="copyTime"
                        dateTime={message.createdAt.toISOString()}
                    >
                        {dayjs(message.createdAt).calendar(
                            undefined,
                            calendarStrings,
                        )}
                    </time>
                </Tooltip>
                {message instanceof Message && message.edited && (
                    <Tooltip
                        placement="top"
                        content={
                            <TooltipWrapper>
                                {dayjs(message.updatedAt).format(
                                    "dddd, MMMM D, YYYY h:mm A",
                                )}
                            </TooltipWrapper>
                        }
                        offset={8}
                    >
                        <Typography textColor="muted" ml={1} className="edited">
                            (edited)
                        </Typography>
                    </Tooltip>
                )}
            </DetailsBase>
        );
    },
);
