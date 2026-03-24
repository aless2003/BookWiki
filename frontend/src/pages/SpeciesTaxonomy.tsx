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
    Link as MuiLink,
    Avatar,
    Collapse,
    Tooltip,
    Button
} from '@mui/material';
import { 
    ArrowBack as ArrowBackIcon, 
    ChevronRight as ChevronRightIcon,
    ExpandMore as ExpandMoreIcon,
    Visibility as ViewIcon,
    AccountTree as TreeIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resolveShortcodes } from '../constants/media';

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

interface TreeNodeProps {
    node: SpeciesTreeNode;
    isTarget?: boolean;
    level: number;
    storyId: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, isTarget, level, storyId }) => {
    const [expanded, setExpanded] = useState(true);
    const navigate = useNavigate();
    const hasChildren = node.children && node.children.length > 0;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    const handleView = () => {
        navigate(`/world/${storyId}?category=Species%20%26%20Nature&id=${node.id}`);
    };

    return (
        <Box sx={{ ml: level > 0 ? 4 : 0, mb: 1 }}>
            <Box 
                onClick={handleToggle}
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 1, 
                    borderRadius: 1,
                    cursor: hasChildren ? 'pointer' : 'default',
                    bgcolor: isTarget ? 'rgba(144, 202, 249, 0.08)' : 'transparent',
                    border: isTarget ? '1px solid rgba(144, 202, 249, 0.3)' : '1px solid transparent',
                    '&:hover': {
                        bgcolor: isTarget ? 'rgba(144, 202, 249, 0.12)' : 'rgba(255, 255, 255, 0.04)'
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', width: 32 }}>
                    {hasChildren && (
                        <IconButton size="small">
                            {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                        </IconButton>
                    )}
                </Box>
                
                <Avatar 
                    src={node.pictureUrl ? resolveShortcodes(node.pictureUrl) : undefined} 
                    sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}
                >
                    {!node.pictureUrl && node.name.charAt(0)}
                </Avatar>

                <Typography 
                    variant="body1" 
                    sx={{ 
                        flexGrow: 1, 
                        fontWeight: isTarget ? 700 : 400,
                        color: isTarget ? 'primary.light' : 'text.primary',
                        userSelect: 'none'
                    }}
                >
                    {node.name} {isTarget && "(Current)"}
                </Typography>

                <Tooltip title="View Details">
                    <IconButton 
                        size="small" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleView();
                        }} 
                        sx={{ ml: 1 }}
                    >
                        <ViewIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            {hasChildren && (
                <Collapse in={expanded} timeout="auto">
                    <Box sx={{ borderLeft: '1px solid rgba(255, 255, 255, 0.1)', ml: 2, pl: 0 }}>
                        {node.children.map(child => (
                            <TreeNode 
                                key={child.id} 
                                node={child} 
                                level={level + 1} 
                                storyId={storyId} 
                            />
                        ))}
                    </Box>
                </Collapse>
            )}
        </Box>
    );
};

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
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="background.default">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
            <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleBack}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <TreeIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Species Taxonomy Tree
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 4 }}>
                    <MuiLink component={Link} underline="hover" color="inherit" to={`/world/${storyId}?category=Species%20%26%20Nature`}>
                        Species List
                    </MuiLink>
                    <MuiLink component={Link} underline="hover" color="inherit" to={`/world/${storyId}?category=Species%20%26%20Nature&id=${speciesId}`}>
                        {taxonomy?.targetNode.name || 'Species'}
                    </MuiLink>
                    <Typography color="text.primary">Taxonomy Tree</Typography>
                </Breadcrumbs>

                {error ? (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(211, 47, 47, 0.1)', border: '1px solid rgba(211, 47, 47, 0.3)' }}>
                        <Typography color="error">{error}</Typography>
                        <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>Retry</Button>
                    </Paper>
                ) : taxonomy ? (
                    <Box>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                                {taxonomy.targetNode.name} Hierarchy
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Exploring the evolutionary line and related species.
                            </Typography>
                        </Box>

                        <Paper sx={{ p: 4, borderRadius: 2 }}>
                            {taxonomy.parentNode && (
                                <>
                                    <Typography variant="overline" sx={{ color: 'text.disabled', mb: 1, display: 'block' }}>
                                        Parent Species
                                    </Typography>
                                    <TreeNode 
                                        node={taxonomy.parentNode} 
                                        level={0} 
                                        storyId={storyId!} 
                                    />
                                    <Box sx={{ ml: 4, my: 1, height: 20, borderLeft: '1px dashed rgba(255,255,255,0.2)' }} />
                                </>
                            )}

                            <Typography variant="overline" sx={{ color: 'text.disabled', mb: 1, display: 'block' }}>
                                {taxonomy.parentNode ? 'Current & Descendants' : 'Species Tree'}
                            </Typography>
                            <TreeNode 
                                node={taxonomy.targetNode} 
                                isTarget={true}
                                level={0} 
                                storyId={storyId!} 
                            />
                        </Paper>
                    </Box>
                ) : null}
            </Container>
        </Box>
    );
};

export default SpeciesTaxonomy;
