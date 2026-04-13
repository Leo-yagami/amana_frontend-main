import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileBarChart, Users, Calendar, DollarSign } from "lucide-react";
import FinancialReport from "./reports/FinancialReport";
import BeneficiaryReport from "./reports/BeneficiaryReport";
import EventReport from "./reports/EventReport";
import DonorReport from "./reports/DonorReport";

const Reports = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights and data analysis</p>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Financial</span>
          </TabsTrigger>
          <TabsTrigger value="beneficiary" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Beneficiaries</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          <TabsTrigger value="donors" className="flex items-center gap-2">
            <FileBarChart className="w-4 h-4" />
            <span className="hidden sm:inline">Donors</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="mt-6">
          <FinancialReport />
        </TabsContent>

        <TabsContent value="beneficiary" className="mt-6">
          <BeneficiaryReport />
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <EventReport />
        </TabsContent>

        <TabsContent value="donors" className="mt-6">
          <DonorReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
