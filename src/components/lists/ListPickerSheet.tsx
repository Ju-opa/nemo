"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMyLists, useToggleItemInList } from "@/hooks/use-lists";
import { useIsInMyList, useToggleMyList } from "@/hooks/use-list";
import { CreateListModal } from "./CreateListModal";

interface ListPickerSheetProps {
  open: boolean;
  onClose: () => void;
  tmdbId: number;
  mediaType: "movie" | "tv";
}

export function ListPickerSheet({ open, onClose, tmdbId, mediaType }: ListPickerSheetProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: lists = [] } = useMyLists();
  const isInDefaultList = useIsInMyList(tmdbId, mediaType);
  const { mutate: toggleDefault } = useToggleMyList();
  const { mutate: toggleInList } = useToggleItemInList();

  function handleListClick(listId: string, isDefault: boolean, isIn: boolean) {
    if (isDefault) {
      toggleDefault({ tmdbId, mediaType, action: isIn ? "remove" : "add" });
    } else {
      toggleInList({ listId, tmdbId, mediaType, action: isIn ? "remove" : "add" });
    }
    onClose();
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[900] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[901]",
              "bg-[#141720] border-t border-white/10 rounded-t-2xl",
              "shadow-2xl outline-none",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
              "duration-300"
            )}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <Dialog.Title className="text-sm font-semibold text-white/60 tracking-wider uppercase">
                Ajouter à une liste
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="flex items-center justify-center size-7 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                  <X className="size-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* List items */}
            <div className="px-2 pb-4 max-h-[60vh] overflow-y-auto">
              {lists.map((list) => {
                const isIn = list.is_default
                  ? isInDefaultList
                  : list.items.some((i) => i.tmdb_id === tmdbId && i.media_type === mediaType);

                return (
                  <button
                    key={list.id}
                    onClick={() => handleListClick(list.id, list.is_default, isIn)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors text-left",
                      isIn ? "bg-white/8" : "hover:bg-white/6",
                    )}
                  >
                    <span className="text-xl leading-none shrink-0">{list.icon ?? "🎬"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{list.name}</p>
                      {list.item_count > 0 && (
                        <p className="text-xs text-white/35 mt-0.5">{list.item_count} élément{list.item_count > 1 ? "s" : ""}</p>
                      )}
                    </div>
                    {isIn && <Check className="size-4 text-nemo-accent shrink-0" />}
                  </button>
                );
              })}

              {/* Divider */}
              <div className="h-px bg-white/8 mx-4 my-2" />

              {/* New list */}
              <button
                onClick={() => { setCreateOpen(true); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-nemo-accent/10 transition-colors text-left"
              >
                <div className="flex items-center justify-center size-8 rounded-full bg-nemo-accent/15 shrink-0">
                  <Plus className="size-4 text-nemo-accent" />
                </div>
                <span className="text-sm font-medium text-nemo-accent">Nouvelle liste</span>
              </button>
            </div>

            {/* Safe area bottom padding */}
            <div className="pb-safe" />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <CreateListModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
