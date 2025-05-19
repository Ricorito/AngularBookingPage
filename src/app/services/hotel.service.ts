import { Injectable } from "@angular/core";
import { Database, ref, push, set, update, remove, get,query,orderByChild,equalTo } from "@angular/fire/database";
import { Observable, from, map } from "rxjs";
import { Hotel } from "../models/hotel.model";

@Injectable({
  providedIn: "root",
})
export class HotelService {
  private hotelsPath = "hotels";

  constructor(private database: Database) {}

  getHotels(): Observable<Hotel[]> {
    const hotelsRef = ref(this.database, this.hotelsPath);
    
    return from(get(hotelsRef)).pipe(
      map(snapshot => {
        const hotels: Hotel[] = [];
        if (snapshot.exists()) {
          snapshot.forEach(childSnapshot => {
            const hotel = childSnapshot.val();
            hotel.id = childSnapshot.key;
            hotels.push(this.convertDates(hotel));
            return false;
          });
        }
        return hotels.sort((a, b) => a.name.localeCompare(b.name));
      })
    );
  }

  getHotel(id: string): Observable<Hotel> {
    const hotelRef = ref(this.database, `${this.hotelsPath}/${id}`);
    
    return from(get(hotelRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const hotel = snapshot.val();
          hotel.id = snapshot.key;
          return this.convertDates(hotel);
        } else {
          throw new Error("Hotel nem található");
        }
      })
    );
  }

  addHotel(hotel: Omit<Hotel, "id" | "createdAt" | "updatedAt">): Observable<string> {
    const hotelsRef = ref(this.database, this.hotelsPath);
    const newHotel = {
      ...hotel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const newHotelRef = push(hotelsRef);
    return from(set(newHotelRef, newHotel)).pipe(
      map(() => newHotelRef.key || "")
    );
  }

  updateHotel(id: string, hotel: Partial<Hotel>): Observable<void> {
    const updates: any = { 
      ...hotel, 
      updatedAt: new Date().toISOString() 
    };
    
    const hotelRef = ref(this.database, `${this.hotelsPath}/${id}`);
    return from(update(hotelRef, updates));
  }

  deleteHotel(id: string): Observable<void> {
    const hotelRef = ref(this.database, `${this.hotelsPath}/${id}`);
    return from(remove(hotelRef));
  }

  private convertDates(hotel: any): Hotel {
    return {
      ...hotel,
      createdAt: new Date(hotel.createdAt),
      updatedAt: new Date(hotel.updatedAt),
    };
  }
  getHotelsByCategory(category: string): Observable<Hotel[]> {
  const hotelsQuery = query(
    ref(this.database, this.hotelsPath),
    orderByChild('category'),
    equalTo(category)
  );

  return from(get(hotelsQuery)).pipe(
    map(snapshot => {
      const hotels: Hotel[] = [];
      if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
          const hotel = childSnapshot.val();
          hotel.id = childSnapshot.key;
          hotels.push(this.convertDates(hotel));
          return false;
        });
      }
      return hotels.sort((a, b) => a.name.localeCompare(b.name));
    })
  );
}
}
