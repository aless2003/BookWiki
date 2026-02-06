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
    ThemeProvider,
    createTheme,
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
    CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';

// Constants defined outside to prevent re-renders
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
        },
        secondary: {
            main: '#f48fb1',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
    },
    typography: {
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
        h4: {
            fontWeight: 700,
        },
        h6: {
            fontWeight: 600,
        }
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                }
            }
        }
    }
});

const drawerWidth = 240;

const categories = [
    { name: 'Characters', icon: <PersonIcon />, endpoint: 'characters' },
    { name: 'Locations', icon: <PlaceIcon />, endpoint: 'locations' },
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
    socialStatus: string;
    role: string;
    traits: string[];
    appearance: string;
    description: string;
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

const Worldbuilding: React.FC = () => {
    const { storyId } = useParams<{ storyId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeCategory, setActiveCategory] = useState('Characters');
    
    // Lists
    const [characters, setCharacters] = useState<Character[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [lore, setLore] = useState<Lore[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [editEntry, setEditEntry] = useState<any>(null); 
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

    const handleEditStart = (entry: any) => {
        if (activeCategory === 'Characters') {
            setEditEntry({ ...entry, traits: entry.traits || [] });
        } else if (activeCategory === 'Lore') {
            setEditEntry({ ...entry, categories: entry.categories || [] });
        } else {
            setEditEntry({ ...entry });
        }
        setIsEditing(true);
    };

    // Handle deep linking from Writing page (CTRL+Click on mention)
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const categoryParam = searchParams.get('category');
        const idParam = searchParams.get('id');

        if (categoryParam && categories.some(c => c.name === categoryParam)) {
            if (activeCategory !== categoryParam) {
                setActiveCategory(categoryParam);
                return; 
            }
            
            if (idParam) {
                const id = parseInt(idParam);
                let list: any[] = [];
                if (categoryParam === 'Characters') list = characters;
                else if (categoryParam === 'Locations') list = locations;
                else if (categoryParam === 'Items') list = items;
                else if (categoryParam === 'Lore') list = lore;

                const entry = list.find(e => e.id === id);
                if (entry) {
                    handleEditStart(entry);
                    navigate(location.pathname, { replace: true });
                }
            }
        }
    }, [location.search, activeCategory, characters, locations, items, lore, navigate, location.pathname]);

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
            if (data.url && editEntry) {
                setEditEntry((prev: any) => ({ ...prev, pictureUrl: data.url }));
            }
        })
        .catch(err => console.error('Upload failed', err))
        .finally(() => setIsUploading(false));
    };

    const addTrait = () => {
        if (!newTrait.trim() || !editEntry) return;
        setEditEntry({
            ...editEntry,
            traits: [...(editEntry.traits || []), newTrait.trim()]
        });
        setNewTrait('');
    };

    const removeTrait = (index: number) => {
        if (!editEntry) return;
        const newTraits = [...(editEntry.traits || [])];
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

    const onSearchChange = (_event: any, value: any) => {
        if (value) {
            handleEditStart(value);
        }
    };

    const renderList = () => {
        let list: any[] = [];
        if (activeCategory === 'Characters') list = characters;
        if (activeCategory === 'Locations') list = locations;
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
                        >
                            {entry.pictureUrl && (
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={entry.pictureUrl}
                                    alt={entry.name}
                                    sx={{ objectFit: 'cover' }}
                                />
                            )}
                            <CardContent>
                                <Typography variant="h6" gutterBottom>{entry.name}</Typography>
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
                                onClick={() => handleDelete(editEntry.id)}
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
                                        src={editEntry.pictureUrl} 
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
                                        value={editEntry.birthday}
                                        onChange={(e) => setEditEntry({ ...editEntry, birthday: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Role"
                                        value={editEntry.role}
                                        onChange={(e) => setEditEntry({ ...editEntry, role: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Social Status"
                                        value={editEntry.socialStatus}
                                        onChange={(e) => setEditEntry({ ...editEntry, socialStatus: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                    
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Traits</Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                            {editEntry.traits?.map((trait: string, i: number) => (
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

                            {activeCategory === 'Lore' && (
                                <>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Lore Categories</Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                            {editEntry.categories?.map((cat: string, i: number) => (
                                                <Chip key={i} label={cat} onDelete={() => {
                                                    const newCats = [...editEntry.categories];
                                                    newCats.splice(i, 1);
                                                    setEditEntry({ ...editEntry, categories: newCats });
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
                                                    setEditEntry({
                                                        ...editEntry,
                                                        categories: [...(editEntry.categories || []), newTrait.trim()]
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
                                onChange={(html) => setEditEntry({ ...editEntry, description: html })}
                                minHeight={300}
                                onSave={handleSave}
                            />
                        </Paper>

                        {activeCategory === 'Characters' && (
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>Appearance</Typography>
                                <RichTextEditor 
                                    key={`appearance-${editEntry.id || 'new'}`}
                                    content={editEntry.appearance} 
                                    onChange={(html) => setEditEntry({ ...editEntry, appearance: html })}
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
                                        content={editEntry.whereItIs} 
                                        onChange={(html) => setEditEntry({ ...editEntry, whereItIs: html })}
                                        minHeight={150}
                                        onSave={handleSave}
                                    />
                                </Paper>
                                <Paper sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="h6" gutterBottom>Important Details</Typography>
                                    <RichTextEditor 
                                        key={`details-${editEntry.id || 'new'}`}
                                        content={editEntry.details} 
                                        onChange={(html) => setEditEntry({ ...editEntry, details: html })}
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
                                    onChange={(html) => updateSection(index, 'content', html)}
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
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            bgcolor: 'background.paper',
                            borderRight: '1px solid rgba(255,255,255,0.1)'
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

                <Box component="main" sx={{ flexGrow: 1, minHeight: '100vh', position: 'relative' }}>
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

                    <Box sx={{ p: 4 }}>
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