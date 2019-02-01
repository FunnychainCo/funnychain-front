import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';


beforeAll(() => {
    let GLOBAL_PROPERTIES_JS_FOR_TEST:any = {
        /* funnychain */
        hostAPI: "https://alpha.funnychain.co/backend",

        /* mixpanel id */
        mixpanelActivated: 'false',
        mixpanelId: "",

        /* google analytics id */
        googleAnalyticsActivated: 'false',
        googleAnalyticsId: '',
        googleAnalyticsUrl: "",

        /* firebase api */
        apiKey: "AIzaSyAJC1BLZBe64zPsZHBIVBzGmPvH4FPSunY",
        authDomain: "funnychain-dev.firebaseapp.com",
        databaseURL: "https://funnychain-dev.firebaseio.com",
        messagingSenderId: "818676897965",
        projectId: "funnychain-dev",
        storageBucket: "funnychain-dev.appspot.com"
    };

    Object.defineProperty(window, "GLOBAL_PROPERTIES_JS", {
        value: GLOBAL_PROPERTIES_JS_FOR_TEST
    });

    Object.defineProperty(window, "matchMedia", {
        value: jest.fn(() => { return { matches: true } })
    });
});

it('renders without crashing', () => {

    const div = document.createElement('div');
    ReactDOM.render(<App/>, div);
    ReactDOM.unmountComponentAtNode(div);
});
