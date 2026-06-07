import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
// import { Skeleton } from '@/components/ui/skeleton';
import { Loader2} from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute2 = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {/* <div className="space-y-4 w-full max-w-md p-8"> */}
          {/* <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" /> */}
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        {/* </div> */}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signUp" replace />;
  }

  return <>{children}</>;
};
