// API Client for Backend Communication
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:3000/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const headers = new Headers(options?.headers);

    // Only send JSON content-type when a request body is present.
    if (options?.body != null && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
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
  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/users");
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
