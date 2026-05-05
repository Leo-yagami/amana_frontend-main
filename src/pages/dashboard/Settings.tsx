import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Building,
  Bell,
  Shield,
  Save,
  Upload,
  Users,
  Lock,
  Mail,
  Phone,
  MapPin,
  Globe,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Loading states
  const [profileLoading, setProfileLoading] = useState(true);
  const [orgLoading, setOrgLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState("profile");

  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
  });

  // Organization state
  const [orgData, setOrgData] = useState({
    name: "HopeBridge Charity",
    address: "",
    city: "",
    country: "Ethiopia",
    phone: "",
    email: "",
    website: "",
    description: "",
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    donationAlerts: true,
    eventReminders: true,
    weeklyReports: false,
    systemUpdates: true,
  });

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/me");
        const data = response.data;
        setProfileData({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch organization settings on mount
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await api.get("/organization");
        const data = response.data;
        setOrgData({
          name: data.name || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "Ethiopia",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          description: data.description || "",
        });
      } catch (error) {
        console.error("Failed to fetch organization:", error);
      } finally {
        setOrgLoading(false);
      }
    };
    fetchOrganization();
  }, []);

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      await api.put("/auth/me", profileData);
      toast.success(t("dashboard.settingsScreen.toastProfileOk"));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("dashboard.settingsScreen.toastProfileErr"));
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("dashboard.settingsScreen.toastPwdMismatch"));
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error(t("dashboard.settingsScreen.toastPwdShort"));
      return;
    }
    try {
      setSaving(true);
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success(t("dashboard.settingsScreen.toastPwdOk"));
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("dashboard.settingsScreen.toastPwdErr"));
    } finally {
      setSaving(false);
    }
  };

  // Handle organization update
  const handleOrgUpdate = async () => {
    try {
      setSaving(true);
      await api.put("/organization", orgData);
      toast.success("Organization settings updated successfully");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update organization"
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle notification update
  const handleNotificationUpdate = () => {
    toast.success("Notification preferences saved");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          {t("dashboard.settingsScreen.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.settingsScreen.subtitle")}
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{t("dashboard.settingsScreen.tabProfile")}</span>
          </TabsTrigger>
          {false && (<TabsTrigger value="organization" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span className="hidden sm:inline">Organization</span>
          </TabsTrigger>)}
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">{t("dashboard.settingsScreen.tabSecurity")}</span>
          </TabsTrigger>
          {false && (<TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>)}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          {profileLoading ? (
            <Card>
              <CardContent className="p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.settingsScreen.profileCardTitle")}</CardTitle>
                <CardDescription>
                  {t("dashboard.settingsScreen.profileCardDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="text-2xl">
                      {profileData.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      {t("dashboard.settingsScreen.changePhoto")}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t("dashboard.settingsScreen.photoHint")}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Profile Fields */}
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            fullName: e.target.value,
                          })
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">{t("common.phone")}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                        className="pl-10"
                        placeholder={t("dashboard.settingsScreen.phonePh")}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="role">{t("common.role")}</Label>
                    <Input
                      id="role"
                      value={profileData.role}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("common.contactAdminRole")}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("common.saving")}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {t("dashboard.settingsScreen.saveChanges")}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Organization Tab */}
        {false && (
          <TabsContent value="organization" className="space-y-6 mt-6">
          {orgLoading ? (
            <Card>
              <CardContent className="p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                  Manage your organization&apos;s information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={orgData.name}
                    onChange={(e) =>
                      setOrgData({ ...orgData, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="orgAddress">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="orgAddress"
                      value={orgData.address}
                      onChange={(e) =>
                        setOrgData({ ...orgData, address: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="orgCity">City</Label>
                    <Input
                      id="orgCity"
                      value={orgData.city}
                      onChange={(e) =>
                        setOrgData({ ...orgData, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="orgCountry">Country</Label>
                    <Input
                      id="orgCountry"
                      value={orgData.country}
                      onChange={(e) =>
                        setOrgData({ ...orgData, country: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="orgPhone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="orgPhone"
                        type="tel"
                        value={orgData.phone}
                        onChange={(e) =>
                          setOrgData({ ...orgData, phone: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="orgEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="orgEmail"
                        type="email"
                        value={orgData.email}
                        onChange={(e) =>
                          setOrgData({ ...orgData, email: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="orgWebsite">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="orgWebsite"
                      type="url"
                      value={orgData.website}
                      onChange={(e) =>
                        setOrgData({ ...orgData, website: e.target.value })
                      }
                      className="pl-10"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="orgDescription">Description</Label>
                  <Textarea
                    id="orgDescription"
                    value={orgData.description}
                    onChange={(e) =>
                      setOrgData({ ...orgData, description: e.target.value })
                    }
                    rows={4}
                    placeholder="Describe your organization's mission and activities..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleOrgUpdate} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Organization
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Management (Admin Only) */}
          {user?.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage system users and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Manage Users</p>
                    <p className="text-sm text-muted-foreground">
                      Add, edit, or remove user accounts
                    </p>
                  </div>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        )}
        

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.settingsScreen.securityTitle")}</CardTitle>
              <CardDescription>
                {t("dashboard.settingsScreen.securityDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">{t("dashboard.settingsScreen.currentPassword")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newPassword">{t("dashboard.settingsScreen.newPassword")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.settingsScreen.passwordHint")}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">{t("dashboard.settingsScreen.confirmNewPassword")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handlePasswordChange} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("dashboard.settingsScreen.changingPassword")}
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      {t("dashboard.settingsScreen.changePasswordButton")}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>Manage your active sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">
                    Logged in from this device
                  </p>
                </div>
                <Button variant="outline">View Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        {false && (
          <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      emailNotifications: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="donationAlerts">Donation Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new donations are received
                  </p>
                </div>
                <Switch
                  id="donationAlerts"
                  checked={notifications.donationAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      donationAlerts: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="eventReminders">Event Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders for upcoming events and activities
                  </p>
                </div>
                <Switch
                  id="eventReminders"
                  checked={notifications.eventReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      eventReminders: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weeklyReports">Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly summary reports via email
                  </p>
                </div>
                <Switch
                  id="weeklyReports"
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      weeklyReports: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="systemUpdates">System Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about system updates and maintenance
                  </p>
                </div>
                <Switch
                  id="systemUpdates"
                  checked={notifications.systemUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      systemUpdates: checked,
                    })
                  }
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleNotificationUpdate}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}
        
      </Tabs>
    </div>
  );
};

export default Settings;
