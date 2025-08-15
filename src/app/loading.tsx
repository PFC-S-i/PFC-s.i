import { Spinner } from "@/components/spinner";

interface Props {
  loadingMessage?: string;
}

export default function Loading({ loadingMessage = "Carregando..." }: Props) {
  return (
    <div className="flex h-full w-full items-center justify-center gap-2">
      <Spinner className="text-primary" />
      <p>{loadingMessage}</p>
    </div>
  );
}
