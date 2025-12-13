# Static Images Structure

This directory contains all static images that are served locally and not stored in the database.

## Directory Structure:

### `/covers/` - Album Cover Images
- `save-the-date-cover.jpg` - Cover for Save the Date album
- `engagement-cover.jpg` - Cover for Engagement album  
- `wedding-cover.jpg` - Cover for Wedding album
- `madhuramveppu-cover.jpg` - Cover for Madhuramveppu album
- `pre-wedding-cover.jpg` - Cover for Pre-Wedding album
- `promise-cover.jpg` - Cover for Promise album
- `moments-cover.jpg` - Cover for Moments button

### `/highlights/` - Best Moments Static Images
- `moment1.jpg` - First highlight moment
- `moment2.jpg` - Second highlight moment  
- `moment3.jpg` - Third highlight moment
- `moment4.jpg` - Fourth highlight moment

### `/landing/` - Landing Page Images
- `DSC03522.JPG` - Main landing page hero image

### Album Directories (existing)
- `/save-the-date/` - Save the Date album images
- `/engagement/` - Engagement album images
- `/wedding/` - Wedding album images
- `/madhuramveppu/` - Madhuramveppu album images
- `/pre-wedding/` - Pre-Wedding album images
- `/promise/` - Promise album images

## Notes:
- All cover images and highlights are static and served locally
- New uploads from admin panel are stored in database and served from `/uploads/`
- Landing page image is always static
- Album images can be mixed (static + database uploads)