import { version } from '../package.json'
import Peer from "./Peer"
import WebSocketTransport from "./transports/WebSocketTransport"

export default {
    version,
    Peer: Peer,
    WebSocketTransport : WebSocketTransport
}