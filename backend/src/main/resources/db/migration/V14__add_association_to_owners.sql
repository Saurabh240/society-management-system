-- Add association_id column to owners table for direct Owner-Association relationship
ALTER TABLE owners ADD COLUMN association_id BIGINT;

-- Add foreign key constraint
ALTER TABLE owners ADD CONSTRAINT fk_owners_association 
    FOREIGN KEY (association_id) REFERENCES associations(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_owners_association_id ON owners(association_id) WHERE association_id IS NOT NULL;
