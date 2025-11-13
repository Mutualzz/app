import { unreachable } from "devlop";
import type { Element, Nodes, Parents, Root } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { urlAttributes } from "html-url-attributes";
import type { Emoji, Spoiler } from "micromark-util-types";
import {
    useEffect,
    useMemo,
    useState,
    type ComponentType,
    type ReactElement,
    type ReactNode,
} from "react";
import { Fragment, jsx, jsxs, type JSX } from "react/jsx-runtime";
import remarkRehype, {
    type Options as RemarkRehypeOptions,
} from "remark-rehype";
import { unified, type PluggableList } from "unified";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";
import { remarkEmoji } from "./remark/remarkEmoji";
import { remarkParse } from "./remark/remarkParse";

type AllowElement = (
    element: Readonly<Element>,
    index: number,
    parent: Readonly<Parents> | undefined,
) => boolean | null | undefined;

interface ExtraProps {
    node?: Element;
}

type Components = {
    [Key in keyof JSX.IntrinsicElements]?:
        | ComponentType<JSX.IntrinsicElements[Key] & ExtraProps>
        | keyof JSX.IntrinsicElements;
} & {
    underline?: ComponentType<JSX.IntrinsicElements["u"] & ExtraProps>;
    emoji?: ComponentType<Emoji>;
    spoiler?: ComponentType<Spoiler>;
    inlineCode?: ComponentType<JSX.IntrinsicElements["code"] & ExtraProps>;
    blockCode?: ComponentType<JSX.IntrinsicElements["pre"] & ExtraProps>;
};

export interface Options {
    allowElement?: AllowElement | null;
    allowedElements?: readonly string[] | null;
    children?: string | null;
    components?: Components | null;
    disallowedElements?: readonly string[] | null;
    rehypePlugins?: PluggableList | null;
    remarkPlugins?: PluggableList | null;
    remarkRehypeOptions?: Readonly<RemarkRehypeOptions> | null;
    skipHtml?: boolean | null;
    unwrapDisallowed?: boolean | null;
    urlTransform?: UrlTransform | null;
}

interface HooksOptionsOnly {
    /** Content to render while the processor is processing the markdown (optional). */
    fallback?: ReactNode | null;
}

type HooksOptions = Options & HooksOptionsOnly;

type UrlTransform = (
    url: string,
    key: string,
    node: Element,
) => string | null | undefined;

const emptyRemarkRehypeOptions: Readonly<RemarkRehypeOptions> = {
    allowDangerousHtml: false,
};
const safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i;

export function Markdown(options: Readonly<Options>): ReactElement {
    const processor = createProcessor(options);
    const file = createFile(options);
    return post(processor.runSync(processor.parse(file), file), options);
}

export async function MarkdownAsync(
    options: Readonly<Options>,
): Promise<ReactElement> {
    const processor = createProcessor(options);
    const file = createFile(options);
    const tree = await processor.run(processor.parse(file), file);
    return post(tree, options);
}

export function MarkdownHooks(options: Readonly<HooksOptions>): ReactNode {
    const processor = useMemo(
        function () {
            return createProcessor(options);
        },
        [
            options.rehypePlugins,
            options.remarkPlugins,
            options.remarkRehypeOptions,
        ],
    );
    const [error, setError] = useState<Error | undefined>();
    const [tree, setTree] = useState<Root | undefined>();

    useEffect(
        function () {
            let cancelled = false;
            const file = createFile(options);

            processor.run(processor.parse(file), file, function (error, tree) {
                if (!cancelled) {
                    setError(error);
                    setTree(tree);
                }
            });

            return function () {
                cancelled = true;
            };
        },
        [options.children, processor],
    );

    if (error) throw error;

    return tree ? post(tree, options) : options.fallback;
}

function createProcessor(options: Readonly<Options>) {
    const remarkRehypeOptions = options.remarkRehypeOptions
        ? { ...options.remarkRehypeOptions, ...emptyRemarkRehypeOptions }
        : emptyRemarkRehypeOptions;

    const processor = unified()
        .use(remarkParse)
        .use(remarkEmoji)
        .use(remarkRehype, remarkRehypeOptions);

    return processor;
}

function createFile(options: Readonly<Options>): VFile {
    const children = options.children || "";
    const file = new VFile();

    if (typeof children === "string") {
        file.value = children;
    } else {
        unreachable(
            "Unexpected value `" +
                children +
                "` for `children` prop, expected `string`",
        );
    }

    return file;
}

function post(tree: Nodes, options: Readonly<Options>): ReactElement {
    const allowedElements = options.allowedElements;
    const allowElement = options.allowElement;
    const components = options.components;
    const disallowedElements = options.disallowedElements;
    const skipHtml = options.skipHtml;
    const unwrapDisallowed = options.unwrapDisallowed;
    const urlTransform = options.urlTransform || defaultUrlTransform;

    if (allowedElements && disallowedElements) {
        unreachable(
            "Unexpected combined `allowedElements` and `disallowedElements`, expected one or the other",
        );
    }

    visit(tree, transform);

    return toJsxRuntime(tree, {
        Fragment,
        components,
        ignoreInvalidStyle: true,
        jsx,
        jsxs,
        passKeys: true,
        passNode: true,
    });

    function transform(node: any, index: any, parent: any) {
        if (node.type === "raw" && parent && typeof index === "number") {
            if (skipHtml) {
                parent.children.splice(index, 1);
            } else {
                parent.children[index] = { type: "text", value: node.value };
            }

            return index;
        }

        if (node.type === "element") {
            let key: string;

            for (key in urlAttributes) {
                if (
                    Object.hasOwn(urlAttributes, key) &&
                    Object.hasOwn(node.properties, key)
                ) {
                    const value = node.properties[key];
                    const test = urlAttributes[key];
                    if (test === null || test.includes(node.tagName)) {
                        node.properties[key] = urlTransform(
                            String(value || ""),
                            key,
                            node,
                        );
                    }
                }
            }
        }

        if (node.type === "element") {
            let remove = allowedElements
                ? !allowedElements.includes(node.tagName)
                : disallowedElements
                  ? disallowedElements.includes(node.tagName)
                  : false;

            if (!remove && allowElement && typeof index === "number") {
                remove = !allowElement(node, index, parent);
            }

            if (remove && parent && typeof index === "number") {
                if (unwrapDisallowed && node.children) {
                    parent.children.splice(index, 1, ...node.children);
                } else {
                    parent.children.splice(index, 1);
                }

                return index;
            }
        }
    }
}

export function defaultUrlTransform(value: string): string {
    const colon = value.indexOf(":");
    const questionMark = value.indexOf("?");
    const numberSign = value.indexOf("#");
    const slash = value.indexOf("/");

    if (
        // If there is no protocol, it’s relative.
        colon === -1 ||
        // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
        (slash !== -1 && colon > slash) ||
        (questionMark !== -1 && colon > questionMark) ||
        (numberSign !== -1 && colon > numberSign) ||
        // It is a protocol, it should be allowed.
        safeProtocol.test(value.slice(0, colon))
    ) {
        return value;
    }

    return "";
}
