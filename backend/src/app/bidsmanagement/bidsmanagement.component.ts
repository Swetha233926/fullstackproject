import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Bids } from '../../models/Bids';
import { BidsService } from '../../services/bids.service';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuctionService } from '../../services/auction.service';
import { Auction } from '../../models/Auction';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player';
import { LoginService } from '../../services/login.service';
import { TeamService } from '../../services/team.service';
import { Team } from '../../models/team';

@Component({
  selector: 'app-bidsmanagement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bidsmanagement.component.html',
  styleUrl: './bidsmanagement.component.scss'
})
export class BidsmanagementComponent implements OnInit {
  bidsByAuctionId: Bids[] = [];
  activePlayers:Player[]=[];
  inactivePlayers:Player[]=[];
  bids: Bids[] = [];
  auction: Auction | null = null; // Declare auction as a single object, not an array
  errorMessage = '';
  isAddingBid: boolean = false;
  auctionId: number | null = null;
  sport:string | null=null;
  userRole: string | null = null;
  isViewingActivePlayers:boolean=true;
  isViewingInactivePlayers:boolean=false;
  currentBid:number = 0;
 


  constructor(
    private bidsService: BidsService,
    private router: ActivatedRoute,
    private auctionService: AuctionService,
    private playerService:PlayerService,
    private loginService:LoginService,
    private route:ActivatedRoute,
    private teamService:TeamService
  ) {}

  newBid: Bids = {
    auctionId: 0,
    playerId: 0,
    bidAmount: 0,
    teamId: 0,
    status: 'Winning'
  };

  ngOnInit(): void {
    this.router.queryParams.subscribe((params) => {
      this.auctionId = +params['auctionId'];
      this.sport=params['sport'];
      console.log('auctionId from URL:', this.auctionId); 
      const userRole=this.loginService.getUserRole();
      if(userRole==='TeamManager'){
        this.newBid.teamId=this.loginService.getUserId();
      }

      // After fetching active players, load the currentBid from localStorage
      this.activePlayers.forEach(player => {
        const savedBid = localStorage.getItem(`player_${player.playerId}_currentBid`);
        if (savedBid) {
          player.currentBid = JSON.parse(savedBid);  // Set the currentBid from localStorage
        }
      });

      this.fetchBidsByAuctionId();
      this.getAuctionById();
      this.fetchActivePlayeres();
      this.fetchInactivePlayers();
      this.userRole=this.loginService.getUserRole();
    });
  }

  isLoggedIn(): boolean {
    return this.loginService.isLoggedIn();  // Check if the user is logged in
  }

  userHasRole(role: string): boolean {
    return this.userRole === role; 
  }
  //show ongoing auctionsdetails
  showActivePlayers(): void {
    this.isViewingActivePlayers = true;
    this.isViewingInactivePlayers = false;
  }

  showInactivePlayers(): void {
    this.isViewingActivePlayers = false;
    this.isViewingInactivePlayers = true;
  }

  showAddBid(playerId: number|undefined): void {
    if (playerId !== undefined) {
      this.newBid.playerId = playerId;
      this.newBid.auctionId = this.auctionId || 0;
      this.isAddingBid = true;
    } else {
      console.error('Invalid player ID');
    }
  this.isViewingActivePlayers = false;
  this.isViewingInactivePlayers = false;
  this.isAddingBid = true; // Show the Add Bid form
}



  // Get bids by auction id
  fetchBidsByAuctionId(): void {
    if (this.auctionId !== null) {
      this.bidsService.getBidsByAuctionId(this.auctionId).subscribe({
        next: (data) => {
          this.bidsByAuctionId = data;
        },
        error: (err) => {
          this.errorMessage = 'Bids Not Found' + err.message;
        }
      });
    }
  }

