import { InputDefault, Option, Select, Stack } from "@mutualzz/ui-web";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { type KeyboardEvent, useState } from "react";

interface Category {
  id: string;
  title: string;
}

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  categories: Category[];
  onCategoryJump: (categoryId: string) => void;
}

export function PermissionEditorControls({
  search,
  onSearchChange,
  categories,
  onCategoryJump
}: Props) {
  const [jumpValue, setJumpValue] = useState("");

  const handleSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") onSearchChange("");
  };

  const handleCategoryJump = (value: string | number | (string | number)[]) => {
    if (Array.isArray(value) || typeof value !== "string" || !value) return;

    onCategoryJump(value);
    setJumpValue("");
  };

  return (
    <Stack direction="row" spacing={10}>
      <InputDefault
        type="text"
        placeholder="Search permissions…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleSearchKey}
        startDecorator={<MagnifyingGlassIcon />}
        fullWidth
      />

      {categories.length > 1 && (
        <Select
          placeholder="Jump to category…"
          value={jumpValue}
          onValueChange={handleCategoryJump}
          size="sm"
        >
          {categories.map((category) => (
            <Option key={category.id} value={category.id}>
              {category.title}
            </Option>
          ))}
        </Select>
      )}
    </Stack>
  );
}
