import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

// ── Enrichment Types ──────────────────────────────────────────
export type EnrichmentType = 'video' | 'recipe' | 'motion_design' | 'comparison' | 'generic';

export interface EnrichmentData {
  type: EnrichmentType;
  summary: string;
  key_points: string[];
  suggested_related: string[];
  // Video / Motion Design
  creator_username?: string;
  creator_profile_url?: string;
  // Recipe
  recipe_name?: string;
  ingredients?: { name: string; amount: string; image_url?: string }[];
  steps?: string[];
  prep_time?: string;
  cook_time?: string;
  related_recipes?: string[];
  substitutes?: { ingredient: string; substitute: string; source_url?: string }[];
  pairs_well_with?: string[];
  // Motion Design
  brands_or_subjects_featured?: string[];
  // Comparison
  items_compared?: string[];
  verdict?: string;
}

export interface SaveItem {
  id: string;
  title: string;
  url: string;
  savedAt: string;
  platform: 'tiktok' | 'instagram' | 'behance' | 'dribbble' | 'other';
  // Dynamic Content Fields
  contentType?: 'movie' | 'list' | 'video' | 'reel' | 'post' | 'default';
  
  // Movie Specific
  genre?: string;
  rating?: number;
  duration?: string;
  description?: string;
  releaseDate?: string;
  director?: string;
  cast?: { name: string; role: string; image: string }[];
  availableOn?: { platform: string; logo: string }[];
  mentionedIn?: { thumbnail: string; source: string }[];
  savesCount?: number;
  diamonds?: number;
  
  // List/Video Specific
  creator?: string; // e.g., @lindseysznn
  extractedText?: { title: string; description: string; icon: string }[];
  foundEntities?: { title: string; category: string; count: number; image: string }[];
  
  // Internal tracking
  thumbnailUrl?: string;
  folderId: string | null;
  createdAt: string;
  // Gemini enrichment
  enrichment?: EnrichmentData;
}

export interface FolderItem {
  id: string;
  name: string;
  count: number;
  platforms: string[];
}

export interface SearchTag {
  label: string;
  icon: string;
}


export interface ImportedPost {
  id?: string;
  title?: string;
  url?: string;
  platform?: 'tiktok' | 'instagram';
  savedAt?: string;
  thumbnailUrl?: string;
  description?: string;
  caption?: string;
}

export interface OnboardingState {
  // Onboarding Status
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  howFound: string | null;
  selectedPlatform: 'tiktok' | 'instagram' | null;
  importedData: {
    platform: 'tiktok' | 'instagram';
    count: number;
    posts: ImportedPost[];
  } | null;
  isProcessing: boolean;
  processProgress: number;
  foldersCreated: string[];
  
  // App Data State
  saves: SaveItem[];
  folders: FolderItem[];
  
  // Setters & Actions
  setHowFound: (source: string) => void;
  setSelectedPlatform: (platform: 'tiktok' | 'instagram' | null) => void;
  setImportedData: (data: { platform: 'tiktok' | 'instagram'; count: number; posts: ImportedPost[] } | null) => void;
  startProcessing: () => void;
  updateProgress: (progress: number) => void;
  finishProcessing: (folders: string[]) => void;
  resetOnboarding: () => void;
  
  // App Operations
  setSaves: (saves: SaveItem[]) => void;
  setFolders: (folders: FolderItem[]) => void;
  addSave: (save: Omit<SaveItem, 'id' | 'createdAt'>) => void;
  triggerEnrichment: (saveId: string, url: string) => Promise<void>;
  deleteSave: (id: string) => void;
  addFolder: (name: string, platforms?: string[]) => string;
  deleteFolder: (id: string) => void;
  renameFolder: (id: string, name: string) => void;
  moveSaveToFolder: (saveId: string, folderId: string | null) => void;
  syncWithSupabase: () => Promise<void>;
  
  // // Modals
  // isAddModalOpen: boolean;
  // setAddModalOpen: (isOpen: boolean) => void;

  // isSearchOpen: boolean;
  // setSearchOpen: (isOpen: boolean) => void;
  modal: 'add' | 'search' | null;
  setModal: (modal: 'add' | 'search' | null) => void;


  searchTag: SearchTag | null;
  setSearchTag: (tag: SearchTag | null) => void;
}

