import {Component} from "react";
import firebase from 'firebase';
import {firebaseAuth} from "../service/firebase";

export default class List extends Component {
    dataBase = "memes"
    state = {
        list:[]
    }

    componentDidMount () {
        firebase.database().ref(this.dataBase+'/' + fileId).
    }
    render () {
        return (
            <List style={{width: '260px'}} >
                <ListItem
                    primaryText="Logout" leftIcon={<ContentInbox />}
                    onClick={() => {logout()}}>
                </ListItem>
            </List>
        )
    }
}