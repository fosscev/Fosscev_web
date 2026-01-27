# FOSS United Events - Data Source

## Current Implementation

The events data is currently stored in `data/events.ts` as static data with proper date objects for automatic upcoming/past categorization.

## RSS Feed Investigation

### Available RSS Feeds:
- ✅ **General FOSS United RSS**: `https://fossunited.org/rss.xml`
  - Contains blog posts, announcements, and general updates
  - Does NOT contain chapter-specific events

- ✅ **Forum RSS**: `https://forum.fossunited.org/c/organisation.rss`
  - Contains forum discussions and organizational updates
  - Does NOT contain chapter events

### Chapter-Specific Events:
❌ **No dedicated RSS feed** for chapter events  
❌ **No public API** for chapter events  
✅ **Events are available** on the chapter page: `https://fossunited.org/c/college-of-engineering-vadakara`

## Keeping Data Updated

### Option 1: Manual Updates (Current - Recommended)
Update the `data/events.ts` file manually when new events are added.

**Advantages:**
- Full control over event data
- Can add custom descriptions
- No dependency on external services
- Immediate updates

**How to add a new event:**
1. Open `data/events.ts`
2. Add event object with proper date:
```typescript
{
    id: 10,
    title: "Your Event Title",
    date: "DD MMM YYYY",
    dateObj: new Date("YYYY-MM-DD"), // Important for auto-categorization
    time: "HH:MM AM/PM - HH:MM AM/PM",
    location: "Venue Name",
    description: "Full description...",
    type: "Workshop" | "Hackathon" | "Talk" | "Meetup",
    attendees: "Expected number",
    status: "Upcoming" | "Registration Open" | "Completed",
    link: "https://fossunited.org/c/college-of-engineering-vadakara/event-slug"
}
```

### Option 2: API Route (Future Enhancement)
Created placeholder at `app/api/update-events/route.ts`

To implement:
1. Install HTML parser: `npm install cheerio`
2. Parse FOSS United chapter page
3. Extract event data
4. Update events file or database

### Option 3: Webhook (If FOSS United Adds It)
If FOSS United implements webhooks in the future, we can:
- Receive real-time event updates
- Automatically sync new events
- Update status automatically

## Auto-Categorization

Events are automatically categorized as "Upcoming" or "Past" based on the `dateObj` field:

```typescript
getUpcomingEvents() // Returns events where dateObj > now
getPastEvents()     // Returns events where dateObj <= now
```

## Contact FOSS United

To request API/RSS feed for chapter events:
- **Email**: foundation@fossunited.org
- **GitHub**: https://github.com/fossunited/fossunited/issues
- **Forum**: https://forum.fossunited.org

## Current Status

**Last Updated**: January 27, 2026  
**Total Events**: 9  
**Upcoming**: 0  
**Past**: 9  

All events are automatically categorized based on their date!
