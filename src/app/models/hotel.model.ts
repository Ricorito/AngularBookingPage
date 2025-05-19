export interface Hotel {
    id?: string;
    name: string;
    address: string;
    city: string;
    country: string;
    description: string;
    stars: number;
    amenities: string[];
    images: string[];
    contactEmail: string;
    contactPhone: string;
    createdAt: Date;
    updatedAt: Date;
  }
  