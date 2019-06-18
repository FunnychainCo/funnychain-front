import * as React from 'react'
import {Component} from 'react'
import Header from "../components/Header/Header";
import MemeListSwipe from "../components/MemeList/MemeListSwipe";

export default class MemeListPage extends Component<{
    match: any,
    history: any,
    location: any
}, {
    type: string,
    disableSelection: boolean,
}> {

    state = {
        type: "hot",
        disableSelection: false,
    };

    //private currentPath: string = null;

    componentWillMount() {
        this.updateComponent();
    }

    updateComponent() {
        //const match = this.props.match; // coming from React Router.
        /*{isExact:true,params:{memeid: "toto"},path:"/meme/:memeid",url:"/meme/toto"}*/
        /*const location = this.props.location; // coming from React Router.
        let path = location.pathname;
        if(path!==this.currentPath) {
            this.currentPath = path;
            if (path === "/hot") {
                this.setState({type: "hot", disableSelection: false});
            } else if (path === "/fresh") {
                this.setState({type: "fresh", disableSelection: false});
            } else if (path === "/") {
                this.setState({type: "hot", disableSelection: false});
            } else {
                this.setState({type: "hot", disableSelection: true});
            }
        }*/
    }

    /*componentDidUpdate(prevProps: Readonly<{ match: any; history: any; location: any }>, prevState: Readonly<{ type: string; disableSelection: boolean }>, snapshot?: any): void {
        this.updateComponent();
    }*/

    render() {
        return (
            <React.Fragment>
                <Header disableSelection={this.state.disableSelection} type={this.state.type}
                        onTypeChange={(type) => this.setState({type: type})}/>
                {/*<MemeListV2 type={this.state.type}/>*/}
                <MemeListSwipe type={this.state.type}/>
            </React.Fragment>
        )
    }
}
