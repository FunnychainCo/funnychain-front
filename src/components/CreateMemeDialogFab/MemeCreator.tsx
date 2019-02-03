import * as React from 'react'
import {Component} from 'react'
import {withStyles} from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid";
import axios from 'axios'
import Masonry from 'react-masonry-component';
import Button from "@material-ui/core/Button";
import {fileUploadService} from "../../service/generic/FileUploadService";
import LoadingBlock from "../LoadingBlock/LoadingBlock";
import {GLOBAL_PROPERTIES} from "../../properties/properties";

let toBuffer = require('blob-to-buffer')

const styles: any = theme => ({});

class MemeInput extends React.Component<{
    field: string,
    onChangeProp: any,
    onEnterProp: any,
    onLeaveProp: any,
    placeholder: string,
    fontSize: string
}, {}> {
    render() {
        //onChange={(event)=>{this.setState({upText:event.target.value})}} type="text" value={this.state.upText}
        return <input
            placeholder={this.props.placeholder}
            style={{
                width: "100%",
                background: "none",
                outline: "none",
                border: "none",
                fontSize: this.props.fontSize,
                textAlign: "center",
                textShadow: "1px 1px 0 #000, -1px -1px 0 #000,1px -1px 0 #000, -1px 1px 0 #000,1px 1px 0 #000",
                color: "white"
            }}
            onChange={(event) => {
                this.props.onChangeProp(event)
            }}
            onFocus={(event) => {
                this.props.onEnterProp(event)
            }}
            onBlur={(event) => {
                this.props.onLeaveProp(event)
            }}
            type="text" value={this.props.field}/>;
    }
}

class MemeCanva extends React.Component<{ image: string, onTextChangeProp: any, onCanvaProp: (canva: any) => void }, {}> {

    state: any = {
        upText: "",
        downText: "",
        fromBottom: 0,
        fromTop: 0,
        computedFontSize: 30,
    };

    canvaUpText = "";
    canvaDownText = "";
    fontSize = 50;

    private ctxImage: HTMLImageElement;
    private canvas: HTMLElement | any;
    private ctx: any;


    componentDidMount() {
        this.ctxImage = new Image();
        this.ctxImage.crossOrigin = "Anonymous";
        this.canvas = document.getElementById('memesCanvas');
        this.props.onCanvaProp(this.canvas);
        this.ctxImage.onload = () => {
            this.canvas.width = this.ctxImage.width;
            this.canvas.height = this.ctxImage.height;
            console.log('i mounted with image ' + this.ctxImage.src);

            let adjustementRation = (this.canvas.offsetHeight / this.ctxImage.height);
            this.setState({
                computedFontSize: this.fontSize * adjustementRation,
                fromBottom: this.canvas.height * 0.10 * adjustementRation,
                fromTop: this.canvas.height * 0.10 * adjustementRation
            });

            this.ctx = this.canvas.getContext('2d');
            this.ctx.font = "600 " + this.fontSize + "px" + " Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = 'white';

            this._redrawCanvas();
        };
        this.ctxImage.src = this.props.image;
        this.ctx = this.canvas.getContext('2d');
        this._redrawCanvas();
    }

    _redrawCanvas() {
        this.ctx.drawImage(this.ctxImage, 0, 0, this.canvas.width, this.canvas.height);
        this._drawText(this.canvaUpText, this.canvas.width / 2, this.state.fromTop + this.fontSize);
        this._drawText(this.canvaDownText, this.canvas.width / 2, this.canvas.height - this.state.fromBottom);
    }

    _drawText(text, x, y) {
        this.ctx.fillText(text, x, y);
        this.ctx.strokeText(text, x, y);
    }

