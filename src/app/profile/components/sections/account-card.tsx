import { Pencil, X } from "lucide-react";
import { Button } from "@/components/button";
import { CARD } from "../lib/ui";
import Alert from "../ui/alert";
import LabeledInput from "../ui/labeled-input";

type Props = {
  name: string;
  email: string;
  isEditing: boolean;
  loading: boolean;
  saveLoading: boolean;
  error?: string | null;
  success?: string | null;
  onChangeName: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onToggleEdit: () => void;
  onSave: () => void;
};

export default function AccountCard(props: Props) {
  const {
    name,
    email,
    isEditing,
    loading,
    saveLoading,
    error,
    success,
    onChangeName,
    onChangeEmail,
    onToggleEdit,
    onSave,
  } = props;

  // só o nome habilita quando estiver editando
  const nameDisabled = loading || !isEditing;

  return (
    <section className={`${CARD} p-6 mb-8`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Informações da conta</h2>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              className="rounded-md border border-white/10 px-3 py-1.5 hover:bg-white/5"
              onClick={onToggleEdit}
              aria-label="Editar informações"
              disabled={loading}
              title="Editar"
            >
              <span className="flex items-center gap-2">
                <Pencil size={16} />
                <span className="text-sm">Editar</span>
              </span>
            </button>
          ) : (
            <button
              type="button"
              className="rounded-md border border-white/10 px-3 py-1.5 hover:bg-white/5"
              onClick={onToggleEdit}
              title="Cancelar"
            >
              <span className="flex items-center gap-2">
                <X size={16} />
                <span className="text-sm">Cancelar</span>
              </span>
            </button>
          )}
        </div>
      </div>

      {error ? <Alert kind="error">{error}</Alert> : null}
      {success ? <Alert kind="success">{success}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <LabeledInput
          id="name"
          label="Nome"
          value={name}
          onChange={onChangeName}
          placeholder={loading ? "Carregando..." : ""}
          disabled={nameDisabled}
        />

        {/* E-mail sempre somente leitura (desabilitado) */}
        <LabeledInput
          id="email"
          label="E-mail"
          type="email"
          value={email}
          onChange={onChangeEmail}
          placeholder={loading ? "Carregando..." : ""}
          disabled
        />
      </div>

      <div className="mt-6">
        <Button
          variant="outline"
          className="px-5"
          onClick={onSave}
          disabled={saveLoading || loading || !isEditing}
          aria-disabled={saveLoading || loading || !isEditing}
          title={
            !isEditing ? "Clique em Editar para alterar o nome" : undefined
          }
        >
          {saveLoading ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </section>
  );
}
