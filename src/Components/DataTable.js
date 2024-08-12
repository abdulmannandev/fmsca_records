import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
  Button,
  Typography,
  Modal,
  Box
} from '@mui/material';
import { useTable, useSortBy, usePagination, useGlobalFilter } from 'react-table';
import LZString from 'lz-string';
import BarGraph from './BarGraph';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Modal styles
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const DataTable = ({ columns, data, onSettingsChange, settings }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [editedData, setEditedData] = useState(data);
  const [editingCell, setEditingCell] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    setPageSize,
    state
  } = useTable(
    {
      columns,
      data: editedData,
      initialState: settings.table || { pageIndex: 0, pageSize: 10 }
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );
  
  const loadData = () => {
    const compressedData = localStorage.getItem('tableData');
    if (compressedData) {
      const decompressedData = LZString.decompress(compressedData);
      if (decompressedData) {
        setEditedData(JSON.parse(decompressedData));
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    onSettingsChange({ ...settings, table: state });
  }, [state]);

  const handleCellChange = (rowIndex, columnId, value) => {
    const newData = [...editedData];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [columnId]: value
    };
    setEditedData(newData);
    const compressedData = LZString.compress(JSON.stringify(newData));
    localStorage.setItem('tableData', compressedData);
  };

  const handleCellClick = (rowIndex, columnId) => {
    setEditingCell({ rowIndex, columnId });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    if (editingCell) {
      const { rowIndex, columnId } = editingCell;
      handleCellChange(rowIndex, columnId, value);
    }
  };

  const handleDateChange = (date) => {
    if (editingCell) {
      const { rowIndex, columnId } = editingCell;
      handleCellChange(rowIndex, columnId, date ? date.toISOString() : '');
    }
  };

  const handleSelectChange = (e) => {
    const { value } = e.target;
    if (editingCell) {
      const { rowIndex, columnId } = editingCell;
      handleCellChange(rowIndex, columnId, value);
    }
  };

  const getUniqueOptions = (columnId) => {
    const uniqueValues = [...new Set(editedData.map(row => row[columnId]))];
    return uniqueValues.map(value => (
      <MenuItem key={value} value={value}>
        {value}
      </MenuItem>
    ));
  };

  const tableData = page.map(row => {
    prepareRow(row);
    return row;
  });

  // Generate chart data
  const barChartData = editedData
    .filter(d => d.out_of_service_date)
    .reduce((acc, cur) => {
      const month = new Date(cur.out_of_service_date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

  const barChartDataArray = Object.keys(barChartData).map(month => ({
    month,
    count: barChartData[month]
  }));

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
        <Typography variant="h6">Data Table</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
          Save/Load View
        </Button>
      </Box>

      <TextField
        label="Search"
        variant="outlined"
        onChange={(e) => setGlobalFilter(e.target.value)}
        value={globalFilter}
        style={{ margin: '20px 0', width: '100%' }}
      />

      <TableContainer component={Paper}>
        <Table {...getTableProps()} size="small">
          <TableHead>
            {headerGroups.map(headerGroup => (
              <TableRow {...headerGroup.getHeaderGroupProps()} sx={{ backgroundColor: '#f5f5f5' }}>
                {headerGroup.headers.map(column => (
                  <TableCell {...column.getHeaderProps(column.getSortByToggleProps())} sx={{ fontWeight: 'bold' }}>
                    {column.render('Header')}
                    {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                    {column.canFilter ? column.render('Filter') : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {tableData.map((row, rowIndex) => {
              prepareRow(row);
              return (
                <TableRow key={rowIndex} {...row.getRowProps()} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                  {row.cells.map(cell => (
                    <TableCell
                      key={cell.column.id}
                      {...cell.getCellProps()}
                      onClick={() => handleCellClick(rowIndex, cell.column.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      {editingCell?.rowIndex === rowIndex && editingCell.columnId === cell.column.id ? (
                        cell.column.type === 'date' ? (
                          <DatePicker
                            selected={cell.value ? new Date(cell.value) : null}
                            onChange={handleDateChange}
                            onBlur={handleCellBlur}
                            autoFocus
                          />
                        ) : cell.column.type === 'select' ? (
                          <FormControl fullWidth>
                            <InputLabel>{cell.column.Header}</InputLabel>
                            <Select
                              value={cell.value || ''}
                              onChange={handleSelectChange}
                              onBlur={handleCellBlur}
                              autoFocus
                            >
                              {getUniqueOptions(cell.column.id)}
                            </Select>
                          </FormControl>
                        ) : (
                          <TextField
                            value={cell.value || ''}
                            onChange={handleInputChange}
                            onBlur={handleCellBlur}
                            autoFocus
                            fullWidth
                          />
                        )
                      ) : (
                        cell.render('Cell')
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={editedData.length}
        rowsPerPage={state.pageSize}
        page={state.pageIndex}
        onPageChange={(event, newPage) => {
          setPageSize(newPage);
          onSettingsChange({ ...settings, table: { ...state, pageIndex: newPage } });
        }}
        onRowsPerPageChange={(event) => {
          setPageSize(parseInt(event.target.value, 10));
          onSettingsChange({ ...settings, table: { ...state, pageSize: parseInt(event.target.value, 10) } });
        }}
      />

      <BarGraph data={barChartDataArray} />

      {/* Modal for saving/loading views */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">Save/Load View</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Implement save functionality
              setOpenModal(false);
            }}
            sx={{ mt: 2, mr: 1 }}
          >
            Save
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              // Implement load functionality
              setOpenModal(false);
            }}
            sx={{ mt: 2 }}
          >
            Load
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default DataTable;
