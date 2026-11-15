import { IconButton } from "@components/IconButton";
import { Tooltip } from "@components/Tooltip";
import { formatColor } from "@mutualzz/ui-core";
import { Typography, useTheme } from "@mutualzz/ui-web";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import {
  resolveCodeLanguage,
  tokenizeCode,
  tokenizeCodeSync
} from "@utils/loadHighlighter";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ThemedToken } from "shiki";

const COPIED_RESET_MS = 1500;

interface Props {
  code: string;
  language: string | null;
}

export const CodeBlock = ({ code, language }: Props) => {
  const { t } = useTranslation("chat");
  const { theme } = useTheme();
  const themeType = theme.type === "light" ? "light" : "dark";
  const resolvedLanguage = resolveCodeLanguage(language);
  const [tokens, setTokens] = useState<ThemedToken[][] | null>(() =>
    resolvedLanguage
      ? tokenizeCodeSync(code, resolvedLanguage, themeType)
      : null
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!resolvedLanguage) {
      setTokens(null);
      return;
    }

    let cancelled = false;
    void tokenizeCode(code, resolvedLanguage, themeType).then((nextTokens) => {
      if (!cancelled) setTokens(nextTokens);
    });
    return () => {
      cancelled = true;
    };
  }, [code, resolvedLanguage, themeType]);

  useEffect(() => {
    if (!copied) return;
    const timeoutId = window.setTimeout(
      () => setCopied(false),
      COPIED_RESET_MS
    );
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
  };

  const copyLabel = copied ? t("codeBlock.copied") : t("codeBlock.copy");

  return (
    <div
      css={{
        margin: "0.4em 0",
        borderRadius: 6,
        overflow: "hidden",
        border: `1px solid ${formatColor(theme.colors.neutral, {
          alpha: 35,
          format: "hexa"
        })}`,
        background: formatColor(theme.colors.surface, {
          darken: themeType === "dark" ? 8 : 0,
          format: "hexa"
        })
      }}
    >
      <div
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "2px 4px 2px 10px",
          borderBottom: `1px solid ${formatColor(theme.colors.neutral, {
            alpha: 20,
            format: "hexa"
          })}`
        }}
      >
        <Typography
          level="body-xs"
          textColor="muted"
          css={{ fontFamily: "monospace" }}
        >
          {language?.toLowerCase() ?? ""}
        </Typography>
        <Tooltip content={copyLabel}>
          <IconButton
            size="sm"
            variant="plain"
            aria-label={copyLabel}
            onClick={() => void copyCode()}
          >
            {copied ? <CheckIcon weight="bold" /> : <CopyIcon />}
          </IconButton>
        </Tooltip>
      </div>
      <pre
        css={{
          margin: 0,
          padding: "0.6em 0.75em",
          overflowX: "auto",
          fontFamily: "monospace",
          fontSize: "0.875em",
          lineHeight: 1.45,
          whiteSpace: "pre",
          color: theme.typography.colors.primary
        }}
      >
        <code>
          {tokens
            ? tokens.map((line, lineIndex) => (
                <Fragment key={lineIndex}>
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} style={{ color: token.color }}>
                      {token.content}
                    </span>
                  ))}
                  {lineIndex < tokens.length - 1 && "\n"}
                </Fragment>
              ))
            : code}
        </code>
      </pre>
    </div>
  );
};
