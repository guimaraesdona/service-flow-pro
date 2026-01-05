import { TopNav } from "@/components/layout/TopNav";
import { Bell, CheckCircle, AlertCircle, Info, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Ordem finalizada",
    message: "A ordem #003 foi marcada como finalizada.",
    time: "Há 2 horas",
    read: false,
  },
  {
    id: "2",
    type: "warning",
    title: "Ordem aguardando",
    message: "A ordem #002 está aguardando aprovação do cliente.",
    time: "Há 5 horas",
    read: false,
  },
  {
    id: "3",
    type: "info",
    title: "Novo cliente cadastrado",
    message: "Paula Costa foi adicionada à sua lista de clientes.",
    time: "Ontem",
    read: true,
  },
  {
    id: "4",
    type: "success",
    title: "Pagamento recebido",
    message: "Pagamento de R$ 180,00 confirmado para ordem #003.",
    time: "Ontem",
    read: true,
  },
];

const iconMap = {
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: "bg-status-finished/15 text-status-finished",
  warning: "bg-status-waiting/15 text-status-waiting",
  info: "bg-status-progress/15 text-status-progress",
};

export default function NotificationsPage() {
  const notifications = mockNotifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="page-container bg-background">
      <TopNav title="Notificações" />

      <div className="content-container">
        {notifications.length > 0 ? (
          <>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mb-4 animate-fade-in">
                {unreadCount} {unreadCount === 1 ? "nova notificação" : "novas notificações"}
              </p>
            )}

            <div className="space-y-3">
              {notifications.map((notification, index) => {
                const Icon = iconMap[notification.type];

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "card-elevated p-4 flex gap-4 hover:shadow-soft transition-all animate-slide-up cursor-pointer",
                      !notification.read && "border-l-4 border-l-primary"
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", colorMap[notification.type])}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={cn("font-semibold text-foreground", !notification.read && "text-primary")}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {notification.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Sem notificações</h3>
            <p className="text-muted-foreground">Você está em dia!</p>
          </div>
        )}
      </div>
    </div>
  );
}
