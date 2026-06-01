ALTER TABLE memories ADD COLUMN storage_key text;

COMMENT ON COLUMN memories.storage_key IS 'R2 object path, e.g. couple-spaces/{id}/memories/{id}/original.jpg';
