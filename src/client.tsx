import React from 'react';
import ReactDOM from 'react-dom';
import JssProvider from 'react-jss/lib/JssProvider';
import {
    MuiThemeProvider,
    createGenerateClassName,
} from '@material-ui/core/styles';
import App, {getTheme} from './app/App';
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

// Create a new class name generator.
const generateClassName = createGenerateClassName();

ReactDOM.hydrate(
    <JssProvider generateClassName={generateClassName}>
        <MuiThemeProvider theme={getTheme()}>
            <Main/>
        </MuiThemeProvider>
    </JssProvider>,
    document.querySelector('#root'),
);

if (module.hot) {
    module.hot.accept();
}