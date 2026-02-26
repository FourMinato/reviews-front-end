import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/user';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-self',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './self.component.html',
  styleUrls: ['./self.component.scss']
})
export class SelfComponent implements OnInit {
  currentTab: string = 'reviews';
  userID: string | number = '';

  // ใช้ค่า apiUrl จาก environment ที่คุณประกาศไว้
  private readonly API_URL = `${environment.apiUrl}/user`;

  userData = {
    name: '',
    email: '',
    password: '',
    image: `${environment.apiUrl}/uploads/1e346a4b-7fb4-4f94-929d-9093df91ce85.jpg`
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

  loadUserProfile(uid: any) {
  this.http.get<any>(`${environment.apiUrl}/user/getuser/${uid}`).subscribe({
    next: (res) => {
      if (res.status && res.data.length > 0) {
        const user = res.data[0];
        this.userData.name = user.name;
        this.userData.email = user.email;
        this.userData.image = this.authService.getProfileImageUrl(user.profile);
      }
    }
  });
}

  loadMyActivity(uid: any) {
    // 1. ดึงรีวิวแบบเดิม: /user/getuser/review/:uid
    this.http.get<any>(`${this.API_URL}/getuser/review/${uid}`).subscribe(res => {
      if (res.status) this.myReviews = res.data;
    });

    // 2. ดึงคำถามแบบเดิม: /user/getuser/question/:uid
    this.http.get<any>(`${this.API_URL}/getuser/question/${uid}`).subscribe(res => {
      if (res.status) this.myQuestions = res.data;
    });
  }

  saveProfile() {
    // 1. ดึงข้อมูล user ปัจจุบันจาก Service
    const user = this.authService.getUser();

    // 2. ตรวจสอบว่าเข้าสู่ระบบอยู่หรือไม่
    if (!user || !user.uid) {
      Swal.fire('กรุณาเข้าสู่ระบบ', 'ไม่พบข้อมูลผู้ใช้งาน', 'warning');
      return;
    }

    // 3. ส่งข้อมูลไปอัปเดตที่ API (ใช้ Path /user/update-user/:uid)
    this.http.put(`${this.API_URL}/update-user/${user.uid}`, this.userData).subscribe({
      next: (res: any) => {
        if (res.status) {
          // แสดงผลสำเร็จด้วย SweetAlert2
          Swal.fire({
            title: 'สำเร็จ!',
            text: 'บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว',
            icon: 'success',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#000'
          });

          // อัปเดตข้อมูลใหม่ลงใน LocalStorage ผ่าน Service
          this.authService.setUser({ ...user, name: this.userData.name });
        } else {
          Swal.fire('ผิดพลาด', res.message || 'ไม่สามารถแก้ไขข้อมูลได้', 'error');
        }
      },
      error: (err) => {
        console.error('Update Error:', err);
        Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      // ส่งชื่อฟิลด์เป็น 'profileImage' ให้ตรงกับ API ตัวใหม่ฝั่งหลังบ้าน
      formData.append('profileImage', file); 

      this.http.post(`${environment.apiUrl}/images/upload-profile/${this.userID}`, formData).subscribe({
        next: (res: any) => {
          if (res.status) {
            // รีเฟรชรูปหน้าจอโดยชี้ไปที่โฟลเดอร์ user-profile
            this.userData.image = `${environment.apiUrl}/images/user-profile/${res.fileName}`;
            Swal.fire('สำเร็จ', 'เปลี่ยนรูปโปรไฟล์เรียบร้อย', 'success');
          }
        },
        error: (err) => {
          console.error('Upload Error:', err);
          Swal.fire('ผิดพลาด', 'ไม่สามารถอัปโหลดรูปภาพได้', 'error');
        }
      });
    }
  }



  tab(name: string) { this.currentTab = name; }
  back() { window.history.back(); }


}