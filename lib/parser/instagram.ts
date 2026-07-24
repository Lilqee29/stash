export interface ParsedSave {
  url: string;
  title: string;
  saved_at: string;
  metadata: any;
}

export function parseInstagramExport(jsonContent: string): ParsedSave[] {
  try {
    const data = JSON.parse(jsonContent);
    let rawList: any[] = [];

    // Instagram exports saved posts as either a direct array or wrapped in an object
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data && Array.isArray(data.saved_media)) {
      rawList = data.saved_media;
    } else if (data && Array.isArray(data.saved_posts)) {
      rawList = data.saved_posts;
    } else if (data && typeof data === 'object') {
      // Look for any array inside the object that might contain media
      const arrays = Object.values(data).filter(Array.isArray);
      if (arrays.length > 0) {
        rawList = arrays[0];
      }
    }

    if (rawList.length === 0) {
      throw new Error("No saved media array found in Instagram export.");
    }

    const parsed: ParsedSave[] = [];

    for (const item of rawList) {
      try {
        // Find URL
        let url = '';
        let title = '';
        let savedAt = new Date().toISOString();

        // Standard Instagram JSON item structure
        // item = { "title": "caption", "string_list_data": [{ "href": "url", "timestamp": 12345 }] }
        // or item = { "media": { "url": "..." }, "string_list_data": ... }
        
        if (item.string_list_data && Array.isArray(item.string_list_data) && item.string_list_data.length > 0) {
          const listData = item.string_list_data[0];
          url = listData.href || '';
          
          if (listData.timestamp) {
            // Convert UNIX timestamp (seconds or ms) to ISO string
            const ts = Number(listData.timestamp);
            const date = new Date(ts * 1000 > Date.now() * 0.1 ? ts : ts * 1000);
            if (!isNaN(date.getTime())) {
              savedAt = date.toISOString();
            }
          }
        }

        // Title/caption extraction
        title = item.title || item.caption || '';
        
        // If url is still empty but title has something resembling a URL
        if (!url && title && (title.startsWith('http://') || title.startsWith('https://'))) {
          url = title;
          title = '';
        }

        if (!url) {
          // Check if item has direct url property
          url = item.url || item.href || (item.media && item.media.url) || '';
        }

        if (!url) {
          console.warn("Skipping Instagram post because no URL was found.", item);
          continue;
        }

        parsed.push({
          url,
          title: title || 'Instagram Post',
          saved_at: savedAt,
          metadata: item,
        });
      } catch (err) {
        console.error("Skipping malformed Instagram post entry:", err);
      }
    }

    return parsed;
  } catch (error: any) {
    throw new Error(`Failed to parse Instagram export: ${error.message}`);
  }
}
