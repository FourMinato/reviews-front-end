import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/user';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-self',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './self.component.html',
  styleUrls: ['./self.component.scss']
})
export class SelfComponent implements OnInit {
  currentTab: string = 'reviews';
  userID: string | number = '';
  newPassword: string = '';
  confirmPassword: string = '';

  private readonly API_URL = `${environment.apiUrl}/user`;

  userData = {
    name: '',
    email: '',
    image: `${environment.apiUrl}/uploads/default-profile.png`
  };

  myReviews: any[] = [];
  myQuestions: any[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user && user.uid) {
      this.userID = user.uid;
      this.loadUserProfile(user.uid);
      this.loadMyActivity(user.uid);
    }
  }

  // 1. โหลดข้อมูลผู้ใช้จาก Database
  loadUserProfile(uid: any) {
    this.http.get<any>(`${environment.apiUrl}/user/getuser/${uid}`).subscribe({
      next: (res) => {
        if (res.status && res.data.length > 0) {
          const user = res.data[0];
          this.userData.name = user.name;
          this.userData.email = user.email;

          // --- แก้ไขจุดนี้เพื่อรองรับ Supabase ---
          if (user.profile && user.profile.includes('supabase.co')) {
            // ถ้าเป็น URL จาก Supabase ให้ใช้ค่านนั้นตรงๆ
            this.userData.image = user.profile;
          } else if (user.profile === 'default-profile.png' || !user.profile) {
            this.userData.image = `${environment.apiUrl}/uploads/default-profile.png`;
          } else {
            // รองรับรูปเก่าที่อาจจะยังค้างอยู่ในเครื่อง
            this.userData.image = `${environment.apiUrl}/uploads/user-profile/${user.profile}`;
          }

          this.authService.setUser(user);
        }
      }
    });
  }

  // 2. บันทึกการเปลี่ยนแปลงโปรไฟล์
  saveProfile() {
    const currentUser = this.authService.getUser() as any;

    if (!currentUser || !currentUser.uid) {
      this.showError('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    // --- Validation Section ---

    // ตรวจสอบชื่อ
    if (!this.userData.name || !this.userData.name.trim()) {
      this.showError('กรุณาป้อนชื่อผู้ใช้');
      return;
    }

    // ตรวจสอบรหัสผ่าน (ถ้ามีการพิมพ์ช่องใดช่องหนึ่ง)
    if (this.newPassword.trim() || this.confirmPassword.trim()) {
      if (this.newPassword.trim() && !this.confirmPassword.trim()) {
        this.showError('โปรดยืนยันรหัสผ่าน');
        return;
      }
      if (!this.newPassword.trim() && this.confirmPassword.trim()) {
        this.showError('กรุณาป้อนรหัสผ่านใหม่');
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.showError('รหัสผ่านยืนยันไม่ตรงกับรหัสผ่านใหม่');
        return;
      }
      if (this.newPassword.length < 6) {
        this.showError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        return;
      }
    }

    // --- Data Preparation ---
    const updateData = {
      name: this.userData.name.trim(),
      email: this.userData.email,
      password: this.newPassword.trim() || null,
      anonymous_name: this.generateAnonymousName(this.userData.name.trim()),
      // ตรวจสอบว่าใช้ URL ปัจจุบันที่แสดงอยู่บนหน้าจอ (ซึ่งเป็น URL ของ Supabase)
      profile: this.userData.image
    };

    this.http.put(`${this.API_URL}/update-user/${currentUser.uid}`, updateData).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.showSuccess('แก้ไขข้อมูลสำเร็จ');

          // อัปเดตข้อมูลใน LocalStorage ให้เป็นค่าล่าสุดรวมถึงรูปด้วย
          this.authService.setUser({
            ...currentUser,
            name: this.userData.name.trim(),
            profile: this.userData.image // อัปเดต URL รูปใน Storage ด้วย
          });

          this.newPassword = '';
          this.confirmPassword = '';
          this.loadUserProfile(currentUser.uid);
        }
      }
    });
  }

  // 3. จัดการการอัปโหลดรูปภาพ
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profileImage', file);

      // ยิงไปที่ API images ที่เราแก้เป็น Supabase แล้ว
      this.http.post(`${environment.apiUrl}/images/upload-profile/${this.userID}`, formData).subscribe({
        next: (res: any) => {
          if (res.status) {
            // --- แก้ไขจุดนี้: res.fileName ตอนนี้คือ Full URL จาก Supabase ---
            this.userData.image = res.fileName;

            const user = this.authService.getUser();
            this.authService.setUser({ ...user, profile: res.fileName });
            this.showSuccess('เปลี่ยนรูปโปรไฟล์เรียบร้อย');
          } else {
            this.showError('อัปโหลดไม่สำเร็จ');
          }
        },
        error: (err) => {
          this.showError('เกิดข้อผิดพลาดในการอัปโหลด');
        }
      });
    }
  }

  // --- Helper Functions ---

  loadMyActivity(uid: any) {
    this.http.get<any>(`${this.API_URL}/getuser/review/${uid}`).subscribe(res => {
      if (res.status) this.myReviews = res.data;
    });

    this.http.get<any>(`${this.API_URL}/getuser/question/${uid}`).subscribe(res => {
      if (res.status) this.myQuestions = res.data;
    });
  }

  private generateAnonymousName(name: string): string {
    if (name.length > 2) {
      return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
    } else if (name.length === 2) {
      return name[0] + '*';
    }
    return name;
  }

  private showError(message: string) {
    Swal.fire({
      html: `<div style="font-size: 1.5rem; font-family: 'Kanit', sans-serif;">${message}</div>`,
      icon: 'error',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#000'
    });
  }

  private showSuccess(message: string) {
    Swal.fire({
      html: `<div style="font-size: 1.5rem; font-family: 'Kanit', sans-serif;">${message}</div>`,
      icon: 'success',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#28D16F'
    });
  }

  tab(name: string) { this.currentTab = name; }
  back() { window.history.back(); }
}