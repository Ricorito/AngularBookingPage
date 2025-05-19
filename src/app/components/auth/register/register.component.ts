import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { MatCardModule } from "@angular/material/card"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatButtonModule } from "@angular/material/button"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar"
import { AuthService } from "../../../services/auth.service"
import {MatRadioModule} from '@angular/material/radio';
import { MatDialog } from "@angular/material/dialog"
import { TermsDialogComponent } from '../terms/terms-dialog.component'; // az útvonal lehet relatív

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatRadioModule,
  
  ],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent {
  registerForm: FormGroup
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,

  ) {
    this.registerForm = this.fb.group(
      {
        displayName: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
        acceptTerms: ['', [Validators.required, Validators.pattern(/igen/)]],
        subscribeToNewsletter: [''],
      },
      { validators: this.passwordMatchValidator },
    )
  }
  openTermsDialog() {
    this.dialog.open(TermsDialogComponent);
  }
  passwordMatchValidator(g: FormGroup) {
    const password = g.get("password")?.value
    const confirmPassword = g.get("confirmPassword")?.value

    return password === confirmPassword ? null : { passwordMismatch: true }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return

    this.isLoading = true
    const { email, password, displayName } = this.registerForm.value

    this.authService.register(email, password, displayName).subscribe({
      next: () => {
        this.snackBar.open("Sikeres regisztráció!", "Close", { duration: 3000 })
        this.router.navigate(["/dashboard"])
      },
      error: (error) => {
        this.isLoading = false
        this.snackBar.open(error.message || "Hiba! Sikertelen regisztráció, kérlek próbáld újra", "Close", { duration: 5000 })
      },
    })
  }
}

