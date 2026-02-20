
-- Add database-level constraints for contact_messages
ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT contact_messages_email_length CHECK (char_length(email) BETWEEN 5 AND 255),
  ADD CONSTRAINT contact_messages_message_length CHECK (char_length(message) BETWEEN 1 AND 2000),
  ADD CONSTRAINT contact_messages_phone_length CHECK (phone IS NULL OR char_length(phone) <= 20),
  ADD CONSTRAINT contact_messages_package_name_length CHECK (package_name IS NULL OR char_length(package_name) <= 200);

-- Add database-level constraints for reservations
ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT reservations_email_length CHECK (char_length(email) BETWEEN 5 AND 255),
  ADD CONSTRAINT reservations_message_length CHECK (message IS NULL OR char_length(message) <= 1000),
  ADD CONSTRAINT reservations_phone_length CHECK (phone IS NULL OR char_length(phone) <= 20),
  ADD CONSTRAINT reservations_package_name_length CHECK (char_length(package_name) BETWEEN 1 AND 200);
