import { apiClient } from "./client";
import type { AuthResponse, LoginDto, RegisterDto } from "@/types/auth.types";

export const authApi = {
  login(dto: LoginDto) {
    return apiClient.post<AuthResponse>("/auth/login", dto);
  },

  register(dto: RegisterDto) {
    const form = new FormData();
    form.append("name", dto.name);
    form.append("email", dto.email);
    form.append("password", dto.password);
    if (dto.role) form.append("role", dto.role);
    if (dto.image) form.append("image", dto.image);
    return apiClient.postForm<AuthResponse>("/auth/register", form);
  },
};
