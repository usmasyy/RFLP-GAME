# Deployment Guide for RFLP Lab Explorer

## Audio Issues on Vercel - Fixed! ✅

### The Problem
Background music wasn't playing on Vercel deployment due to:
1. Incorrect audio file path
2. Browser autoplay restrictions

### The Solution
✅ **Fixed audio path**: Changed from `/background-music.mp3` to `/assets/background-music.mp3`
✅ **Added autoplay handling**: Gracefully handles browser autoplay restrictions
✅ **Click-to-play fallback**: Audio starts on any user click if autoplay is blocked
✅ **Added vercel.json**: Ensures proper static file serving

### Files Changed
- `App.tsx` - Fixed audio path and improved error handling
- `vercel.json` - Added for proper asset caching

### Deployment Steps

1. **Commit the changes:**
   ```bash
   git add .
   git commit -m "Fix audio path for Vercel deployment"
   git push origin main
   ```

2. **Vercel will auto-deploy** (if connected to GitHub)
   - Or manually redeploy from Vercel dashboard

3. **Test the audio:**
   - Visit your Vercel URL
   - Click anywhere on the page if audio doesn't start automatically
   - Audio should play once you start the game

### Browser Autoplay Policy
Modern browsers (Chrome, Firefox, Safari) block autoplay until user interaction. This is normal behavior. The game handles this by:
- Attempting autoplay when game starts
- Falling back to click-to-play if blocked
- Showing console message if autoplay prevented

### Troubleshooting

**If audio still doesn't work:**

1. Check browser console (F12) for errors
2. Verify file exists: `https://your-app.vercel.app/assets/background-music.mp3`
3. Check browser allows audio (not muted, no extensions blocking)
4. Try clicking anywhere on the page to trigger audio

**File size note:**
- Current audio file: ~8MB
- This is fine for Vercel (100MB limit per file)
- Consider compressing if load time is slow

### Audio File Location
```
public/
  assets/
    background-music.mp3  ← Audio file here
    steps.jpg
```

This structure ensures Vite/Vercel serves files correctly from `/assets/` path.
