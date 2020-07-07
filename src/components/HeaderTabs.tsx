import React, { useState } from 'react';
import {Tabs, Tab, makeStyles} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  tabContainer: {
    position: 'fixed',
    top: 0,
  }
}))

// Home
// Portfolio
// About
// Why Work With Us
// Contact
const HeaderTabs = () => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  return (
    <Tabs className={classes.tabContainer} value={tabValue} onChange={(evt, value) => setTabValue(value)} indicatorColor='primary'>
      <Tab value={0} label='Home'/>
      <Tab value={1} label='Portfolio'/>
      <Tab value={2} label='About'/>
      <Tab value={3} label='Why Work With Us'/>
      <Tab value={4} label='Contact'/>
    </Tabs>
  );
};

export default HeaderTabs;