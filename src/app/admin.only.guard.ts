import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminOnly implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const role = localStorage.getItem('authRole');
    if (role === 'admin') {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
}