    render() {
        //onChange={(event)=>{this.setState({upText:event.target.value})}} type="text" value={this.state.upText}
        return <div style={{position: "relative"}}>
            <canvas style={{maxWidth: "100%", maxHeight: "100%", minHeight: "20px"}} id='memesCanvas'/>
            <div style={{
                position: "absolute",
                top: this.state.fromTop,
                left: "0",
                width: "100%",
            }}>
                <MemeInput
                    fontSize={this.state.computedFontSize + "px"}
                    placeholder={this.canvaUpText === "" ? "Type your text here" : ""}
                    onChangeProp={(event) => {
                        this.setState({upText: event.target.value})
                    }}
                    onLeaveProp={() => {
                        //switch text from input to canva
                        this.canvaUpText = this.state.upText;
                        this._redrawCanvas();
                        this.setState({upText: ""});
                        this.props.onTextChangeProp({up: this.canvaUpText, down: this.canvaDownText});
                    }}
                    onEnterProp={() => {
                        //switch text from canva to input
                        this.setState({upText: this.canvaUpText});
                        this.canvaUpText = "";
                        this._redrawCanvas();
                    }}
                    field={this.state.upText}/>
            </div>
            <div style={{
                position: "absolute",
                bottom: this.state.fromBottom,
                left: "0",
                width: "100%",
            }}>
                <MemeInput
                    fontSize={this.state.computedFontSize + "px"}
                    placeholder={this.canvaDownText === "" ? "Type your text here" : ""}
                    onChangeProp={(event) => {
                        this.setState({downText: event.target.value})
                    }}

                    onLeaveProp={() => {
                        //switch text from input to canva
                        this.canvaDownText = this.state.downText;
                        this._redrawCanvas();
                        this.setState({downText: ""});
                        this.props.onTextChangeProp({up: this.canvaUpText, down: this.canvaDownText});
                    }}
                    onEnterProp={() => {
                        //switch text from canva to input
                        this.setState({downText: this.canvaDownText});
                        this.canvaDownText = "";
                        this._redrawCanvas();
                    }}
                    field={this.state.downText}/>
            </div>
        </div>;
    }
}

interface MemeTemplate{
    refImageSD: string,
    refImageMD: string,
    refImageHD: string,
    memeName: string,
}

interface State {
    memesTemplates: MemeTemplate[],
    selected:MemeTemplate,
    step: number,
    upText: string,
    downText: string,
    finalMemeUrl: string,
}


class MemeCreator extends Component<{ visible:boolean,onImageUploaded:(image:string)=> void }, State> {

    state: State = {
        memesTemplates: [],
        selected: {refImageSD: "",refImageMD:"",refImageHD:"", memeName: ""},
        step: 0,
        upText: "",
        downText: "",
        finalMemeUrl: ""
    };
    private canva: any;

    componentDidMount() {
        axios.get(GLOBAL_PROPERTIES.MEME_SERVICE_GET_MAP(), {}).then((response) => {
            let data = response.data;
            let imageLinks: MemeTemplate[] = [];
            Object.keys(data).forEach(key => {
                imageLinks.push({
                    refImageSD: data[key].ipfsSD,
                    refImageMD: data[key].ipfsMD,
                    refImageHD: data[key].ipfs,
                    memeName: key,
                });
            });
            this.setState({memesTemplates: imageLinks});
        });
    }

    computeGrid() {
        let groupSize = 4;
        let ratio = 100 / groupSize;
        let rows = this.state.memesTemplates.map((content) => {
            // map content to html elements
            return <Grid item style={{flexGrow: 1, maxWidth: ratio + "%", maxHeight: "100%"}}>
                <img style={{flexGrow: 1, maxWidth: "100%", maxHeight: "100%"}} src={content.refImageSD}
                     alt={content.memeName}/></Grid>;
        }).reduce((r: any, element, index) => {
            // create element groups with size 3, result looks like:
            // [[elem1, elem2, elem3], [elem4, elem5, elem6], ...]
            index % groupSize === 0 && r.push([]);
            r[r.length - 1].push(element);
            return r;
        }, []).map((rowContent) => {
            // surround every group with 'row'
            return <Grid container item>{rowContent}
            </Grid>;
        });
        return <Grid container style={{flexGrow: 1}}>{rows}</Grid>;
    }

