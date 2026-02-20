
-- Add missing admin SELECT, UPDATE, DELETE policies for bookings table

CREATE POLICY "Admins can view bookings"
  ON public.bookings
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
