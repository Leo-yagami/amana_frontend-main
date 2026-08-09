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
          // IMPORTANT: Save token to localStorage FIRST so the axios
          // interceptor can attach it as a Bearer header on subsequent
          // requests. Previously this was done after /me, but on mobile
          // browsers the HttpOnly cookie from the exchange response is
          // often dropped by the Vercel proxy, causing /me to fail.
          setAuthSession(token, user);

          (window as any).__isTransitioning = true;
          const redirectTo = localStorage.getItem('redirectTo') || '/dashboard';
          localStorage.removeItem('redirectTo');

          // Verify the session is valid by hitting /me
          try {
            await authApi.getCurrentUser();
          } catch {
            // /me failed — clear auth and bail
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            (window as any).__isTransitioning = false;
            navigate("/login?error=google_callback_failed", { replace: true });
            return;
          }

          const hasPlayed = sessionStorage.getItem("amana-auth-transition-played");
          if (!hasPlayed && (window as any).__animateRouteTransition) {
            sessionStorage.setItem("amana-auth-transition-played", "1");
            (window as any).__animateRouteTransition(redirectTo);
          } else {
            (window as any).__isTransitioning = false;
            navigate(redirectTo, { replace: true });
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