import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Target, Users, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const campaigns = [
  {
    id: "CAM001",
    name: "Clean Water for Villages",
    category: "Healthcare",
    status: "Active",
    raised: 45000,
    goal: 60000,
    donors: 328,
    startDate: "2024-11-01",
    endDate: "2025-02-01",
    image: "https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "CAM002",
    name: "Education for Orphans",
    category: "Education",
    status: "Active",
    raised: 32000,
    goal: 50000,
    donors: 245,
    startDate: "2024-10-15",
    endDate: "2025-03-15",
    image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "CAM003",
    name: "Emergency Medical Fund",
    category: "Medical",
    status: "Urgent",
    raised: 78000,
    goal: 100000,
    donors: 512,
    startDate: "2024-12-01",
    endDate: "2025-01-15",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "CAM004",
    name: "Winter Relief Program",
    category: "Relief",
    status: "Completed",
    raised: 75000,
    goal: 75000,
    donors: 890,
    startDate: "2024-09-01",
    endDate: "2024-12-01",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&auto=format&fit=crop&q=80",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-success/10 text-success border-success/20";
    case "Urgent":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "Completed":
      return "bg-primary/10 text-primary border-primary/20";
    default:
      return "bg-muted text-muted-foreground border-muted";
  }
};

const Campaigns = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{t("dashboard.campaignsPage.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.campaignsPage.subtitle")}</p>
        </div>
        <Button variant="default">
          <Plus className="w-4 h-4 mr-2" />
          {t("dashboard.campaignsPage.createCampaign")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("dashboard.campaignsPage.searchPh")}
            className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          {t("dashboard.campaignsPage.filters")}
        </Button>
      </div>

      {/* Campaign Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-40 overflow-hidden">
              <img
                src={campaign.image}
                alt={campaign.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{campaign.id}</p>
                  <h3 className="font-semibold text-foreground text-lg">{campaign.name}</h3>
                </div>
                <Badge variant="outline" className={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-primary">
                    ${campaign.raised.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    of ${campaign.goal.toLocaleString()}
                  </span>
                </div>
                <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{campaign.donors}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{campaign.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{campaign.endDate}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Campaigns;
