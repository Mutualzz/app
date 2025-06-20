import type { Config, Context } from "@netlify/edge-functions";
import escape from "lodash/escape";

const isBot = (ua: string) =>
    /bot|discord|twitter|facebook|linkedin|crawl|whatsapp/i.test(ua);

type Meta = {
    title: string;
    description: string;
    image?: string;
};

const getMeta = (pathname: string): Meta => {
    if (pathname.startsWith("/ui")) {
        const uiComponent = pathname.split("/ui/")[1];
        if (!uiComponent)
            return {
                title: "Mutualzz UI",
                description: "Explore the Mutualzz UI components.",
            };

        return {
            title: `Mutualzz UI - ${uiComponent}`,
            description: `Explore the ${uiComponent} component in Mutualzz UI.`,
        };
    }

    return {
        title: "Mutualzz (Under Development)",
        description:
            "Connect with other people who share your interests. Currently under heavy development. UI is being made from scratch, so only UI playground is available. In the future there will be a lot fun on this website :3",
    };
};

export default (req: Request, context: Context) => {
    const userAgent = req.headers.get("user-agent") ?? "";

    if (!isBot(userAgent)) return context.next();

    const url = new URL(req.url);
    const meta = getMeta(url.pathname);

    const html = `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="title" content="${escape(meta.title)}">
                <meta name="description" content="${escape(meta.description)}">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta property="og:title" content="${escape(meta.title)}">
                <meta property="og:description" content="${escape(meta.description)}">
                <meta property="og:type" content="website">
                <meta property="og:url" content="${escape(req.url)}">
                ${meta.image ? `<meta property="og:image" content="${escape(meta.image)}" />` : ""}
                <meta
                    name="keywords"
                    content="mutualzz, alternative, alt, emo, punk, metal, deathcore, metalcore"
                />
                <meta name="robots" content="index, follow" />
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <meta name="author" content="Mutualzz" />
                <title>${escape(meta.title)}</title>
            </head>
            <body>
                <h1>${escape(meta.title)}</h1>
                <p>${escape(meta.description)}</p>
                ${meta.image ? `<img src="${escape(meta.image)}" alt="Preview Image" />` : ""}
                <p>Visit us at <a href="https://mutualzz.com">mutualzz.com</a></p>
            </body>
        </html>
    `;

    return new Response(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
        status: 200,
    });
};

export const config: Config = {
    path: "/*",
};
