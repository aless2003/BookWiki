import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    IconButton, 
    AppBar, 
    Toolbar, 
    Container, 
    CircularProgress, 
    Paper,
    Breadcrumbs,
    Link as MuiLink
} from '@mui/material';
import { 
    ArrowBack as ArrowBackIcon, 
    Pets as SpeciesIcon 
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';

interface SpeciesTreeNode {
    id: number;
    name: string;
    pictureUrl: string;
    children: SpeciesTreeNode[];
}

interface SpeciesTaxonomy {
    parentNode: SpeciesTreeNode | null;
    targetNode: SpeciesTreeNode;
}

const SpeciesTaxonomy: React.FC = () => {
    const { storyId, speciesId } = useParams<{ storyId: string; speciesId: string }>();
    const navigate = useNavigate();
    const [taxonomy, setTaxonomy] = useState<SpeciesTaxonomy | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTaxonomy = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3906/api/stories/${storyId}/species/${speciesId}/taxonomy`);
                if (!response.ok) {
                    throw new Error('Failed to fetch taxonomy');
                }
                const data = await response.json();
                setTaxonomy(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching taxonomy:', err);
                setError('Failed to load taxonomy tree.');
            } finally {
                setLoading(false);
            }
        };

        if (storyId && speciesId) {
            fetchTaxonomy();
        }
    }, [storyId, speciesId]);

    const handleBack = () => {
        navigate(`/world/${storyId}?category=Species%20%26%20Nature&id=${speciesId}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
            <AppBar position="static" color="transparent" elevation={0}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleBack}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Species Taxonomy Tree
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                    <MuiLink component={Link} underline="hover" color="inherit" to={`/world/${storyId}?category=Species%20%26%20Nature`}>
                        Species List
                    </MuiLink>
                    <MuiLink component={Link} underline="hover" color="inherit" to={`/world/${storyId}?category=Species%20%26%20Nature&id=${speciesId}`}>
                        {taxonomy?.targetNode.name || 'Species'}
                    </MuiLink>
                    <Typography color="text.primary">Taxonomy Tree</Typography>
                </Breadcrumbs>

                {error ? (
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'error.dark', color: 'error.contrastText' }}>
                        <Typography>{error}</Typography>
                    </Paper>
                ) : (
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            {taxonomy?.targetNode.name} Hierarchy
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Visualizing the relationship and descendants of this species.
                        </Typography>
                        
                        {/* Tree implementation will go here in Phase 3 */}
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <SpeciesIcon sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
                            <Typography variant="h6">Tree View coming in Phase 3</Typography>
                        </Paper>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default SpeciesTaxonomy;
