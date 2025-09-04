export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Photo {
  id: string;
  uri: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  locationName?: string;
  description?: string;
}

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  visitGoal: number; // nombre de visites souhaitées par semaine
  currentVisits: number; // nombre de visites cette semaine
  weekStartDate: Date; // date de début de la semaine courante
  photos: Photo[];
}

export interface WeeklyProgress {
  locationId: string;
  weekStartDate: Date;
  targetVisits: number;
  actualVisits: number;
  completionPercentage: number;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Camera: undefined;
  Map: undefined;
  Calendar: undefined;
  LocationDetail: { locationId: string };
  PhotoDetail: { photoId: string };
};

export type BottomTabParamList = {
  Camera: undefined;
  Map: undefined;
  Calendar: undefined;
};

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface AppState {
  photos: Photo[];
  locations: Location[];
  selectedDate: Date | null;
  permissions: {
    camera: boolean;
    location: boolean;
  };
}
