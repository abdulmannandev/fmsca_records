import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Paper,
  Box,
  Typography,
  Modal,
  Button,
  MenuItem,
  Select
} from '@mui/material';
import LZString from 'lz-string';
import { useTable, usePagination } from 'react-table';
import BarGraph from './BarGraph';

// Constants
const BATCH_SIZE = 1000;


// Utility to save only changed data to localStorage
const saveChangesToLocalStorage = (changes) => {
  try {
    const compressedChanges = LZString.compress(JSON.stringify(changes));
    localStorage.setItem('pivotData', compressedChanges);
  } catch (e) {
    console.error("Error saving data to localStorage", e);
  }
};

const PivotTable = ({ data: initialData }) => {
  const [pivotData, setPivotData] = useState([]);
  const [timePeriod, setTimePeriod] = useState('month');
  const [openModal, setOpenModal] = useState(false);
  const [changedRows, setChangedRows] = useState(new Map());
  const [previousData, setPreviousData] = useState([...pivotData]);

  // Pivot Table Configuration
  const columns = React.useMemo(
    () => [
      { Header: 'Period', accessor: 'period' },
      { Header: 'Count', accessor: 'count' }
    ],
    []
  );
  const loadData = () => {
    const compressedData = localStorage.getItem('pivotData');
    const tempData = [...initialData];
    if (compressedData) {
      const decompressedData = LZString.decompress(compressedData);
      if (decompressedData) {
        const decompressedDataParsed = JSON.parse(decompressedData)
        const decompressedDataKeys = Object.keys(decompressedDataParsed);
        if (decompressedDataKeys?.length) {
          decompressedDataKeys.forEach((key) => {
            const item = decompressedDataParsed[key];
            tempData[key] = item;
          })
        }
      }
    }
    setPivotData(tempData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const data = React.useMemo(() => {
    const groupedData = pivotData.reduce((acc, item) => {
      const date = new Date(item.out_of_service_date);
      const period = timePeriod === 'month'
        ? date.toLocaleString('default', { month: 'short', year: 'numeric' })
        : timePeriod === 'week'
        ? `Week ${Math.ceil(date.getDate() / 7)} ${date.getFullYear()}`
        : date.getFullYear();

      if (!acc[period]) {
        acc[period] = { period, count: 0 };
      }
      acc[period].count += 1;

      return acc;
    }, {});

    return Object.values(groupedData);
  }, [pivotData, timePeriod]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: { pageIndex, pageSize }
  } = useTable(
    { columns, data },
    usePagination
  );

  const handleCellChange = (rowIndex, value) => {
    const newData = [...pivotData];
    newData[rowIndex].count = value;
    setPivotData(newData);

    // Track changes
    setChangedRows(prev => new Map(prev).set(newData[rowIndex].id, newData[rowIndex]));
  };

  const handleCellClick = (rowIndex) => {
    // Add logic to handle cell click if needed
  };

  const handleCellBlur = () => {
    // Asynchronously save changes
    requestIdleCallback(() => {
      if (changedRows.size > 0) {
        saveChangesToLocalStorage(Array.from(changedRows.values()));
        setChangedRows(new Map());
      }
    });
  };

  const handlePeriodChange = (event) => {
    setTimePeriod(event.target.value);
  };

  useEffect(() => {
    setPreviousData([...pivotData]);
  }, [pivotData]);

  const tableData = page.map(row => {
    prepareRow(row);
    return row;
  });

  // Generate chart data
  const barChartDataArray = data.map(row => ({
    period: row.period,
    count: row.count
  }));
  

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
        <Typography variant="h6">Pivot Table</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
          Save/Load View
        </Button>
      </Box>

      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="body1">Group By:</Typography>
        <Select
          value={timePeriod}
          onChange={handlePeriodChange}
          style={{ marginLeft: '20px', width: '150px' }}
        >
          <MenuItem value="month">Month</MenuItem>
          <MenuItem value="week">Week</MenuItem>
          <MenuItem value="year">Year</MenuItem>
        </Select>
      </Box>

      <TableContainer component={Paper}>
        <Table {...getTableProps()}>
          <TableHead>
            {headerGroups.map(headerGroup => (
              <TableRow {...headerGroup.getHeaderGroupProps()} sx={{ backgroundColor: '#f5f5f5' }}>
                {headerGroup.headers.map(column => (
                  <TableCell {...column.getHeaderProps()} sx={{ fontWeight: 'bold' }}>
                    {column.render('Header')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {tableData.map((row, rowIndex) => (
              <TableRow key={rowIndex} {...row.getRowProps()} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                {row.cells.map(cell => (
                  <TableCell
                    key={cell.column.id}
                    {...cell.getCellProps()}
                    onClick={() => handleCellClick(rowIndex)}
                    onBlur={handleCellBlur}
                  >
                    <TextField
                      type="text"
                      value={cell.value || ''}
                      onChange={(e) => handleCellChange(rowIndex, e.target.value)}
                      onBlur={handleCellBlur}
                      fullWidth
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={data?.length}
        rowsPerPage={pageSize}
        page={pageIndex}
        onPageChange={(event, newPage) => {
          // Handle page change if needed
        }}
        onRowsPerPageChange={(event) => {
          // Handle rows per page change if needed
        }}
      />

      <BarGraph data={barChartDataArray} />

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">Save/Load View</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Implement save functionality
              setOpenModal(false);
            }}
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
          >
            Load
          </Button>
        </Box>
      </Modal>
    </>
  );
};

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

export default PivotTable;
