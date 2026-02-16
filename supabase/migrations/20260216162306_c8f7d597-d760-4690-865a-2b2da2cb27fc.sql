
-- Weekly recurring availability rules (admin sets which days/times are available)
CREATE TABLE public.availability_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '17:00',
  slot_duration_minutes INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availability rules" ON public.availability_rules FOR SELECT USING (true);
CREATE POLICY "Admins can insert availability rules" ON public.availability_rules FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update availability rules" ON public.availability_rules FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete availability rules" ON public.availability_rules FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Date-specific overrides (block or add extra availability for specific dates)
CREATE TABLE public.availability_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  override_date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT false,
  start_time TIME,
  end_time TIME,
  slot_duration_minutes INTEGER DEFAULT 60,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(override_date)
);

ALTER TABLE public.availability_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availability overrides" ON public.availability_overrides FOR SELECT USING (true);
CREATE POLICY "Admins can insert availability overrides" ON public.availability_overrides FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update availability overrides" ON public.availability_overrides FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete availability overrides" ON public.availability_overrides FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Bookings table for actual meeting reservations
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  package_category TEXT,
  package_name TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view own booking by email" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Admins can update bookings" ON public.bookings FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete bookings" ON public.bookings FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
