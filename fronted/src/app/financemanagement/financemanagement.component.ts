import { Component,OnInit } from '@angular/core';
import { FinanceService } from '../../services/finance.service';
import { Finance } from '../../models/Finance';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reports } from '../../models/Reports';
import { AuctionResults } from '../../models/AuctionResults';

@Component({
  selector: 'app-financemanagement',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './financemanagement.component.html',
  styleUrl: './financemanagement.component.scss'
})
export class FinancemanagementComponent {
  finances:Finance[]=[];
  reports:Reports[]=[];
  auctionResults:AuctionResults[]=[];
  teamId:number|null=null;
  selectedTeamFinance:Finance[] |null = null;
  isViewingFinance = true;
  isViewingAuctionResults = false;
  isViewingReports = false;
  errorMessage='';
  constructor(private financeServics:FinanceService){}
  ngOnInit():void{
    this.fetchAllFinances();
    this.fetchFinancesById();
    this.fetchAllReports();
    this.fetchAllAuctionResults();
  }

  showFinanceSection() {
    this.isViewingFinance = true;
    this.isViewingAuctionResults = false;
    this.isViewingReports = false;
  // Fetch the finance data when showing finance section
  }

  // Function to show the Auction Results section
  showAuctionResultsSection() {
    this.isViewingFinance = false;
    this.isViewingAuctionResults = true;
    this.isViewingReports = false;
   // Fetch the auction results data
  }

  // Function to show the Reports section
  showReportsSection() {
    this.isViewingFinance = false;
    this.isViewingAuctionResults = false;
    this.isViewingReports = true;
     // Fetch the reports data
  }


  fetchAllFinances():void{
    this.financeServics.getAllFinances().subscribe({
      next:(data)=>{
        this.finances=data;
      },
      error:(err)=>{
        this.errorMessage='Failed to load finances'+err.message;
      }
    })
  }

  fetchFinancesById():void{
    if(this.teamId!==null){
      this.financeServics.getFinanceById(this.teamId).subscribe({
        next:(data)=>{
          this.selectedTeamFinance=data;
          this.errorMessage=''
        },
        error:(err)=>{
          this.errorMessage="Team finances not found"+err.message;
          this.selectedTeamFinance=null;
        }
      })
    }
  }

  fetchAllReports():void{
    this.financeServics.getAllReports().subscribe({
      next:(data)=>{
        this.reports=data;
      },
      error:(err)=>{
        this.errorMessage='Failed to load reports'+err.message;
      }
    })
  }

  fetchAllAuctionResults():void{
    this.financeServics.getAllAuctionResults().subscribe({
      next:(data)=>{
        this.auctionResults=data;
      },
      error:(err)=>{
        this.errorMessage='Failed to load auction Results'+err.message;
      }
    })
  }


}
