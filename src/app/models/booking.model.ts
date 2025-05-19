export interface Booking {
    id?: string
    roomId: string
    userId: string
    checkInDate: Date
    checkOutDate: Date
    guestName: string
    guestEmail: string
    guestPhone: string
    totalPrice: number
    status: "confirmed" | "pending" | "cancelled"
    createdAt: Date
    updatedAt: Date
  }
  
  