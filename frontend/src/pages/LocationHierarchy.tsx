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
    Stack,
    LinearProgress
} from '@mui/material';
import { 
    ArrowBack as ArrowBackIcon, 
    Visibility as ViewIcon,
    AccountTree as TreeIcon,
    Route as FlowIcon,
    Place as PlaceIcon
} from '@mui/icons-material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resolveShortcodes } from '../constants/media';
import { fetchLocationTaxonomy, fetchLocationFlow } from '../utils/locationApi';
import type { LocationTaxonomy as LocationHierarchyData, LocationFlow, LocationTreeNode } from '../utils/locationApi';
import { LocationFlowDiagram } from '../components/LocationFlowDiagram';
import { darkTheme } from '../theme';

interface TreeItemLabelProps {
    node: LocationTreeNode;
    isTarget?: boolean;
    storyId: string;
}

const TreeItemLabel: React.FC<TreeItemLabelProps> = ({ node, isTarget, storyId }) => {
    const navigate = useNavigate();
    const theme = useTheme();

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/world/${storyId}?category=Locations&id=${node.id}`);
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

            <Box sx={{ flexGrow: 1 }}>
                <Typography 
                    variant="body2" 
                    sx={{ 
                        fontWeight: isTarget ? 700 : 400,
                        color: isTarget ? 'primary.light' : 'text.primary',
                        userSelect: 'none'
                    }}
                >
                    {node.name} {isTarget && "(Current)"}
                </Typography>
                {node.areaPercentage !== undefined && node.areaPercentage !== null && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Box sx={{ flexGrow: 1, maxWidth: 100 }}>
                            <LinearProgress 
                                variant="determinate" 
                                value={node.areaPercentage} 
                                sx={{ height: 4, borderRadius: 2 }} 
                            />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            {node.areaPercentage}% of parent
                        </Typography>
                    </Box>
                )}
            </Box>

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

const RenderTreeItem: React.FC<{ node: LocationTreeNode; isTarget?: boolean; storyId: string }> = ({ node, isTarget, storyId }) => {
    return (
        <TreeItem 
            itemId={node.id.toString()} 
            label={<TreeItemLabel node={node} isTarget={isTarget} storyId={storyId} />}
            sx={{
                '& .MuiTreeItem-content': {
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                        bgcolor: alpha(darkTheme.palette.primary.main, 0.04),
                    },
                    '&.Mui-selected': {
                        bgcolor: alpha(darkTheme.palette.primary.main, 0.1),
                        '&:hover': {
                            bgcolor: alpha(darkTheme.palette.primary.main, 0.15),
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

const LocationHierarchy: React.FC = () => {
    const { storyId, locationId } = useParams<{ storyId: string; locationId: string }>();
    const navigate = useNavigate();
    const theme = useTheme();
    const [hierarchy, setHierarchy] = useState<LocationHierarchyData | null>(null);
    const [flowData, setFlowData] = useState<LocationFlow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'tree' | 'flow'>('tree');

    useEffect(() => {
        const fetchData = async () => {
            if (!storyId || !locationId) return;
            
            try {
                setLoading(true);
                const [taxData, flowData] = await Promise.all([
                    fetchLocationTaxonomy(Number(locationId)),
                    fetchLocationFlow([Number(locationId)])
                ]);

                setHierarchy(taxData);
                setFlowData(flowData);
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load location data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [storyId, locationId]);

    const handleBack = () => {
        navigate(`/world/${storyId}?category=Locations&id=${locationId}`);
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

    const getAllNodeIds = (node: LocationTreeNode | null): string[] => {
        if (!node) return [];
        let ids = [node.id.toString()];
        if (node.children) {
            node.children.forEach(child => {
                ids = [...ids, ...getAllNodeIds(child)];
            });
        }
        return ids;
    };

    const expandedIds = hierarchy ? [
        ...getAllNodeIds(hierarchy.parentNode),
        ...getAllNodeIds(hierarchy.targetNode)
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
                        <PlaceIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Location Hierarchy & Relations
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                            <Box>
                                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                                    <MuiLink component={Link} underline="hover" color="inherit" to={`/world/${storyId}?category=Locations`}>
                                        Locations List
                                    </MuiLink>
                                    <MuiLink component={Link} underline="hover" color="inherit" to={`/world/${storyId}?category=Locations&id=${locationId}`}>
                                        {hierarchy?.targetNode.name || 'Location'}
                                    </MuiLink>
                                    <Typography color="text.primary">{view === 'tree' ? 'Hierarchy Tree' : 'Relation Network'}</Typography>
                                </Breadcrumbs>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {hierarchy?.targetNode.name} {view === 'tree' ? 'Hierarchy' : 'Relationships'}
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
                                    <TreeIcon sx={{ mr: 1 }} /> Hierarchy
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
                        ) : hierarchy ? (
                            <Box>
                                {view === 'tree' ? (
                                    <Paper sx={{ p: 4, borderRadius: 2 }}>
                                        <SimpleTreeView defaultExpandedItems={expandedIds}>
                                            {hierarchy.parentNode && (
                                                <>
                                                    <Typography variant="overline" sx={{ color: 'text.disabled', mb: 1, display: 'block', pl: 1 }}>
                                                        Parent Location
                                                    </Typography>
                                                    <RenderTreeItem 
                                                        node={hierarchy.parentNode} 
                                                        storyId={storyId!} 
                                                    />
                                                    <Box sx={{ ml: 4, my: 1, height: 20, borderLeft: `1px dashed ${alpha(theme.palette.divider, 0.5)}` }} />
                                                </>
                                            )}

                                            <Typography variant="overline" sx={{ color: 'text.disabled', mb: 1, display: 'block', pl: 1 }}>
                                                {hierarchy.parentNode ? 'Current & Sub-locations' : 'Location Tree'}
                                            </Typography>
                                            <RenderTreeItem 
                                                node={hierarchy.targetNode} 
                                                isTarget={true}
                                                storyId={storyId!} 
                                            />
                                        </SimpleTreeView>
                                    </Paper>
                                ) : (
                                    <Box>
                                        <Paper sx={{ p: 2, mb: 2, bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
                                            <Typography variant="body2" color="text.secondary">
                                                This diagram shows relationships between locations, such as trade routes, proximity, or political ties.
                                            </Typography>
                                        </Paper>
                                        {flowData && (
                                            <LocationFlowDiagram 
                                                data={flowData} 
                                                storyId={storyId!} 
                                                targetLocationId={Number(locationId)} 
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

export default LocationHierarchy;
