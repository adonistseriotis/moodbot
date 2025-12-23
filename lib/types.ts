export interface Message {
  role: 'user' | 'model';
  content: Array<{
    text?: string;
  }>;
}

// Event schema
export interface Event {
  id: string;
  name: string;
  about?: string | null;
  startDate: string;
  media: {
    photos: Array<{
      url: string;
      blurhash: string;
    }>;
  };
  type: string;
  venue?: {
    id: string;
    name: string;
  } | null;
  geodata: {
    name: string;
    country: string;
  };
  genres: Array<{
    id: string;
    name: string;
  }>;
}

// Response from the Genkit flow
export interface StreamResponse {
  reply: string;
  suggestedQueries: string[];
  events: Event[];
  history: Message[];
}
