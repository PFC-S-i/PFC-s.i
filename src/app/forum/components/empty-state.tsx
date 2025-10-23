import { Button } from "@/components";
import { Plus } from "lucide-react";

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-[#1B1B1B] p-8 text-center">
      <p className="text-sm md:text-base opacity-80">
        Nenhuma publicação por aqui ainda.
      </p>
      <Button
        type="button"
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 hover:bg-white/5"
      >
        <Plus className="h-4 w-4" />
        Publicar a primeira notícia
      </Button>
    </div>
  );
}
