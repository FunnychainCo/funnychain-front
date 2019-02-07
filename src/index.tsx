import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app/App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import WebFont from 'webfontloader';

ReactDOM.render(
    <App/>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();


// postpone initiation of app until fonts are active
const webFontConfig = {
    google: {
        families: ['Roboto'],
    },
    custom: {
        families: ['FontAwesome'],
        urls: [
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'
        ],
    },
    classes: false,
    timeout: 1000,
};

// application entry point
WebFont.load(webFontConfig);