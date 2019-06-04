import * as React from 'react';
import {Component} from 'react';
import ModalPage from "../ModalPage/ModalPage";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import Button from "@material-ui/core/Button/Button";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import {userNotificationService} from "../../service/notification/UserNotificationService";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import InboxIcon from '@material-ui/icons/Inbox';
import {UiNotificationData} from "../../service/generic/Notification";
import {Link} from "react-router-dom";
import {CommentTextOutline} from 'mdi-material-ui';//https://materialdesignicons.com/
import {TooltipImageOutline} from 'mdi-material-ui';//https://materialdesignicons.com/
import {ThumbUpOutline} from 'mdi-material-ui';
import moment from "moment";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import {deviceDetector} from "../../service/mobile/DeviceDetector";
import LoadMoreList from "../List/LoadMoreList";
import {ItemLoader, PaginationCursor} from "../../service/concurency/PaginationInterface";

//https://materialdesignicons.com/

interface State {
}

export default class NotificationList extends Component<{
    userid: string,
    onRequestClose: () => void,
    open: boolean,
}, State> {

    state: State = {};

    handleClose = () => {
        this.props.onRequestClose();
    };

    private cursor: PaginationCursor<string>;
    private itemLoader: ItemLoader<UiNotificationData>;

    componentWillMount() {
        this.cursor = userNotificationService.notificationPaginationCursorFactory.create();
        this.itemLoader = userNotificationService.itemLoader;
        this.restartLoader(this.props.userid);
    }

    restartLoader(uid: string) {
    }

    componentWillUnmount() {
        //userNotificationService.markAllAsSeen();
    }

    getIcon(type: string): any {
        if (type === "Comments_Follow" || type === "Comments_Created") {
            return <CommentTextOutline/>;
        }
        if (type === "Meme_Create") {
            return <TooltipImageOutline/>;
        }
        if (type === "Meme_Like") {
            return <ThumbUpOutline/>;
        } else {
            return <InboxIcon/>;
        }
    }

    render() {
        return (
            <ModalPage
                open={this.props.open}
                onRequestClose={this.handleClose}
            >
                <DialogTitle>Notifications</DialogTitle>
                <DialogContent style={{minWidth: "300px"}}>
                    <List component="nav" dense={false}>
                        <LoadMoreList
                            key="loadlist"
                            scrollableAncestor={undefined}
                            paginationCursor={this.cursor}
                            itemLoader={this.itemLoader}
                            element={(notificationKey, notification) => {
                                if (notification) {
                                    let action = notification.data ? notification.data.action ? notification.data.action : null : null;
                                    const link = (props) => <Link to={action ? action : "/"} {...props} />;
                                    let date = moment(notification.date).fromNow();
                                    let type = notification.type;
                                    let message = "";
                                    let token = notification.data.token === 0 ? "some" : notification.data.token.toFixed(2)
                                    if (type === "Transaction") {
                                        message = "You received " + token + " LOL";
                                    } else if (type === "Meme_Like") {
                                        message = "The meme you liked became hot! You earn " + token + " token like a boss.";
                                    } else if (type === "Meme_Invest") {
                                        message = "The meme you invested in became hot! You earn " + token + " token like a boss.";
                                    } else if (type === "Meme_Create") {
                                        message = "The meme you created became hot! You earn " + token + " token like a boss.";
                                    } else if (type === "Comments_Follow") {
                                        message = "Someone write a comment";
                                    } else if (type === "Comments_Created") {
                                        message = "Someone write a comment on a post you created";
                                    }

                                    //hack for iphone that does not allow remuneration on like
                                    if (!(notification.type === "Meme_Like" && deviceDetector.isIphoneAndMobileApp())) {
                                        return <ListItem button key={notificationKey}
                                                         component={action ? link : undefined}>
                                            <ListItemIcon>
                                                {this.getIcon(type)}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={notification.seen ? message : <b>{message}</b>}
                                                secondary={date}
                                            />
                                        </ListItem>
                                    } else {
                                        return <div key={notificationKey}></div>
                                    }
                                } else {
                                    return <div key={notificationKey}></div>
                                }
                            }}
                            placeHolderElement={() => {
                                <img className="memeImage"
                                     src="/static/image/placeholder-image.png"
                                     alt=""/>
                            }}
                        />
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </ModalPage>
        )
    }
}
