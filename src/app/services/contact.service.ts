import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'https://api.foxyclan.fr/contact';

  constructor(private http: HttpClient) {}

  sendMessage(data: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(this.apiUrl, data, { observe: 'response' });
  }
}
