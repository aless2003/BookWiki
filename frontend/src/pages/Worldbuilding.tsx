import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    CardMedia, 
    Typography, 
    Button, 
    TextField, 
    Fab, 
    IconButton, 
    Drawer, 
    List, 
    ListItem, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText, 
    Divider,
    MenuItem,
    ThemeProvider,
    CssBaseline,
    Paper,
    InputAdornment,
    Toolbar,
    Stack,
    Chip,
    Autocomplete,
    CircularProgress,
    AppBar,
    Grid
} from '@mui/material';
import { 
    Person as PersonIcon, 
    Place as PlaceIcon, 
    LocalMall as ItemIcon, 
    MenuBook as LoreIcon, 
    Add as AddIcon, 
    ArrowBack as ArrowBackIcon, 
    Delete as DeleteIcon, 
    Save as SaveIcon, 
    CloudUpload as CloudUploadIcon,
    Pets as SpeciesIcon
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { WindowService } from '../utils/WindowService';
import RichTextEditor from '../components/RichTextEditor';
import { darkTheme } from '../theme';
import { resolveShortcodes } from '../constants/media';

const drawerWidth = 240;

const categories = [
    { name: 'Characters', icon: <PersonIcon />, endpoint: 'characters' },
    { name: 'Locations', icon: <PlaceIcon />, endpoint: 'locations' },
    { name: 'Species & Nature', icon: <SpeciesIcon />, endpoint: 'species' },
    { name: 'Items', icon: <ItemIcon />, endpoint: 'items' },
    { name: 'Lore', icon: <LoreIcon />, endpoint: 'lore' },
];

interface Section {
    id?: number;
    title: string;
    content: string;
}

interface Character {
    id?: number;
    name: string;
    pictureUrl: string;
    birthday: string;
    speciesId?: number;
    socialStatus: string;
    role: string;
    traits: string[];
    appearance: string;
    description: string;
    customSections: Section[];
}

interface Species {
    id?: number;
    name: string;
    pictureUrl: string;
    category: 'SPECIES' | 'RACE' | 'FLORA' | 'FAUNA';
    parentId?: number;
    lifespan: string;
    averageSize: string;
    diet: string;
    description: string;
    habitatId?: number;
    customSections: Section[];
}

interface Location {
    id?: number;
    name: string;
    pictureUrl: string;
    description: string;
    whereItIs: string;
    details: string;
    customSections: Section[];
}

interface Item {
    id?: number;
    name: string;
    pictureUrl: string;
    description: string;
    customSections: Section[];
}

interface Lore {
    id?: number;
    name: string;
    pictureUrl: string;
    categories: string[];
    description: string;
    customSections: Section[];
}

type WorldbuildingEntry = Character | Species | Location | Item | Lore;

const Worldbuilding: React.FC = () => {
    const { storyId } = useParams<{ storyId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeCategory, setActiveCategory] = useState('Characters');
    
    // Lists
    const [characters, setCharacters] = useState<Character[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [species, setSpecies] = useState<Species[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [lore, setLore] = useState<Lore[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [editEntry, setEditEntry] = useState<WorldbuildingEntry | null>(null); 
    const [isUploading, setIsUploading] = useState(false);
    const [newTrait, setNewTrait] = useState('');

    const fetchData = useCallback(() => {
        if (!storyId) return;
        const cat = categories.find(c => c.name === activeCategory);
        if (!cat) return;

        setIsLoading(true);
        fetch(`http://localhost:3906/api/stories/${storyId}/${cat.endpoint}`)
            .then(res => res.json())
            .then(data => {
                if (activeCategory === 'Characters') setCharacters(data);
                if (activeCategory === 'Locations') setLocations(data);
                if (activeCategory === 'Species & Nature') setSpecies(data);
                if (activeCategory === 'Items') setItems(data);
                if (activeCategory === 'Lore') setLore(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [storyId, activeCategory]);

    useEffect(() => {
        if (!storyId) {
             navigate('/stories');
             return;
        }
        fetchData();
    }, [storyId, activeCategory, navigate, fetchData]);

    const handleEditStart = useCallback((entry: WorldbuildingEntry) => {
        if (activeCategory === 'Characters') {
            const char = entry as Character;
            setEditEntry({ ...char, traits: char.traits || [] });
        } else if (activeCategory === 'Lore') {
            const loreEntry = entry as Lore;
            setEditEntry({ ...loreEntry, categories: loreEntry.categories || [] });
        } else if (activeCategory === 'Species & Nature') {
            const spec = entry as Species;
            setEditEntry({ 
                ...spec, 
                category: spec.category || 'SPECIES',
                lifespan: spec.lifespan || '',
                averageSize: spec.averageSize || '',
                diet: spec.diet || ''
            });
        } else {
            setEditEntry({ ...entry });
        }
        setIsEditing(true);
    }, [activeCategory]);

    // Separate useEffect for Deep Linking to handle state race conditions
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const categoryParam = searchParams.get('category');
        const idParam = searchParams.get('id');

        if (!categoryParam || !idParam) return;

        console.log(`Deep Link detected: Category=${categoryParam}, ID=${idParam}. ActiveCategory=${activeCategory}`);

        // 1. Switch category if needed
        if (categories.some(c => c.name === categoryParam) && activeCategory !== categoryParam) {
            console.log(`Switching category to: ${categoryParam}`);
            setActiveCategory(categoryParam);
            return;
        }

        // 2. Once category matches, find the entry in the populated list
        if (activeCategory === categoryParam) {
            let list: any[] = [];
            if (activeCategory === 'Characters') list = characters;
            else if (activeCategory === 'Locations') list = locations;
            else if (activeCategory === 'Species & Nature') list = species;
            else if (activeCategory === 'Items') list = items;
            else if (activeCategory === 'Lore') list = lore;
            
            console.log(`Searching for ID ${idParam} in ${activeCategory} list (length: ${list.length})`);
            
            if (list.length > 0) {
                const id = parseInt(idParam);
                const entry = list.find(e => e.id === id);
                if (entry) {
                    console.log(`Found entry! Opening editor...`);
                    handleEditStart(entry);
                    navigate(location.pathname, { replace: true });
                } else {
                    console.warn(`Entry with ID ${id} not found in ${activeCategory} list.`);
                }
            }
        }
    }, [location.search, activeCategory, characters, locations, species, items, lore, navigate, handleEditStart, location.pathname]);

    const handleCreateNew = () => {
        if (activeCategory === 'Characters') {
            setEditEntry({
                name: '',
                pictureUrl: '',
                birthday: '',
                socialStatus: '',
                role: '',
                traits: [],
                appearance: '<p>Describe appearance...</p>',
                description: '<p>Enter backstory...</p>',
                customSections: []
            });
        } else if (activeCategory === 'Locations') {
            setEditEntry({
                name: '',
                pictureUrl: '',
                description: '<p>What is this place?</p>',
                whereItIs: '<p>Where is it located?</p>',
                details: '<p>Important details (e.g. why is it important, when was it built)...</p>',
                customSections: []
            });
        } else if (activeCategory === 'Species & Nature') {
            setEditEntry({
                name: '',
                pictureUrl: '',
                category: 'SPECIES',
                parentId: undefined,
                lifespan: '',
                averageSize: '',
                diet: '',
                description: '<p>Describe this species/race...</p>',
                habitatId: undefined,
                customSections: []
            });
        } else if (activeCategory === 'Items') {
            setEditEntry({
                name: '',
                pictureUrl: '',
                description: '<p>What is this item?</p>',
                customSections: []
            });
        } else if (activeCategory === 'Lore') {
            setEditEntry({
                name: '',
                pictureUrl: '',
                categories: [],
                description: '<p>Tell the story of this lore entry...</p>',
                customSections: []
            });
        }
        setIsEditing(true);
    };

    const handleSave = useCallback(() => {
        if (!editEntry || !storyId) return;
        const cat = categories.find(c => c.name === activeCategory);
        if (!cat) return;

        const method = editEntry.id ? 'PUT' : 'POST';
        const url = editEntry.id 
            ? `http://localhost:3906/api/${cat.endpoint}/${editEntry.id}`
            : `http://localhost:3906/api/stories/${storyId}/${cat.endpoint}`;

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editEntry)
        })
        .then(res => res.json())
        .then(() => {
            fetchData();
            setIsEditing(false);
            setEditEntry(null);
        })
        .catch(err => console.error(err));
    }, [editEntry, storyId, activeCategory, fetchData]);

    // Optimize CTRL+S listener with a Ref to avoid constant re-binding
    const saveRef = useRef(handleSave);
    useEffect(() => { saveRef.current = handleSave; }, [handleSave]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                if (isEditing) {
                    e.preventDefault();
                    saveRef.current();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEditing]);

    const handleDelete = (id: number) => {
        if (!confirm(`Are you sure you want to delete this ${activeCategory.slice(0, -1)}?`)) return;
        const cat = categories.find(c => c.name === activeCategory);
        if (!cat) return;

        fetch(`http://localhost:3906/api/${cat.endpoint}/${id}`, { method: 'DELETE' })
            .then(() => {
                fetchData();
                setIsEditing(false);
                setEditEntry(null);
            });
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        fetch('http://localhost:3906/api/upload', {
            method: 'POST',
            body: formData,
        })
        .then(res => res.json())
        .then(data => {
            if (data.id && editEntry) {
                setEditEntry((prev: any) => ({ ...prev, pictureUrl: `#{image:${data.id}}` }));
            }
        })
        .catch(err => console.error('Upload failed', err))
        .finally(() => setIsUploading(false));
    };

    const addTrait = () => {
        if (!newTrait.trim() || !editEntry) return;
        setEditEntry({
            ...editEntry,
            traits: [...((editEntry as Character).traits || []), newTrait.trim()]
        });
        setNewTrait('');
    };

    const removeTrait = (index: number) => {
        if (!editEntry) return;
        const newTraits = [...((editEntry as Character).traits || [])];
        newTraits.splice(index, 1);
        setEditEntry({ ...editEntry, traits: newTraits });
    };

    const updateSection = (index: number, field: keyof Section, value: string) => {
        if (!editEntry) return;
        const newSections = [...editEntry.customSections];
        newSections[index] = { ...newSections[index], [field]: value };
        setEditEntry({ ...editEntry, customSections: newSections });
    };

    const addSection = () => {
        if (!editEntry) return;
        setEditEntry({
            ...editEntry,
            customSections: [...editEntry.customSections, { title: 'New Section', content: '<p>Content...</p>' }]
        });
    };

    const removeSection = (index: number) => {
        if (!editEntry) return;
        const newSections = [...editEntry.customSections];
        newSections.splice(index, 1);
        setEditEntry({ ...editEntry, customSections: newSections });
    };

    const onSearchChange = (_event: React.SyntheticEvent, value: WorldbuildingEntry | null) => {
        if (value) {
            handleEditStart(value);
        }
    };

    const handleMentionClick = (id: number, type: string) => {
        const typeMap: Record<string, string> = {
            'character': 'Characters',
            'item': 'Items',
            'location': 'Locations',
            'lore': 'Lore',
            'species': 'Species & Nature'
        };
        const category = typeMap[type] || 'Characters';
        
        if (activeCategory === category) {
            const list = category === 'Characters' ? characters :
                         category === 'Locations' ? locations :
                         category === 'Species & Nature' ? species :
                         category === 'Items' ? items :
                         category === 'Lore' ? lore : [];
            const entry = list.find(e => e.id === id);
            if (entry) handleEditStart(entry as WorldbuildingEntry);
        } else {
            setActiveCategory(category);
            // The useEffect will handle opening the entry after category switch and fetch
            navigate(`${location.pathname}?category=${encodeURIComponent(category)}&id=${id}`, { replace: true });
        }
    };

    const renderList = () => {
        let list: WorldbuildingEntry[] = [];
        if (activeCategory === 'Characters') list = characters;
        if (activeCategory === 'Locations') list = locations;
        if (activeCategory === 'Species & Nature') list = species;
        if (activeCategory === 'Items') list = items;
        if (activeCategory === 'Lore') list = lore;

        return (
            <Grid container spacing={3}>
                {list.map((entry) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={entry.id}>
                        <Card 
                            sx={{ 
                                height: '100%', 
                                cursor: 'pointer',
                                transition: '0.3s',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                            }}
                            onClick={() => handleEditStart(entry)}
                            onMouseDown={(e) => {
                                if (e.button === 1) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    WindowService.openWindow(`/world/${storyId}?category=${encodeURIComponent(activeCategory)}&id=${entry.id}&popup=true`, `entry_${entry.id}`, `${entry.name} - BookWiki`);
                                }
                            }}
                        >
                            {entry.pictureUrl && (
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={resolveShortcodes(entry.pictureUrl)}
                                    alt={entry.name}
                                    sx={{ objectFit: 'cover' }}
                                />
                            )}
                            <CardContent>
                                <Typography variant="h6" gutterBottom>{entry.name}</Typography>
                                
                                {activeCategory === 'Characters' && (entry as Character).speciesId && (
                                    <Chip 
                                        label={species.find(s => s.id === (entry as Character).speciesId)?.name || 'Unknown Species'} 
                                        size="small" 
                                        color="primary" 
                                        variant="outlined"
                                        sx={{ mb: 1 }}
                                    />
                                )}

                                <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ 
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: entry.description }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    };

    const renderEditor = () => {
        if (!editEntry) return null;

        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
                    <Typography variant="h4">{editEntry.id ? 'Edit' : 'Create'} {activeCategory.slice(0, -1)}</Typography>
                    <Stack direction="row" spacing={2}>
                        {editEntry.id && (
                            <Button 
                                variant="outlined" 
                                color="error" 
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDelete(editEntry.id!)}
                            >
                                Delete
                            </Button>
                        )}
                        <Button variant="outlined" onClick={() => { setIsEditing(false); setEditEntry(null); }}>Cancel</Button>
                        <Button 
                            variant="contained" 
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                    </Stack>
                </Box>

                <Grid container spacing={4}>
                    {/* Left Column - Meta & Image */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Box 
                                sx={{ 
                                    width: '100%', 
                                    height: 300, 
                                    bgcolor: 'action.hover', 
                                    borderRadius: 2,
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {editEntry.pictureUrl ? (
                                    <img 
                                        src={resolveShortcodes(editEntry.pictureUrl)} 
                                        alt="Preview" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                ) : (
                                    <CloudUploadIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                                )}
                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                />
                                <Box 
                                    sx={{ 
                                        position: 'absolute', 
                                        bottom: 0, 
                                        left: 0, 
                                        right: 0, 
                                        p: 1, 
                                        bgcolor: 'rgba(0,0,0,0.5)',
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Button 
                                        size="small" 
                                        sx={{ color: 'white' }}
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? <CircularProgress size={20} /> : 'Change Image'}
                                    </Button>
                                </Box>
                            </Box>

                            <TextField
                                fullWidth
                                label="Name"
                                value={editEntry.name}
                                onChange={(e) => setEditEntry({ ...editEntry, name: e.target.value })}
                                sx={{ mb: 2 }}
                            />

                                                        {activeCategory === 'Characters' && (
                                                            <>
                                                                <TextField
                                                                    fullWidth
                                                                    label="Birthday / Age"
                                                                    value={(editEntry as Character).birthday}
                                                                    onChange={(e) => setEditEntry({ ...(editEntry as Character), birthday: e.target.value })}
                                                                    sx={{ mb: 2 }}
                                                                />
                                                                <TextField
                                                                    fullWidth
                                                                    label="Role"
                                                                    value={(editEntry as Character).role}
                                                                    onChange={(e) => setEditEntry({ ...(editEntry as Character), role: e.target.value })}
                                                                    sx={{ mb: 2 }}
                                                                />
                                                                <TextField
                                                                    fullWidth
                                                                    label="Social Status"
                                                                    value={(editEntry as Character).socialStatus}
                                                                    onChange={(e) => setEditEntry({ ...(editEntry as Character), socialStatus: e.target.value })}
                                                                    sx={{ mb: 2 }}
                                                                />
                            
                                                                <TextField
                                                                    select
                                                                    fullWidth
                                                                    label="Species / Race"
                                                                    value={(editEntry as Character).speciesId || ''}
                                                                    onChange={(e) => setEditEntry({ ...(editEntry as Character), speciesId: (e.target.value as any) || undefined })}
                                                                    sx={{ mb: 2 }}
                                                                >
                                                                    <MenuItem value="">Unknown</MenuItem>
                                                                    {species.map(s => (
                                                                        <MenuItem key={s.id} value={s.id}>{s.name} ({s.category})</MenuItem>
                                                                    ))}
                                                                </TextField>
                                                                
                                                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Traits</Typography>
                                                                <Box sx={{ mb: 2 }}>
                                                                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                                                        {(editEntry as Character).traits?.map((trait: string, i: number) => (
                                                                            <Chip key={i} label={trait} onDelete={() => removeTrait(i)} size="small" />
                                                                        ))}
                                                                    </Stack>
                                                                    <TextField
                                                                        size="small"
                                                                        fullWidth
                                                                        placeholder="Add trait and press Enter"
                                                                        value={newTrait}
                                                                        onChange={(e) => setNewTrait(e.target.value)}
                                                                        onKeyDown={(e) => e.key === 'Enter' && addTrait()}
                                                                    />
                                                                </Box>
                                                            </>
                                                        )}
                            
                                                        {activeCategory === 'Species & Nature' && (
                                                            <>
                                                                <TextField
                                                                    select
                                                                    fullWidth
                                                                    label="Category"
                                                                    value={(editEntry as Species).category}
                                                                    onChange={(e) => setEditEntry({ ...(editEntry as Species), category: e.target.value as any })}
                                                                    sx={{ mb: 2 }}
                                                                >
                                                                    <MenuItem value="SPECIES">Species</MenuItem>
                                                                    <MenuItem value="RACE">Race</MenuItem>
                                                                    <MenuItem value="FLORA">Flora</MenuItem>
                                                                    <MenuItem value="FAUNA">Fauna</MenuItem>
                                                                </TextField>
                            
                                                                <TextField
                                                                    select
                                                                    fullWidth
                                                                    label="Parent Species"
                                                                    value={(editEntry as Species).parentId || ''}
                                                                    onChange={(e) => setEditEntry({ ...(editEntry as Species), parentId: (e.target.value as any) || undefined })}
                                                                    sx={{ mb: 2 }}
                                                                >
                                                                    <MenuItem value="">None</MenuItem>
                                                                    {species
                                                                        .filter(s => s.id !== editEntry.id && s.category === 'SPECIES')
                                                                        .map(s => (
                                                                            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                                                        ))
                                                                    }
                                                                </TextField>
                            
                                                                <TextField
                                                                    select
                                                                    fullWidth
                                                                    label="Habitat (Location)"
                                                                    value={(editEntry as Species).habitatId || ''}
                                                                    onChange={(e) => setEditEntry({ ...(editEntry as Species), habitatId: (e.target.value as any) || undefined })}
                                                                    sx={{ mb: 2 }}
                                                                >
                                                                    <MenuItem value="">Unknown</MenuItem>
                                                                    {locations.map(loc => (
                                                                        <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                                                                    ))}
                                                                </TextField>
                            
                                                                <TextField
                                                                    fullWidth
                                                                    label="Lifespan"
                                                                    value={(editEntry as Species).lifespan || ''}
                                                                    onChange={(e) => setEditEntry({ ...(editEntry as Species), lifespan: e.target.value })}
                                                                    sx={{ mb: 2 }}
                                                                />
                                                                <TextField
                                                                    fullWidth
                                                                    label="Average Size"
                                                                    value={(editEntry as Species).averageSize || ''}
                                                                    onChange={(e) => setEditEntry({ ...(editEntry as Species), averageSize: e.target.value })}
                                                                    sx={{ mb: 2 }}
                                                                />
                                                                <TextField
                                                                    fullWidth
                                                                    label="Diet"
                                                                    value={(editEntry as Species).diet || ''}
                                                                    onChange={(e) => setEditEntry({ ...(editEntry as Species), diet: e.target.value })}    
                                                                    sx={{ mb: 2 }}
                                                                />
                                                            </>
                                                        )}
                                                        {activeCategory === 'Lore' && (
                                <>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Lore Categories</Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                            {(editEntry as Lore).categories?.map((cat: string, i: number) => (
                                                <Chip key={i} label={cat} onDelete={() => {
                                                    const loreEntry = editEntry as Lore;
                                                    const newCats = [...loreEntry.categories];
                                                    newCats.splice(i, 1);
                                                    setEditEntry({ ...loreEntry, categories: newCats });
                                                }} size="small" />
                                            ))}
                                        </Stack>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            placeholder="Add category and press Enter"
                                            value={newTrait}
                                            onChange={(e) => setNewTrait(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && newTrait.trim()) {
                                                    const loreEntry = editEntry as Lore;
                                                    setEditEntry({
                                                        ...loreEntry,
                                                        categories: [...(loreEntry.categories || []), newTrait.trim()]
                                                    });
                                                    setNewTrait('');
                                                }
                                            }}
                                        />
                                    </Box>
                                </>
                            )}
                        </Paper>
                    </Grid>

                    {/* Right Column - Rich Text Fields */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Description / Backstory</Typography>
                            <RichTextEditor 
                                key={activeCategory + (editEntry.id || 'new')}
                                content={editEntry.description} 
                                characters={characters}
                                locations={locations}
                                species={species}
                                items={items}
                                lore={lore}
                                onChange={(html) => setEditEntry({ ...editEntry, description: html })}
                                onMentionClick={handleMentionClick}
                                minHeight={300}
                                onSave={handleSave}
                            />
                        </Paper>

                        {activeCategory === 'Characters' && (
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>Appearance</Typography>
                                <RichTextEditor 
                                    key={`appearance-${editEntry.id || 'new'}`}
                                    content={(editEntry as Character).appearance} 
                                    characters={characters}
                                    locations={locations}
                                    species={species}
                                    items={items}
                                    lore={lore}
                                    onChange={(html) => setEditEntry({ ...(editEntry as Character), appearance: html })}
                                    onMentionClick={handleMentionClick}
                                    minHeight={200}
                                    onSave={handleSave}
                                />
                            </Paper>
                        )}

                        {activeCategory === 'Locations' && (
                            <>
                                <Paper sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="h6" gutterBottom>Where is it?</Typography>
                                    <RichTextEditor 
                                        key={`where-${editEntry.id || 'new'}`}
                                        content={(editEntry as Location).whereItIs} 
                                        characters={characters}
                                        locations={locations}
                                        species={species}
                                        items={items}
                                        lore={lore}
                                        onChange={(html) => setEditEntry({ ...(editEntry as Location), whereItIs: html })}
                                        onMentionClick={handleMentionClick}
                                        minHeight={150}
                                        onSave={handleSave}
                                    />
                                </Paper>
                                <Paper sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="h6" gutterBottom>Important Details</Typography>
                                    <RichTextEditor 
                                        key={`details-${editEntry.id || 'new'}`}
                                        content={(editEntry as Location).details} 
                                        characters={characters}
                                        locations={locations}
                                        species={species}
                                        items={items}
                                        lore={lore}
                                        onChange={(html) => setEditEntry({ ...(editEntry as Location), details: html })}
                                        onMentionClick={handleMentionClick}
                                        minHeight={200}
                                        onSave={handleSave}
                                    />
                                </Paper>
                            </>
                        )}

                        {/* Custom Sections */}
                        {editEntry.customSections?.map((section: Section, index: number) => (
                            <Paper key={index} sx={{ p: 3, mb: 3, position: 'relative' }}>
                                <IconButton 
                                    size="small" 
                                    sx={{ position: 'absolute', top: 8, right: 8 }}
                                    onClick={() => removeSection(index)}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                                <TextField
                                    variant="standard"
                                    fullWidth
                                    value={section.title}
                                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                                    sx={{ mb: 2, '& .MuiInput-root': { fontSize: '1.25rem', fontWeight: 600 } }}
                                />
                                <RichTextEditor 
                                    key={`section-${index}-${editEntry.id || 'new'}`}
                                    content={section.content} 
                                    characters={characters}
                                    locations={locations}
                                    species={species}
                                    items={items}
                                    lore={lore}
                                    onChange={(html) => updateSection(index, 'content', html)}
                                    onMentionClick={handleMentionClick}
                                    minHeight={200}
                                    onSave={handleSave}
                                />
                            </Paper>
                        ))}

                        <Button 
                            fullWidth 
                            variant="outlined" 
                            startIcon={<AddIcon />} 
                            onClick={addSection}
                            sx={{ py: 2, borderStyle: 'dashed' }}
                        >
                            Add Custom Section
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', height: '100%', bgcolor: 'background.default', overflow: 'hidden' }}>
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            bgcolor: 'background.paper',
                            borderRight: '1px solid rgba(255,255,255,0.1)',
                            position: 'relative',
                            height: '100%'
                        },
                    }}
                >
                    <Toolbar>
                        <IconButton onClick={() => navigate('/stories')} sx={{ mr: 1 }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">BookWiki</Typography>
                    </Toolbar>
                    <Divider />
                    <List sx={{ px: 1, py: 2 }}>
                        {categories.map((cat) => (
                            <ListItem key={cat.name} disablePadding sx={{ mb: 1 }}>
                                <ListItemButton 
                                    selected={activeCategory === cat.name}
                                    onClick={() => {
                                        setActiveCategory(cat.name);
                                        setIsEditing(false);
                                        setEditEntry(null);
                                    }}
                                    sx={{ 
                                        borderRadius: 2,
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.main',
                                            color: 'primary.contrastText',
                                            '&:hover': { bgcolor: 'primary.dark' },
                                            '& .MuiListItemIcon-root': { color: 'inherit' }
                                        }
                                    }}
                                >
                                    <ListItemIcon>{cat.icon}</ListItemIcon>
                                    <ListItemText primary={cat.name} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Drawer>

                <Box component="main" sx={{ flexGrow: 1, height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <AppBar position="sticky" sx={{ bgcolor: 'background.paper', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <Toolbar>
                            <Grid container alignItems="center" spacing={2} sx={{ width: '100%' }}>
                                <Grid size="grow">
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                        {activeCategory}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Autocomplete
                                        key={activeCategory} // Force re-mount on category change to clear search state
                                        fullWidth
                                        size="small"
                                        options={
                                            activeCategory === 'Characters' ? characters :
                                            activeCategory === 'Locations' ? locations :
                                            activeCategory === 'Species & Nature' ? species :
                                            activeCategory === 'Items' ? items :
                                            activeCategory === 'Lore' ? lore : []
                                        }
                                        getOptionLabel={(option) => option.name}
                                        onChange={onSearchChange}
                                        renderInput={(params) => (
                                            <TextField 
                                                {...params} 
                                                placeholder={`Search in ${activeCategory}...`} 
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <AddIcon />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </AppBar>

                    <Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            isEditing ? renderEditor() : renderList()
                        )}
                    </Box>

                    {!isEditing && (
                        <Fab 
                            color="primary" 
                            aria-label="add" 
                            sx={{ position: 'fixed', bottom: 32, right: 32 }}
                            onClick={handleCreateNew}
                        >
                            <AddIcon />
                        </Fab>
                    )}
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Worldbuilding;