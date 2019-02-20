import * as React from 'react';
import {Component} from 'react';
import ButtonBase from "@material-ui/core/ButtonBase";
import {pwaService} from "../../service/mobile/PWAService";
import {Link} from 'react-router-dom';

export default class InstallButtons extends Component<{}, {
    displayAddToHomeButton: boolean,
}> {
    state = {
        displayAddToHomeButton: false,
    };


    private removeListenerPWA: () => void;

    componentDidMount() {
        //https://ipfs.funnychain.co/ipfs/QmPCdLdMEEev9kkq4mBh5qZK46Ztd2TcrhwGs369BxRPZ5  //android
        //https://ipfs.funnychain.co/ipfs/QmbsazofVLw3rAhtViJ4TTqVW7gCkW9BQSem46zxMbFJRy //iphone
        //https://ipfs.funnychain.co/ipfs/Qmf328sDL7omNVNZ2VH5DGc7BymDQJ6L6Jd2LbQ2NKKMd8 //pwa
        this.removeListenerPWA = pwaService.on((callback) => {
            this.setState({displayAddToHomeButton: callback != null});
        });
    }

    componentWillUnmount() {
        this.removeListenerPWA();
    }

    render() {
        const installLink = (props) => <Link to={"/install"} {...props} />;
        const buttonStyle = {
            width: "160px",
            margin: "5px"
        };
        const imageStyle = {
            width: "100%"
        };
        return (
            <React.Fragment>
                <ButtonBase
                    onClick={
                        () => {
                            window.open("https://play.google.com/store/apps/details?id=mobile.funnychain.co", "_system");
                        }
                    }
                    focusRipple
                    style={buttonStyle}
                >
                    <img
                        style={imageStyle}
                        src="https://ipfs.funnychain.co/ipfs/QmPCdLdMEEev9kkq4mBh5qZK46Ztd2TcrhwGs369BxRPZ5"
                        alt="android"/>
                </ButtonBase>
                <br/>
                {false &&
                <ButtonBase
                    focusRipple
                    style={buttonStyle}
                >
                    <img
                        style={imageStyle}
                        src="https://ipfs.funnychain.co/ipfs/QmbsazofVLw3rAhtViJ4TTqVW7gCkW9BQSem46zxMbFJRy"
                        alt="ios"/>
                </ButtonBase>
                }
                <br/>
                {this.state.displayAddToHomeButton &&
                <ButtonBase
                    focusRipple
                    style={buttonStyle}
                    onClick={() => {
                        pwaService.triggerAddToHomeScreen();
                    }}
                >
                    <img
                        style={imageStyle}
                        src="https://ipfs.funnychain.co/ipfs/QmcFu7AU2aZjkgzPaTYpbJ9BH3mJmQuy22u62oiGc57Kh3"
                        alt="pwa"/>
                </ButtonBase>
                }
                {!this.state.displayAddToHomeButton &&
                <ButtonBase
                    component={installLink}
                    focusRipple
                    style={buttonStyle}
                    onClick={() => {
                        pwaService.triggerAddToHomeScreen();
                    }}
                >
                    <img
                        style={imageStyle}
                        src="https://ipfs.funnychain.co/ipfs/QmcFu7AU2aZjkgzPaTYpbJ9BH3mJmQuy22u62oiGc57Kh3"
                        alt="pwa"/>
                </ButtonBase>
                }
            </React.Fragment>
        )
    }
}
