import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-terms-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './terms-dialog.component.html',
})
export class TermsDialogComponent {}
