import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-profile-modal',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.css']
})
export class ProfileModalComponent implements OnInit {
  isLoggedIn: boolean = true;
  users: any[] = [];
  userid: string | null = localStorage.getItem('authUserId');

  constructor(private router: Router, private http: HttpClient) {}

  private apiUrl = environment.apiUrl;
  ngOnInit(): void {
    this.isLoggedIn = !!localStorage.getItem('authToken');

    if (this.userid) {
      this.http.get<any[]>(`${this.apiUrl}/users/profileDetails/${this.userid}`).subscribe(
        (data) => {
          this.users = data;
        },
        (error) => {
          console.error('Error fetching users', error);
        }
      );
    }
  }

  logout() {
    localStorage.removeItem('authToken');
    this.isLoggedIn = false;
    this.router.navigate(['/']); 
    window.location.reload();
  }
}
