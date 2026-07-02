import { ContextMenu } from "@components/ContextMenu";
import { ContextItem } from "@components/ContextItem";
import { generateMenuIDs, useMenu } from "@contexts/ContextMenu.context";
import { useAppStore } from "@hooks/useStores";
import { ClipboardIcon, CopyIcon, ScissorsIcon } from "@phosphor-icons/react";
import { Checkbox, Divider } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";

interface Props {
  isEditable: boolean;
  canCut: boolean;
  canCopy: boolean;
  canPaste: boolean;
  selectionText: string;
  misspelledWord: string;
  dictionarySuggestions: string[];
  sourceElement: HTMLElement | null;
}

export const EditableContextMenu = observer(
  ({
    isEditable,
    canCut,
    canCopy,
    canPaste,
    selectionText,
    misspelledWord,
    dictionarySuggestions,
    sourceElement
  }: Props) => {
    const app = useAppStore();
    const { clearMenu } = useMenu();

    const hasSpellcheck = !!misspelledWord;
    const spellcheckEnabled = app.settings?.spellcheckEnabled ?? true;

    if (!canCut && !canCopy && !canPaste && !hasSpellcheck && !isEditable)
      return null;

    const replaceMisspelling = async (word: string) => {
      sourceElement?.focus();
      await window.api.contextMenu.replaceMisspelling(word);
      clearMenu();
    };

    const addToDictionary = async () => {
      await window.api.contextMenu.addToDictionary(misspelledWord);
      clearMenu();
    };

    const copy = async () => {
      await navigator.clipboard.writeText(selectionText);
      clearMenu();
    };

    const cut = async () => {
      await navigator.clipboard.writeText(selectionText);
      sourceElement?.focus();
      document.execCommand("delete");
      clearMenu();
    };

    const paste = async () => {
      sourceElement?.focus();
      const text = await navigator.clipboard.readText();
      document.execCommand("insertText", false, text);
      clearMenu();
    };

    const toggleSpellcheck = () => {
      app.settings?.toggleSpellcheckEnabled();
      clearMenu();
    };

    return (
      <ContextMenu
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        id={generateMenuIDs.editable()}
      >
        {hasSpellcheck && (
          <>
            {dictionarySuggestions.map((suggestion) => (
              <ContextItem
                key={suggestion}
                onClick={() => replaceMisspelling(suggestion)}
              >
                {suggestion}
              </ContextItem>
            ))}
            <Divider css={{ opacity: 0.5 }} />
            <ContextItem onClick={addToDictionary}>
              Add to Dictionary
            </ContextItem>
          </>
        )}
        {isEditable && (
          <>
            <ContextItem
              endDecorator={
                <Checkbox
                  checked={spellcheckEnabled}
                  readOnly
                  size={14}
                  css={{ pointerEvents: "none" }}
                />
              }
              onClick={toggleSpellcheck}
            >
              Spellcheck
            </ContextItem>
          </>
        )}
        {(canCut || canCopy || canPaste) && (
          <>
            {(hasSpellcheck || isEditable) && (
              <Divider css={{ opacity: 0.5 }} />
            )}
            {canCut && (
              <ContextItem
                endDecorator={<ScissorsIcon weight="fill" />}
                onClick={cut}
              >
                Cut
              </ContextItem>
            )}
            {canCopy && (
              <ContextItem
                endDecorator={<CopyIcon weight="fill" />}
                onClick={copy}
              >
                Copy
              </ContextItem>
            )}
            {canPaste && (
              <ContextItem
                endDecorator={<ClipboardIcon weight="fill" />}
                onClick={paste}
              >
                Paste
              </ContextItem>
            )}
          </>
        )}
      </ContextMenu>
    );
  }
);
