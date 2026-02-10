import { useState, useEffect, useCallback, useMemo } from "react";
import { apiClient } from "../api";
import { ApiRequestError } from "../api/client";
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  RequestContext,
} from "../api/client";
import { useAuth } from "./useAuth";

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createUser: (data: CreateUserDto) => Promise<User>;
  updateUser: (id: string, data: UpdateUserDto) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function useUsers(): UseUsersReturn {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestContext = useMemo<RequestContext>(
    () => ({ role: user?.role }),
    [user?.role],
  );

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getUsers(requestContext);
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch users"));
    } finally {
      setLoading(false);
    }
  }, [requestContext]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const createUser = useCallback(
    async (data: CreateUserDto) => {
      try {
        setError(null);
        const newUser = await apiClient.createUser(data, requestContext);
        setUsers((previousUsers) => [newUser, ...previousUsers]);
        return newUser;
      } catch (err) {
        const message = getErrorMessage(err, "Failed to create user");
        setError(message);
        throw err;
      }
    },
    [requestContext],
  );

  const updateUser = useCallback(
    async (id: string, data: UpdateUserDto) => {
      try {
        setError(null);
        const updatedUser = await apiClient.updateUser(
          id,
          data,
          requestContext,
        );
        setUsers((previousUsers) =>
          previousUsers.map((candidate) =>
            candidate.id === id ? updatedUser : candidate,
          ),
        );
        return updatedUser;
      } catch (err) {
        const message = getErrorMessage(err, "Failed to update user");
        setError(message);
        throw err;
      }
    },
    [requestContext],
  );

  const deleteUser = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await apiClient.deleteUser(id, requestContext);
        setUsers((previousUsers) =>
          previousUsers.filter((candidate) => candidate.id !== id),
        );
      } catch (err) {
        const message = getErrorMessage(err, "Failed to delete user");
        setError(message);
        throw err;
      }
    },
    [requestContext],
  );

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}
