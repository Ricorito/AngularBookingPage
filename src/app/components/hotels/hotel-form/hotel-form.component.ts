import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, type FormArray } from "@angular/forms"
import { FormsModule } from "@angular/forms"
import { ActivatedRoute, Router, RouterLink } from "@angular/router"
import { MatCardModule } from "@angular/material/card"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatChipsModule } from "@angular/material/chips"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar"
import { HotelService } from "../../../services/hotel.service"
import { Hotel } from "../../../models/hotel.model"
import { of, switchMap } from "rxjs"

@Component({
  selector: "app-hotel-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: "./hotel-form.component.html",
  styleUrls: ["./hotel-form.component.scss"],
})
export class HotelFormComponent implements OnInit {
  hotelForm!: FormGroup
  isEditMode = false
  isLoading = false
  isSubmitting = false
  hotelId: string | null = null
  amenityInput = ""

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.initForm()

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get("id")
          this.hotelId = id
          this.isEditMode = !!id

          if (id) {
            this.isLoading = true
            return this.hotelService.getHotel(id)
          }

          return of(null)
        }),
      )
      .subscribe({
        next: (hotel) => {
          if (hotel) {
            this.populateForm(hotel)
          }
          this.isLoading = false
        },
        error: (error) => {
          this.isLoading = false
          this.snackBar.open("Hiba a hotel betöltésekor", "Bezárás", { duration: 3000 })
          console.error(error)
        },
      })
  }

  initForm(): void {
    this.hotelForm = this.fb.group({
      name: ["", Validators.required],
      address: ["", Validators.required],
      city: ["", Validators.required],
      country: ["", Validators.required],
      description: ["", Validators.required],
      stars: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      amenities: this.fb.array([]),
      images: this.fb.array([this.fb.control("")]),
      contactEmail: ["", [Validators.required, Validators.email]],
      contactPhone: ["", Validators.required],
    })
  }

  populateForm(hotel: Hotel): void {
    this.hotelForm.patchValue({
      name: hotel.name,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      description: hotel.description,
      stars: hotel.stars,
      contactEmail: hotel.contactEmail,
      contactPhone: hotel.contactPhone,
    })

    // Amenities feltöltése
    const amenitiesArray = this.hotelForm.get("amenities") as FormArray
    amenitiesArray.clear()
    if (hotel.amenities && hotel.amenities.length > 0) {
      hotel.amenities.forEach((amenity) => {
        amenitiesArray.push(this.fb.control(amenity))
      })
    }

    // Képek feltöltése
    const imagesArray = this.hotelForm.get("images") as FormArray
    imagesArray.clear()
    if (hotel.images && hotel.images.length > 0) {
      hotel.images.forEach((image) => {
        imagesArray.push(this.fb.control(image))
      })
    } else {
      imagesArray.push(this.fb.control(""))
    }
  }

  get amenities(): FormArray {
    return this.hotelForm.get("amenities") as FormArray
  }

  get images(): FormArray {
    return this.hotelForm.get("images") as FormArray
  }

  addAmenity(): void {
    if (this.amenityInput.trim()) {
      this.amenities.push(this.fb.control(this.amenityInput.trim()))
      this.amenityInput = ""
    }
  }

  removeAmenity(index: number): void {
    this.amenities.removeAt(index)
  }

  addImage(): void {
    this.images.push(this.fb.control(""))
  }

  removeImage(index: number): void {
    if (this.images.length > 1) {
      this.images.removeAt(index)
    }
  }

  onSubmit(): void {
    if (this.hotelForm.invalid) return

    this.isSubmitting = true
    const formValue = this.hotelForm.value

    // Üres képek eltávolítása
    formValue.images = formValue.images.filter((url: string) => url.trim() !== "")

    if (this.isEditMode && this.hotelId) {
      this.hotelService.updateHotel(this.hotelId, formValue).subscribe({
        next: () => {
          this.isSubmitting = false
          this.snackBar.open("Hotel sikeresen frissítve", "Bezárás", { duration: 3000 })
          this.router.navigate(["/hotels"])
        },
        error: (error) => {
          this.isSubmitting = false
          this.snackBar.open("Hiba a hotel frissítésekor", "Bezárás", { duration: 3000 })
          console.error(error)
        },
      })
    } else {
      this.hotelService.addHotel(formValue).subscribe({
        next: () => {
          this.isSubmitting = false
          this.snackBar.open("Hotel sikeresen létrehozva", "Bezárás", { duration: 3000 })
          this.router.navigate(["/hotels"])
        },
        error: (error) => {
          this.isSubmitting = false
          this.snackBar.open("Hiba a hotel létrehozásakor", "Bezárás", { duration: 3000 })
          console.error(error)
        },
      })
    }
  }
}

