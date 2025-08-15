import { useToast } from "@/hooks";
import { isAxiosError } from "axios";

const useHandleError = () => {
  const { toast } = useToast();

  function extractErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
      if (error.response) {
        return error.response.data?.detail;
      }
      if (error.request) {
        return "Erro na solicitação: Nenhuma resposta recebida do servidor.";
      }
      return error.message;
    }

    return error instanceof Error ? error.message : "Erro desconhecido.";
  }

  function handleError(error: unknown, title = "Erro") {
    toast({
      title,
      description: extractErrorMessage(error),
      variant: "destructive",
    });
  }

  return { handleError };
};

export { useHandleError };
