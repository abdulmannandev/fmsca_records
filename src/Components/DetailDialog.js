import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';

const DetailDialog = ({ open, onClose, rowData, columns }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Row Details</DialogTitle>
      <DialogContent>
        {columns.map((column) => (
          <div key={column.id}>
            <strong>{column.label}:</strong> {rowData[column.id] !== null ? rowData[column.id] : 'N/A'}
          </div>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetailDialog;
