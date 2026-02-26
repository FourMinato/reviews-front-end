import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Constants } from '../../../../config/constant';
import { AuthService } from '../../../../service/user';

interface Comment {
  id: string;
  username: string;
  avatarUrl: string; // ใช้ URL หรือ path ของรูป
  content: string;
  isReportable: boolean;
  replies: Comment[]; // ต้องเป็น Type Comment[]
  showReplies: boolean; // ต้องมีตัวนี้
}

interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  date: string;
  content: string;
  comments: Comment[];
}

@Component({
  selector: 'app-postdetails',
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './postdetails.component.html',
  styleUrl: './postdetails.component.scss'
})
export class PostdetailsComponent {

  newCommentText: string = '';
  // 1. ตัวแปรควบคุม Popup
  showPopup: boolean = false; // ถ้า true คือเปิด, false คือปิด
  replyToUser: string = '';   // เก็บชื่อคนที่จะตอบ
  replyMessage: string = '';  // เก็บข้อความที่พิมพ์

  questionID: string = '';
  questions: any[] = [];
  comments: any[] = [];
  commentText: string = '';
  isOwner: boolean = false; // ตัวแปรนี้จะใช้เช็คว่าโพสต์นี้เป็นของเราไหม
  isLoggedIn: boolean = false;
  userID: string = '';
  replyToID: string = '';
  repliesText: string = '';
  constructor(private http: HttpClient, private constants: Constants, private authService: AuthService) { }
  ngOnInit() {
    const ID = history.state.questionID || '';
    this.questionID = ID;
    console.log("questionID id is " + this.questionID);

    this.getDetailQuestion();
    this.getComments('question', this.questionID);
  }
  checkLogin() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }
  checkUser() {
    const uid = this.authService.getUser().uid;
    this.userID = uid;
    console.log(this.userID);

  }
  getDetailQuestion() {
    this.http.get<any>(`${this.constants.API}/detail/question/${this.questionID}`)
      .subscribe(res => {
        if (res.status === true) {
          this.questions = res.result.map((questions: any) => ({
            ...questions,
            // แปลง Path รูปภาพโพสต์หลักผ่าน Service
            profile: this.authService.getProfileImageUrl(questions.profile, questions.is_anonymous)
          }));
          if (this.questions[0].uid === this.userID) {
            this.isOwner = true;
            console.log("is owner = " + this.isOwner);
          }
        }
      });
  }
  getComments(type: 'review' | 'question', refId: string) {
    this.http.get<any>(`${this.constants.API}/comment/review/${type}/${refId}`)
      .subscribe({
        next: (response) => {
          if (response.status === true) {

            // เรียกใช้ฟังก์ชัน mapRecursive ที่เราสร้างขึ้น
            this.comments = response.data.map((comment: any) => this.mapCommentData(comment));

            console.log('Comments:', this.comments);
          }
        },
        error: (error) => {
          console.error('Error loading comments:', error);
        }
      });
  }

  // --- สร้างฟังก์ชันนี้เพิ่มครับ ---
  // ฟังก์ชันนี้จะจัดการเติม URL ให้รูป และวนลูปเข้าไปจัดการ replies ย่อยๆ ด้วย
  mapCommentData(node: any): any {
    if (node.avatarUrl && !node.avatarUrl.startsWith('http')) {
      // แปลง Path รูปคอมเมนต์ผ่าน Service
      node.avatarUrl = this.authService.getProfileImageUrl(node.avatarUrl, node.isAnonymous);
    }

    if (node.replies && node.replies.length > 0) {
      node.replies = node.replies.map((reply: any) => this.mapCommentData(reply));
    }

    return node;
  }
  reportReview(questionID: string) {

  }
  edtitReview() {

  }
  linkToProfile(userID: string) {

  }
  createComment() {

  }
  reportComment(reply: any) {
    console.log('Report logic here for ID:', reply.id);
    reply.showMenu = false; // กดแล้วปิดเมนู
    // ใส่โค้ดแจ้งเตือนหรือเรียก API ตรงนี้
  }
  openPopup(commentOrReplyID: string) {
    this.replyToID = commentOrReplyID;
    console.log('Opening popup for ID:', this.replyToID);

    this.showPopup = true;
  }
  toggleMenu(reply: any, event: Event) {
    event.stopPropagation(); // ป้องกันไม่ให้ไปกระทบ event คลิกอื่นๆ

    // ถ้ากดตัวเดิมให้ปิด (Toggle)
    if (reply.showMenu) {
      reply.showMenu = false;
    } else {
      // (Optional) ปิดเมนูของคนอื่นก่อนเปิดอันใหม่ (ต้องเขียน loop วนปิด)
      // this.closeAllMenus(); 

      reply.showMenu = true;
    }
  }
  toggleReplyMenu(reply: any, event: Event) {
    event.stopPropagation(); // ป้องกันไม่ให้ไปกระทบ event คลิกอื่นๆ

    // ถ้ากดตัวเดิมให้ปิด (Toggle)
    if (reply.showMenu) {
      reply.showMenu = false;
    } else {
      // (Optional) ปิดเมนูของคนอื่นก่อนเปิดอันใหม่ (ต้องเขียน loop วนปิด)
      // this.closeAllMenus(); 

      reply.showMenu = true;
    }
  }
  sendReply() {
    console.log(this.repliesText);
    //this.createReplies(this.replyToID);
    this.repliesText = '';
    this.showPopup = false;
  }
  postData: Post = {
    id: 'p001',
    author: 'someone015',
    authorAvatar: 'assets/default-avatar.png',
    date: '02-02-2025',
    content: 'Text Test001',
    comments: [
      {
        id: 'c001',
        username: 'user012',
        avatarUrl: '',
        content: 'เรียนกับอาจารย์ท่านไหนครับ?',
        replies: [],
        showReplies: false,
        isReportable: true
      },
      {
        id: 'c002',
        username: 'user015',
        avatarUrl: '',
        content: 'Sec ไหนดีครับ?',
        showReplies: false, // เริ่มต้นซ่อนไว้
        isReportable: true,
        replies: [
          {
            id: 'r001',
            username: 'someone015',
            avatarUrl: '',
            content: 'user015 Sec1 ครับ?',
            replies: [],
            showReplies: false,
            isReportable: true
          },
          {
            id: 'r002',
            username: 'user015',
            avatarUrl: '',
            content: 'someone015 ขอบคุณครับ',
            replies: [],
            showReplies: false,
            isReportable: true
          }
        ]
      },
      {
        id: 'c003',
        username: 'user019',
        avatarUrl: '',
        content: '***(คำหยาบที่หลุดมาได้)**** อย่าไปเรียน',
        replies: [],
        showReplies: false,
        isReportable: true
      },
      {
        id: 'c004',
        username: 'user055',
        avatarUrl: '',
        content: 'thx kub',
        replies: [],
        showReplies: false,
        isReportable: true
      }
    ]
  };

  // ฟังก์ชันจำลองการส่งคอมเม้นท์
  submitComment() {
    if (this.newCommentText.trim()) {
      const newComment: Comment = {
        id: `c${this.postData.comments.length + 1}`,
        username: 'currentUser', // จำลอง User ปัจจุบัน
        avatarUrl: 'assets/default-avatar.png',
        content: this.newCommentText,
        isReportable: true,
        replies: [],
        showReplies: false
      };

      // เพิ่มคอมเม้นท์ใหม่ลงใน Array
      this.postData.comments.push(newComment);
      this.newCommentText = ''; // ล้างช่องข้อความ
    }
  }
  toggleReplies(comment: Comment) {
    comment.showReplies = !comment.showReplies;
  }

  // 2. ฟังก์ชันเปิด Popup (เรียกเมื่อกดปุ่มตอบกลับ)

  // 3. ฟังก์ชันปิด Popup (เรียกเมื่อกดปุ่มยกเลิก หรือกดพื้นหลัง)
  closePopup() {
    this.showPopup = false;      // สั่งปิด Popup
  }

  // 4. ฟังก์ชันส่งข้อความ
}
