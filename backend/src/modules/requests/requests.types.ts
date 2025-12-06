import { z } from 'zod';

export const FreightRequestSchema = z.object({
  companyName: z.string().optional(),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  isBroker: z.boolean().default(false),
  equipment: z.string().optional(),
  cargo: z.string().optional(),
  weight: z.string().optional(),
  pallets: z.string().optional(),
  pickupAddress: z.string().min(1),
  pickupDate: z.string().optional(),
  pickupTime: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryDate: z.string().optional(),
  deliveryTime: z.string().optional(),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
});

export const ContactRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

export type FreightRequestDTO = z.infer<typeof FreightRequestSchema>;
export type ContactRequestDTO = z.infer<typeof ContactRequestSchema>;

