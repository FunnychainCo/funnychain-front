import React from 'react';
import ReactDOM from 'react-dom';
import JssProvider from 'react-jss/lib/JssProvider';
import {
    MuiThemeProvider,
    createMuiTheme,
    createGenerateClassName,
} from '@material-ui/core/styles';
import App from './app/App';
import {BrowserRouter} from "react-router-dom";

class Main extends React.Component {
    // Remove the server-side injected CSS.
    componentDidMount() {
        const jssStyles = document.getElementById('jss-server-side');
        if (jssStyles && jssStyles.parentNode) {
            jssStyles.parentNode.removeChild(jssStyles);
        }
    }

    render() {
        return <BrowserRouter><App/></BrowserRouter>
    }
}

// Create a theme instance.
const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
    },
    palette: {
        //type: 'dark'
        //https://material.io/tools/color/#!/?view.left=0&view.right=0&primary.color=212121&secondary.color=FF3D00
        primary: {
            light: '#ffc046',
            main: '#ff8f00',
            dark: '#c56000',
        },
        secondary: {
            light: '#7843ff',
            main: '#1e00ff',
            dark: '#0000ca',
        },
    },
});

// Create a new class name generator.
const generateClassName = createGenerateClassName();

ReactDOM.hydrate(
    <JssProvider generateClassName={generateClassName}>
        <MuiThemeProvider theme={theme}>
            <Main/>
        </MuiThemeProvider>
    </JssProvider>,
    document.querySelector('#root'),
);

if (module.hot) {
    module.hot.accept();
}