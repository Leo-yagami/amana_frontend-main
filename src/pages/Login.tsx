import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

/** Colored Google "G" for OAuth button */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const Login = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    localStorage.setItem('redirectTo', redirectTo);
    const apiOrigin = import.meta.env.VITE_API_URL || '';
    window.location.assign(`${apiOrigin}/api/auth/google`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      (window as any).__isTransitioning = true;
      await login({ email, password });
      const hasPlayed = sessionStorage.getItem("amana-auth-transition-played");
      if (!hasPlayed && (window as any).__animateRouteTransition) {
        sessionStorage.setItem("amana-auth-transition-played", "1");
        (window as any).__animateRouteTransition(redirectTo);
      } else {
        (window as any).__isTransitioning = false;
        navigate(redirectTo);
      }
    } catch (err: any) {
      (window as any).__isTransitioning = false;
      setError(err.response?.data?.message || t("auth.loginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-svh w-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 sm:p-6 md:p-8 py-8">
      <Card className="w-full max-w-md shadow-lg border-border/60">
        <CardHeader className="space-y-1.5 p-6 sm:p-8 pb-4 sm:pb-4">
          <CardTitle className="text-2xl font-bold text-center">{t("auth.signInTitle", "Welcome Back")}</CardTitle>
          <CardDescription className="text-center text-sm text-muted-foreground">
            {t("auth.signInSubtitle", "Sign in to your account to continue")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-0 sm:pt-0 space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-border bg-background text-foreground hover:bg-muted/80 flex items-center justify-center gap-2 font-medium"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <GoogleIcon className="h-5 w-5 shrink-0" />
            {t("auth.continueGoogle", "Continue with Google")}
          </Button>

          <div className="flex items-center gap-3 my-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap uppercase tracking-wider">
              {t("auth.orSignInEmail", "or sign in with email")}
            </span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email", "Email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password", "Password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.signingIn", "Signing in...")}
                </>
              ) : (
                t("auth.signIn", "Sign In")
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              {t("auth.dontHaveAccount", "Don't have an account?")}{" "}
              <Link to={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`} className="text-primary hover:underline font-medium">
                {t("auth.signUpLink", "Sign up")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
