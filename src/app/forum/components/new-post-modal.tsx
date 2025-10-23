"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCharCounter } from "@/app/forum/hooks/useCharCounter";
import { classNames } from "@/app/forum/lib/utils";
import { type CoinOption, topCoins } from "@/services/forum.service";
import { postSchema } from "@/app/schemas/post.schema";
import { Button } from "@/components";
import {
  ShadcnSelect as Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";

const formSchema = postSchema.extend({
  coin_id: z.string().min(1, "Selecione uma moeda."),
});

type NewPostForm = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    title: string;
    description: string;
    coin_id: string;
  }) => void;
};

const TITLE_MAX = 120;
const DESC_MAX = 5000;
const DEFAULT_VALUES: NewPostForm = { title: "", description: "", coin_id: "" };

export function NewPostModal({ open, onClose, onConfirm }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
    watch,
    reset,
  } = useForm<NewPostForm>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  const { ref: titleFieldRef, ...titleReg } = register("title");
  const descReg = register("description");

  const titleVal = watch("title");
  const descVal = watch("description");
  const { count: titleCount, pct: titlePct } = useCharCounter(
    titleVal,
    TITLE_MAX
  );
  const { count: descCount, pct: descPct } = useCharCounter(descVal, DESC_MAX);

  const titleRef = useRef<HTMLInputElement | null>(null);

  const [coinOptions, setCoinOptions] = useState<CoinOption[]>([]);
  const [loadingCoins, setLoadingCoins] = useState(false);

  const handleClose = useCallback(() => {
    reset(DEFAULT_VALUES);
    setCoinOptions([]);
    onClose();
  }, [onClose, reset]);

  const onValid = useCallback(
    (data: NewPostForm) => {
      onConfirm({
        title: data.title.trim(),
        description: data.description.trim(),
        coin_id: data.coin_id,
      });
      handleClose();
    },
    [onConfirm, handleClose]
  );

  const submit = useCallback(
    () => handleSubmit(onValid)(),
    [handleSubmit, onValid]
  );

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => titleRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "enter")
        void submit();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, handleClose, submit]);

  // Carrega TOP moedas ao abrir
  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try {
        setLoadingCoins(true);
        const data = await topCoins(20);
        if (alive) setCoinOptions(data);
      } catch {
        if (alive) setCoinOptions([]);
      } finally {
        if (alive) setLoadingCoins(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px]"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-post-title"
        className="fixed inset-0 z-50 grid place-items-center p-4"
        onClick={handleClose}
      >
        <div
          className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#1B1B1B] shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 px-5 pt-5">
            <div>
              <h2
                id="new-post-title"
                className="text-lg md:text-xl font-semibold"
              >
                Publicar uma notícia
              </h2>
              {loadingCoins && (
                <p className="text-xs opacity-70 mt-1">Carregando moedas…</p>
              )}
            </div>
          </div>

          <form
            className="px-5 pb-5 pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            {/* Título */}
            <label className="block text-sm font-medium mb-1" htmlFor="title">
              Título
            </label>
            <input
              id="title"
              type="text"
              placeholder="Ex.: ETF de Bitcoin bate novo recorde de volume"
              {...titleReg}
              ref={(el) => {
                titleFieldRef(el);
                titleRef.current = el;
              }}
              className={classNames(
                "w-full rounded-xl bg-[#121212] border px-3 py-2 outline-none",
                "placeholder:opacity-50",
                errors.title
                  ? "border-red-500/60"
                  : "border-white/10 focus:border"
              )}
              maxLength={TITLE_MAX}
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <p className="text-red-400 min-h-[1.25rem]">
                {errors.title?.message || "\u00A0"}
              </p>
              <Counter value={titleCount} pct={titlePct} max={TITLE_MAX} />
            </div>

            {/* Moeda */}
            <label
              className="block text-sm font-medium mt-4 mb-1"
              htmlFor="coin_id"
            >
              Moeda
            </label>
            <Controller
              name="coin_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="coin_id"
                    className={classNames(
                      "bg-[#121212] border border-white/10 rounded-xl px-3 py-2 outline-none",
                      errors.coin_id ? "ring-1 ring-red-500/60" : "focus:border"
                    )}
                  >
                    <SelectValue placeholder="Selecione uma moeda" />
                  </SelectTrigger>

                  <SelectContent
                    position="popper"
                    sideOffset={6}
                    className={classNames(
                      "max-h-64 overflow-y-auto",

                      "bg-[#1B1B1B] text-foreground border border-white/10 shadow-xl rounded-xl",

                      "z-[60]"
                    )}
                  >
                    <SelectGroup>
                      <SelectLabel className="px-2 py-1 text-xs opacity-70">
                        Moedas
                      </SelectLabel>

                      {coinOptions.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={c.id}
                          className="focus:bg-white/10 focus:text-white"
                        >
                          {c.name} ({c.symbol})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />

            <p className="mt-1 text-xs text-red-400 min-h-[1.25rem]">
              {errors.coin_id?.message || "\u00A0"}
            </p>
            {/* Descrição */}
            <label
              className="block text-sm font-medium mt-4 mb-1"
              htmlFor="description"
            >
              Descrição
            </label>
            <textarea
              id="description"
              rows={6}
              placeholder="Explique os detalhes da notícia, contexto, links de fontes, impacto no mercado, etc."
              {...descReg}
              className={classNames(
                "w-full rounded-xl bg-[#121212] border px-3 py-2 outline-none resize-y",
                "placeholder:opacity-50",
                errors.description ? "border-red-500/60" : "border-white/10  "
              )}
              maxLength={DESC_MAX}
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <p className="text-red-400 min-h-[1.25rem]">
                {errors.description?.message || "\u00A0"}
              </p>
              <Counter value={descCount} pct={descPct} max={DESC_MAX} />
            </div>

            {/* Ações */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handleClose}
                className="inline-flex items-center rounded-xl px-4 py-2 border border-white/10 hover:bg-white/5"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="default"
                disabled={!isValid || isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                title={
                  !isValid ? "Preencha os campos obrigatórios" : "Publicar"
                }
              >
                <Plus className="h-4 w-4" />
                Publicar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function Counter({
  value,
  pct,
  max,
}: {
  value: number;
  pct: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full" style={{ width: `${pct}%` }} aria-hidden />
      </div>
      <span className="tabular-nums opacity-70">
        {value}/{max}
      </span>
    </div>
  );
}
