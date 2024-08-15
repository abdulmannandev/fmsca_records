import React, { useState, useEffect, useMemo } from 'react';
import { Container, Tabs, Tab, Select, MenuItem, Button } from '@mui/material';
import DataTable from './Components/DataTable';
import PivotView from './Components/PivotView';
import SettingsModal from './Components/SettingsModal';
import data from "./data.json";

const App = () => {
  const [view, setView] = useState('table');
  const [modalOpen, setModalOpen] = useState(false);
  const [settings, setSettings] = useState(JSON.parse(localStorage.getItem('settings')) || {});

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const handleSaveSettings = () => {
    localStorage.setItem('settings', JSON.stringify(settings));
    setModalOpen(false);
  };

  const handleResetSettings = () => {
    setSettings({});
    localStorage.removeItem('settings');
  };

  return (
    <Container>
      {/* <Tabs value={view} onChange={(e, newValue) => setView(newValue)}>
        <Tab label="Table View" value="table" />
        <Tab label="Pivot View" value="pivot" />
      </Tabs> */}

      {view === 'table' && (
        <DataTable
          columns={[
            { Header: 'Legal Name', accessor: 'legal_name', type: 'text' },
            { Header: 'DBA Name', accessor: 'dba_name', type: 'text' },
            { Header: 'Physical Address', accessor: 'physical_address', type: 'text' },
            { Header: 'City', accessor: 'p_city', type: 'text' },
            { Header: 'State', accessor: 'p_state', type: 'text' },
            { Header: 'Zip Code', accessor: 'p_zip_code', type: 'text' },
            { Header: 'Phone', accessor: 'phone', type: 'text' },
            { Header: 'Drivers', accessor: 'drivers', type: 'text' },
            { Header: 'Power Units', accessor: 'power_units', type: 'text' },
            { Header: 'Mileage Year', accessor: 'mcs_150_mileage_year', type: 'text' },
            { Header: 'Record Status', accessor: 'record_status', type: 'select' },
            { Header: 'Created Date', accessor: 'created_dt', type: 'date' },
            { Header: 'Modified Date', accessor: 'data_source_modified_dt', type: 'date' },
            { Header: 'Out of Service Date', accessor: 'out_of_service_date', type: 'date' }
          ]}
          data={data}
          onSettingsChange={newSettings => setSettings(prev => ({ ...prev, table: newSettings }))}
          settings={settings}
        />
      )}

      {/* {view === 'pivot' && (
        <PivotView
          data={data}
          onSettingsChange={newSettings => setSettings(prev => ({ ...prev, pivot: newSettings }))}
          settings={settings}
        />
      )} */}

      <SettingsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveSettings}
        onReset={handleResetSettings}
      />

      <Button onClick={() => setModalOpen(true)} style={{ marginTop: 20 }}>
        Save/Load Settings
      </Button>
    </Container>
  );
};

export default App;
