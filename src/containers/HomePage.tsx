import * as React from 'react'
import {Route} from 'react-router-dom'
import MemeDisplayPage from "./MemeDisplayPage";
import MemeListPage from "./MemeListPage";
import BackListener from "./BackListener";
import InstallPage from "./DialogPage/InstallPage";
import StartPopupSkipDialogV2 from "../components/StartPopUp/StartPopupSkipDialogV2";
import UserMemeListPage from "./UserMemeListPage";
import WalletPage from "./WalletPage";
import NotificationListPage from "./NotificationListPage";
import PostPage from "./DialogPage/PostPage";

export default class HomePage extends React.Component<{
    match: any,
    history: any,
    location:any
}, {}> {

    static defaultProps = {
        match: {},
        history: {},
        location: {},
    };

    render() {
        return (
            <React.Fragment>
                <Route path='/' component={BackListener} />
                <Route path='/' component={StartPopupSkipDialogV2}/>
                <Route path='/' component={MemeListPage} />

                <Route exact path='/meme/:memeid' component={MemeDisplayPage} />
                <Route exact path='/user/:userid/meme/list' component={UserMemeListPage} />
                <Route exact path='/user/:userid/notification/list' component={NotificationListPage} />
                <Route exact path='/install' component={InstallPage} />
                <Route exact path='/user/current/wallet' component={WalletPage} />
                <Route exact path='/post' component={PostPage} />
                {/*<Route exact path='/account' component={AccountDrawerPage}/>
                <Route exact path='/login' component={LoginPage}/>*/}
            </React.Fragment>
        )
    }
}