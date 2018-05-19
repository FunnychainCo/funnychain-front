import {fireBaseMemeService} from "./FireBaseMemeService";
import PropTypes from "prop-types";

export class MemeProvider {

    propTypes = {
        id: PropTypes.string,
        uid: PropTypes.string,
        user: PropTypes.any,
        title: PropTypes.string,
        imageUrl: PropTypes.string,
        created: PropTypes.instanceOf(Date)
    };

    checkMemeFormat(meme){
        PropTypes.checkPropTypes(propTypes, this.meme, 'prop', 'checkMemeFormat');
    }

    on(callback) {
        fireBaseMemeService.on((memesValue) => {
            var itemsKeys = Object.keys(memesValue);
            itemsKeys.forEach((key) => {
                var meme = memesValue[key];
                this.state.memes[key] = meme;
                this.forceUpdate();
            });
        });
    }
}

export var memeProvider = new MemeProvider();