// import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { authApi } from '@/services/api.service';
// import type { User, LoginCredentials, RegisterData } from '@/types/api';

// // Types
// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   login: (credentials: LoginCredentials) => Promise<void>;
//   register: (data: RegisterData) => Promise<void>;
//   logout: () => void;
// }

// // Create context
// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Provider component
// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // Initialize auth state from localStorage on mount
//   useEffect(() => {
//     const storedToken = localStorage.getItem('token');
//     const storedUser = localStorage.getItem('user');

//     if (storedToken && storedUser) {
//       try {
//         setToken(storedToken);
//         setUser(JSON.parse(storedUser));
//       } catch (error) {
//         console.error('Failed to parse stored user:', error);
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//       }
//     }
//     setIsLoading(false);
//   }, []);

//   // Login function
//   const login = async (credentials: LoginCredentials) => {
//     const response = await authApi.login(credentials);
//     const { token: newToken, user: newUser } = response.data;

//     localStorage.setItem('token', newToken);
//     localStorage.setItem('user', JSON.stringify(newUser));
//     setToken(newToken);
//     setUser(newUser);
//   };

//   // Register function
//   const register = async (data: RegisterData) => {
//     const response = await authApi.register(data);
//     const { token: newToken, user: newUser } = response.data;

//     localStorage.setItem('token', newToken);
//     localStorage.setItem('user', JSON.stringify(newUser));
//     setToken(newToken);
//     setUser(newUser);
//   };

//   //login with google function
  

//   // Logout function
//   const logout = () => {
//     // Try to call logout API but don't wait for it
//     authApi.logout().catch(() => {});

//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setToken(null);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         isLoading,
//         isAuthenticated: !!token && !!user,
//         login,
//         register,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Hook to use auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };


///////////////////
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/api.service';
import type { User, LoginCredentials, RegisterData } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: () => void;
  setAuthSession: (token: string, user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for 401 events from axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const res = await authApi.getCurrentUser();
          setUser(res.data);
        } catch {
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const res = await authApi.login(credentials); 
    const { token, ...userData } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData as User);
  };

  const register = async (data: RegisterData) => {
    const res = await authApi.register(data); 
    const { token, ...userData } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData as User);
  };

  const setAuthSession = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const loginWithGoogle = () => {
    authApi.loginWithGoogle(); // Full page redirect
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    try {
      await authApi.logout(); 
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        setAuthSession,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};