    computeMaconery() {

        let groupSize = 4;
        let ratio = 100 / groupSize;

        const childElements = this.state.memesTemplates.map((element) => {
            return (
                <img key={element.memeName}
                     style={{width: ratio + "%", maxWidth: ratio + "%", maxHeight: "100%", minHeight: "20px"}}
                     src={element.refImageSD}
                     onClick={() => {
                         this.setState({selected: element, step: 1})
                     }}/>
            );
        });

        return <Masonry
            style={{width: "100%", height: "10px"}}>
            {childElements}
        </Masonry>
    }


    cleanupText(input: string): string {
        if (input === "") {
            input = " ";
        }
        input.replace(new RegExp(" ", "g"), "_");
        input.replace(new RegExp("_", "g"), "__");
        input.replace(new RegExp("-", "g"), "--");
        input.replace(new RegExp("\\?", "g"), "~q");
        input.replace(new RegExp("%", "g"), "~p");
        input.replace(new RegExp("#", "g"), "~h");
        input.replace(new RegExp("/", "g"), "~s");
        input.replace(new RegExp("\"", "g"), "''");
        return input;
    }

    computeImageRef() {
        let textValue = "";
        textValue += "/" + this.cleanupText(this.state.upText);
        textValue += "/" + this.cleanupText(this.state.downText);
        if (textValue == "/_/_") {
            textValue = "/__";
        }
        return "https://memegen.link/" + this.state.selected.memeName + textValue + ".jpg?watermark=none";
    }

    render() {
        return (
            <React.Fragment>

                {this.state.step === 2 &&
                <React.Fragment>
                    <Button style={{margin: "20px"}} variant="contained" color="primary" onClick={() => {
                        this.setState({step: 1, finalMemeUrl: ""});
                    }}>Return</Button>
                    {this.state.finalMemeUrl === "" && <LoadingBlock/>}
                    {this.state.finalMemeUrl !== "" &&
                    <img style={{maxWidth: "100%", maxHeight: "100%", minHeight: "20px"}}
                         src={this.state.finalMemeUrl}/>}
                </React.Fragment>
                }
                {this.state.step === 1 &&
                <React.Fragment>
                    <Button style={{margin: "20px"}} variant="contained" color="primary" onClick={() => {
                        this.setState({step: 0});
                    }}>Return</Button>

                    <Button style={{margin: "20px"}} variant="contained" color="primary" onClick={() => {
                        this.setState({step: 2});
                        new Promise<string>((resolve, reject) => {
                            this.canva.toBlob((blob) => {
                                toBuffer(blob, (err, buffer) => {
                                    if (err) throw err;
                                    fileUploadService.uploadBuffer(buffer, (progress) => {
                                    }).then((data) => {
                                        resolve(data.fileURL);
                                    }).catch(reason => {
                                        reject(reason);
                                    });
                                })
                            });
                        }).then(url => {
                            this.props.onImageUploaded(url);
                            this.setState({finalMemeUrl: url});
                        });
                    }}>Upload</Button>
                    <MemeCanva
                        image={this.state.selected.refImageHD}
                        onTextChangeProp={(value) => {
                            this.setState({upText: value.up, downText: value.down});
                        }}
                        onCanvaProp={(canva) => {
                            this.canva = canva
                        }}
                    />
                </React.Fragment>
                }
                {(this.state.step === 0 && this.props.visible==true) && this.computeMaconery()}
                {this.state.step === -1 &&
                <Button style={{margin: "20px"}} variant="contained" color="primary" onClick={() => {
                    this.setState({step: 0});
                }}>Start</Button>
                }
            </React.Fragment>
        )
    }
}

export default withStyles(styles)(MemeCreator);