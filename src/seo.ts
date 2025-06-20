type SEO = {
    title?: string;
    description?: string;
    image?: string;
    keywords?: string | string[];
};

const defaultTitle = "Mutualzz (Under Development)";
const defaultDescription =
    "Connect with other people who share your interests. Currently under heavy development. UI is being made from scratch, so only UI playground is available. In the future there will be a lot fun on this website :3";

export const seo = (params?: SEO) => {
    const {
        title = defaultTitle,
        description = defaultDescription,
        image,
        keywords,
    } = params ?? {};

    const tags = [
        {
            charSet: "utf-8",
        },
        {
            name: "viewport",
            content: "width=device-width, initial-scale=1",
        },
        { title },
        {
            meta: "title",
            content: title,
        },
        {
            name: "description",
            content: description,
        },
        {
            name: "keywords",
            content: keywords
                ? Array.isArray(keywords)
                    ? keywords.join(", ")
                    : keywords
                : "mutualzz, alternative, alt, emo, punk, metal, deathcore, metalcore, hardcore, music, social media, social network, emo social media, emo social network",
        },
        {
            name: "robots",
            content: "index, follow",
        },
        { name: "author", content: "Mutualzz" },
        { name: "twitter:title", content: title },
        {
            name: "twitter:description",
            content: description,
        },
        { name: "twitter:creator", content: "Mutualzz" },
        { name: "twitter:site", content: "Mutualzz" },
        { name: "og:type", content: "website" },
        { name: "og:title", content: title },
        { name: "og:description", content: description },
        {
            name: "theme-color",
            content: "#B22222",
        },
        {
            name: "application-name",
            content: "Mutualzz",
        },
        {
            name: "apple-mobile-web-app-capable",
            content: "yes",
        },
        ...(image
            ? [
                  { name: "twitter:image", content: image },
                  { name: "twitter:card", content: "summary_large_image" },
                  { name: "og:image", content: image },
              ]
            : []),
    ];

    return tags;
};
