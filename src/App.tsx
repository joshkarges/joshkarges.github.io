import React from 'react';
import {makeStyles, Typography, ThemeProvider, createMuiTheme} from '@material-ui/core';
import HeaderTabs from './components/HeaderTabs';
import { deepOrange, blueGrey } from '@material-ui/core/colors';

const useStyles = makeStyles((theme) => ({
  header: {
    fontSize: 400,
  },
}));

const theme = createMuiTheme({
  palette: {
    primary: deepOrange,
    secondary: blueGrey,
  },
});

function App() {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
    <div className="App">
      <header className="App-header">
        <HeaderTabs/>
        <Typography variant='h1' className={classes.header}>
          <b>Ty Karges</b>
        </Typography>
      </header>
    </div>
    </ThemeProvider>
  );
}

export default App;
