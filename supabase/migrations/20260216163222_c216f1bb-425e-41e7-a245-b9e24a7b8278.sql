
ALTER TABLE public.contact_messages
ADD COLUMN package_category text DEFAULT NULL,
ADD COLUMN package_name text DEFAULT NULL;
