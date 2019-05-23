import * as React from "react";

export class ImageFit extends React.Component<{ src: string,style:any }, {}> {

    public render() {
        return (
            <div style={{...{
                minWidth: "100%",
                minHeight: "100%",
                backgroundImage: `url(${this.props.src})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "50% 50%",
                backgroundColor:"#000000"
            },...this.props.style}} />
        );
    }
}