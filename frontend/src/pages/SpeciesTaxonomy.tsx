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
    Tooltip,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    ThemeProvider,
    CssBaseline,
    useTheme,
    alpha,
    Stack
} from '@mui/material';
import { 
    ArrowBack as ArrowBackIcon, 
    Visibility as ViewIcon,
    AccountTree as TreeIcon,
    Route as FlowIcon
} from '@mui/icons-material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resolveShortcodes } from '../constants/media';
import { API_BASE_URL } from '../constants/api';
import { fetchSpeciesFlow } from '../utils/speciesApi';
import type { SpeciesFlow } from '../utils/speciesApi';
import { SpeciesFlowDiagram } from '../components/SpeciesFlowDiagram';
import { darkTheme } from '../theme';

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

interface TreeItemLabelProps {
    node: SpeciesTreeNode;
    isTarget?: boolean;
    storyId: string;
}

const TreeItemLabel: React.FC<TreeItemLabelProps> = ({ node, isTarget, storyId }) => {
    const navigate = useNavigate();
    const theme = useTheme();

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/world/${storyId}?category=Species%20%26%20Nature&id=${node.id}`);
    };

    return (
        <Stack 
            direction="row" 
            alignItems="center" 
            spacing={2} 
            sx={{ 
                py: 0.5,
                pr: 1,
                width: '100%',
                bgcolor: isTarget ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                borderRadius: 1,
                '&:hover': {
                    bgcolor: isTarget ? alpha(theme.palette.primary.main, 0.12) : 'transparent'
                }
            }}
        >
            <Avatar 
                src={node.pictureUrl ? resolveShortcodes(node.pictureUrl) : undefined} 
                sx={{ 
                    width: 28, 
                    height: 28, 
                    bgcolor: 'primary.main', 
                    fontSize: '0.875rem',
                    border: '1px solid rgba(255,255,255,0.1)' 
                }}
            >
                {!node.pictureUrl && node.name.charAt(0)}
            </Avatar>

            <Typography 
                variant="body2" 
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
                    onClick={handleView}
                    sx={{ 
                        opacity: 0.5, 
                        '&:hover': { opacity: 1, bgcolor: alpha(theme.palette.primary.main, 0.1) } 
                    }}
                >
                    <ViewIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
            </Tooltip>
        </Stack>
    );
};

const RenderTreeItem: React.FC<{ node: SpeciesTreeNode; isTarget?: boolean; storyId: string }> = ({ node, isTarget, storyId }) => {
    const theme = useTheme();
    return (
        <TreeItem 
            itemId={node.id.toString()} 
            label={<TreeItemLabel node={node} isTarget={isTarget} storyId={storyId} />}
            sx={{
                '& .MuiTreeItem-content': {
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                    '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.15),
                        },
                    },
                },
            }}
        >
            {node.children && node.children.map(child => (
                <RenderTreeItem key={child.id} node={child} storyId={storyId} />
            ))}
        </TreeItem>
    );
};

const SpeciesTaxonomy: React.FC = () => {
    const { storyId, speciesId } = useParams<{ storyId: string; speciesId: string }>();
    const navigate = useNavigate();
    const theme = useTheme();
    const [taxonomy, setTaxonomy] = useState<SpeciesTaxonomy | null>(null);
    const [flowData, setFlowData] = useState<SpeciesFlow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'tree' | 'flow'>('tree');

    useEffect(() => {
        const fetchData = async () => {
            if (!storyId || !speciesId) return;
            
            try {
                setLoading(true);
                const [taxRes, flowRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/stories/${storyId}/species/${speciesId}/taxonomy`),
                    fetchSpeciesFlow([Number(speciesId)])
                ]);

                if (!taxRes.ok) throw new Error('Failed to fetch taxonomy');
                
                const taxData = await taxRes.json();
                setTaxonomy(taxData);
                setFlowData(flowRes);
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load species data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [storyId, speciesId]);

    const handleBack = () => {
        navigate(`/world/${storyId}?category=Species%20%26%20Nature&id=${speciesId}`);
    };

    if (loading) {
        return (
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="background.default">
                    <CircularProgress />
                </Box>
            </ThemeProvider>
        );
    }

    // Collect all node IDs to expand them by default
    const getAllNodeIds = (node: SpeciesTreeNode | null): string[] => {
        if (!node) return [];
        let ids = [node.id.toString()];
        if (node.children) {
            node.children.forEach(child => {
                ids = [...ids, ...getAllNodeIds(child)];
            });
        }
        return ids;
    };

    const expandedIds = taxonomy ? [
        ...getAllNodeIds(taxonomy.parentNode),
        ...getAllNodeIds(taxonomy.targetNode)
    ] : [];

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box sx={{ flexGrow: 1, bgcolor: 'background.default', height: '100%', color: 'text.primary', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
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
                            Species Relationships
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                            <Box>
                                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                                    <MuiLink component={Link} underline="hover" color="inherit" to={`/world/${storyId}?category=Species%20%26%20Nature`}>
                                        Species List
                                    </MuiLink>
                                    <MuiLink component={Link} underline="hover" color="inherit" to={`/world/${storyId}?category=Species%20%26%20Nature&id=${speciesId}`}>
                                        {taxonomy?.targetNode.name || 'Species'}
                                    </MuiLink>
                                    <Typography color="text.primary">{view === 'tree' ? 'Taxonomy Tree' : 'Relationship Network'}</Typography>
                                </Breadcrumbs>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {taxonomy?.targetNode.name} {view === 'tree' ? 'Hierarchy' : 'Relationships'}
                                </Typography>
                            </Box>

                            <ToggleButtonGroup
                                value={view}
                                exclusive
                                onChange={(_e, newView) => newView && setView(newView)}
                                size="small"
                                aria-label="view switch"
                            >
                                <ToggleButton value="tree" aria-label="tree view">
                                    <TreeIcon sx={{ mr: 1 }} /> Tree
                                </ToggleButton>
                                <ToggleButton value="flow" aria-label="network view">
                                    <FlowIcon sx={{ mr: 1 }} /> Network
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {error ? (
                            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.1), border: `1px solid ${alpha(theme.palette.error.main, 0.3)}` }}>
                                <Typography color="error">{error}</Typography>
                                <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>Retry</Button>
                            </Paper>
                        ) : taxonomy ? (
                            <Box>
                                {view === 'tree' ? (
                                    <Paper sx={{ p: 4, borderRadius: 2 }}>
                                        <SimpleTreeView defaultExpandedItems={expandedIds}>
                                            {taxonomy.parentNode && (
                                                <>
                                                    <Typography variant="overline" sx={{ color: 'text.disabled', mb: 1, display: 'block', pl: 1 }}>
                                                        Parent Species
                                                    </Typography>
                                                    <RenderTreeItem 
                                                        node={taxonomy.parentNode} 
                                                        storyId={storyId!} 
                                                    />
                                                    <Box sx={{ ml: 4, my: 1, height: 20, borderLeft: `1px dashed ${alpha(theme.palette.divider, 0.5)}` }} />
                                                </>
                                            )}

                                            <Typography variant="overline" sx={{ color: 'text.disabled', mb: 1, display: 'block', pl: 1 }}>
                                                {taxonomy.parentNode ? 'Current & Descendants' : 'Species Tree'}
                                            </Typography>
                                            <RenderTreeItem 
                                                node={taxonomy.targetNode} 
                                                isTarget={true}
                                                storyId={storyId!} 
                                            />
                                        </SimpleTreeView>
                                    </Paper>
                                ) : (
                                    <Box>
                                        <Paper sx={{ p: 2, mb: 2, bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
                                            <Typography variant="body2" color="text.secondary">
                                                This diagram shows relationships between species, such as evolution, growth stages, variants, or social dynamics.
                                                The diagram is automatically laid out to prevent overlaps. You can pan and zoom.
                                            </Typography>
                                        </Paper>
                                        {flowData && (
                                            <SpeciesFlowDiagram 
                                                data={flowData} 
                                                storyId={storyId!} 
                                                targetSpeciesId={Number(speciesId)} 
                                            />
                                        )}
                                    </Box>
                                )}
                            </Box>
                        ) : null}
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default SpeciesTaxonomy;
