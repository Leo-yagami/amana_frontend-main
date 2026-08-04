import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { authApi } from "@/services/api.service";
import { useAuth } from "@/contexts/AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setAuthSession } = useAuth();

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
          (window as any).__isTransitioning = true;
          const redirectTo = localStorage.getItem('redirectTo') || '/dashboard';
          localStorage.removeItem('redirectTo');
          // Verify it works by hitting /me
          const meRes = await authApi.getCurrentUser();
          if (meRes.data) {
            setAuthSession(token, user);
            if ((window as any).__animateRouteTransition) {
              (window as any).__animateRouteTransition(redirectTo);
            } else {
              navigate(redirectTo, { replace: true });
            }
          } else {
            (window as any).__isTransitioning = false;
            navigate("/login?error=google_callback_failed", { replace: true });
          }
        } else {
          (window as any).__isTransitioning = false;
          navigate("/login?error=google_callback_failed", { replace: true });
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        (window as any).__isTransitioning = false;
        navigate("/login?error=google_callback_failed", { replace: true });
      }
    };

    run();
  }, [navigate]);

  return (
    <div className="min-h-svh flex items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("authCallback.signingIn")}
      </div>
    </div>
  );
};

export default AuthCallback;