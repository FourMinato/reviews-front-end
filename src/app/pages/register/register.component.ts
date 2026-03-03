import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../service/user';
import { Router } from '@angular/router';
import { Constants } from '../../config/constant';
import { environment } from '../../../environments/environment.prod';
import { FormsModule } from '@angular/forms';


declare const google: any;
declare var grecaptcha: any;

@Component({
  selector: 'app-register',
  imports: [HttpClientModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  name: string = '';
  email: string = ''
  password: string = '';
  confirmPassword: string = '';
  captchaToken: string = '';
      constructor(private http: HttpClient,
    private authService: AuthService, private router: Router,  private constants: Constants) { }


  ngOnInit() {

  }
  register() {
    // 1. ตรวจสอบชื่อผู้ใช้
    if (!this.name.trim()) {
      this.showError('กรุณาใส่ชื่อผู้ใช้');
      return;
    }

    // 2. ตรวจสอบอีเมล
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!this.email.trim()) {
      this.showError('กรุณาใส่อีเมล');
      return;
    } else if (!emailPattern.test(this.email)) {
      this.showError('กรุณาใส่อีเมลที่ใช้ได้');
      return;
    }

    // 3. ตรวจสอบรหัสผ่าน
    if (!this.password.trim()) {
      this.showError('กรุณาใส่รหัสผ่าน');
      return;
    }

    // 4. ตรวจสอบความยาวรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
    if (this.password.length < 6) {
      this.showError('กรุณาใส่รหัสผ่านให้มีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    // 5. ตรวจสอบการยืนยันรหัสผ่าน
    if (!this.confirmPassword.trim()) {
      this.showError('กรุณายืนยันรหัสผ่าน');
      return;
    }

    // 6. ตรวจสอบรหัสผ่านให้ตรงกัน
    if (this.password !== this.confirmPassword) {
      this.showError('รหัสผ่านยืนยันไม่ตรงกับรหัสผ่าน');
      return;
    }

    // 7. ตรวจสอบ reCAPTCHA
    if (!this.captchaToken) {
      this.showRequireCaptcha();
      return;
    }

    // --- ส่วนประมวลผลข้อมูล (Logic เดิมของคุณ) ---
    let anonymousName = this.name;
    if (this.name.length > 2) {
      anonymousName = this.name[0] + '*'.repeat(this.name.length - 2) + this.name[this.name.length - 1];
    } else if (this.name.length === 2) {
      anonymousName = this.name[0] + '*';
    }

    const userData = {
      name: this.name,
      email: this.email,
      password: this.password,
      anonymous_name: anonymousName,
      profile: null,
      type: 1
    };

    // ส่งข้อมูลไปยัง Backend
    this.http.post(`${this.constants.API}/user/register`, userData)
      .subscribe({
        next: (response: any) => {
          if (response.status === false) {
            this.showError(response.message || 'สมัครสมาชิกไม่สำเร็จ');
            return;
          }
          this.showSuccess(response.message || 'สมัครสมาชิกสำเร็จ')
            .then(() => {
              if (typeof grecaptcha !== 'undefined') {
                grecaptcha.reset();
              }
              this.loadRecaptcha();
              this.router.navigate(['/login']);
            });
        },
        error: (err) => {
          this.showError(err.error?.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
        }
      });
  }
  ngAfterViewInit() {
    this.loadRecaptcha();
  }
  googleRegister() {

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

      this.http.post(`${this.constants.API}/google/register/google`, {
        token: res.access_token,
        captcha: this.captchaToken
      })
      .subscribe({

        next: (response: any) => {

          if (response.status === false) {
            this.showError(response.message || 'สมัครสมาชิกไม่สำเร็จ');
            return;
          }

          this.showSuccess(response.message || 'สมัครสมาชิกสำเร็จ')
            .then(() => {
              grecaptcha.reset();
              this.loadRecaptcha();
              this.router.navigate(['/login']);
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
