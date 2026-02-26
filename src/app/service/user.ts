import { Injectable } from '@angular/core';
// สำคัญ: อย่าลืมแก้ path ของ environment ให้ตรงกับโปรเจกต์ของคุณนะครับ
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userKey = 'auth_user';

  // ==========================================
  // เพิ่มฟังก์ชันจัดการ URL รูปโปรไฟล์ที่นี่
  // ==========================================
  // ใน AuthService
  getProfileImageUrl(profileFileName: string | null | undefined, isAnonymous: boolean = false): string {
    const defaultPicName = "1e346a4b-7fb4-4f94-929d-9093df91ce85.jpg";

    // 1. ถ้าเป็นการโพสต์/คอมเมนต์แบบ "ไม่ระบุตัวตน" ให้บังคับใช้รูป Default เสมอ
    if (isAnonymous) {
      return `${environment.apiUrl}/images/${defaultPicName}`;
    }

    // 2. ถ้าระบุตัวตน แต่ไม่มีรูป หรือเป็นรูป Default เดิม ให้ดึงจากโฟลเดอร์ชั้นนอก
    if (!profileFileName || profileFileName === defaultPicName) {
      return `${environment.apiUrl}/images/${defaultPicName}`;
    } 
    // 3. นอกนั้น (อัปโหลดรูปใหม่) ให้ดึงจากโฟลเดอร์ user-profile
    else {
      return `${environment.apiUrl}/images/user-profile/${profileFileName}`;
    }
  }
  // ==========================================

  setUser(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser() {
    const data = localStorage.getItem(this.userKey);

    try {
      if (!data) {
        // ไม่มี user → ให้ default
        return {
          uid: null,
          type: 1
        };
      }

      const parsed = JSON.parse(data);

      return {
        uid: parsed?.uid ?? null,
        type: parsed?.type ?? 1
      };

    } catch {
      // ถ้า parse error → ส่ง default
      return {
        uid: null,
        type: 1
      };
    }
  }

  isLoggedIn(): boolean {
    const user = this.getUser();
    return !!(user && user.uid);
  }

  logout() {
    localStorage.removeItem(this.userKey);
  }
}