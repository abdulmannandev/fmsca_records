import React from 'react';
import { TextField } from '@mui/material';

const DefaultColumnFilter = ({
  column: { filterValue, setFilter },
}) => (
  <TextField
    value={filterValue || ''}
    onChange={e => setFilter(e.target.value || undefined)}
    variant="outlined"
    size="small"
    fullWidth
  />
);

export default DefaultColumnFilter;
