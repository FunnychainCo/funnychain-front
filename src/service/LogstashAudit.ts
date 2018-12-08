import axios from 'axios'

export class LogstashAudit {

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /** A generated random id for each application-start. */
    private sessionId: string = this.uuidv4();

    /** Timestamp of the session-start. */
    private sessionStart: number = +new Date();

    /** A generated random id for this "installation", kind of like a user-id. */
    private userId: string;

    constructor(private tracking_url: string, uid: string) {
        this.userId = uid=="" ? uid : this.uuidv4();
    }

    /**
     * Tracks an event.
     * @param event the info of the event. (e.g. "Application Start" or "Click Button Create Project")
     * @param value optional additional information (e.g. the msec it took to start the app)
     */
    public track(event: string, data?: any): void {
        let finalvalue={
            event:event,
            user: this.userId,
            session: this.sessionId,
            session_duration: (+new Date()) - this.sessionStart,
            ...data,
        };
        axios.put(this.tracking_url, finalvalue);
    }
}