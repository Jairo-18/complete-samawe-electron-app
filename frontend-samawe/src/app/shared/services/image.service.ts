import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AccommodationImageResponse } from '../interfaces/image.interface';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly _httpClient: HttpClient = inject(HttpClient);

  /**
   * Sube una imagen para un alojamiento específico
   * @param accommodationId ID del alojamiento
   * @param file Archivo de imagen
   */
  uploadAccommodationImage(
    accommodationId: number,
    file: File
  ): Observable<AccommodationImageResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this._httpClient.post<AccommodationImageResponse>(
      `${environment.apiUrl}accommodation-images/${accommodationId}/image`,
      formData
    );
  }
}
