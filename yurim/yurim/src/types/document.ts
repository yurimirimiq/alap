export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
  isPasswordProtected?: boolean;
  password?: string;
  isDeleted?: boolean;
  deletedAt?: Date;
}