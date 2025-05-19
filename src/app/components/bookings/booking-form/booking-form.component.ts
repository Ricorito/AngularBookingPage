import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { BookingService } from "../../../services/booking.service";
import { RoomService } from "../../../services/room.service";
import { AuthService } from "../../../services/auth.service";
import { Booking } from "../../../models/booking.model";
import { Room } from "../../../models/room.model";
import { Observable, of, switchMap, map, combineLatest } from "rxjs";

@Component({
  selector: "app-booking-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: "./booking-form.component.html",
  styleUrls: ["./booking-form.component.scss"],
})
export class BookingFormComponent implements OnInit {
  bookingForm!: FormGroup;
  availableRooms$!: Observable<Room[]>;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  bookingId: string | null = null;
  selectedRoomPrice: number = 0;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private roomService: RoomService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.availableRooms$ = this.roomService.getRooms();

    combineLatest([
      this.bookingForm.get('checkInDate')!.valueChanges,
      this.bookingForm.get('checkOutDate')!.valueChanges
    ]).subscribe(([checkIn, checkOut]) => {
      if (checkIn && checkOut && this.selectedRoomPrice > 0) {
        this.calculateTotalPrice(checkIn, checkOut);
      }
    });

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get("id");
          this.bookingId = id;
          this.isEditMode = !!id;

          if (id) {
            this.isLoading = true;
            return this.bookingService.getBooking(id);
          }

          return of(null);
        })
      )
      .subscribe({
        next: (booking: Booking | null) => {
          if (booking) {
            this.populateForm(booking);
            this.availableRooms$.pipe(
              map((rooms: Room[]) => rooms.find((r: Room) => r.id === booking.roomId))
            ).subscribe((room: Room | undefined) => {
              if (room) {
                this.selectedRoomPrice = room.price;
              }
            });
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open("Hiba a foglalás betöltése során", "Bezár", { duration: 3000 });
          console.error(error);
        },
      });
  }

  initForm(): void {
    this.bookingForm = this.fb.group({
      guestName: ["", Validators.required],
      guestEmail: ["", [Validators.required, Validators.email]],
      guestPhone: ["", Validators.required],
      roomId: ["", Validators.required],
      checkInDate: [new Date(), Validators.required],
      checkOutDate: [new Date(Date.now() + 86400000), Validators.required],
      totalPrice: [0, [Validators.required, Validators.min(1)]],
      status: ["pending"],
    });
  }

  onRoomSelected(roomId: string): void {
    this.availableRooms$.pipe(
      map((rooms: Room[]) => rooms.find((room: Room) => room.id === roomId))
    ).subscribe((room: Room | undefined) => {
      if (room) {
        this.selectedRoomPrice = room.price;
        this.calculateTotalPrice(
          this.bookingForm.get('checkInDate')?.value,
          this.bookingForm.get('checkOutDate')?.value
        );
      }
    });
  }

  public calculateTotalPrice(checkIn: Date, checkOut: Date): void {
    if (!checkIn || !checkOut || this.selectedRoomPrice <= 0) return;

    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (nights > 0) {
      const totalPrice = nights * this.selectedRoomPrice;
      this.bookingForm.get('totalPrice')?.setValue(totalPrice);
    } else {
      this.bookingForm.get('totalPrice')?.setValue(0);
    }
  }

  populateForm(booking: Booking): void {
    this.bookingForm.patchValue({
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      roomId: booking.roomId,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      totalPrice: booking.totalPrice,
      status: booking.status,
    });
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) return;

    this.isSubmitting = true;
    const formValue = this.bookingForm.value;

    if (this.isEditMode && this.bookingId) {
      this.updateBooking(formValue);
    } else {
      this.createBooking(formValue);
    }
  }

  private updateBooking(formValue: Booking): void {
    this.bookingService.updateBooking(this.bookingId!, formValue).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open("Foglalás sikeresen frissítve!", "Bezár", { duration: 3000 });
        this.router.navigate(["/bookings"]);
      },
      error: (error) => {
        this.handleError(error, "Hiba a foglalás frissítése során");
      },
    });
  }

  private createBooking(formValue: Booking): void {
    this.authService.currentUser$
      .pipe(
        switchMap((user) => {
          if (!user) {
            throw new Error("Felhasználó nincs hitelesítve");
          }

          const newBooking: Omit<Booking, "id" | "createdAt" | "updatedAt"> = {
            ...formValue,
            userId: user.uid,
            status: "pending",
          };

          return this.bookingService.addBooking(newBooking);
        })
      )
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.snackBar.open("Sikeres foglalás!", "Bezár", { duration: 3000 });
          this.router.navigate(["/bookings"]);
        },
        error: (error) => {
          this.handleError(error, "Hiba a foglalás során!");
        },
      });
  }

  private handleError(error: any, message: string): void {
    this.isSubmitting = false;
    this.snackBar.open(message, "Bezár", { duration: 3000 });
    console.error(error);
  }
}