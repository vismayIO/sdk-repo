// API Client for Backend Communication
export type UserRole =
  | "Admin"
  | "Manager"
  | "Developer"
  | "Designer"
  | "Viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface RequestContext {
  role?: UserRole;
  signal?: AbortSignal;
}

interface ErrorResponseBody {
  error?: string;
  message?: string;
}

export class ApiRequestError extends Error {
  status: number;
  responseBody?: ErrorResponseBody | null;

  constructor(
    status: number,
    message: string,
    responseBody?: ErrorResponseBody | null,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.responseBody = responseBody;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:3000/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
    context?: RequestContext,
  ): Promise<T> {
    const headers = new Headers(options?.headers);
    if (context?.role && !headers.has("x-user-role")) {
      headers.set("x-user-role", context.role);
    }

    // Only send JSON content-type when a request body is present.
    if (options?.body != null && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: context?.signal,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Network request failed";
      throw new ApiRequestError(0, message);
    }

    if (!response.ok) {
      let body: ErrorResponseBody | null = null;
      try {
        body = (await response.json()) as ErrorResponseBody;
      } catch {
        body = null;
      }

      const message =
        body?.message ||
        body?.error ||
        `API request failed with ${response.status}`;
      throw new ApiRequestError(response.status, message, body);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json() as Promise<T>;
    }

    return undefined as T;
  }

  // User Management APIs
  async getUsers(context?: RequestContext): Promise<User[]> {
    return this.request<User[]>("/users", undefined, context);
  }

  async getUserById(id: string, context?: RequestContext): Promise<User> {
    return this.request<User>(`/users/${id}`, undefined, context);
  }

  async createUser(
    data: CreateUserDto,
    context?: RequestContext,
  ): Promise<User> {
    return this.request<User>(
      "/users",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      context,
    );
  }

  async updateUser(
    id: string,
    data: UpdateUserDto,
    context?: RequestContext,
  ): Promise<User> {
    return this.request<User>(
      `/users/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      context,
    );
  }

  async deleteUser(id: string, context?: RequestContext): Promise<void> {
    return this.request<void>(
      `/users/${id}`,
      {
        method: "DELETE",
      },
      context,
    );
  }
}

export const apiClient = new ApiClient();
