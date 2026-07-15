export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number; // in USD
  priceString: string;
  image: string;
  category: 'Hypercar' | 'Grand Tourer' | 'Track Weapon' | 'Ultra-Luxury';
  origin: string;
  engine: string;
  power: number; // Horsepower (hp)
  torque: number; // Torque in Nm
  topSpeed: number; // Top speed in mph
  acceleration: number; // 0-60 mph time in seconds
  weight: number; // Weight in kg
  productionVolume: number; // Total units produced/planned
  chassis: string;
  transmission: string;
  drivetrain: 'AWD' | 'RWD';
  highlights: string[];
  description: string;
  designEthos: string;
  aeroFeatures: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  readTime: string;
  content: string[]; // split by paragraphs for rich rendering
  featuredImage: string;
  carId: string; // Refers to the car featured
  category: string;
  tags: string[];
  likes: number;
}
