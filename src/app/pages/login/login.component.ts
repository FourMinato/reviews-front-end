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
    private authService: AuthService, private router: Router,  private constants: Constants) { }

  ngOnInit() {

  }
    ngAfterViewInit() {
    this.loadRecaptcha();
  }
  login() {
  if (!this.email.trim() || !this.password.trim()) {
    this.showError('กรุณากรอกอีเมลและรหัสผ่าน');
    return;
  }

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
        if (!response.status) {
          this.showError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
          return;
        }

        this.authService.setUser(response);

        this.showSuccess('เข้าสู่ระบบสำเร็จ')
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
  back(){
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
