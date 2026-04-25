import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './../contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

// NEW: Redirects authenticated users away from signup to payment
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
    );;
  
  if (isAuthenticated) {
    return <Navigate to="/payment" replace />;
  }

  return children;
};