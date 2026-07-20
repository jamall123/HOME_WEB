export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface UserEntity extends BaseEntity {
  email: string;
  name: string;
  role: string;
  courses: string[];
}

export interface MediaEntity extends BaseEntity {
  path: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
}
