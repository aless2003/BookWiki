import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  TextField,
  ThemeProvider,
  CssBaseline,
  DialogContentText
} from '@mui/material';
import { MdEdit, MdDelete, MdCheck, MdClose } from 'react-icons/md';
import { darkTheme } from '../theme';

interface Emote {
  id: number;
  name: string;
  imageUrl: string;
}

interface EmoteManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  onEmotesChanged: () => void;
}

const EmoteManagementModal: React.FC<EmoteManagementModalProps> = ({ isOpen, onClose, storyId, onEmotesChanged }) => {
  const [emotes, setEmotes] = useState<Emote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3906/api/stories/${storyId}/emotes`);
      if (response.ok) {
        const data = await response.json();
        setEmotes(data);
      } else {
        setError('Failed to load emotes.');
      }
    } catch (err) {
      setError('An error occurred while fetching emotes.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmotes();
    } else {
      setEditingId(null);
      setNewName('');
    }
  }, [isOpen, storyId]);

  const handleStartEdit = (emote: Emote) => {
    setEditingId(emote.id);
    setNewName(emote.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewName('');
  };

  const handleRename = async (id: number) => {
    if (!newName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3906/api/stories/${storyId}/emotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });

      if (response.ok) {
        setEditingId(null);
        await fetchEmotes();
        onEmotesChanged();
      } else if (response.status === 409) {
        alert('An emote with this name already exists.');
      } else {
        alert('Failed to rename emote.');
      }
    } catch (err) {
      console.error('Error renaming emote:', err);
      alert('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this emote? This will remove the shortcut but existing images in your text will remain.') || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3906/api/stories/${storyId}/emotes/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchEmotes();
        onEmotesChanged();
      } else {
        alert('Failed to delete emote.');
      }
    } catch (err) {
      console.error('Error deleting emote:', err);
      alert('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Story Emotes</DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            Manage the named emotes for this story. Renaming updates the shortcut trigger, and deleting removes it from the suggestions list.
          </DialogContentText>
          {isLoading && emotes.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : emotes.length === 0 ? (
            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              No named emotes found for this story.
            </Typography>
          ) : (
            <List>
              {emotes.map((emote) => (
                <ListItem
                  key={emote.id}
                  secondaryAction={
                    editingId === emote.id ? (
                      <Box>
                        <IconButton edge="end" aria-label="confirm" color="primary" onClick={() => handleRename(emote.id)} disabled={isSubmitting}>
                          <MdCheck />
                        </IconButton>
                        <IconButton edge="end" aria-label="cancel" onClick={handleCancelEdit} disabled={isSubmitting}>
                          <MdClose />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box>
                        <IconButton edge="end" aria-label="edit" sx={{ mr: 1 }} onClick={() => handleStartEdit(emote)} disabled={isSubmitting}>
                          <MdEdit />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" color="error" onClick={() => handleDelete(emote.id)} disabled={isSubmitting}>
                          <MdDelete />
                        </IconButton>
                      </Box>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar 
                      variant="square" 
                      src={emote.imageUrl} 
                      alt={emote.name}
                      sx={{ width: 40, height: 40, borderRadius: 1 }}
                    />
                  </ListItemAvatar>
                  {editingId === emote.id ? (
                    <TextField
                      autoFocus
                      size="small"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(emote.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      variant="standard"
                      sx={{ ml: 1, flexGrow: 1 }}
                    />
                  ) : (
                    <ListItemText
                      primary={emote.name}
                      secondary={`:${emote.name}`}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                      sx={{ ml: 1 }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default EmoteManagementModal;
