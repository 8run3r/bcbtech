
-- Create storage bucket for camera images
INSERT INTO storage.buckets (id, name, public) VALUES ('camera-images', 'camera-images', true);

-- Public read access
CREATE POLICY "Camera images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'camera-images');

-- Admin upload
CREATE POLICY "Admins can upload camera images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'camera-images' AND public.has_role(auth.uid(), 'admin'));

-- Admin delete
CREATE POLICY "Admins can delete camera images"
ON storage.objects FOR DELETE
USING (bucket_id = 'camera-images' AND public.has_role(auth.uid(), 'admin'));

-- Admin update
CREATE POLICY "Admins can update camera images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'camera-images' AND public.has_role(auth.uid(), 'admin'));
