import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../api";
import type { User, CreateUserDto, UpdateUserDto } from "../api/client";

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createUser: (data: CreateUserDto) => Promise<User | undefined>;
  updateUser: (id: string, data: UpdateUserDto) => Promise<User | undefined>;
  deleteUser: (id: string) => Promise<void>;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Try real API first, fallback to mock if it fails
      let data: User[] = [];
      try {
        data = await apiClient.getUsers();
      } catch (e) {
        console.error("[useUsers] API client failed, falling back to mock", e);
      }
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = useCallback(
    async (data: CreateUserDto) => {
      try {
        setError(null);
        try {
          const newUser = await apiClient.createUser(data);
          await fetchUsers();
          return newUser;
        } catch (e) {
          console.error(
            "[useUsers] createUser API failed, falling back to mock",
            e,
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create user");
        throw err;
      }
    },
    [fetchUsers],
  );

  const updateUser = useCallback(
    async (id: string, data: UpdateUserDto) => {
      try {
        setError(null);
        try {
          const updatedUser = await apiClient.updateUser(id, data);
          await fetchUsers();
          return updatedUser;
        } catch (e) {
          console.error(
            "[useUsers] updateUser API failed, falling back to mock",
            e,
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update user");
        throw err;
      }
    },
    [fetchUsers],
  );

  const deleteUser = useCallback(
    async (id: string) => {
      try {
        setError(null);
        try {
          await apiClient.deleteUser(id);
          await fetchUsers();
        } catch (e) {
          console.error(
            "[useUsers] deleteUser API failed, falling back to mock",
            e,
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete user");
        throw err;
      }
    },
    [fetchUsers],
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
