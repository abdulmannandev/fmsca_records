// src/components/SettingsModal.js
import React from 'react';
import { Modal, Button, Container } from '@mui/material';

const SettingsModal = ({ open, onClose, onSave, onReset }) => (
  <Modal open={open} onClose={onClose}>
    <Container style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Button variant="contained" color="primary" onClick={onSave} style={{ marginBottom: 10 }}>
        Save Settings
      </Button>
      <Button variant="contained" color="secondary" onClick={onReset}>
        Reset Settings
      </Button>
    </Container>
  </Modal>
);

export default SettingsModal;
