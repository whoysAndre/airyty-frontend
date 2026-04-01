import { apiClient } from './client'
import type { User } from '@/types/auth.types'

export interface UpdateProfileDto {
  name?: string
  image?: File
}

export interface ChangePasswordDto {
  password: string
  confirmPassword: string
  newPassword: string
}

export const usersApi = {
  updateProfile(dto: UpdateProfileDto, token: string) {
    const form = new FormData()
    if (dto.name) form.append('name', dto.name)
    if (dto.image) form.append('image', dto.image)
    return apiClient.patchForm<{ status: number; message: string; user: User }>(
      '/users/update-profile',
      form,
      token,
    )
  },

  changePassword(dto: ChangePasswordDto, token: string) {
    return apiClient.patch<{ status: number; message: string }>(
      '/users/change-password',
      dto,
      token,
    )
  },

  changeRole(token: string) {
    return apiClient.patch<{ status: number; message: string }>(
      '/users/change-role',
      {},
      token,
    )
  },
}
