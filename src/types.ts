export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  coverUrl: string;
  description: string;
  driveLink?: string;
  fileType?: string;
  fileSize?: string;
  isLoaded?: boolean;
}

export type Category = {
  name: string;
  color: string;
  ringColor: string;
};

export interface ApiResponse {
  success: boolean;
  data: Book[];
  error?: string;
}