  // Post bid
 /* addBid(): void {
    if (this.auctionId != null) {
      this.newBid.auctionId = this.auctionId;
      console.log('Adding bid:', this.newBid);  
      this.bidsService.addBids(this.newBid).subscribe({
        next: (data) => {
          this.bids.push(data);
          console.log('Bids successfully pushed');
          this.isAddingBid = false;
          this.isViewingActivePlayers=true;
        },
        error: (err) => {
          this.errorMessage = 'Failed to add bid: ' + err.message;
        }
      });
    } else {
      console.error('Auction ID is null');
    }
  }*/

    // addBid(): void {
    //   const loggedInUserId = this.loginService.getUserId();  // Get logged-in user Id
    //   if (this.auctionId != null) {
    //     // Check if the manager is bidding for their own team
    //     this.newBid.auctionId = this.auctionId;
    //     console.log('Adding bid:', this.newBid);
    
    //     this.bidsService.addBids(this.newBid).subscribe({
    //       next: (data) => {
    //         this.bids.push(data);
    //         console.log('Bid successfully added');
    //         this.isAddingBid = false;
    //         this.isViewingActivePlayers = true;
    //       },
    //       error: (err) => {
    //         this.errorMessage = 'Failed to add bid: ' + err.message;
    //       }
    //     });
    //   } else {
    //     console.error('Auction ID is null');
    //   }
    // }
    addBid(): void {
      const loggedInUserId = this.loginService.getUserId();  // Get logged-in user Id
    
      if (this.auctionId != null && this.newBid.teamId != null) {
        // Fetch team data to get the managerId
        this.teamService.getTeamById(this.newBid.teamId).subscribe({
          next: (teamData: Team) => {
            if (!teamData || !teamData.managerId) {
              console.error('Team data or managerId is missing.');
              this.errorMessage = 'Failed to fetch valid team data.';
              return;
            }
    
            // Check if the logged-in user is the manager of the team
            if (teamData.managerId !== loggedInUserId) {
              this.errorMessage = 'You can only place a bid for your own team.';
              console.error('Manager cannot place bid for a different team');
              return; // Prevent submitting the bid if the IDs don't match
            }
    
            // Proceed with placing the bid if the managerId matches
            this.newBid.auctionId = this.auctionId as number;  // Type assertion
            console.log('Adding bid:', this.newBid);
    
            this.bidsService.addBids(this.newBid).subscribe({
              next: (data) => {
                this.bids.push(data);
                console.log('Bid successfully added');
                this.isAddingBid = false;
                this.isViewingActivePlayers = true;
              },
              error: (err) => {
                this.errorMessage = 'Failed to add bid: ' + err.message;
                console.error(err);
              }
            });
          },
          error: (error) => {
            console.error('Error fetching team data:', error);
            this.errorMessage = 'There was an issue checking your team data.';
          }
        });
      } else {
        console.error('Auction ID or Team ID is null');
        this.errorMessage = 'Auction ID or Team ID is missing.';
      }
    }
    
    
    
  

  cancelAddBid(): void {
    this.isAddingBid = false;
    this.isViewingActivePlayers=true;
  }

  // Get auction details by auction id
  getAuctionById(): void {
    if (this.auctionId !== null) {
      this.auctionService.getAuctionById(this.auctionId).subscribe({
        next: (data) => {
          this.auction = data;  // Assign the fetched auction data
        },
        error: (err) => {
          this.errorMessage = 'Auction not found: ' + err.message;
        }
      });
    }
  }

  fetchActivePlayeres(): void {
    if (this.sport) {
      this.playerService.getActivePlayersByStatusAndSport(this.sport).subscribe({
        next: (data) => {
          console.log('Active Players:', data);
          this.activePlayers = data;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load active players: ' + err.message;
        },
      });
    } else {
      console.error('Sport parameter is missing');
    }
  }
  
  fetchInactivePlayers(): void {
    if (this.sport) {
      this.playerService.getInactivePlayersByStatusAndSport(this.sport).subscribe({
        next: (data) => {
          console.log('Inactive Players:', data);
          this.inactivePlayers = data;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load inactive players: ' + err.message;
        },
      });
    } else {
      console.error('Sport parameter is missing');
    }
  }
  
  

}
