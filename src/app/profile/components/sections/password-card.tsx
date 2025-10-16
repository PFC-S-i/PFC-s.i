import { Button } from "@/components/button";
import { CARD } from "../lib/ui";
import Alert from "../ui/alert";
import LabeledInput from "../ui/labeled-input";

type Props = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onChangeCurrent: (v: string) => void;
  onChangeNew: (v: string) => void;
  onChangeConfirm: (v: string) => void;
  loading: boolean;
  error?: string | null;
  success?: string | null;
  onSubmit: () => void;
};

export default function PasswordCard(props: Props) {
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    onChangeCurrent,
    onChangeNew,
    onChangeConfirm,
    loading,
    error,
    success,
    onSubmit,
  } = props;

  return (
    <section className={`${CARD} p-6`}>
      <h2 className="text-xl font-medium mb-4">Alterar senha</h2>

      {error ? <Alert kind="error">{error}</Alert> : null}
      {success ? <Alert kind="success">{success}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <LabeledInput
          id="currentPassword"
          label="Senha atual"
          type="password"
          value={currentPassword}
          onChange={onChangeCurrent}
        />
        <LabeledInput
          id="newPassword"
          label="Nova senha"
          type="password"
          value={newPassword}
          onChange={onChangeNew}
        />
        <LabeledInput
          id="confirmPassword"
          label="Confirmar nova senha"
          type="password"
          value={confirmPassword}
          onChange={onChangeConfirm}
        />
      </div>

      <div className="mt-6">
        <Button
          variant="outline"
          className="px-5"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? "Alterando..." : "Alterar senha"}
        </Button>
      </div>
    </section>
  );
}
