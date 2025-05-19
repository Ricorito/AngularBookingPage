import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from "@angular/forms"
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
import { RoomService } from "../../../services/room.service"
import { HotelService } from "../../../services/hotel.service"
import { Room } from "../../../models/room.model"
import { Hotel } from "../../../models/hotel.model"
import { Observable, of, switchMap } from "rxjs"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-room-form",
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
  templateUrl: "./room-form.component.html",
  styleUrls: ["./room-form.component.scss"],
})
export class RoomFormComponent implements OnInit {
  roomForm!: FormGroup
  hotels$!: Observable<Hotel[]>
  isEditMode = false
  isLoading = false
  isSubmitting = false
  roomId: string | null = null
  preselectedHotelId: string | null = null
  amenityInput = ""

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private hotelService: HotelService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.hotels$ = this.hotelService.getHotels()

    this.route.queryParams.subscribe((params) => {
      this.preselectedHotelId = params["hotelId"] || null
    })

    this.initForm()

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get("id")
          this.roomId = id
          this.isEditMode = !!id

          if (id) {
            this.isLoading = true
            return this.roomService.getRoom(id)
          }

          return of(null)
        }),
      )
      .subscribe({
        next: (room) => {
          if (room) {
            this.populateForm(room)
          } else if (this.preselectedHotelId) {
            // Ha van előre kiválasztott hotel ID, akkor beállítjuk az űrlapon
            this.roomForm.patchValue({ hotelId: this.preselectedHotelId })
          }
          this.isLoading = false
        },
        error: (error) => {
          this.isLoading = false
          this.snackBar.open("Hiba a szoba betöltésekor", "Bezárás", { duration: 3000 })
          console.error(error)
        },
      })
  }

  initForm(): void {
    this.roomForm = this.fb.group({
      hotelId: [this.preselectedHotelId || "", Validators.required],
      number: ["", Validators.required],
      type: ["single", Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      capacity: [1, [Validators.required, Validators.min(1)]],
      description: ["", Validators.required],
      amenities: this.fb.array([]),
      images: this.fb.array([this.fb.control("")]),
      isAvailable: [true],
    })
  }

  populateForm(room: Room): void {
    this.roomForm.patchValue({
      hotelId: room.hotelId,
      number: room.number,
      type: room.type,
      price: room.price,
      capacity: room.capacity,
      description: room.description,
      isAvailable: room.isAvailable,
    })

    // Amenities feltöltése
    const amenitiesArray = this.roomForm.get("amenities") as FormArray
    amenitiesArray.clear()
    if (room.amenities && room.amenities.length > 0) {
      room.amenities.forEach((amenity) => {
        amenitiesArray.push(this.fb.control(amenity))
      })
    }

    // Képek feltöltése
    const imagesArray = this.roomForm.get("images") as FormArray
    imagesArray.clear()
    if (room.images && room.images.length > 0) {
      room.images.forEach((image) => {
        imagesArray.push(this.fb.control(image))
      })
    } else {
      imagesArray.push(this.fb.control(""))
    }
  }

  get amenities(): FormArray {
    return this.roomForm.get("amenities") as FormArray
  }

  get images(): FormArray {
    return this.roomForm.get("images") as FormArray
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
    const imagesArray = this.roomForm.get('images') as FormArray;
  
    if (imagesArray.length === 1) {
      imagesArray.at(0).setValue("");
    } else if (imagesArray.length > 1) {
      imagesArray.removeAt(index);
    }
  }



  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
  
    const files = Array.from(input.files);
  
    const readerPromises = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);  // A fájl tartalma base64 formátumban
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);  // Alakítja át a fájlt base64-re
      });
    });
  
    Promise.all(readerPromises).then(base64Images => {
      const imagesArray = this.roomForm.get('images') as FormArray;
  
      // Megkeressük az első üres pozíciót, és oda tesszük a képet
      base64Images.forEach(image => {
        let added = false;
        
        // Keresünk egy üres helyet
        for (let i = 0; i < imagesArray.length; i++) {
          if (!imagesArray.at(i).value) {
            imagesArray.at(i).setValue(image);  // Üres helyre helyezzük az új képet
            added = true;
            break;
          }
        }
  
        // Ha nincs üres hely, akkor új elemet adunk hozzá
        if (!added) {
          imagesArray.push(this.fb.control(image));
        }
      });
    });
  }
  onSubmit(): void {
    if (this.roomForm.invalid) return

    this.isSubmitting = true
    const formValue = this.roomForm.value

    formValue.images = formValue.images.filter((url: string) => url.trim() !== "")

    if (this.isEditMode && this.roomId) {
      this.roomService.updateRoom(this.roomId, formValue).subscribe({
        next: () => {
          this.isSubmitting = false
          this.snackBar.open("Szoba sikeresen frissítve", "Bezárás", { duration: 3000 })
          if (this.preselectedHotelId) {
            this.router.navigate(["/hotels", this.preselectedHotelId])
          } else {
            this.router.navigate(["/rooms"])
          }
        },
        error: (error) => {
          this.isSubmitting = false
          this.snackBar.open("Hiba a szoba frissítésekor", "Bezárás", { duration: 3000 })
          console.error(error)
        },
      })
    } else {
      this.roomService.addRoom(formValue).subscribe({
        next: () => {
          this.isSubmitting = false
          this.snackBar.open("Szoba sikeresen létrehozva", "Bezárás", { duration: 3000 })
          if (this.preselectedHotelId) {
            this.router.navigate(["/hotels", this.preselectedHotelId])
          } else {
            this.router.navigate(["/rooms"])
          }
        },
        error: (error) => {
          this.isSubmitting = false
          this.snackBar.open("Hiba a szoba létrehozásakor", "Bezárás", { duration: 3000 })
          console.error(error)
        },
      })
    }
  }
}

