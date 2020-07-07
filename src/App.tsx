import React from 'react';
import './App.css';
import {makeStyles, Typography} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  header: {
    fontSize: 200,
  },
}));

function App() {
  const classes = useStyles();
  return (
    <div className="App">
      <header className="App-header">
        <Typography variant='h1'>
          <b>Ty Karges</b>
        </Typography>
      </header>
    </div>
  );
}

export default App;
