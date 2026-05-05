import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import { useTranslation } from "react-i18next";

const transactions = [
  { id: "TXN001", type: "income", description: "Donation - Sarah Mitchell", amount: 500, date: "2024-12-28", category: "Individual" },
  { id: "TXN002", type: "expense", description: "Medical Supplies Purchase", amount: 2500, date: "2024-12-27", category: "Operations" },
  { id: "TXN003", type: "income", description: "Corporate Donation - TechCorp", amount: 10000, date: "2024-12-26", category: "Corporate" },
  { id: "TXN004", type: "expense", description: "Event Venue Booking", amount: 1500, date: "2024-12-25", category: "Events" },
  { id: "TXN005", type: "income", description: "Fundraising Gala Proceeds", amount: 25000, date: "2024-12-24", category: "Events" },
  { id: "TXN006", type: "expense", description: "Staff Salaries", amount: 8000, date: "2024-12-23", category: "Admin" },
];

const Finances = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">{t("dashboard.finances.title")}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{t("dashboard.finances.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Download className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t("dashboard.finances.export")}</span>
          </Button>
          <Button variant="default" size="sm" className="text-xs sm:text-sm">
            <DollarSign className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t("dashboard.finances.record")}</span>
            <span className="sm:hidden">{t("dashboard.finances.addShort")}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard
          title={t("dashboard.finances.statTotalIncome")}
          value="$124,500"
          change="+18%"
          trend="up"
          icon={TrendingUp}
          iconColor="text-success"
          iconBgColor="bg-success/10"
        />
        <StatCard
          title={t("dashboard.finances.statTotalExpense")}
          value="$42,300"
          change="+5%"
          trend="up"
          icon={TrendingDown}
          iconColor="text-destructive"
          iconBgColor="bg-destructive/10"
        />
        <StatCard
          title={t("dashboard.finances.statNetBalance")}
          value="$82,200"
          change="+24%"
          trend="up"
          icon={DollarSign}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
        />
        <StatCard
          title={t("dashboard.finances.statPendingDonations")}
          value="$15,000"
          icon={DollarSign}
          iconColor="text-warning"
          iconBgColor="bg-warning/10"
        />
      </div>

      <div className="bg-card rounded-lg sm:rounded-xl border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-6 border-b border-border">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">{t("dashboard.finances.recentTx")}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <Filter className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t("dashboard.finances.filter")}</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">{t("dashboard.finances.viewAll")}</span>
              <span className="sm:hidden">{t("dashboard.finances.allShort")}</span>
              <ArrowUpRight className="w-3 sm:w-4 h-3 sm:h-4 ml-1" />
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-foreground">
                  {t("dashboard.finances.colTransaction")}
                </th>
                <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-foreground hidden sm:table-cell">
                  {t("dashboard.finances.colCategory")}
                </th>
                <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-foreground hidden md:table-cell">
                  {t("dashboard.finances.colDate")}
                </th>
                <th className="text-right py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-foreground">
                  {t("dashboard.finances.colAmount")}
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-border hover:bg-muted/30 transition-colors text-xs sm:text-sm">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-foreground">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">{txn.id}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">{txn.category}</td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">{txn.date}</td>
                  <td className="py-4 px-6 text-right">
                    <span
                      className={`font-semibold ${
                        txn.type === "income" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {txn.type === "income" ? "+" : "-"}${txn.amount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finances;
