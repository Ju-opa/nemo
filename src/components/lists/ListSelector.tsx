"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsInMyList } from "@/hooks/use-list";
import { useMyLists } from "@/hooks/use-lists";
import { ListPickerSheet } from "./ListPickerSheet";

interface ListSelectorProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  size?: "sm" | "md";
  className?: string;
}

export function ListSelector({ tmdbId, mediaType, size = "sm", className }: ListSelectorProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: lists = [] } = useMyLists();
  const isInDefaultList = useIsInMyList(tmdbId, mediaType);

  const buttonSize = size === "sm" ? "size-8" : "size-10";
  const iconSize = size === "sm" ? "size-3" : "size-5";

  const isInAnyList =
    isInDefaultList ||
    lists.some((list) =>
      !list.is_default && list.items.some((i) => i.tmdb_id === tmdbId && i.media_type === mediaType)
    );

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSheetOpen(true);
        }}
        aria-label={isInAnyList ? "Gérer les listes" : "Ajouter à une liste"}
        className={cn(
          "flex items-center justify-center rounded-full transition-all shrink-0",
          "border border-white/30 hover:border-white/60",
          "bg-black/30 backdrop-blur-sm",
          isInAnyList && "bg-white/15 border-white/50",
          buttonSize,
          className
        )}
      >
        {isInAnyList ? (
          <Check className={cn(iconSize, "text-white")} />
        ) : (
          <Plus className={cn(iconSize, "text-white")} />
        )}
      </button>

      <ListPickerSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        tmdbId={tmdbId}
        mediaType={mediaType}
      />
    </>
  );
}
