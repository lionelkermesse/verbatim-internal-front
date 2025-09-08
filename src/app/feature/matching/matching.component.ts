import { Component } from '@angular/core';
import { SharedZorroModule } from '../../shared/shared-zorro.module';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { MatchingService } from '../../core/services/matching.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-matching',
  templateUrl: './matching.component.html',
  styleUrls: ['./matching.component.scss'],
  standalone: true,
  imports: [SharedZorroModule, NzUploadModule, FormsModule]
})
export class MatchingComponent {
  verbatimFile: NzUploadFile[] = [];
  eventFile: NzUploadFile[] = [];
  sessionIdentifier: string = '';

  constructor(private matchingService: MatchingService, private router: Router) {}

  beforeUpload = (file: NzUploadFile, fileList: NzUploadFile[], type: string): boolean => {
    if (type === 'verbatim') {
      this.verbatimFile = [file];
    } else if (type === 'event') {
      this.eventFile = [file];
    }
    return false;
  };

  startMatching() {
    this.matchingService.startMatching(this.sessionIdentifier, this.verbatimFile[0] as any, this.eventFile[0] as any)
      .subscribe(result => {
        console.log('Matching started:', result);
        this.router.navigate(['/matching', result.sessionIdentifier, result.version]);
      });
  }
}
