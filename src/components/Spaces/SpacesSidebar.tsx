import { Avatar, IconButton, Paper, Tooltip } from "@mutualzz/ui-web";

const placeholderSpaces = [
    {
        id: 1,
        name: "Alesana",
        iconUrl:
            "https://i.scdn.co/image/ab67616d00001e02b61c7c28b7e29515c3d0a257",
    },
    {
        id: 2,
        name: "Silverstein",
        iconUrl:
            "https://craftrecordings.com/cdn/shop/articles/Screenshot_2023-08-07_at_2.50.16_PM.png?v=1692202987",
    },
    {
        id: 3,
        name: "Lorna Shore",
        iconUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZlTjtEfFK6cLnj6RYTGqkpWEh-8vg1xX79g&s",
    },
    {
        id: 4,
        name: "Asking Alexandria",
        iconUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvOPVJevV1-ttQWdIdtmsT2iJYOuhM5HKvMQ&s",
    },
    {
        id: 5,
        name: "Femboy Fatale",
        iconUrl:
            "https://pbs.twimg.com/profile_images/1621061231015755777/HmZz5eU1_400x400.jpg",
    },
];

export const SpacesSidebar = () => {
    return (
        <Paper
            elevation={2}
            maxWidth="5rem"
            direction="column"
            alignItems="center"
            pt={20}
            spacing={10}
            width="100%"
        >
            {placeholderSpaces.map((space) => (
                <Tooltip
                    title={`${space.name} [Placeholder]`}
                    key={space.id}
                    placement="right"
                >
                    <IconButton
                        css={{
                            borderRadius: 9999,
                            padding: 0,
                        }}
                        variant="plain"
                    >
                        <Avatar
                            size="lg"
                            src={space.iconUrl}
                            alt={space.name}
                        />
                    </IconButton>
                </Tooltip>
            ))}
        </Paper>
    );
};
