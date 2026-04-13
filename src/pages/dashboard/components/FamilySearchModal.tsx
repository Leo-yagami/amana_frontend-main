import { useState, useEffect } from "react";
import { familyApi } from "@/services/api.service";
import { Family } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users, AlertCircle, ArrowRight, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FamilySearchModalProps {
  open: boolean;
  onClose: () => void;
  onFamilySelected: (familyId: string) => void;
  onSkip: () => void;
}

const FamilySearchModal = ({
  open,
  onClose,
  onFamilySelected,
  onSkip,
}: FamilySearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setFamilies([]);
      setSearched(false);
    }
  }, [open]);

  // Search families
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Enter search term",
        description: "Please enter a family name or code to search",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const response = await familyApi.getAll({
        search: searchTerm,
        limit: 20,
      });
      setFamilies(response.data.data);
      
      if (response.data.data.length === 0) {
        toast({
          title: "No families found",
          description: "Try a different search term or register a new family",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to search families",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search for Existing Family
          </DialogTitle>
          <DialogDescription>
            Before adding a beneficiary, check if their family is already registered to avoid duplicates.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Search by family name, family code, or head of family name 
            to prevent duplicate registrations.
          </AlertDescription>
        </Alert>

        {/* Search Input */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by family name, code, or head of family..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || !searchTerm.trim()}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Search Results */}
          {searched && (
            <div className="border rounded-lg">
              <div className="p-3 bg-muted font-medium text-sm">
                Search Results ({families.length})
              </div>
              <ScrollArea className="max-h-[300px]">
                {families.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="mb-2">No families found matching "{searchTerm}"</p>
                    <p className="text-sm">
                      This might be a new family. You can skip and register them.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {families.map((family) => (
                      <div
                        key={family.id}
                        className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between"
                        onClick={() => onFamilySelected(family.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{family.familyName}</span>
                            <Badge variant="outline" className="text-xs">
                              {family.familyCode}
                            </Badge>
                            {!family.registrationCompleted && (
                              <Badge variant="secondary" className="text-xs">
                                Incomplete
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {family.headBeneficiary?.fullName && (
                              <div>Head: {family.headBeneficiary.fullName}</div>
                            )}
                            <div className="flex gap-4">
                              {family.region && <span>Region: {family.region}</span>}
                              {family.primaryPhone && <span>Phone: {family.primaryPhone}</span>}
                            </div>
                            <div className="flex gap-2 items-center mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {family.numberOfMembers || 0} members
                              </Badge>
                              <Badge
                                variant={
                                  family.verificationStatus === "verified"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {family.verificationStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onSkip}>
              <Plus className="mr-2 h-4 w-4" />
              Skip & Register New Family
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FamilySearchModal;
