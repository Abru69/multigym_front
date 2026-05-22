import { Injectable } from '@angular/core';

export interface ImageUploadResult {
  success: boolean;
  data?: string; // base64 data
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  constructor() { }

  /**
   * Valida y convierte una imagen a base64
   */
  uploadImage(file: File): Promise<ImageUploadResult> {
    return new Promise((resolve) => {
      // Validar tipo de archivo
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        resolve({
          success: false,
          error: 'Formato de archivo no permitido. Solo se aceptan: JPEG, PNG, WebP, GIF'
        });
        return;
      }

      // Validar tamaño
      if (file.size > this.MAX_FILE_SIZE) {
        resolve({
          success: false,
          error: 'El archivo es demasiado grande. Máximo 5MB'
        });
        return;
      }

      // Convertir a base64
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve({
          success: true,
          data: reader.result as string
        });
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Error al leer el archivo'
        });
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Comprime una imagen base64 (opcional para reducir tamaño)
   */
  compressImage(base64: string, maxWidth: number = 1200, maxHeight: number = 1200): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          reject('No se pudo obtener el contexto del canvas');
        }
      };

      img.onerror = () => {
        reject('Error al cargar la imagen');
      };

      img.src = base64;
    });
  }

  /**
   * Obtiene la URL base64 almacenada
   */
  getImageUrl(base64: string | undefined): string {
    return base64 || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+Cjwvc3ZnPg==';
  }

  /**
   * Elimina una imagen (limpia la referencia)
   */
  removeImage(): string | undefined {
    return undefined;
  }
}
