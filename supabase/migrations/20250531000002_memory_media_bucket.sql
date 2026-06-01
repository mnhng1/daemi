-- Create private bucket for memory media
INSERT INTO storage.buckets (id, name, public)
VALUES ('memory-media', 'memory-media', false)
ON CONFLICT (id) DO NOTHING;

-- Allow couple space members to upload media
CREATE POLICY "memory_media_insert" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'memory-media'
  AND is_couple_space_member((split_part(name, '/', 2))::uuid)
);

-- Allow couple space members to read their media
CREATE POLICY "memory_media_select" ON storage.objects FOR SELECT
USING (
  bucket_id = 'memory-media'
  AND is_couple_space_member((split_part(name, '/', 2))::uuid)
);

-- Allow couple space members to delete their media
CREATE POLICY "memory_media_delete" ON storage.objects FOR DELETE
USING (
  bucket_id = 'memory-media'
  AND is_couple_space_member((split_part(name, '/', 2))::uuid)
);
