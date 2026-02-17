import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  ThemeProvider,
  CssBaseline
} from '@mui/material';
import { darkTheme } from '../theme';

interface EmoteNamingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (emoteName: string | null) => void;
}

const EmoteNamingModal: React.FC<EmoteNamingModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [emoteName, setEmoteName] = useState('');

  const handleConfirm = () => {
    onConfirm(emoteName.trim() === '' ? null : emoteName.trim());
    setEmoteName('');
  };

  const handleCancel = () => {
    setEmoteName('');
    onClose();
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Dialog open={isOpen} onClose={handleCancel}>
        <DialogTitle>Convert to Inline Image</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Optionally provide a name for this emote. If named, you can reuse it later by typing :name.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Emote name (optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={emoteName}
            onChange={(e) => setEmoteName(e.target.value)}
            placeholder="e.g. smile"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default EmoteNamingModal;
