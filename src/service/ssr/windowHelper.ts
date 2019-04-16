declare let window: any;

export function isServerRenderMode(): boolean {
    return (typeof (window) === 'undefined') ? true : window.renderMode === 'server';
}

export function isBrowserRenderMode(): boolean {
    return !isServerRenderMode();
}

export function getWindow(){
    if(isServerRenderMode()){
        throw new Error("no window available on server rendering");
    }else{
        return window;
    }
}