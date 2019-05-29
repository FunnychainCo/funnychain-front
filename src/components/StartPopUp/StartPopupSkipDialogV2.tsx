import * as React from 'react'
import {Component} from 'react'
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import {withStyles} from '@material-ui/core/styles';
//import store from 'store';
import ModalPage from "../ModalPage/ModalPage";
import {Check} from 'mdi-material-ui';
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ExternalLink from "../Link/ExternalLink";
import {cookiesService} from "../../service/ssr/CookiesService";
import {deviceDetector} from "../../service/mobile/DeviceDetector";
import InstallButtons from "./InstallButtons";
import {ExternalButtons} from "../Account/ExternalLinkAccount";
import List from "@material-ui/core/List/List";
import ListItemText from "@material-ui/core/ListItemText/ListItemText"; //https://materialdesignicons.com/

const styles: any = theme => ({});

class StartPopupSkipDialogV2 extends Component<{
    classes: any
}, {
    open: boolean
}> {

    state = {
        open: false
    };

    skipPopupStoreKey = "fc.terms.privacy.agreed";

    componentWillMount() {
        //let skiped = store.get(this.skipPopupStoreKey, false);
        let skiped = cookiesService.cookies.get(this.skipPopupStoreKey) ? cookiesService.cookies.get(this.skipPopupStoreKey) : false;
        let displayPopup = !skiped;
        this.setState({open: displayPopup});
    }


    skip() {
        this.doNotShowPopupAgain();
        this.handleClose();
    }

    doNotShowPopupAgain() {
        //store.set(this.skipPopupStoreKey, true);
        cookiesService.cookies.set(this.skipPopupStoreKey, true);
    }

    handleClose() {
        this.setState({open: false});
    }

    render() {
        return (
            <ModalPage
                open={this.state.open}
            >
                <DialogContent style={{display: "flex", flexDirection: "row", margin: 0, padding: 0}}>
                    <div style={{flexGrow: 1, display: "flex", flexDirection: "column"}}>

                        <div style={{textAlign: "center", fontSize: "1.0em"}}>
                            <h1>Welcome to Funnychain!</h1>
                            <img style={{flexGrow: 1, maxWidth: "100%", maxHeight: "100%"}}
                                 src="/static/image/start/1.png" alt="install"/>
                            <br/>
                            <b style={{fontSize: "1.0em"}}>
                                Like, post or invest on the best memes to get paid!
                            </b><br/>
                            <img style={{flexGrow: 1, maxWidth: "100%", maxHeight: "100%"}}
                                 src="/static/image/start/2.png" alt="install"/>

                            <h1>Join the Community</h1>
                            <List>
                                <ExternalButtons/>
                            </List>

                            {!deviceDetector.isMobileAppRender() &&
                                <React.Fragment>
                            <h1>Check the app App</h1>
                            <div style={{textAlign: "center", fontSize: "1.1em"}}>
                                <InstallButtons/>
                            </div>
                                </React.Fragment>
                            }

                            <h1>What is Funnychain</h1>
                            {/*TODO change this link*/}
                            <Button variant={"contained"} color={"primary"} component={(props) => <ExternalLink href="https://www.funnychain.co/static/white_paper.pdf" {...props} />}>
                                <ListItemText primary="Open the whitepaper"/>
                            </Button>
                        </div>
                        <Typography style={{padding:"10px"}}>
                            Decentralized redistribution algorithm focusing on data valuation for incentivized<br />platforms.<br /><br />The future of social and entertainment platforms will consist on fair platforms where<br />each<br />users&rsquo; data and contribution will be recognized by both the platform and its users.<br />Users<br />should be able to sell their anonymized data and take profit of them with rewards,<br />instead<br />of giving it to big companies such as Facebook and Google for free.<br /><br />Many platforms in the past year tried to build this next generation platform such as<br />Steemit<br />or Kik but algorithms were lacking.<br />Incentives in token economics are often based on its digital value coming from scarcity<br />and<br />usefulness. Our algorithm focus on a more practical approach linking advertisement<br />(sponsored posts and premium revenues) to the algorithm allowing a decentralized<br />redistribution model based on revenues instead of inflation lifting the volatility<br />problems<br />of these tokens.<br />The technology we&rsquo;re building will allow new platforms -like ours- to flourish with a<br />constant improving algorithm based on Artificial Intelligence (AI).<br />As incentives bring automatized bots and mischievous users trying to take advantage of<br />the<br />system, our algorithm focus on being robust and secure.<br />We focus on building the next generation Media&rsquo;s Data Redistribution Framework (MDRF):<br />- Incentivize any users providing data on any medias (Social Networks/Videos/Memes..)<br />- Circular Token Economy focusing on inside Ads instead of speculation reducing<br />volatility<br />- Providing a curated Quality Content page (Top), with Incentives on creating and<br />sorting<br />(New) content only<br />- Fair contribution algorithm processing how much each user&rsquo;s provided to the platform<br />with<br />our Aura system and upgraded with a custom feed using a combination of Tags and Neural<br />Network<br />- Transparency and fair Redistribution of each transaction thanks to the blockchain<br />- Robust Security with our IPFS based Audience system<br /><br />The entertainment world is the key to bring the cryptocurrency knowledge to the masses<br />and<br />this is what we want to achieve. We believe redistribution and incentives from<br />advertisements and platforms itself makes a fair platform possible.<br />We created our own meme platform in order to develop the funniest and easiest way to<br />understand cryptocurrencies, and with our Decentralized Popularity Sorting Algorithm<br />(DPSA),<br />aim to create the futuristic fair platform we all dream of.
                        </Typography>
                    </div>
                </DialogContent>
                <DialogActions style={{backgroundColor: "#f2f2f2"}}>
                    <Typography>
                        By clicking the "Continue" button you agree with our&nbsp;
                        <ExternalLink style={{textDecoration: "underline", color: "#0000ee"}}
                                      href={"http://start.funnychain.co/terms"}>
                            Terms of Use
                        </ExternalLink>
                        &nbsp;and&nbsp;
                        <ExternalLink style={{textDecoration: "underline", color: "#0000ee"}}
                                      href={"http://start.funnychain.co/privacy"}>
                            Privacy Policy
                        </ExternalLink>.
                        <br/>
                        <br/>
                    </Typography>
                    <Button style={{minWidth: "131px"}} color="primary" size="medium" variant="outlined"
                            aria-label="Continue" onClick={() => {
                        this.skip()
                    }}><Check/>&nbsp;Continue</Button>
                </DialogActions>
            </ModalPage>
        )
    }
}

export default withStyles(styles)(StartPopupSkipDialogV2);