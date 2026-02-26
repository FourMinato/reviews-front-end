import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/user';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { Constants } from '../../../config/constant';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-other',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './other.component.html',
  styleUrl: './other.component.scss'
})
export class OtherComponent {
    currentTab: string = 'reviews';
  reviews: any[] = [];
  questions: any[] = [];
  userID: string = '';
  userData:any = [];
  userName: string = '';
  userImage: string = '';
    isLoggedIn: boolean = false;
  myUID: string = '';
  isOwnProfile: boolean = false;
  constructor(private router: Router, private http: HttpClient, private constants: Constants, private authService: AuthService) { }
  ngOnInit() {
    const ID = history.state.userID || '';
    this.userID = ID;
    console.log("ID id is " + ID);
    this.getUser();
    this.getReview();
    this.getQuestion();
    this.checkLogin();
    this.checkUser();
  }
    checkLogin() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }
  checkUser() {
    const uid = this.authService.getUser().uid;
    this.myUID = uid;
    console.log(this.myUID);
    
  }
  getUser(){
        this.http.get<any>(`${this.constants.API}/user/getuser/${this.userID}`)
      .subscribe(res => {
        if (res.status === true) {
          this.userData = res.data;
          this.userName = this.userData[0].name;
          this.userImage = `${this.constants.API}/images/${this.userData[0].profile}`;
          if(res.data[0].uid === this.myUID){
            this.isOwnProfile = true;
          }
          console.log("is owner = "+this.isOwnProfile);
          console.log(this.userData);
        }
      });
  }
  getReview() {
    this.http.get<any>(`${this.constants.API}/user/getuser/review/${this.userID}`)
      .subscribe(res => {
        if (res.status === true) {
          this.reviews = res.data
          console.log(this.reviews);

        }
      });
  }
    getQuestion() {
    this.http.get<any>(`${this.constants.API}/user/getuser/question/${this.userID}`)
      .subscribe(res => {
        if (res.status === true) {
          this.questions = res.data
          console.log(this.questions);
        }
      });
  }
    linkToReviewDetails(reviewID: string) {
    this.router.navigate(['post/review/details'], {
      state: { reviewID: reviewID }
    });
  }
      linkToQuestionDetails(questionID: string) {
    this.router.navigate(['post/question/details'], {
      state: { questionID: questionID }
    });
  }
    linkToProfile() {
    this.router.navigate(['profile'], {
    });
  }
  reportUser(){
        if (!this.isLoggedIn) {
          Swal.fire({
            html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณาเข้าสู่ระบบก่อน</div>',
            icon: 'error',
            confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
            confirmButtonColor: '#000000',
            color: '#000000'
          });
          return;
        }
        Swal.fire({
                  html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยืนยันการรายงานผู้ใช้นี้?</div>',
                  icon: 'warning',
                  confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
                  confirmButtonColor: '#ff4d4d',
                  color: '#000000',
                  showCancelButton: true,
                  cancelButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยกเลิก</div>',
                  cancelButtonColor: '#000000',
                }).then((result) => {
                  if (result.isConfirmed) {
                    const reportData = { reported_uid: this.userID, reporter_uid: this.myUID };
                    console.log(reportData);
                    
                    this.http.post<any>(`${this.constants.API}/report/profile`, reportData)
                      .subscribe({
                        next: (response) => {
                          if (response.status == true) {
                            Swal.fire({
                              html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">รายงานโปรไฟล์สำเร็จ</div>',
                              icon: 'success',
                              timer: 1500,
                              showConfirmButton: false
                            });
                          } else {
                            Swal.fire({
                              html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">' + response.message + '</div>',
                              icon: 'error',
                              confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
                              confirmButtonColor: '#000000',
                              color: '#000000'
                            });
                          }
                        },
                        error: (error) => {
                          Swal.fire({
                            html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">' + (error.error?.message || 'กรุณาลองใหม่อีกครั้ง') + '</div>',
                            icon: 'error',
                            confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
                            confirmButtonColor: '#000000',
                            color: '#000000'
                          });
                        }
                      });
                  }
                });



  }
  // --- Mock Data: ข้อมูลผู้ใช้ (เปลี่ยนเป็นค่าที่ดึงจาก API ทีหลังได้เลย) ---
  //userName: string = 'Kumphalak';
  // ลองใช้รูปจาก internet จำลองดูก่อน
  //userImage: string = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80';


  // ข้อมูลจำลองสำหรับรีวิว
  reviewsList = [
    { code: '0041001', date: '14-02-2025' },
    { code: '0042001', date: '02-02-2025' },
    { code: '0043015', date: '25-01-2025' },
    { code: '0045014', date: '02-01-2025' }
  ];

  // ข้อมูลจำลองสำหรับคำถาม
  questionsList = [
    { title: 'คำถาม: การลงทะเบียน', date: '10-02-2025' },
    { title: 'คำถาม: สอบกลางภาค', date: '05-02-2025' },
    { title: 'คำถาม: หาหนังสือเรียน', date: '01-02-2025' }
  ];

  // ฟังก์ชันเปลี่ยน Tab
  tab(tabName: string) {
    this.currentTab = tabName;
    console.log('เลือก Tab:', this.currentTab);
  }
  back() {
    history.back();
  }
}
