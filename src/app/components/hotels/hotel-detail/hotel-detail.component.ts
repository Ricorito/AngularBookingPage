import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatTabsModule } from "@angular/material/tabs";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { HotelService } from "../../../services/hotel.service";
import { RoomService } from "../../../services/room.service";
import { BookingService } from "../../../services/booking.service";
import { AuthService } from "../../../services/auth.service";
import { Hotel } from "../../../models/hotel.model";
import { Room } from "../../../models/room.model";
import { Observable, catchError, of, switchMap } from "rxjs";

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: "app-hotel-detail",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./hotel-detail.component.html",
  styleUrls: ["./hotel-detail.component.scss"],
})
export class HotelDetailComponent implements OnInit {
  hotel$!: Observable<Hotel>;
  rooms$!: Observable<Room[]>;
  isAdmin$!: Observable<boolean>;
  bookingForm!: FormGroup;
  selectedRoom: Room | null = null;
  isSubmitting = false;
  numberOfNights: number = 0;
  totalPrice: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hotelService: HotelService,
    private roomService: RoomService,
    private bookingService: BookingService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.isAdmin$ = this.authService.isAdmin();
    this.initBookingForm();

    this.hotel$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get("id");
        if (!id) {
          this.router.navigate(["/hotels"]);
          return of(null);
        }

        return this.hotelService.getHotel(id).pipe(
          catchError((error) => {
            this.snackBar.open("Hiba a hotel betöltésekor", "Bezárás", { duration: 3000 });
            this.router.navigate(["/hotels"]);
            return of(null);
          }),
        );
      }),
    ) as Observable<Hotel>;

    this.rooms$ = this.hotel$.pipe(
      switchMap((hotel) => {
        if (!hotel) return of([]);
        return this.roomService.getRoomsByHotel(hotel.id!);
      }),
    );

    this.rooms$.subscribe((rooms) => {
      this.selectedRoom = rooms[0] || null;
      if (this.selectedRoom) {
        this.bookingForm.patchValue({ roomId: this.selectedRoom.id });
        this.calculateBookingDetails();
      }
    });

    this.bookingForm.controls['checkInDate'].valueChanges.subscribe(() => this.calculateBookingDetails());
    this.bookingForm.controls['checkOutDate'].valueChanges.subscribe(() => this.calculateBookingDetails());
  }

  initBookingForm(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    this.bookingForm = this.fb.group({
      roomId: ["", Validators.required],
      checkInDate: [new Date(), Validators.required],
      checkOutDate: [tomorrow, Validators.required],
      guestName: ["", Validators.required],
      guestEmail: ["", [Validators.required, Validators.email]],
      guestPhone: ["", Validators.required],
      numberOfGuests: [1, [Validators.required, Validators.min(1)]],
      specialRequests: [""],
    });
  }

  selectRoom(room: Room): void {
    this.selectedRoom = room;
    this.bookingForm.patchValue({ roomId: room.id });
    this.calculateBookingDetails();
  }

  selectFirstAvailableRoom(): void {
    this.rooms$.subscribe((rooms) => {
      if (rooms && rooms.length > 0) {
        this.selectRoom(rooms[0]);
      }
    });
  }

  calculateBookingDetails(): void {
    if (this.bookingForm.get('checkInDate')?.value && this.bookingForm.get('checkOutDate')?.value && this.selectedRoom) {
      const checkInDate = new Date(this.bookingForm.get('checkInDate')?.value);
      const checkOutDate = new Date(this.bookingForm.get('checkOutDate')?.value);
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      this.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.totalPrice = this.selectedRoom.price * this.numberOfNights;
    } else {
      this.numberOfNights = 0;
      this.totalPrice = 0;
    }
  }

  onDateChange(): void {
    this.calculateBookingDetails();
  }

  onSubmit(): void {
    if (this.bookingForm.invalid || !this.selectedRoom) return;

    this.isSubmitting = true;
    const formValue = this.bookingForm.value;

    this.authService.currentUser$
      .pipe(
        switchMap((user) => {
          if (!user) {
            throw new Error("Felhasználó nincs bejelentkezve");
          }

          const newBooking = {
            ...formValue,
            userId: user.uid,
            totalPrice: this.totalPrice,
            status: "confirmed",
          };

          return this.bookingService.addBooking(newBooking);
        }),
      )
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.snackBar.open("Foglalás sikeresen létrehozva", "Bezárás", { duration: 3000 });
          this.router.navigate(["/bookings"]);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open("Hiba a foglalás létrehozásakor", "Bezárás", { duration: 3000 });
          console.error(error);
        },
      });
  }
}