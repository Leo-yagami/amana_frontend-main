// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { Loader2 } from "lucide-react";
// import { authApi } from "@/services/api.service";

// const AuthCallback = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const run = async () => {
//       try {
//         const params = new URLSearchParams(window.location.search);
//         const code = params.get("code");

//         if (!code) {
//           navigate("/login?error=missing_code", { replace: true });
//           return;
//         }

//         // Exchange one-time code for app token + user
//         const response = await authApi.exchangeGoogleCode(code);
//         console.log(response);
//         const { token, user } = response.data;

//         // Store raw JWT only (no "Bearer " prefix)
//         // localStorage.setItem("token", token);
//         localStorage.setItem("user", JSON.stringify(user));

//         navigate("/payment", { replace: true });
//       } catch {
//         navigate("/login?error=google_callback_failed", { replace: true });
//       }
//     };

//     run();
//   }, [navigate]);

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="flex items-center gap-2 text-muted-foreground">
//         <Loader2 className="h-4 w-4 animate-spin" />
//         ("authCallback.signingIn")
//       </div>
//     </div>
//   );
// };

// export default AuthCallback;

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
        // Cookie was already set by the backend redirect.
        // Just verify it's valid by hitting /api/auth/me.
        const response = await authApi.me();

        if (response.data?.user) {
          navigate("/payment", { replace: true });
        } else {
          navigate("/login?error=google_callback_failed", { replace: true });
        }
      } catch {
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