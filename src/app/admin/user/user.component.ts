import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {

      constructor(private router: Router, private http: HttpClient) { }
      
  users = [
    { 
      name: 'Somchai Jaidee', 
      email: 'somchai@example.com', 
      role: 'Admin', 
      isActive: true,
      image: 'https://i.pravatar.cc/150?img=11' // รูปผู้ชาย
    },
    { 
      name: 'Mana Rakdee', 
      email: 'mana@example.com', 
      role: 'User', 
      isActive: true,
      image: 'https://i.pravatar.cc/150?img=12' // รูปผู้ชาย
    },
    { 
      name: 'Manee Meeta', 
      email: 'manee@example.com', 
      role: 'User', 
      isActive: false,
      image: 'https://i.pravatar.cc/150?img=5' // รูปผู้หญิง
    },
    { 
      name: 'Piti Chujai', 
      email: 'piti@example.com', 
      role: 'User', 
      isActive: true,
      image: 'https://i.pravatar.cc/150?img=68' // รูปผู้ชาย
    },
    { 
      name: 'Chujai Rakrian', 
      email: 'chujai@example.com', 
      role: 'Admin', 
      isActive: true,
      image: 'https://i.pravatar.cc/150?img=44' // รูปผู้หญิง
    }
  ];
  userDetail(){
    this.router.navigate(['/admin/user/detail'])
  }
    back() {
     history.back();
  }

}
