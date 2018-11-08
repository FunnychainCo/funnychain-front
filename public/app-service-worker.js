// tslint:disable:no-console
console.log('app service worker V1.0');
let url = '/';

function init() {
    self.addEventListener('message', (event) => {
        if (event && event.data) {
            processCommand(event.data);
        }
    });
    self.addEventListener('push', (event) => {
        if (event && event.data) {
            const data = event.data.json();
            event.waitUntil(processCommand(data));
        }
    });
    self.addEventListener('notificationclick', (event) => {
        event.notification.close(); // Android needs explicit close.
        event.waitUntil(
            clients.matchAll({type: 'window'}).then( windowClients => {
                // Check if there is already a window/tab open with the target URL
                for (var i = 0; i < windowClients.length; i++) {
                    var client = windowClients[i];
                    // If so, just focus it.
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, then open the target URL in a new window/tab.
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
        );
    });
}

function processCommand(cmd){
    return new Promise((resolve,reject) => {
        console.log("SW Received Message: " + cmd);
        let data = cmd.data;
        if(cmd.cmd==="NOTIFY_USER"){
            //Notification can be internal (toast) or external
            //Try to send notification via client toast
            sendCommandToAllClients(cmd).then(clientResponsePromiseList => {
                if(clientResponsePromiseList.length===0){
                    //nobody is here to process the command so we perform external notification
                    processNotification(data.title, data.message).then(()=>{
                        resolve(true);
                    });
                }else{
                    Promise.all(clientResponsePromiseList).then(clientResponseList =>{
                        let respOK = 0;
                        clientResponseList.forEach(resp => {
                            respOK += resp==="OK"?1:0;
                        });
                        if(respOK>0){
                            //notification has been proceced by a client (displayed as a toast)
                            reject("not an error");//Here we reject the promise to avoid getting the chrom notification "The website has been updated in background"
                        }else{
                            //nobody is viewing the client
                            // no one is here to process the command so we perform external notification
                            processNotification(data.title, data.message).then(()=>{
                                resolve(true);
                            });
                        }
                    });
                }
            })
        }else{
            console.error(cmd);
            reject(cmd);
        }
    });
}

function sendMessageToClient(client, msg){
    return new Promise((resolve, reject)=>{
        let msgChan = new MessageChannel();

        msgChan.port1.onmessage = (event)=>{
            if(event.data.error){
                reject(event.data.error);
            }else{
                resolve(event.data);
            }
        };

        client.postMessage(msg, [msgChan.port2]);
    });
}

function sendCommandToAllClients(msg) {
    return new Promise(resolve => {
        clients.matchAll().then(clients => {
            let promiseList = [];
            clients.forEach(client => {
                promiseList.push(sendMessageToClient(client, msg));
            });
            resolve(promiseList);
        })
    });
}

function processNotification(title, message) {
    return new Promise(resolve =>{
        //https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
        //https://twitter.com/push_service_worker.js
        //sendMessageToAllClients("SW_REQ_NOTIFICATION_PERMISSION");
        self.registration.showNotification(title, {
            body:message,
            icon:"/static/image/push_notif_icon.png"
        }).then((NotificationEvent) => {
            resolve(NotificationEvent);
        });
    });
}

init();