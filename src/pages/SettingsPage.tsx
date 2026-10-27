import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Building, ChevronRight, ListPlus, LogOut, MapPin, Palette, type LucideIcon } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { CustomFieldsSettings } from "@/components/settings/CustomFieldsSettings";
import { AddressSettings, AppearanceSettings, CompanySettings } from "@/components/settings/ProfileSections";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/AuthContext";
import { useDesktop } from "@/hooks/use-desktop";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { Profile } from "@/types";

interface Section {
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
  Content: () => JSX.Element;
}

const SECTIONS: Section[] = [
  { slug: "empresa", label: "Empresa", description: "Logo, nome e contato que saem na OS impressa.", icon: Building, Content: CompanySettings },
  { slug: "endereco", label: "Endereço", description: "Endereço da empresa na OS impressa.", icon: MapPin, Content: AddressSettings },
  { slug: "aparencia", label: "Aparência", description: "Tema do aplicativo neste aparelho.", icon: Palette, Content: AppearanceSettings },
  {
    slug: "campos",
    label: "Campos personalizados",
    description: "Campos extras nos cadastros de ordens, clientes e serviços.",
    icon: ListPlus,
    Content: CustomFieldsSettings,
  },
];

const THEME_LABEL = { light: "Claro", dark: "Escuro", system: "Automático" } as const;

// Resumo do que está salvo em cada seção, para a lista do celular.
const summary = (slug: string, profile: Profile | null | undefined, theme: keyof typeof THEME_LABEL) => {
  if (slug === "empresa") return profile?.name || "Não preenchido";
  if (slug === "endereco") return [profile?.city, profile?.state].filter(Boolean).join(" / ") || "Não preenchido";
  if (slug === "aparencia") return THEME_LABEL[theme];
  return "Ordens, clientes e serviços";
};

function useLogout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return async () => {
    await signOut();
    navigate("/");
  };
}

function SectionPanel({ section }: { section: Section }) {
  return (
    <section aria-labelledby={`settings-${section.slug}`} className="card-elevated p-5 lg:p-6">
      {/* No celular o título já está no TopNav. */}
      <h2 id={`settings-${section.slug}`} className="sr-only lg:not-sr-only text-base font-semibold text-foreground">
        {section.label}
      </h2>
      <p className="text-sm text-muted-foreground mb-5 lg:mt-1">{section.description}</p>
      <section.Content />
    </section>
  );
}

// Celular: a raiz é uma lista de seções e cada uma abre em tela própria.
function MobileSettings({ section }: { section?: Section }) {
  const { profile } = useProfile();
  const { theme } = useTheme();
  const logout = useLogout();

  if (section) {
    return (
      <div>
        <TopNav title={section.label} showBack backTo="/configuracoes" />
        <div className="content-container">
          <SectionPanel section={section} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopNav title="Configurações" />
      <div className="content-container space-y-4">
        <nav aria-label="Seções das configurações">
          <ul className="card-elevated divide-y divide-border">
            {SECTIONS.map(({ slug, label, icon: Icon }) => (
              <li key={slug}>
                <Link to={`/configuracoes/${slug}`} className="flex items-center gap-3 px-4 min-h-16 py-3 active:bg-muted/60">
                  <span className="w-9 h-9 shrink-0 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                    <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-foreground">{label}</span>
                    <span className="block text-xs text-muted-foreground truncate">{summary(slug, profile, theme)}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={logout}
          className="card-elevated w-full flex items-center gap-3 px-4 h-14 text-sm font-medium text-destructive active:bg-destructive/10"
        >
          <LogOut className="w-[18px] h-[18px]" aria-hidden="true" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}

// Desktop: menu lateral e a seção aberta ao lado (o "Sair" fica no Sidebar).
function DesktopSettings({ section }: { section: Section }) {
  return (
    <div>
      <DesktopHeader title="Configurações" />
      <div className="content-container grid grid-cols-[15rem_minmax(0,1fr)] gap-8 items-start">
        <nav aria-label="Seções das configurações" className="sticky top-24 space-y-0.5">
          {SECTIONS.map(({ slug, label, icon: Icon }) => {
            const active = slug === section.slug;
            return (
              <Link
                key={slug}
                to={`/configuracoes/${slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 h-9 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="max-w-2xl">
          <SectionPanel section={section} />
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { section: slug } = useParams();
  const section = SECTIONS.find((s) => s.slug === slug);
  const desktop = useDesktop();

  if (slug && !section) return <Navigate to="/configuracoes" replace />;

  return (
    <div className="page-container bg-background">
      {desktop ? <DesktopSettings section={section ?? SECTIONS[0]} /> : <MobileSettings section={section} />}
    </div>
  );
}
