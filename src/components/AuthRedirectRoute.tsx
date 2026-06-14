import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './../contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

// Redirects authenticated users away from signup to dashboard
export const AuthRedirectRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  
  if (isAuthenticated && !(window as any).__isTransitioning) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};