interface SEO {
    title?: string;
    description?: string;
    image?: string;
    keywords?: string | string[];
}

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
            content:
                "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, shrink-to-fit=no",
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

        { rel: "manifest", href: "manifest.json" },

        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-title", content: "Mutualzz" },
        { name: "theme-color", content: "#88449a" },
        { name: "msapplication-navbutton-color", content: "#88449a" },
        {
            name: "apple-mobile-web-app-status-bar-style",
            content: "black-translucent",
        },
        { name: "msapplication-starturl", content: "." },

        // Icons
        {
            rel: "icon",
            type: "image/png",
            sizes: "48x48",
            href: "assets/icons/icon-48.webp",
        },
        {
            rel: "apple-touch-icon",
            type: "image/png",
            sizes: "48x48",
            href: "assets/icons/icon-48.webp",
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "72x72",
            href: "assets/icons/icon-72.webp",
        },
        {
            rel: "apple-touch-icon",
            type: "image/png",
            sizes: "72x72",
            href: "assets/icons/icon-72.webp",
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "96x96",
            href: "assets/icons/icon-96.webp",
        },
        {
            rel: "apple-touch-icon",
            type: "image/png",
            sizes: "96x96",
            href: "assets/icons/icon-96.webp",
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "128x128",
            href: "assets/icons/icon-128.webp",
        },
        {
            rel: "apple-touch-icon",
            type: "image/png",
            sizes: "128x128",
            href: "assets/icons/icon-128.webp",
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "192x192",
            href: "assets/icons/icon-192.webp",
        },
        {
            rel: "apple-touch-icon",
            type: "image/png",
            sizes: "192x192",
            href: "assets/icons/icon-192.webp",
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "256x256",
            href: "assets/icons/icon-256.webp",
        },
        {
            rel: "apple-touch-icon",
            type: "image/png",
            sizes: "256x256",
            href: "assets/icons/icon-256.webp",
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "512x512",
            href: "assets/icons/icon-512.webp",
        },
        {
            rel: "apple-touch-icon",
            type: "image/png",
            sizes: "512x512",
            href: "assets/icons/icon-512.webp",
        },
        {
            rel: "icon",
            type: "image/x-icon",
            sizes: "64x64 32x32 24x24 16x16",
            href: "favicon.ico",
        },
        {
            rel: "apple-touch-icon",
            type: "image/x-icon",
            sizes: "64x64 32x32 24x24 16x16",
            href: "favicon.ico",
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "256x256",
            href: "icon256.png",
        },
        {
            rel: "apple-touch-icon",
            type: "image/png",
            sizes: "256x256",
            href: "icon256.png",
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "192x192",
            href: "icon192.png",
        },
        {
            rel: "apple-touch-icon",
            type: "image/png",
            sizes: "192x192",
            href: "icon192.png",
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "512x512",
            href: "icon512.png",
        },
        {
            rel: "apple-touch-icon",
            type: "image/png",
            sizes: "512x512",
            href: "icon512.png",
        },
    ];

    return tags;
};
