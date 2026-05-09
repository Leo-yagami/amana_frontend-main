import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { authApi } from "@/services/api.service";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          navigate("/login?error=missing_code", { replace: true });
          return;
        }

        const res = await authApi.exchangeGoogleCode(code);
        const { token, user } = res.data;

        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Verify it works by hitting /me
          const meRes = await authApi.getCurrentUser();
          if (meRes.data) {
            window.location.href = "/payment"; // Use full reload to initialize AuthContext
          } else {
            navigate("/login?error=google_callback_failed", { replace: true });
          }
        } else {
          navigate("/login?error=google_callback_failed", { replace: true });
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        navigate("/login?error=google_callback_failed", { replace: true });
      }
    };

    run();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("authCallback.signingIn")}
      </div>
    </div>
  );
};

export default AuthCallback;