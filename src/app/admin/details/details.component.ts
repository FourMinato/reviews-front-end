import { CommonModule } from '@angular/common';
import { HttpClient , HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-details',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {

  subjects = [
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' },
    { code: '0041001', name: 'ภาษาอังกฤษ' }

  ];
      constructor(private router: Router, private http: HttpClient) { }

  back(){
     history.back();
  }
  details(){
    this.router.navigate(['/admin/edit'])
    console.log("tester");
  }
}
