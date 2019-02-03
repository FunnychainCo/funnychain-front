import * as React from 'react'
import {Route} from 'react-router-dom'
import MemeDisplayPage from "./MemeDisplayPage";
import MemeListPage from "./MemeListPage";
import BackListener from "./BackListener";
import InstallPage from "./DialogPage/InstallPage";
import InstallSkipDialog from "../components/StartPopUp/StartPopupSkipDialog";
import UserMemeListPage from "./UserMemeListPage";

export default class HomePage extends React.Component<{}, {}> {
    render() {
        return (
            <div>
                <Route path='/' component={BackListener} />

                <Route path='/' component={InstallSkipDialog} />
                <Route path='/' component={MemeListPage} />
                <Route path='/meme/:memeid' component={MemeDisplayPage} />
                <Route exact path='/user/:userid/meme/list' component={UserMemeListPage} />

                <Route path='/install' component={InstallPage} />

            </div>
        )
    }
}