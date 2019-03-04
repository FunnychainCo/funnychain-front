import * as React from 'react'
import {Component} from 'react'
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../service/generic/UserEntry";
import List from "@material-ui/core/List";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import InboxIcon from '@material-ui/icons/Inbox';
import {walletService} from "../../service/firebase/WalletService";
import {FirebaseTransaction} from "../../service/firebase/shared/FireBaseDBDefinition";
import {audit} from "../../service/Audit";
import moment from "moment";

interface State {
    user: UserEntry,
    loading: boolean,
    transactions: any[],
    displayTransaction: boolean,
}

export default class UserWalletTransaction extends Component<{
    userid: string,
}, State> {

    state: State = {
        user: USER_ENTRY_NO_VALUE,
        loading: true,
        transactions: [],
        displayTransaction: false,
    };

    private removeListener: () => void = () => {
    };

    componentWillMount() {
        this.loadWalletTransaction();
    }

    componentWillUnmount() {
        this.removeListener();
    }

    loadWalletTransaction() {
        walletService.getTransaction(this.props.userid).then(transactions => {
            this.setState({transactions: transactions});
        });
    }

    render() {
        return (
            <List component="nav">
                {this.state.transactions.map((value: FirebaseTransaction, index, array) => {
                    let addressMessage = "ERROR";
                    let date = moment(value.date).fromNow();
                    let amount = "ERROR";
                    if (value.src === this.props.userid) {
                        addressMessage = "To " + value.dst;
                        if (value.amount >= 0.01) {
                            amount = "" + (-value.amount).toFixed(2);
                        } else {
                            amount = "" + (-value.amount);
                        }
                    } else if (value.dst === this.props.userid) {
                        addressMessage = "From " + value.src;
                        if (value.amount >= 0.01) {
                            amount = "" + value.amount.toFixed(2);
                        } else {
                            amount = "" + value.amount;
                        }
                    } else {
                        audit.reportError(value);
                    }
                    return <ListItem key={index}>
                        <ListItemIcon>
                            <InboxIcon/>
                        </ListItemIcon>
                        <ListItemText
                            primary={amount + " LOL"}
                            secondary={addressMessage + " " + date}
                        />
                    </ListItem>
                })
                }
            </List>
        )
    }
}
