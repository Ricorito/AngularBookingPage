import { Injectable } from "@angular/core";
import { Database, ref, push, set, update, remove, get, query, orderByChild, equalTo, startAt, endAt  } from "@angular/fire/database";
import { Observable, from, map } from "rxjs";
import { Booking } from "../models/booking.model";

@Injectable({
  providedIn: "root",
})
export class BookingService {
  private bookingsPath = "bookings"

  constructor(private database: Database) {}

  getBookings(): Observable<Booking[]> {
    const bookingsRef = ref(this.database, this.bookingsPath)

    return from(get(bookingsRef)).pipe(
      map((snapshot) => {
        const bookings: Booking[] = []
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const booking = childSnapshot.val()
            booking.id = childSnapshot.key
            bookings.push(this.convertDates(booking))
            return false 
          })
        }
        return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }),
    )
  }

  getBookingsByUser(userId: string): Observable<Booking[]> {
    const bookingsRef = ref(this.database, this.bookingsPath)

    return from(get(bookingsRef)).pipe(
      map((snapshot) => {
        const bookings: Booking[] = []
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const booking = childSnapshot.val()
            if (booking.userId === userId) {
              booking.id = childSnapshot.key
              bookings.push(this.convertDates(booking))
            }
            return false 
          })
        }
        return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }),
    )
  }

  getBookingsByRoom(roomId: string): Observable<Booking[]> {
    const bookingsRef = ref(this.database, this.bookingsPath)

    return from(get(bookingsRef)).pipe(
      map((snapshot) => {
        const bookings: Booking[] = []
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const booking = childSnapshot.val()
            if (booking.roomId === roomId) {
              booking.id = childSnapshot.key
              bookings.push(this.convertDates(booking))
            }
            return false 
          })
        }
        return bookings.sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())
      }),
    )
  }

  getBooking(id: string): Observable<Booking> {
    const bookingRef = ref(this.database, `${this.bookingsPath}/${id}`)

    return from(get(bookingRef)).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          const booking = snapshot.val()
          booking.id = snapshot.key
          return this.convertDates(booking)
        } else {
          throw new Error("Foglalás nem található")
        }
      }),
    )
  }

  addBooking(booking: Omit<Booking, "id" | "createdAt" | "updatedAt">): Observable<string> {
    const bookingsRef = ref(this.database, this.bookingsPath)
    const newBooking = {
      ...booking,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checkInDate: booking.checkInDate.toISOString(),
      checkOutDate: booking.checkOutDate.toISOString(),
    }

    const newBookingRef = push(bookingsRef)
    return from(set(newBookingRef, newBooking)).pipe(map(() => newBookingRef.key || ""))
  }

  updateBooking(id: string, booking: Partial<Booking>): Observable<void> {
    const updates: any = { ...booking, updatedAt: new Date().toISOString() }

    if (booking.checkInDate) {
      updates.checkInDate = booking.checkInDate.toISOString()
    }

    if (booking.checkOutDate) {
      updates.checkOutDate = booking.checkOutDate.toISOString()
    }

    const bookingRef = ref(this.database, `${this.bookingsPath}/${id}`)
    return from(update(bookingRef, updates))
  }

  deleteBooking(id: string): Observable<void> {
    const bookingRef = ref(this.database, `${this.bookingsPath}/${id}`)
    return from(remove(bookingRef))
  }

  private convertDates(booking: any): Booking {
    return {
      ...booking,
      checkInDate: new Date(booking.checkInDate),
      checkOutDate: new Date(booking.checkOutDate),
      createdAt: new Date(booking.createdAt),
      updatedAt: new Date(booking.updatedAt),
    }
  }
getBookingsByCityAndCheckInPeriod(
  city: string,
  periodStart: Date,
  periodEnd: Date
): Observable<Booking[]> {
  const bookingsRef = ref(this.database, this.bookingsPath);

  const bookingsQuery = query(
    bookingsRef,
    orderByChild("checkInDate"),
    startAt(periodStart.toISOString()),
    endAt(periodEnd.toISOString())
  );

  return from(get(bookingsQuery)).pipe(
    map(snapshot => {
      const bookings: Booking[] = [];
      if (snapshot.exists()) {
        snapshot.forEach(childSnap => {
          const booking = childSnap.val();
          booking.id = childSnap.key;

          booking.checkInDate = new Date(booking.checkInDate);
          booking.checkOutDate = new Date(booking.checkOutDate);
          booking.createdAt = new Date(booking.createdAt);
          booking.updatedAt = new Date(booking.updatedAt);

          if (booking.city === city) {
            bookings.push(booking);
          }

          return false;
        });
      }
      return bookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    })
  );
}
}

