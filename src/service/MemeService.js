import firebase from 'firebase';
import {idService} from "./IdService";
import PropTypes from 'prop-types'; // ES6

export class MemeService {
    dataBase = "memes"
    propTypes = {
        iid: PropTypes.string,
        uid: PropTypes.string,
        title: PropTypes.string,
        created: PropTypes.string
    };

    on(callback) {
        var ref = firebase.database().ref(this.dataBase);
        var toremove = ref.on("value", (memes) => {
            var memesValue = memes.val() || {};
            callback(memesValue);
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        //return remove listener function
        return () => {
            ref.off("value",toremove);
        };
    }

    createMeme(meme) {
        var user = firebase.auth().currentUser;
        meme.uid = user.uid;//ensure ownership of meme
        meme.created = new Date().toString();
        return new Promise((resolve) => {
            console.log(meme);
            PropTypes.checkPropTypes(this.propTypes, meme, 'prop', 'Meme');
            firebase.database().ref(this.dataBase + '/' + idService.makeid()).set(meme);
        });
    }

}

export var memeService = new MemeService();
