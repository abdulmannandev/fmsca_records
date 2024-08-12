import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableRow } from '@mui/material';

const DetailDialog = ({ open, onClose, rowData, columns }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Row Details</DialogTitle>
      <DialogContent>
        <Table>
          <TableBody>
            {columns.map((column) => (
              <TableRow key={column.id}>
                <TableCell>{column.label}</TableCell>
                <TableCell>{rowData[column.id] !== null ? rowData[column.id] : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetailDialog;
