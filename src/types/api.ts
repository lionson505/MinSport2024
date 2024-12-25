export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

export interface Professional {
  id: string;
  name: string;
  username: string;
  phone: string;
  function: string;
  subFunction?: string;
  status: 'Active' | 'Inactive';
  nationality: string;
  location: string;
  avatar?: string;
  skills?: string[];
}

export interface Team {
  id: string;
  name: string;
  month: string;
  status: 'Active' | 'Expired';
  federation: string;
  players: number;
}

export interface Match {
  type: string;
  team1: {
    name: string;
    score: number;
    logo: string;
  };
  team2: {
    name: string;
    score: number;
    logo: string;
  };
  time: string;
  venue: string;
  live: boolean;
}

export interface League {
  id: string;
  name: string;
  logo: string;
  bgColor: string;
  gradient?: string;
  shadow?: boolean;
}

export interface Event {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  date: string;
  tag?: 'NEW' | 'LIVE';
} 