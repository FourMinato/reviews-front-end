import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from '../../../service/user';
import { Constants } from '../../../config/constant';
@Component({
  selector: 'app-question-all-posts',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss'
})
export class QuestionAllPostsComponent {

  isLoggedIn: boolean = false;
  userID: number = 0;
  questionList: any[] = [];
  isOwner: boolean = false;
  isDropdownOpen: boolean = false;
  selectedSortOption: string = 'โพสต์ล่าสุด'; // ค่าเริ่มต้น
  activeReportId: number | null = null; // เก็บ ID ของการ์ดที่กำลังเปิดเมนู (ถ้าไม่มีให้เป็น null)
  constructor(private http: HttpClient, private router: Router, private authService: AuthService, private constants: Constants) { }


  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();

    const user = this.authService.getUser();
    this.userID = user.uid;
    console.log(this.userID);

    this.getData();

  }
  getData() {
    this.http.get<any>(`${this.constants.API}/review/question/date/` + this.userID)
      .subscribe(res => {
        if (res.status === true) {
          this.questionList = res.result.map((question: any) => ({
            ...question,
            // แปลง Path รูปผ่าน Service
            profile: this.authService.getProfileImageUrl(question.profile, question.is_anonymous),
            is_saved: (question.is_saved === 1 || question.is_saved === true)
          }));
          console.log(this.questionList);
        }
      });
  }
  saveToFavorites(questionID: number) {
    if (this.isLoggedIn === false) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณาเข้าสู่ระบบก่อน</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    } else {
      const question = this.questionList.find(q => q.id === questionID);
      if (!question) return;
      const previousState = question.is_saved;
      question.is_saved = !question.is_saved;
      const data = { uid: this.userID, questionID: questionID };

      this.http.post<any>(`${this.constants.API}/favorite/question`, data)
        .subscribe({
          next: (response) => {
            if (response.status == true) {
              if (response.action === 'added') {
                Swal.fire({
                  html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">บันทึกโพสต์สำเร็จ</div>',
                  icon: 'success',
                  timer: 1500,
                  showConfirmButton: false
                });
              }
            } else {
              question.is_saved = previousState;
            }
          },
          error: (error) => {
            question.is_saved = previousState;
            Swal.fire({
              html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง</div>',
              icon: 'error',
              confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
              confirmButtonColor: '#000000',
              color: '#000000'
            });
          }
        });
    }
  }
  linkToQuestionDetail(questionID: any) {
    this.router.navigate(['post/question/details'], {
      state: { questionID: questionID }
    });
  }
  toggleSave(btn: any) {
    // คำสั่ง classList.toggle คือการสลับ class
    // ถ้ามี .saved อยู่จะเอาออก, ถ้าไม่มีจะใส่เพิ่มเข้าไป
    btn.classList.toggle("saved");

    // (ลูกเล่นเพิ่มเติม) เปลี่ยนข้อความตามสถานะ
    if (btn.classList.contains("saved")) {
      btn.innerText = "บันทึกแล้ว";
    } else {
      btn.innerText = "บันทึกโพสต์";
    }
  }
  // รายการตัวเลือก (เพิ่มลดได้ง่ายๆ ที่นี่)
  sortOptions: string[] = [
    'โพสต์ล่าสุด',
    'จำนวนไลค์',
    'รีวิวที่มีคอมเมนต์',
    'คะแนนรีวิวสูงสุด'
  ];
  reportReasons: any[] = [
    'เนื้อหาไม่เหมาะสม',
    'สแปมหรือโฆษณา',
    'คำพูดสร้างความเกลียดชัง',
    'ข้อมูลเท็จ'
  ];

  create() {
    if (this.isLoggedIn === false) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณาเข้าสู่ระบบก่อน</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }
    else {
      this.router.navigate(['/create/question']);
    }

  }

  // ฟังก์ชันเปิด/ปิด เมนูตาม ID ของโพสต์
  toggleReportMenu(id: number, event: Event) {
    event.stopPropagation(); // ป้องกันไม่ให้ Event ทะลุไปปิดเมนูทันที
    if (this.activeReportId === id) {
      this.activeReportId = null; // ถ้าเปิดอยู่แล้ว ให้ปิด
    } else {
      this.activeReportId = id; // เปิดเมนูของ ID นี้
    }
  }

  // ฟังก์ชันเมื่อกดเลือกหัวข้อ
  selectReportReason(id: number, reason: string) {
    console.log(`Report Post ID: ${id}, Reason: ${reason}`);
    alert(`รายงานโพสต์เรียบร้อย: ${reason}`);
    this.activeReportId = null; // ปิดเมนูหลังเลือกเสร็จ
  }

  // (Optional) คลิกที่ว่างๆ แล้วให้เมนูปิด
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any) {
    event.stopPropagation();
    this.activeReportId = null;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectOption(option: string) {
    this.selectedSortOption = option;
    this.isDropdownOpen = false; // ปิด dropdown หลังเลือก
    // TODO: เรียกฟังก์ชัน sort ข้อมูลจริงที่นี่
    console.log('Selected:', option);
  }
  questions = [
    {
      id: 1,
      username: 'Night',
      date: '02-02-2024',
      rating: 5,
      content: 'แนะนำอาจารย์ที่ดีมากๆครับ คอร์สนี้ดีมากๆครับ',
      likes: 1,
      comments: 0
    },
    {
      id: 2,
      username: 'N***t',
      date: '01-02-2024',
      rating: 3,
      content: 'CDDDD',
      likes: 0,
      comments: 0
    },
    {
      id: 3,
      username: 'Nt000222222222222222',
      date: '03-01-2024',
      rating: 3,
      content: 'ABDHD',
      likes: 11,
      comments: 3
    }
  ];

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }
  back() {
    history.back();
  }

}
