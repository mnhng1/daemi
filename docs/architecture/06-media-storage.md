# Media Storage Architecture

## Provider

Use Supabase Storage.

## Buckets

```txt
memory-media
avatars
```

## Storage Path Convention

```txt
couple-spaces/{coupleSpaceId}/memories/{memoryId}/original.{ext}
couple-spaces/{coupleSpaceId}/memories/{memoryId}/thumb.{ext}
```

## MVP Upload Flow

For photo memories:

1. User picks image with Expo Image Picker.
2. Client creates a temporary local preview.
3. Client uploads image to Supabase Storage.
4. Client receives public or signed URL.
5. Client inserts memory row with `media_url`.

## Security

Storage access must be scoped by couple space.

Preferred:

- private bucket
- signed URLs

MVP acceptable:

- public bucket with unguessable paths, but this is less private

For Daemi, private bucket plus signed URL is preferred.

## Future Work

- image compression
- thumbnail generation
- video compression
- video duration validation
- background uploads
- upload progress
- offline retry
