import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-favorite',
  imports: [CommonModule],
  templateUrl: './favorite.component.html',
  styleUrl: './favorite.component.scss'
})
export class FavoriteComponent {
currentTab: 'review' | 'qa' = 'review'; // เริ่มต้นที่ Tab รีวิว
  sortBy: 'code' | 'date' = 'date';      // เริ่มต้นเรียงตามวันที่

  // Mock Data: รีวิวรายวิชา
  reviews = [
    { id: 1, subjectCode: '0041001', savedDate: new Date('2025-02-02') },
    { id: 2, subjectCode: '0045006', savedDate: new Date('2025-01-31') },
    { id: 3, subjectCode: '0041002', savedDate: new Date('2025-01-10') },
    { id: 4, subjectCode: '0011001', savedDate: new Date('2025-02-11') },
  ];

  // Mock Data: ถามตอบ
  questions = [
    { id: 101, title: 'โพสต์ของ User007', savedDate: new Date('2025-02-02') },
    { id: 102, title: 'โพสต์ของ User012', savedDate: new Date('2025-01-31') },
    { id: 103, title: 'โพสต์ของ User001', savedDate: new Date('2025-01-10') },
  ];

  constructor() { }

  ngOnInit(): void {
    // โหลดครั้งแรกให้เรียงข้อมูลตามค่า default
    this.sortReviews(this.sortBy);
  }

  // ฟังก์ชันสลับ Tab
  setTab(tab: 'review' | 'qa') {
    this.currentTab = tab;
  }

  // ฟังก์ชันเรียงลำดับ (เฉพาะ Tab รีวิว)
  sortReviews(criteria: 'code' | 'date') {
    this.sortBy = criteria;

    if (criteria === 'code') {
      // เรียงตามรหัสวิชา (น้อย -> มาก)
      this.reviews.sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));
    } else {
      // เรียงตามวันที่ (ใหม่ล่าสุด -> เก่า)
      this.reviews.sort((a, b) => b.savedDate.getTime() - a.savedDate.getTime());
    }
  }
}
