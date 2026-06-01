'use client'

export interface CloudinaryUploadResponse {
  asset_id: string
  public_id: string
  secure_url: string
  url: string
  [key: string]: any
}

export async function uploadImageToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
  const cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary não configurado no frontend')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Falha no upload para o Cloudinary')
  }

  const data = await response.json()
  if (!data?.secure_url) {
    throw new Error('Resposta inválida do Cloudinary')
  }

  return data as CloudinaryUploadResponse
}