const DEFAULT_SAVES: SaveItem[] = [
  {
    id: 's1',
    title: 'Spider-Man: Homecoming',
    url: 'https://example.com/movie',
    savedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date().toISOString(),
    folderId: 'f1',
    platform: 'other',
    contentType: 'movie',
    thumbnailUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=400&fit=crop',
    genre: 'Action',
    rating: 7.33,
    duration: '2h 13m',
    description: 'Following the events of Captain America: Civil War, Peter Parker, with the help of his mentor Tony Stark, tries to balance his life as an ordinary high school student in Queens, New York City, with fighting crime as his superhero alter ego Spider-Man as a new threat, the Vulture, emerges.',
    releaseDate: 'Jul 5, 2017',
    director: 'Jon Watts',
    savesCount: 106,
    diamonds: 1,
    cast: [
      { name: 'Tom Holland', role: 'Peter Parker / Spider-Man', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Tom_Holland_by_Gage_Skidmore.jpg' },
      { name: 'Michael Keaton', role: 'Adrian Toomes / Vulture', image: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Michael_Keaton_at_the_2014_Comic-Con_International.jpg' },
      { name: 'Robert Downey Jr.', role: 'Tony Stark / Iron Man', image: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Robert_Downey_Jr_2014_Comic_Con_%28cropped%29.jpg' },
    ],
    availableOn: [
      { platform: 'Prime Video', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png' }
    ],
    mentionedIn: [
      { thumbnail: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=200&h=300&fit=crop', source: 'tiktok' },
      { thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop', source: 'instagram' },
    ],
  },
  {
    id: 's2',
    title: 'Helpful PC Websites',
    url: 'https://instagram.com/p/12345',
    savedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    folderId: 'f3',
    platform: 'instagram',
    contentType: 'list',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=300&h=400&fit=crop',
    creator: '@lindseysznn',
    savesCount: 7,
    extractedText: [
      { title: 'Cloud Convert', description: 'A website for converting files without a subscription or upload limit.', icon: 'cloud-outline' },
      { title: 'Build Cores', description: 'A website that allows you to build a PC in 3D.', icon: 'desktop-outline' },
      { title: 'Rate My PC', description: 'A website that scans your PC\'s hardware and tells you what games are compatible.', icon: 'hardware-chip-outline' },
    ],
    foundEntities: [
      { title: 'CloudConvert', category: 'File Conversion', count: 7, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop' },
      { title: 'Build Cores: 3D PC Builder', category: 'PC Building', count: 7, image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=100&h=100&fit=crop' },
      { title: 'Rate My PC', category: 'Utilities', count: 7, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&h=100&fit=crop' },
    ]
  },
  {
    id: 's3',
    title: 'Top 5 design inspiration sites',
    url: 'https://tiktok.com/@uiux/video/456',
    savedAt: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date().toISOString(),
    folderId: 'f2',
    platform: 'tiktok',
    contentType: 'default',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&h=400&fit=crop',
  },
  // ── Extra demo saves for category filtering ──────────────────────────────────
  {
    id: 's4',
    title: 'Best Italian Carbonara Recipe',
    url: 'https://tiktok.com/@foodie/video/789',
    savedAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date().toISOString(),
    folderId: null,
    platform: 'tiktok',
    contentType: 'default',
    genre: 'Recipes',
    thumbnailUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300&h=400&fit=crop',
  },
  {
    id: 's5',
    title: 'Hidden cafes in Tokyo you need to visit',
    url: 'https://instagram.com/p/places123',
    savedAt: new Date(Date.now() - 14400000).toISOString(),
    createdAt: new Date().toISOString(),
    folderId: null,
    platform: 'instagram',
    contentType: 'list',
    genre: 'Places',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=400&fit=crop',
    creator: '@tokyodiscoveries',
    savesCount: 42,
    extractedText: [
      { title: 'Café de L\'Ambre', description: 'An iconic coffee shop near Ginza, open since 1948.', icon: 'cafe-outline' },
      { title: 'Fuglen', description: 'Norwegian-style specialty coffee in Tomigaya.', icon: 'cafe-outline' },
    ],
    foundEntities: [],
  },
  {
    id: 's6',
    title: 'Interstellar — must watch sci-fi',
    url: 'https://tiktok.com/@films/video/999',
    savedAt: new Date(Date.now() - 21600000).toISOString(),
    createdAt: new Date().toISOString(),
    folderId: 'f1',
    platform: 'tiktok',
    contentType: 'movie',
    genre: 'Films',
    thumbnailUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&h=400&fit=crop',
    rating: 8.6,
    duration: '2h 49m',
    director: 'Christopher Nolan',
    savesCount: 214,
    diamonds: 3,
    cast: [],
    availableOn: [],
    mentionedIn: [],
  },
  {
    id: 's7',
    title: '10 Figma plugins that will change your workflow',
    url: 'https://behance.net/gallery/design-workflow',
    savedAt: new Date(Date.now() - 43200000).toISOString(),
    createdAt: new Date().toISOString(),
    folderId: 'f2',
    platform: 'behance',
    contentType: 'list',
    genre: 'Design',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=300&h=400&fit=crop',
    creator: '@designwithtom',
    savesCount: 89,
    extractedText: [
      { title: 'Unsplash', description: 'Insert free high-quality images directly into Figma.', icon: 'image-outline' },
      { title: 'Iconify', description: 'Access 100k+ icons from popular packs.', icon: 'shapes-outline' },
    ],
    foundEntities: [],
  },
  {
    id: 's8',
    title: 'Easy 15-minute Thai green curry',
    url: 'https://tiktok.com/@cookingpro/video/321',
    savedAt: new Date(Date.now() - 50400000).toISOString(),
    createdAt: new Date().toISOString(),
    folderId: null,
    platform: 'tiktok',
    contentType: 'default',
    genre: 'Recipes',
    thumbnailUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=300&h=400&fit=crop',
  },
];

const DEFAULT_FOLDERS: FolderItem[] = [
  { id: 'f1', name: 'Motion Design', count: 24, platforms: ['tiktok', 'instagram'] },
  { id: 'f2', name: 'UI Inspiration', count: 18, platforms: ['behance', 'dribbble'] },
  { id: 'f3', name: 'Color Grading', count: 12, platforms: ['instagram'] },
];

export const useStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial states
      hasCompletedOnboarding: false,
      howFound: null,
      selectedPlatform: null,
      importedData: null,
      isProcessing: false,
      processProgress: 0,
      foldersCreated: [],
      saves: DEFAULT_SAVES,
      folders: DEFAULT_FOLDERS,
      modal:null,
      searchTag: null,

      // // Modals
      // setAddModalOpen: (isOpen) => set({ isAddModalOpen: isOpen }),
      // setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
      setModal: (modal) => set({ modal }),
      setSearchTag: (tag) => set({ searchTag: tag }),

      // Onboarding
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      
      // Onboarding setters
      setHowFound: (source) => set({ howFound: source }),
      setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),
      setImportedData: (data) => set({ importedData: data }),
      
      startProcessing: () => set({ isProcessing: true, processProgress: 0 }),
      updateProgress: (progress) => set({ processProgress: progress }),
      
      finishProcessing: (folderNames) => {
        const { importedData } = get();
        
        // Create new folder items
        const newFolders: FolderItem[] = folderNames.map((name, index) => ({
          id: `imported-f-${index}-${Date.now()}`,
          name,
          count: 0,
          platforms: importedData ? [importedData.platform] : ['tiktok'],
        }));

        // Map parsed posts to these folders if available
        let newSaves: SaveItem[] = [];
        if (importedData && importedData.posts.length > 0) {
          newSaves = importedData.posts.map((post, postIdx) => {
            // Distribute posts across new folders
            const assignedFolder = newFolders[postIdx % newFolders.length];
            assignedFolder.count += 1;
            
            return {
              id: `post-${postIdx}-${Date.now()}`,
              title: post.caption || post.title || 'Untitled Bookmarked Post',
              platform: importedData.platform,
              url: post.url || 'https://stash-placeholder.com',
              folderId: assignedFolder.id,
              savedAt: post.savedAt || new Date().toISOString(),
              createdAt: new Date().toISOString(),
            };
          });
        }

        // Merge folders and saves
        const finalFolders = [...get().folders];
        newFolders.forEach(nf => {
          const existing = finalFolders.find(f => f.name.toLowerCase() === nf.name.toLowerCase());
          if (existing) {
            existing.count += nf.count;
          } else {
            finalFolders.push(nf);
          }
        });

        set({ 
          isProcessing: false, 
          processProgress: 1, 
          foldersCreated: folderNames,
          saves: newSaves.length > 0 ? [...newSaves, ...get().saves] : get().saves,
          folders: finalFolders,
        });
      },
      
      resetOnboarding: () => set({
        howFound: null,
        selectedPlatform: null,
        importedData: null,
        isProcessing: false,
        processProgress: 0,
        foldersCreated: [],
      }),

      // Operations
      setSaves: (saves) => set({ saves }),
      setFolders: (folders) => set({ folders }),

      addSave: async (newItem) => {
        const id = `save-${Date.now()}`;
        const newSave: SaveItem = {
          ...newItem,
          id,
          createdAt: new Date().toISOString(),
        };

        // Update folder counts locally
        const updatedFolders = get().folders.map(f => {
          if (f.id === newItem.folderId) {
            return { ...f, count: f.count + 1 };
          }
          return f;
        });

        set((state) => ({
          saves: [newSave, ...state.saves],
          folders: updatedFolders,
        }));

        // Sync to Supabase
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const userId = session.user.id;
            
            await supabase.from('saves').insert({
              id,
              title: newSave.title,
              url: newSave.url,
              saved_at: newSave.savedAt,
              platform: newSave.platform,
              content_type: newSave.contentType || 'default',
              genre: newSave.genre,
              rating: newSave.rating,
              duration: newSave.duration,
              description: newSave.description,
              release_date: newSave.releaseDate,
              director: newSave.director,
              saves_count: newSave.savesCount,
              diamonds: newSave.diamonds,
              creator: newSave.creator,
              thumbnail_url: newSave.thumbnailUrl,
              folder_id: newSave.folderId,
              extracted_text: newSave.extractedText,
              found_entities: newSave.foundEntities,
              cast_list: newSave.cast,
              available_on: newSave.availableOn,
              mentioned_in: newSave.mentionedIn,
              enrichment: newSave.enrichment || null,
              user_id: userId,
              created_at: newSave.createdAt,
            });

            if (newItem.folderId) {
              const folder = updatedFolders.find(f => f.id === newItem.folderId);
              if (folder) {
                await supabase
                  .from('folders')
                  .update({ count: folder.count })
                  .eq('id', folder.id);
              }
            }
          }
        } catch (err) {
          console.error('Error adding save to Supabase:', err);
        }
      },

      triggerEnrichment: async (saveId: string, url: string) => {
        // Deduplication: skip if enrichment already exists or already in progress
        const existing = get().saves.find((s) => s.id === saveId);
        if (existing?.enrichment) return;

        try {
          const { data, error } = await supabase.functions.invoke('enrich-with-gemini', {
            body: { save_id: saveId, url },
          });

          if (!error && data?.enrichment) {
            // Update local state with enrichment
            set((state) => ({
              saves: state.saves.map((s) =>
                s.id === saveId ? { ...s, enrichment: data.enrichment } : s
              ),
            }));
          }
        } catch (err) {
          console.error('Enrichment failed (non-critical):', err);
        }
      },

      deleteSave: async (id) => {
        const saveToDelete = get().saves.find(s => s.id === id);
        if (!saveToDelete) return;

        // Update folder counts locally
        const updatedFolders = get().folders.map(f => {
          if (f.id === saveToDelete.folderId) {
            return { ...f, count: Math.max(0, f.count - 1) };
          }
          return f;
        });

        set((state) => ({
          saves: state.saves.filter(s => s.id !== id),
          folders: updatedFolders,
        }));

        // Sync to Supabase
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase.from('saves').delete().eq('id', id);

            if (saveToDelete.folderId) {
              const folder = updatedFolders.find(f => f.id === saveToDelete.folderId);
              if (folder) {
                await supabase
                  .from('folders')
                  .update({ count: folder.count })
                  .eq('id', folder.id);
              }
            }
          }
        } catch (err) {
          console.error('Error deleting save from Supabase:', err);
        }
      },

      addFolder: (name, platforms = []) => {
        const id = `folder-${Date.now()}`;
        const newFolder: FolderItem = {
          id,
          name,
          count: 0,
          platforms,
        };
        set((state) => ({
          folders: [...state.folders, newFolder],
        }));

        // Sync to Supabase in the background
        (async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const userId = session.user.id;
              await supabase.from('folders').insert({
                id,
                name,
                count: 0,
                platforms,
                user_id: userId,
              });
            }
          } catch (err) {
            console.error('Error adding folder to Supabase:', err);
          }
        })();

        return id;
      },

      deleteFolder: async (id) => {
        // Delete folder and unsort its saves locally
        const updatedSaves = get().saves.map(s => {
          if (s.folderId === id) {
            return { ...s, folderId: null };
          }
          return s;
        });

        set((state) => ({
          folders: state.folders.filter(f => f.id !== id),
          saves: updatedSaves,
        }));

        // Sync to Supabase
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase.from('folders').delete().eq('id', id);
            await supabase
              .from('saves')
              .update({ folder_id: null })
              .eq('folder_id', id);
          }
        } catch (err) {
          console.error('Error deleting folder from Supabase:', err);
        }
      },

      renameFolder: async (id, name) => {
        set((state) => ({
          folders: state.folders.map(f => f.id === id ? { ...f, name } : f),
        }));

        // Sync to Supabase
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase
              .from('folders')
              .update({ name })
              .eq('id', id);
          }
        } catch (err) {
          console.error('Error renaming folder in Supabase:', err);
        }
      },

      moveSaveToFolder: async (saveId, folderId) => {
        const prevSaves = get().saves;
        const saveItem = prevSaves.find(s => s.id === saveId);
        if (!saveItem) return;

        const oldFolderId = saveItem.folderId;
        if (oldFolderId === folderId) return;

        // Update counts locally
        const updatedFolders = get().folders.map(f => {
          let count = f.count;
          if (f.id === oldFolderId) count = Math.max(0, count - 1);
          if (f.id === folderId) count += 1;
          return { ...f, count };
        });

        const updatedSaves = prevSaves.map(s => {
          if (s.id === saveId) {
            return { ...s, folderId };
          }
          return s;
        });

        set({
          saves: updatedSaves,
          folders: updatedFolders,
        });

        // Sync to Supabase
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase
              .from('saves')
              .update({ folder_id: folderId })
              .eq('id', saveId);

            if (oldFolderId) {
              const oldFolder = updatedFolders.find(f => f.id === oldFolderId);
              if (oldFolder) {
                await supabase
                  .from('folders')
                  .update({ count: oldFolder.count })
                  .eq('id', oldFolderId);
              }
            }

            if (folderId) {
              const newFolder = updatedFolders.find(f => f.id === folderId);
              if (newFolder) {
                await supabase
                  .from('folders')
                  .update({ count: newFolder.count })
                  .eq('id', folderId);
              }
            }
          }
        } catch (err) {
          console.error('Error moving save to folder in Supabase:', err);
        }
      },

      syncWithSupabase: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const userId = session.user.id;

          const { data: dbFolders, error: foldersError } = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', userId);

          if (foldersError) throw foldersError;

          const { data: dbSaves, error: savesError } = await supabase
            .from('saves')
            .select('*')
            .eq('user_id', userId);

          if (savesError) throw savesError;

          const mappedFolders: FolderItem[] = (dbFolders || []).map(f => ({
            id: f.id,
            name: f.name,
            count: f.count,
            platforms: f.platforms || [],
          }));

          const mappedSaves: SaveItem[] = (dbSaves || []).map(s => ({
            id: s.id,
            title: s.title,
            url: s.url,
            savedAt: s.saved_at,
            platform: s.platform as any,
            contentType: s.content_type as any,
            genre: s.genre || undefined,
            rating: s.rating ? parseFloat(s.rating) : undefined,
            duration: s.duration || undefined,
            description: s.description || undefined,
            releaseDate: s.release_date || undefined,
            director: s.director || undefined,
            savesCount: s.saves_count || undefined,
            diamonds: s.diamonds || undefined,
            creator: s.creator || undefined,
            thumbnailUrl: s.thumbnail_url || undefined,
            folderId: s.folder_id,
            createdAt: s.created_at,
            extractedText: s.extracted_text || undefined,
            foundEntities: s.found_entities || undefined,
            cast: s.cast_list || undefined,
            availableOn: s.available_on || undefined,
            mentionedIn: s.mentioned_in || undefined,
            enrichment: s.enrichment || undefined,
          }));

          set({
            folders: mappedFolders.length > 0 ? mappedFolders : get().folders,
            saves: mappedSaves.length > 0 ? mappedSaves : get().saves,
          });
        } catch (err) {
          console.error('Error syncing with Supabase:', err);
        }
      },
    }),
    {
      name: 'stash-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        saves: state.saves,
        folders: state.folders,
      }),
    }
  )
);

