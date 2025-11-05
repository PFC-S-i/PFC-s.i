"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/button";
import { fetchMe, updateMe } from "@/services/user.service";
import { getAuthToken } from "@/services/login.service";
import { useAuth } from "@/context/auth.context";
import { getErrMsg } from "./lib/utils";
import AccountCard from "./sections/account-card";
import FavoritesDemo from "./sections/favorites-demo";
import PasswordCard from "./sections/password-card";
import { CARD } from "./lib/ui";

export default function ProfileView() {
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

  // submit da troca de senha (bem simples, só valida front)
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

      // aqui você poderia chamar um service ex.: updatePassword(...)
      // await updatePassword({ currentPassword, newPassword });

      setPwdSuccess("Senha atualizada.");
      // limpa campos de senha
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwdError(getErrMsg(err) || "Não foi possível atualizar a senha.");
    } finally {
      setPwdLoading(false);
    }
  }

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

      <div className={`${CARD} mt-8 p-6`}>
        <div className="flex justify-end">
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
    </main>
  );
}
