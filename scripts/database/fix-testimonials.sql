-- Update existing testimonials to remove broken image paths
UPDATE testimonials SET photo_url = NULL WHERE photo_url LIKE '/images/testimonials/%';
