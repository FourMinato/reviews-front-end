import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../service/user';
import { Router } from '@angular/router';
import { Constants } from '../../config/constant';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
interface ApiResponse<T> {
  status: boolean;
  result: T;
  message?: string;
}

declare const google: any;
declare var grecaptcha: any;

@Component({
  selector: 'app-login',
  imports: [HttpClientModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  captchaToken: string = '';
  constructor(private http: HttpClient,
    private authService: AuthService, private router: Router, private constants: Constants) { }

  ngOnInit() {

  }
  ngAfterViewInit() {
    this.loadRecaptcha();
  }
  login() {
    // 1. ตรวจสอบชื่อผู้ใช้หรืออีเมล
    if (!this.email.trim()) {
      this.showError('กรุณาใส่ชื่อผู้ใช้หรืออีเมล');
      return;
    }

    // 2. ตรวจสอบรหัสผ่าน
    if (!this.password.trim()) {
      this.showError('กรุณาใส่รหัสผ่าน');
      return;
    }

    // 3. ตรวจสอบ reCAPTCHA
    if (!this.captchaToken) {
      this.showRequireCaptcha();
      return;
    }

    const userData = {
      email: this.email,
      password: this.password,
      captcha: this.captchaToken
    };

    this.http.post<ApiResponse<any>>(`${this.constants.API}/user/login`, userData)
      .subscribe({
        next: (response) => {
          // กรณี status เป็น false จาก API (เช่น ไม่พบผู้ใช้ หรือ รหัสผ่านผิด)
          if (!response.status) {
            // ดึงข้อความแจ้งเตือนจากหลังบ้านมาแสดง (เช่น 'ไม่พบผู้ใช้', 'รหัสผ่านไม่ถูกต้อง')
            this.showError(response.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            return;
          }

          // กรณีเข้าสู่ระบบสำเร็จ
          this.authService.setUser(response);
          this.showSuccess('เข้าสู่ระบบสำเร็จ')
            .then(() => {
              if (typeof grecaptcha !== 'undefined') {
                grecaptcha.reset();
              }
              this.loadRecaptcha();
              this.router.navigateByUrl('/');
            });
        },
        error: (err) => {
          // กรณีเกิด Error จาก Server (404, 500)
          const errorMessage = err.error?.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์';
          this.showError(errorMessage);
        }
      });
  }
  googleLogin() {
    if (!this.captchaToken) {
      this.showRequireCaptcha();
      return;
    }

    const client = google.accounts.oauth2.initTokenClient({
      client_id: environment.googleClientId,
      scope: 'openid email profile',
      callback: (res: any) => {

        if (!res?.access_token) {
          this.showError('ไม่สามารถรับ Access Token ได้');
          return;
        }

        this.http.post(`${this.constants.API}/google/login/google`, {
          token: res.access_token,
          captcha: this.captchaToken
        })
          .subscribe({
            next: (response: any) => {

              if (!response.success) {
                this.showError(response.error || 'เข้าสู่ระบบไม่สำเร็จ');
                return;
              }

              this.authService.setUser(response.user);

              this.showSuccess(response.message || 'เข้าสู่ระบบสำเร็จ')
                .then(() => {
                  grecaptcha.reset();
                  this.loadRecaptcha();
                  this.router.navigateByUrl('/');
                });
            },

            error: (err) => {
              this.showError(err.error?.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
            }
          });
      }
    });

    client.requestAccessToken();
  }


  loadRecaptcha() {
    setTimeout(() => {
      if (document.getElementById('recaptcha-container')) {
        document.getElementById('recaptcha-container')!.innerHTML = "";

        grecaptcha.render('recaptcha-container', {
          'sitekey': environment.reCaptchaSitekey,
          'callback': (token: any) => {
            this.captchaToken = token;
          }
        });
      }
    }, 500);
  }
  back() {
    history.back();
  }
  private showError(message: string) {
    Swal.fire({
      html: `<div style="font-size: 1.5rem; font-family: 'Kanit','Prompt','Mitr','Noto Sans Thai',sans-serif;">${message}</div>`,
      icon: 'error',
      confirmButtonText: `<div style="font-size:1.2rem; font-family: 'Kanit','Prompt','Mitr','Noto Sans Thai',sans-serif;">ตกลง</div>`,
      confirmButtonColor: '#000000',
      color: '#000000'
    });
  }

  private showSuccess(message: string) {
    return Swal.fire({
      html: `<div style="font-size: 1.5rem; font-family: 'Kanit','Prompt','Mitr','Noto Sans Thai',sans-serif;">${message}</div>`,
      icon: 'success',
      confirmButtonText: `<div style="font-size:1.2rem; font-family: 'Kanit','Prompt','Mitr','Noto Sans Thai',sans-serif;">ตกลง</div>`,
      confirmButtonColor: '#28D16F',
      color: '#000000'
    });
  }

  private showRequireCaptcha() {
    this.showError('กรุณาทำ reCAPTCHA ก่อน');
  }
}
