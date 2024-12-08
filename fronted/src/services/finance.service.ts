import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Finance } from '../models/Finance';
import { Reports } from '../models/Reports';
import { AuctionResults } from '../models/AuctionResults';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private apiUrl='https://localhost:7178/api/Finance';
  private apiUrlReports='https://localhost:7178/api/Reports';
  private apiUrlAuctionResults='https://localhost:7178/api/AuctionResults';

  constructor(private http:HttpClient) { }
  //get all finances
  getAllFinances():Observable<Finance[]>{
    return this.http.get<Finance[]>(`${this.apiUrl}`);
  }

  //get Finace by team id
  getFinanceById(id:number):Observable<Finance[]>{
    return this.http.get<Finance[]>(`${this.apiUrl}/team/${id}`);
  }

  //get all reports
  getAllReports():Observable<Reports[]>{
    return this.http.get<Reports[]>(`${this.apiUrlReports}`);
  }

  //get all auction results
  getAllAuctionResults():Observable<AuctionResults[]>{
    return this.http.get<AuctionResults[]>(`${this.apiUrlAuctionResults}`);
  }
}
