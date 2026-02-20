
-- Strengthen INSERT RLS policies with server-side email format validation and field constraints
-- This replaces the overly permissive WITH CHECK (true) policies

-- contact_messages: drop and recreate with validation
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (
    email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
    AND length(trim(name)) BETWEEN 1 AND 100
    AND length(email) BETWEEN 5 AND 255
    AND length(trim(message)) BETWEEN 1 AND 2000
    AND (phone IS NULL OR length(trim(phone)) <= 20)
    AND (package_name IS NULL OR length(package_name) <= 200)
    AND (package_category IS NULL OR package_category IN ('cameras', 'web', ''))
  );

-- reservations: drop and recreate with validation
DROP POLICY IF EXISTS "Anyone can insert reservations" ON public.reservations;
CREATE POLICY "Anyone can insert reservations"
  ON public.reservations
  FOR INSERT
  WITH CHECK (
    email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
    AND length(trim(name)) BETWEEN 1 AND 100
    AND length(email) BETWEEN 5 AND 255
    AND length(package_name) BETWEEN 1 AND 200
    AND package_category IN ('cameras', 'web')
    AND (phone IS NULL OR length(trim(phone)) <= 20)
    AND (message IS NULL OR length(trim(message)) <= 1000)
  );

-- bookings: drop and recreate with validation
DROP POLICY IF EXISTS "Anyone can insert bookings" ON public.bookings;
CREATE POLICY "Anyone can insert bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (
    email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
    AND length(trim(name)) BETWEEN 1 AND 100
    AND length(email) BETWEEN 5 AND 255
    AND booking_date IS NOT NULL
    AND booking_time IS NOT NULL
    AND (phone IS NULL OR length(trim(phone)) <= 20)
    AND (message IS NULL OR length(trim(message)) <= 2000)
    AND (package_name IS NULL OR length(package_name) <= 200)
    AND (package_category IS NULL OR package_category IN ('cameras', 'web'))
  );
