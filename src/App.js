import React, { Component } from "react";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import Header from "./components/Header/Header";
import LeftNav from "./components/LeftNav/LeftNav";
import Grid from "./components/Grid/Grid";

class App extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <Header />
        <div style={{display: 'flex'}}>
          <LeftNav />
          <Grid />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
