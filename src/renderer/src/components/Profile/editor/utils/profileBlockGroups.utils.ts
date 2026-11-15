import type { APIProfileBlock } from "@mutualzz/types";

const getGroupSizes = (blocks: APIProfileBlock[]) => {
  const sizes = new Map<string, number>();
  for (const block of blocks) {
    if (!block.groupId) continue;
    sizes.set(block.groupId, (sizes.get(block.groupId) ?? 0) + 1);
  }
  return sizes;
};

const getSelectedGroupIds = (
  blocks: APIProfileBlock[],
  selectedBlockIds: string[]
) =>
  new Set(
    blocks
      .filter((block) => selectedBlockIds.includes(block.id) && block.groupId)
      .map((block) => block.groupId as string)
  );

export const expandSelectionToGroups = (
  selectedBlockIds: string[],
  blocks: APIProfileBlock[]
) => {
  const groupIds = getSelectedGroupIds(blocks, selectedBlockIds);
  if (groupIds.size === 0) return selectedBlockIds;

  const expanded = new Set(selectedBlockIds);
  for (const block of blocks) {
    if (block.groupId && groupIds.has(block.groupId)) expanded.add(block.id);
  }
  return [...expanded];
};

export const getGroupedBlockIds = (blocks: APIProfileBlock[]) => {
  const sizes = getGroupSizes(blocks);
  return new Set(
    blocks
      .filter((block) => block.groupId && (sizes.get(block.groupId) ?? 0) > 1)
      .map((block) => block.id)
  );
};

export const canGroupSelection = (
  blocks: APIProfileBlock[],
  selectedBlockIds: string[]
) => {
  if (selectedBlockIds.length < 2) return false;

  const selectedBlocks = blocks.filter((block) =>
    selectedBlockIds.includes(block.id)
  );
  const firstGroupId = selectedBlocks[0]?.groupId;
  const alreadyOneGroup =
    !!firstGroupId &&
    selectedBlocks.every((block) => block.groupId === firstGroupId) &&
    getGroupSizes(blocks).get(firstGroupId) === selectedBlocks.length;

  return !alreadyOneGroup;
};

export const canUngroupSelection = (
  blocks: APIProfileBlock[],
  selectedBlockIds: string[]
) => {
  const groupedIds = getGroupedBlockIds(blocks);
  return selectedBlockIds.some((blockId) => groupedIds.has(blockId));
};

export const groupBlocks = (
  blocks: APIProfileBlock[],
  selectedBlockIds: string[]
) => {
  if (!canGroupSelection(blocks, selectedBlockIds)) return blocks;

  const groupId = crypto.randomUUID();
  return removeSingleMemberGroups(
    blocks.map((block) =>
      selectedBlockIds.includes(block.id) ? { ...block, groupId } : block
    )
  );
};

export const ungroupBlocks = (
  blocks: APIProfileBlock[],
  selectedBlockIds: string[]
) => {
  const groupIds = getSelectedGroupIds(blocks, selectedBlockIds);
  if (groupIds.size === 0) return blocks;

  return blocks.map((block) =>
    block.groupId && groupIds.has(block.groupId)
      ? { ...block, groupId: undefined }
      : block
  );
};

export const removeSingleMemberGroups = (blocks: APIProfileBlock[]) => {
  const sizes = getGroupSizes(blocks);
  const hasSingles = [...sizes.values()].some((size) => size < 2);
  if (!hasSingles) return blocks;

  return blocks.map((block) =>
    block.groupId && (sizes.get(block.groupId) ?? 0) < 2
      ? { ...block, groupId: undefined }
      : block
  );
};

export const remapGroupIds = (copies: APIProfileBlock[]) => {
  const nextGroupIds = new Map<string, string>();

  const remapped = copies.map((block) => {
    if (!block.groupId) return block;

    let nextGroupId = nextGroupIds.get(block.groupId);
    if (!nextGroupId) {
      nextGroupId = crypto.randomUUID();
      nextGroupIds.set(block.groupId, nextGroupId);
    }
    return { ...block, groupId: nextGroupId };
  });

  return removeSingleMemberGroups(remapped);
};
