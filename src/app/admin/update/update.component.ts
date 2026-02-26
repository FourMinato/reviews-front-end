import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-update',
  imports: [FormsModule, CommonModule],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss'
})
export class UpdateComponent {

selectedSubject = { 
    category: 1, 
    subcode: '0041001', 
    name: 'ภาษาอังกฤษเพื่อการสื่อสาร' 
  };

  // รายการหมวดหมู่สำหรับวนลูปใน select (ถ้ามีเยอะ)
  categories = [1, 2, 3, 4, 5];

  onSave() {
    console.log('ข้อมูลที่แก้ไขแล้ว:', this.selectedSubject);
    // ส่งข้อมูลไปหา API เพื่อ update ต่อไป
  }
    back(){
     history.back();
  }

}
