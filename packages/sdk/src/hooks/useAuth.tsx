import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Developer' | 'Designer' | 'Manager' | 'Viewer';
  avatar?: string;
}

export interface Permission {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canManageRoles: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  permissions: Permission;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  hasPermission: (action: keyof Permission) => boolean;
}

/** Role-based permission map */
const ROLE_PERMISSIONS: Record<string, Permission> = {
  Admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    canManageRoles: true,
  },
  Manager: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canExport: true,
    canManageRoles: false,
  },
  Developer: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canExport: false,
    canManageRoles: false,
  },
  Designer: {
    canCreate: false,
    canEdit: true,
    canDelete: false,
    canExport: false,
    canManageRoles: false,
  },
  Viewer: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    canManageRoles: false,
  },
};

const DEFAULT_PERMISSIONS: Permission = {
  canCreate: false,
  canEdit: false,
  canDelete: false,
  canExport: false,
  canManageRoles: false,
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Dev fallback user for standalone MFE development */
const DEV_USER: AuthUser = {
  id: 'dev-1',
  name: 'Dev Admin',
  email: 'dev@example.com',
  role: 'Admin',
};

/**
 * AuthProvider - Wrap your app with this to provide authentication context.
 *
 * In Module Federation, since React and SDK are shared singletons,
 * the host's AuthProvider is accessible by all remote MFEs.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const permissions = user
    ? (ROLE_PERMISSIONS[user.role] || DEFAULT_PERMISSIONS)
    : DEFAULT_PERMISSIONS;

  const login = useCallback((userData: AuthUser) => {
    setUser(userData);
    // Emit cross-MFE event
    window.dispatchEvent(
      new CustomEvent('mfe:auth:user-changed', {
        detail: { userId: userData.id, name: userData.name, role: userData.role },
      })
    );
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    window.dispatchEvent(new CustomEvent('mfe:auth:logout'));
  }, []);

  const hasPermission = useCallback(
    (action: keyof Permission) => permissions[action] || false,
    [permissions]
  );

  return (
    <AuthContext.Provider
      value={{ user, permissions, isAuthenticated: !!user, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook - Access authentication state from any component.
 *
 * When used outside AuthProvider (standalone MFE mode),
 * returns a dev fallback with full Admin permissions.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  // Standalone MFE fallback (no host AuthProvider)
  if (!context) {
    return {
      user: DEV_USER,
      permissions: ROLE_PERMISSIONS['Admin']!,
      isAuthenticated: true,
      login: () => console.warn('[useAuth] No AuthProvider — running standalone'),
      logout: () => console.warn('[useAuth] No AuthProvider — running standalone'),
      hasPermission: () => true,
    };
  }

  return context;
}

export { ROLE_PERMISSIONS };
