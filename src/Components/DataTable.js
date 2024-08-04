import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import DetailDialog from './DetailDialog';
import data from "../data.json";

const columns = [
  { id: 'created_dt', label: 'Created_DT', type: 'text' },
  { id: 'data_source_modified_dt', label: 'Modified_DT', type: 'text' },
  { id: 'operating_status', label: 'Operating Status', type: 'select' },
  { id: 'legal_name', label: 'Legal Name', type: 'text' },
  { id: 'dba_name', label: 'DBA Name', type: 'text' },
  { id: 'physical_address', label: 'Physical Address', type: 'text' },
  { id: 'phone', label: 'Phone', type: 'text' },
  { id: 'usdot_number', label: 'DOT', type: 'text' },
  { id: 'mc_mx_ff_number', label: 'MC/MX/FF', type: 'text' },
  { id: 'power_units', label: 'Power Units', type: 'text' },
  { id: 'out_of_service_date', label: 'Out of Service Date', type: 'text' },
];

const getUniqueOptions = (data, columnId) => {
  return [...new Set(data.map(item => item[columnId]))];
};

const DataTable = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filters, setFilters] = useState({});
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleFilterChange = (event, columnId) => {
    const newFilters = { ...filters, [columnId]: event.target.value };
    setFilters(newFilters);
  };

  const clearFilter = (columnId) => {
    const newFilters = { ...filters, [columnId]: '' };
    setFilters(newFilters);
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
  };

  const filteredData = data.filter((row) =>
    columns.every((column) => {
      const filterValue = filters[column.id];
      if (!filterValue) return true;
      return String(row[column.id]).toLowerCase().includes(filterValue.toLowerCase());
    })
  );

  const columnOptions = useMemo(() => {
    const options = {};
    columns.forEach(column => {
      if (column.type === 'select') {
        options[column.id] = getUniqueOptions(data, column.id);
      }
    });
    return options;
  }, [data]);

  const handleOpenFilterDialog = () => {
    setOpenFilterDialog(true);
  };

  const handleCloseFilterDialog = () => {
    setOpenFilterDialog(false);
  };

  return (
    <Paper>
      <TableContainer>
        <Table aria-label="data table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  {column.label}
                </TableCell>
              ))}
              <TableCell>
                <IconButton onClick={handleOpenFilterDialog}>
                  <FilterListIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rowIndex) => (
              <TableRow key={rowIndex} onClick={() => handleRowClick(row)} style={{ cursor: 'pointer' }}>
                {columns.map((column) => (
                  <TableCell key={column.id}>{row[column.id] !== null ? row[column.id] : 'N/A'}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog open={openFilterDialog} onClose={handleCloseFilterDialog}>
        <DialogTitle>Filter Columns</DialogTitle>
        <DialogContent>
          {columns.map((column) => (
            <div key={column.id}>
              {column.type === 'text' ? (
                <TextField
                  value={filters[column.id] || ''}
                  onChange={(event) => handleFilterChange(event, column.id)}
                  placeholder={`Filter ${column.label}`}
                  variant="standard"
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => clearFilter(column.id)}>
                        <ClearIcon />
                      </IconButton>
                    )
                  }}
                />
              ) : (
                <FormControl variant="standard" size="small" fullWidth>
                  <InputLabel>{`Filter ${column.label}`}</InputLabel>
                  <Select
                    value={filters[column.id] || ''}
                    onChange={(event) => handleFilterChange(event, column.id)}
                    label={`Filter ${column.label}`}
                    endAdornment={
                      <IconButton onClick={() => clearFilter(column.id)}>
                        <ClearIcon />
                      </IconButton>
                    }
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {columnOptions[column.id].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFilterDialog} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
      {selectedRow && (
        <DetailDialog
          open={openDetailDialog}
          onClose={handleCloseDetailDialog}
          rowData={selectedRow}
          columns={columns}
        />
      )}
    </Paper>
  );
};

export default DataTable;
