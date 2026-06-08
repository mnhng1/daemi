alter table memories
  add column duration_seconds int,
  add column media_size_bytes bigint,
  add column media_mime text;
