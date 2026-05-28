import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import {
    Button,
    Option,
    Radio,
    Select,
    Stack,
    Typography
} from "@mutualzz/ui-web";
import { SpaceMember } from "@stores/objects/SpaceMember";
import { Space } from "@stores/objects/Space";
import { useState } from "react";
import { InputWithLabel } from "@components/InputWithLabel";
import { useMutation } from "@tanstack/react-query";
import { useModal } from "@contexts/Modal.context";
import { HttpException } from "@mutualzz/types";

interface Props {
    space: Space;
    member: SpaceMember;
}

const suspicious = "Suspicious or spam account";
const compromised = "Compromised or hacked account";
const breakingRules = "Breaking space rules";
const other = "Other";

const deleteMessageOptions = [
    { label: "Don't delete messages", value: 0 },
    { label: "Last hour", value: 3600 },
    { label: "Last 24 hours", value: 86400 },
    { label: "Last 7 days", value: 604800 },
    { label: "Delete all messages", value: -1 }
];

export const MemberBan = observer(({ space, member }: Props) => {
    const app = useAppStore();
    const [reason, setReason] = useState<string | null>(null);
    const [deleteMessageTimeframe, setDeleteMessageTimeframe] =
        useState<number>(3600);
    const [otherSelected, setOtherSelected] = useState(false);
    const [errors, setErrors] = useState<{
        reason: string | null;
    }>({
        reason: null
    });

    const { closeModal } = useModal();

    const { mutate: banMember, isPending: isBanning } = useMutation({
        mutationKey: ["ban_member", space.id, member.id],
        mutationFn: () =>
            app.rest.put(`/spaces/${space.id}/members/${member.id}/ban`, {
                reason,
                deleteMessageTimeframe
            }),
        onSuccess: () => {
            closeModal();
        },
        onError: (err: HttpException) => {
            err.errors?.forEach((e) => {
                setErrors((prev) => ({ ...prev, [e.path]: e.message }));
            });
        }
    });

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            p={5}
            borderRadius={12}
            direction="column"
            justifyContent="space-between"
            spacing={1.25}
        >
            <Stack direction="column" spacing={5}>
                <Typography level="h6" textColor="secondary" fontWeight="bold">
                    Ban @{member.user?.displayName}?
                </Typography>
                <Typography fontWeight="bold">Reason for ban *</Typography>
                <Stack direction="column" justifyContent="center" spacing={2.5}>
                    <Radio
                        color="neutral"
                        value={suspicious}
                        label={suspicious}
                        checked={reason === suspicious}
                        onChange={() => {
                            setReason(suspicious);
                            setOtherSelected(false);
                        }}
                        size={18}
                    />
                    <Radio
                        color="neutral"
                        value={compromised}
                        label={compromised}
                        checked={reason === compromised}
                        onChange={() => {
                            setReason(compromised);
                            setOtherSelected(false);
                        }}
                        size={18}
                    />
                    <Radio
                        color="neutral"
                        value={breakingRules}
                        label={breakingRules}
                        checked={reason === breakingRules}
                        onChange={() => {
                            setReason(breakingRules);
                            setOtherSelected(false);
                        }}
                        size={18}
                    />
                    <Radio
                        color="neutral"
                        value={other}
                        label={other}
                        checked={reason === other}
                        onChange={() => {
                            setReason("");
                            setOtherSelected(true);
                        }}
                        size={18}
                    />
                    {otherSelected && (
                        <InputWithLabel
                            onChange={(e) => setReason(e.target.value)}
                            type="text"
                            name="reason"
                            value={reason || ""}
                        />
                    )}
                    {errors.reason && (
                        <Typography variant="plain" color="danger">
                            {errors.reason}
                        </Typography>
                    )}
                </Stack>
                <Stack direction="column" spacing={2.5}>
                    <Typography>Delete recent messages</Typography>
                    <Select
                        value={deleteMessageTimeframe}
                        onValueChange={(v) =>
                            setDeleteMessageTimeframe(Number(v))
                        }
                    >
                        {deleteMessageOptions.map((opt) => (
                            <Option key={opt.value} value={opt.value}>
                                {opt.label}
                            </Option>
                        ))}
                    </Select>
                </Stack>
                <Stack direction="row" spacing={1.25}>
                    <Button
                        color="neutral"
                        expand
                        disabled={isBanning}
                        onClick={() => closeModal()}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="danger"
                        expand
                        onClick={() => banMember()}
                        disabled={isBanning}
                    >
                        Ban
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
});
