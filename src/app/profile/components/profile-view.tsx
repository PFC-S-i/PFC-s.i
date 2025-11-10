"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserX } from "lucide-react";
import { Button } from "@/components/button";
import { fetchMe, updateMe, deleteMe } from "@/services/user.service";
import { getAuthToken } from "@/services/login.service";
import { useAuth } from "@/context/auth.context";
import { getErrMsg } from "./lib/utils";
import AccountCard from "./sections/account-card";
import FavoritesDemo from "./sections/favorites-demo";
import PasswordCard from "./sections/password-card";
import { CARD } from "./lib/ui";
import { changePassword } from "@/services/password.service";

export default function ProfileView() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [origName, setOrigName] = useState("");
  const [origEmail, setOrigEmail] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // exclusão
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { logout } = useAuth();

  // carrega perfil
  useEffect(() => {
    const token = getAuthToken?.();
    if (!token) return;

    setProfileLoading(true);
    fetchMe()
      .then((me) => {
        const n = me.name ?? "";
        const e = me.email ?? "";
        setName(n);
        setEmail(e);
        setOrigName(n);
        setOrigEmail(e);
      })
      .catch((err) =>
        setError(getErrMsg(err) || "Não foi possível carregar seu perfil.")
      )
      .finally(() => setProfileLoading(false));
  }, []);

  function toggleEdit() {
    if (isEditing) {
      // cancelar edição
      setName(origName);
      setEmail(origEmail);
      setSuccess(null);
      setError(null);
      setIsEditing(false);
    } else {
      // iniciar edição
      setSuccess(null);
      setError(null);
      setIsEditing(true);
    }
  }

  async function saveProfile() {
    try {
      setSaveLoading(true);
      setSuccess(null);
      setError(null);

      const updated = await updateMe({ name: name.trim() });

      const n = updated.name ?? "";
      const e = updated.email ?? "";
      setName(n);
      setEmail(e);
      setOrigName(n);
      setOrigEmail(e);

      setIsEditing(false);
      setSuccess("Informações atualizadas.");
    } catch (err) {
      setError(getErrMsg(err) || "Não foi possível salvar.");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handlePasswordSubmit() {
    setPwdLoading(true);
    setPwdSuccess(null);
    setPwdError(null);

    try {
      if (!currentPassword.trim()) {
        setPwdError("Informe a senha atual.");
        return;
      }
      if (!newPassword.trim()) {
        setPwdError("Informe a nova senha.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setPwdError("As senhas não coincidem.");
        return;
      }

      await changePassword(currentPassword.trim(), newPassword.trim());

      setPwdSuccess("Senha atualizada.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwdError(getErrMsg(err) || "Não foi possível atualizar a senha.");
    } finally {
      setPwdLoading(false);
    }
  }

  async function confirmDeleteAccount() {
    try {
      setDeleteLoading(true);
      setDeleteError(null);

      await deleteMe(); // 🔗 integração real com o backend

      // encerra sessão no front e redireciona
      logout();
      router.push("/?account_deleted=1");
    } catch (err) {
      setDeleteError(getErrMsg(err) || "Falha ao excluir a conta.");
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  }

  // fecha modal com ESC
  useEffect(() => {
    if (!deleteOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDeleteOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteOpen]);

  return (
    <main className="py-10 px-4 text-gray-200 md:px-10 lg:px-20 xl:px-32">
      <h1 className="mb-2 text-3xl font-semibold">Meu perfil</h1>

      <AccountCard
        name={name}
        email={email}
        isEditing={isEditing}
        loading={profileLoading}
        saveLoading={saveLoading}
        error={error}
        success={success}
        onChangeName={setName}
        onChangeEmail={setEmail}
        onToggleEdit={toggleEdit}
        onSave={saveProfile}
      />

      <FavoritesDemo />

      <PasswordCard
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        onChangeCurrent={setCurrentPassword}
        onChangeNew={setNewPassword}
        onChangeConfirm={setConfirmPassword}
        loading={pwdLoading}
        error={pwdError}
        success={pwdSuccess}
        onSubmit={handlePasswordSubmit}
      />

      {/* Ações: Excluir (esquerda) e Sair (direita) */}
      <div className={`${CARD} mt-8 p-6`}>
        <div className="flex items-center justify-between">
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={() => setDeleteOpen(true)}
            title="Excluir permanentemente sua conta"
          >
            <UserX size={18} />
            Excluir conta
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={logout}
          >
            <LogOut size={18} />
            Sair
          </Button>
        </div>
      </div>

      {/* Modal de confirmação */}
      {deleteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          className="fixed inset-0 z-50 grid place-items-center"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
            onClick={() => setDeleteOpen(false)}
          />
          <div className="relative z-10 w-[92vw] max-w-md rounded-xl bg-[#1B1B1B] p-6 shadow-xl">
            <h2 id="delete-title" className="text-lg font-semibold">
              Excluir conta?
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Esta ação é <span className="text-red-400">permanente</span> e não poderá ser desfeita.
            </p>

            {deleteError && (
              <p className="mt-3 text-sm text-red-400" aria-live="polite">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-2"
                onClick={confirmDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Excluindo..." : (<><UserX size={16} /> Excluir conta</>)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
