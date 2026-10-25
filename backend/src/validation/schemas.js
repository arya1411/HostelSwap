import { z } from "zod";

export const text = (min, max) => z.string().trim().min(min).max(max);
export const location = { hostel_name: text(2, 100), block: text(1, 50) };
export const profile = z.object({ name: text(2, 80), ...location });
export const money = z.coerce.number().finite().positive().max(10000000);
export const listingSchema = z.object({
  title: text(3, 120),
  description: text(10, 5000),
  category_id: z.coerce.number().int().positive(),
  price: money,
  original_price: z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    money.nullable(),
  ),
  condition: z.enum(["Like New", "Good", "Fair"]),
  ...location,
});
