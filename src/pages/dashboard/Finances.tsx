import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";

const transactions = [
  { id: "TXN001", type: "income", description: "Donation - Sarah Mitchell", amount: 500, date: "2024-12-28", category: "Individual" },
  { id: "TXN002", type: "expense", description: "Medical Supplies Purchase", amount: 2500, date: "2024-12-27", category: "Operations" },
  { id: "TXN003", type: "income", description: "Corporate Donation - TechCorp", amount: 10000, date: "2024-12-26", category: "Corporate" },
  { id: "TXN004", type: "expense", description: "Event Venue Booking", amount: 1500, date: "2024-12-25", category: "Events" },
  { id: "TXN005", type: "income", description: "Fundraising Gala Proceeds", amount: 25000, date: "2024-12-24", category: "Events" },
  { id: "TXN006", type: "expense", description: "Staff Salaries", amount: 8000, date: "2024-12-23", category: "Admin" },
];

const Finances = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Finances</h1>
          <p className="text-muted-foreground">Track income, expenses, and financial health</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="default">
            <DollarSign className="w-4 h-4 mr-2" />
            Record Transaction
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income (MTD)"
          value="$124,500"
          change="+18%"
          trend="up"
          icon={TrendingUp}
          iconColor="text-success"
          iconBgColor="bg-success/10"
        />
        <StatCard
          title="Total Expenses (MTD)"
          value="$42,300"
          change="+5%"
          trend="up"
          icon={TrendingDown}
          iconColor="text-destructive"
          iconBgColor="bg-destructive/10"
        />
        <StatCard
          title="Net Balance"
          value="$82,200"
          change="+24%"
          trend="up"
          icon={DollarSign}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
        />
        <StatCard
          title="Pending Donations"
          value="$15,000"
          icon={DollarSign}
          iconColor="text-warning"
          iconBgColor="bg-warning/10"
        />
      </div>

      {/* Transactions */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Transaction</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Category</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Date</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-border hover:bg-muted/30 transition-colors">
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
