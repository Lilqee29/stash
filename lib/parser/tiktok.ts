import { ParsedSave } from './instagram';

export function parseTikTokExport(content: string): ParsedSave[] {
  const trimmed = content.trim();
  
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return parseTikTokJSON(trimmed);
  } else {
    return parseTikTokTXT(trimmed);
  }
}

function parseTikTokJSON(jsonContent: string): ParsedSave[] {
  try {
    const data = JSON.parse(jsonContent);
    let rawList: any[] = [];

    // TikTok schema variations
    // 1. { "Activity": { "Favorite Videos": { "FavoriteVideoList": [...] } } }
    // 2. { "ItemFavoriteList": [...] }
    if (data && data.Activity && data.Activity['Favorite Videos'] && Array.isArray(data.Activity['Favorite Videos'].FavoriteVideoList)) {
      rawList = data.Activity['Favorite Videos'].FavoriteVideoList;
    } else if (data && Array.isArray(data.ItemFavoriteList)) {
      rawList = data.ItemFavoriteList;
    } else if (data && Array.isArray(data.FavoriteVideoList)) {
      rawList = data.FavoriteVideoList;
    } else if (Array.isArray(data)) {
      rawList = data;
    } else if (data && typeof data === 'object') {
      // General depth-first search for arrays
      const findArrays = (obj: any): any[] => {
        if (!obj || typeof obj !== 'object') return [];
        if (Array.isArray(obj)) return obj;
        
        for (const val of Object.values(obj)) {
          const arr = findArrays(val);
          if (arr.length > 0) return arr;
        }
        return [];
      };
      rawList = findArrays(data);
    }

    if (rawList.length === 0) {
      throw new Error("No favorite videos list found in TikTok JSON.");
    }

    const parsed: ParsedSave[] = [];

    for (const item of rawList) {
      try {
        const url = item.Link || item.url || item.link || '';
        let savedAt = new Date().toISOString();

        if (item.Date || item.date) {
          const date = new Date(item.Date || item.date);
          if (!isNaN(date.getTime())) {
            savedAt = date.toISOString();
          }
        }

        if (!url) {
          console.warn("Skipping TikTok post because no URL was found.", item);
          continue;
        }

        parsed.push({
          url,
          title: item.title || item.caption || 'TikTok Video',
          saved_at: savedAt,
          metadata: item,
        });
      } catch (err) {
        console.error("Skipping malformed TikTok JSON entry:", err);
      }
    }

    return parsed;
  } catch (error: any) {
    throw new Error(`Failed to parse TikTok JSON: ${error.message}`);
  }
}

function parseTikTokTXT(txtContent: string): ParsedSave[] {
  try {
    const lines = txtContent.split('\n');
    const parsed: ParsedSave[] = [];
    
    let currentSave: Partial<ParsedSave> = {};
    let metadata: Record<string, string> = {};

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.toLowerCase().startsWith('date:')) {
        const dateStr = line.substring(5).trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          currentSave.saved_at = date.toISOString();
        }
        metadata.date = dateStr;
      } else if (line.toLowerCase().startsWith('video link:')) {
        const url = line.substring(11).trim();
        currentSave.url = url;
        metadata.link = url;
      }

      // If we've successfully gathered both fields, add to parsed list
      if (currentSave.url && currentSave.saved_at) {
        parsed.push({
          url: currentSave.url,
          title: 'TikTok Video',
          saved_at: currentSave.saved_at,
          metadata: { ...metadata },
        });
        currentSave = {};
        metadata = {};
      }
    }

    // Secondary parsing for raw URL lists (one per line)
    if (parsed.length === 0) {
      for (const line of lines) {
        if (line.startsWith('http://') || line.startsWith('https://')) {
          parsed.push({
            url: line,
            title: 'TikTok Video',
            saved_at: new Date().toISOString(),
            metadata: { link: line },
          });
        }
      }
    }

    if (parsed.length === 0) {
      throw new Error("No video links or structured text matches found in TikTok TXT.");
    }

    return parsed;
  } catch (error: any) {
    throw new Error(`Failed to parse TikTok TXT: ${error.message}`);
  }
}
