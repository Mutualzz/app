type SEO = {
    title: string;
    description?: string;
    image?: string;
    keywords?: string | string[];
};

export const seo = ({ title, description, image, keywords }: SEO) => {
    const tags = [
        { title },
        {
            name: "description",
            content: description,
        },
        {
            name: "keywords",
            content: Array.isArray(keywords) ? keywords.join(", ") : keywords,
        },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:creator", content: "@tannerlinsley" },
        { name: "twitter:site", content: "@tannerlinsley" },
        { name: "og:type", content: "website" },
        { name: "og:title", content: title },
        { name: "og:description", content: description },
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
