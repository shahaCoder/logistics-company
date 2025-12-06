import { ApplicationStatus } from '@prisma/client';

export interface UpdateStatusDTO {
  status: ApplicationStatus;
  internalNotes?: string;
}

export interface DecryptSSNDTO {
  password: string;
}

