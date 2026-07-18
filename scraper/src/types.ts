export type Lead = {
  business_name: string;
  category_guess: string;
  city: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  description: string | null;
  source_url: string;
  source_name: string;
  raw_data: Record<string, string>;
};
