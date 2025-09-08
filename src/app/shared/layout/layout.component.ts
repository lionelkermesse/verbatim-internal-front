import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedZorroModule } from '../shared-zorro.module';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [SharedZorroModule, RouterOutlet]
})
export class LayoutComponent {

}
