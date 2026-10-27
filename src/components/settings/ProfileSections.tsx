import { useEffect, useState } from "react";
import { Monitor, Moon, Save, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/form/ImageUploader";
import { DatePicker } from "@/components/form/DatePicker";
import { useTheme } from "@/components/theme-provider";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useStorage } from "@/hooks/useStorage";
import { maskCEP, maskDocument, maskPhone } from "@/utils/masks";
import { validateDocument, validateEmail } from "@/utils/validations";
import { cn } from "@/lib/utils";
import { Profile } from "@/types";

type TextKey = "name" | "email" | "phone" | "document" | "birth_date" | "cep" | "street" | "number" | "complement" | "neighborhood" | "city" | "state";

const OPTIONAL: TextKey[] = ["complement"];

const validate = (field: TextKey, value: string) => {
  if (!value) return OPTIONAL.includes(field) ? "" : "Campo obrigatório";
  if (field === "email" && !validateEmail(value)) return "Email inválido";
  if (field === "document" && !validateDocument(value)) return "CPF/CNPJ inválido";
  return "";
};

// Estado de um pedaço do perfil: cada seção edita e salva só os próprios campos.
function useProfileForm<K extends TextKey>(keys: K[], extra?: (profile: Profile) => Partial<Profile>) {
  const { profile, updateProfile } = useProfile();
  const read = (p?: Profile | null) => Object.fromEntries(keys.map((k) => [k, (p?.[k] as string) || ""])) as Record<K, string>;

  const [values, setValues] = useState(() => read(profile));
  const [errors, setErrors] = useState<Partial<Record<K, string>>>({});

  useEffect(() => {
    if (profile) setValues(read(profile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const dirty = !!profile && keys.some((k) => values[k] !== ((profile[k] as string) || ""));

  const check = (field: K, value = values[field]) => {
    const error = validate(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const update = (field: K, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) check(field, value);
  };

  const save = async (more: Partial<Profile> = {}) => {
    const valid = keys.map((k) => check(k)).every(Boolean);
    if (!valid) {
      toast({ title: "Campos inválidos", description: "Corrija os campos destacados antes de salvar.", variant: "destructive" });
      return false;
    }
    try {
      await updateProfile.mutateAsync({ ...values, ...(profile && extra ? extra(profile) : {}), ...more });
      toast({ title: "Alterações salvas" });
      return true;
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : "Não foi possível salvar.";
      toast({
        title: "Erro ao salvar",
        description: message.includes("invalid input syntax for type date") ? "Data inválida. Verifique o formato." : message,
        variant: "destructive",
      });
      return false;
    }
  };

  return { profile, values, errors, dirty, saving: updateProfile.isPending, update, check, save };
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: (a11y: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => React.ReactNode;
}

function Field({ id, label, error, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({ id, "aria-invalid": !!error, "aria-describedby": error ? `${id}-error` : undefined })}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (error?: string) => cn("input-field", error && "border-destructive focus-visible:ring-destructive");

function SaveBar({ dirty, saving, onSave }: { dirty: boolean; saving: boolean; onSave: () => void }) {
  return (
    <div className="pt-2 flex lg:justify-end">
      <Button onClick={onSave} disabled={!dirty || saving} className="w-full lg:w-auto btn-primary">
        <Save className="w-4 h-4 mr-2" />
        {saving ? "Salvando..." : "Salvar alterações"}
      </Button>
    </div>
  );
}

export function CompanySettings() {
  const { deleteImage } = useStorage();
  const form = useProfileForm(["name", "email", "phone", "document", "birth_date"]);
  const { profile, values, errors, update, check } = form;

  const [logo, setLogo] = useState("");
  const [useLogo, setUseLogo] = useState(true);
  useEffect(() => {
    if (profile) {
      setLogo(profile.avatar_url || "");
      setUseLogo(profile.use_logo_for_print ?? true);
    }
  }, [profile]);

  const logoDirty = !!profile && (logo !== (profile.avatar_url || "") || useLogo !== (profile.use_logo_for_print ?? true));

  const handleLogo = async (url: string) => {
    // Uma imagem enviada e trocada antes de salvar não fica órfã no storage.
    if (logo && logo !== profile?.avatar_url && logo !== url) {
      await deleteImage(logo).catch((error) => console.error("Falha ao apagar imagem temporária:", error));
    }
    setLogo(url);
  };

  const handleSave = async () => {
    const previous = profile?.avatar_url;
    const saved = await form.save({ avatar_url: logo, use_logo_for_print: useLogo });
    if (saved && previous && previous !== logo) await deleteImage(previous).catch(() => {});
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <ImageUploader value={logo} onChange={handleLogo} previewClassName="w-16 h-16" />
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Logo da empresa</p>
          <div className="flex items-center gap-2">
            <Switch id="use_logo" checked={useLogo} onCheckedChange={setUseLogo} />
            <Label htmlFor="use_logo" className="text-sm font-normal text-muted-foreground cursor-pointer">
              Usar na impressão da OS
            </Label>
          </div>
        </div>
      </div>

      <Field id="name" label="Nome / Razão social" error={errors.name}>
        {(a11y) => (
          <Input {...a11y} value={values.name} onChange={(e) => update("name", e.target.value)} onBlur={() => check("name")} className={inputClass(errors.name)} placeholder="Ex: Minha Empresa LTDA" />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="email" label="Email" error={errors.email}>
          {(a11y) => (
            <Input {...a11y} type="email" value={values.email} onChange={(e) => update("email", e.target.value)} onBlur={() => check("email")} className={inputClass(errors.email)} placeholder="contato@minhaempresa.com" />
          )}
        </Field>
        <Field id="phone" label="Telefone" error={errors.phone}>
          {(a11y) => (
            <Input {...a11y} type="tel" maxLength={15} value={values.phone} onChange={(e) => update("phone", maskPhone(e.target.value))} onBlur={() => check("phone")} className={inputClass(errors.phone)} placeholder="(11) 99999-9999" />
          )}
        </Field>
        <Field id="document" label="CPF / CNPJ" error={errors.document}>
          {(a11y) => (
            <Input {...a11y} maxLength={18} value={values.document} onChange={(e) => update("document", maskDocument(e.target.value))} onBlur={() => check("document")} className={inputClass(errors.document)} placeholder="000.000.000-00" />
          )}
        </Field>
        <Field id="birth_date" label="Nascimento / abertura" error={errors.birth_date}>
          {(a11y) => (
            <DatePicker
              id={a11y.id}
              aria-describedby={a11y["aria-describedby"]}
              historical
              value={values.birth_date}
              invalid={!!errors.birth_date}
              onChange={(next) => update("birth_date", next)}
              onBlur={() => check("birth_date")}
            />
          )}
        </Field>
      </div>

      <SaveBar dirty={form.dirty || logoDirty} saving={form.saving} onSave={handleSave} />
    </div>
  );
}

export function AddressSettings() {
  const form = useProfileForm(["cep", "street", "number", "complement", "neighborhood", "city", "state"]);
  const { values, errors, update, check } = form;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 grid-cols-3">
        <Field id="cep" label="CEP" error={errors.cep} className="col-span-3 sm:col-span-1">
          {(a11y) => (
            <Input {...a11y} inputMode="numeric" maxLength={9} value={values.cep} onChange={(e) => update("cep", maskCEP(e.target.value))} onBlur={() => check("cep")} className={inputClass(errors.cep)} placeholder="00000-000" />
          )}
        </Field>
        <Field id="street" label="Logradouro" error={errors.street} className="col-span-3 sm:col-span-2">
          {(a11y) => (
            <Input {...a11y} value={values.street} onChange={(e) => update("street", e.target.value)} onBlur={() => check("street")} className={inputClass(errors.street)} placeholder="Rua, avenida..." />
          )}
        </Field>
        <Field id="number" label="Número" error={errors.number}>
          {(a11y) => (
            <Input {...a11y} value={values.number} onChange={(e) => update("number", e.target.value)} onBlur={() => check("number")} className={inputClass(errors.number)} placeholder="000" />
          )}
        </Field>
        <Field id="complement" label="Complemento" className="col-span-2">
          {(a11y) => <Input {...a11y} value={values.complement} onChange={(e) => update("complement", e.target.value)} className="input-field" placeholder="Apto, sala..." />}
        </Field>
        <Field id="neighborhood" label="Bairro" error={errors.neighborhood} className="col-span-3">
          {(a11y) => (
            <Input {...a11y} value={values.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} onBlur={() => check("neighborhood")} className={inputClass(errors.neighborhood)} />
          )}
        </Field>
        <Field id="city" label="Cidade" error={errors.city} className="col-span-2">
          {(a11y) => (
            <Input {...a11y} value={values.city} onChange={(e) => update("city", e.target.value)} onBlur={() => check("city")} className={inputClass(errors.city)} />
          )}
        </Field>
        <Field id="state" label="Estado" error={errors.state}>
          {(a11y) => (
            <Input {...a11y} maxLength={2} value={values.state} onChange={(e) => update("state", e.target.value.toUpperCase())} onBlur={() => check("state")} className={inputClass(errors.state)} placeholder="UF" />
          )}
        </Field>
      </div>

      <SaveBar dirty={form.dirty} saving={form.saving} onSave={() => form.save()} />
    </div>
  );
}

const THEMES = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Automático", icon: Monitor },
] as const;

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div role="radiogroup" aria-label="Tema" className="grid grid-cols-3 gap-2">
      {THEMES.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className={cn(
              "h-20 flex flex-col items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors",
              active ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary",
            )}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
