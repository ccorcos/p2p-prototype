/*

TODO:
- mock out all the crypto abstractions.
	- write crypto tests.

- state machine for clients.
	- Hardcoded WebRTC + Signalhub abstraction first.
	- generalize public channel abstraction.
	- generalize address abstration.
	- generalize transport abstraction.


*/

import {
	createPublicPrivateKeyPair,
	PrivateSignedData,
	PublicKey,
	PublicPrivateKeyPair,
} from "./abstractCrypto"
import { StateMachine } from "./StateMachine"

type Contact = { name: string; publicKey: PublicKey }

type LogState = {
	sendLog: any[]
	sendCursor: number
	recieveLog: any[]
}

type ClientState = {
	me: PublicPrivateKeyPair
	contacts: Contact[]
	logs: Map<PublicKey, LogState>
}

const clientReducers = {
	addContact(
		state: ClientState,
		name: string,
		publicKey: PublicKey
	): ClientState {
		// TODO: check that contact doesnt already exist.
		return { ...state, contacts: [...state.contacts, { name, publicKey }] }
	},
	deleteContact(state: ClientState, publicKey: PublicKey): ClientState {
		// TODO
		return state
	},
	swapKey(
		state: ClientState,
		beforeKey: PublicKey,
		afterKey: PublicKey
	): ClientState {
		// TODO: should probably identify contacts by id anyways...
		return state
	},
	sendMessage(state: ClientState, to: PublicKey, data: string): ClientState {
		// TODO: verify that its already a contact.
		let logs = new Map(state.logs)
		if (!state.logs.has(to)) {
			logs.set(to, { sendLog: [data], sendCursor: 0, recieveLog: [] })
		} else {
			const log = state.logs.get(to)!
			const newLog = {
				...log,
				// TODO: this spread is not performant.
				sendLog: [...log.sendLog, data],
			}
			logs.set(to, newLog)
		}
		return { ...state, logs }
	},
}

// ======================================================================

function main() {
	const me = createPublicPrivateKeyPair()
	const initialState: ClientState = { me, contacts: [], logs: new Map() }
	const app = new StateMachine(initialState, clientReducers)

	for (const contact of app.state.contacts) {
		contact.publicKey
	}

	app.plug({
		update(prevState) {},
		destroy() {},
	})
}

class MessageBroker {
	async connect(): Promise<MessageBrokerConnection> {
		return new MessageBrokerConnection()
	}
}

class MessageBrokerConnection {
	async send(publicKey: PublicKey, data: any): Promise<void> {}

	onDisconnect(fn: () => void): () => void {
		return () => {}
	}
}

// type MessageBrokerState = {
// 	connected: boolean
// 	queue: Map<PublicKey, { stage: "sending"; any }[]>
// }

// const messageBrokerReducers = {
// 	setStatus(state: MessageBrokerState, connected: boolean): MessageBrokerState {
// 		return state
// 	},
// 	sendMessage(
// 		state: MessageBrokerState,
// 		to: PublicKey,
// 		data: any
// 	): MessageBrokerState {
// 		return state
// 	},
// }

type ConnectionState = {
	stage: "should-connect" | "connecting" | "connected" | "error"
}

// messageBrokerState
// p2pState
type NetworkState = {
	contacts: Map<PublicKey, ConnectionState>
}

// class Socket {}

// type ConnectionStatus =
// 	| {
// 			stage: "attempt"
// 			// TODO: timeout and retries.
// 	  }
// 	| {
// 			stage: "connected"
// 			socket: Socket
// 	  }
// 	| {
// 			stage: "failed"
// 			error: string
// 	  }

// type MessageQueue = Map<PublicKey, any[]>

// type ConnectionState = {
// 	status: Map<PublicKey, ConnectionStatus>
// 	queue: MessageQueue
// }

// function establishConnection(me: PublicPrivateKeyPair, publicKey: PublicKey) {
// 	// send address to
// }

// // Outgoing public messages, needs timouts too.
// type PublicMessageQueue = Map<PublicKey, any>

class Transport {
	constructor(public initiator: boolean) {}
	onSendAddress(fn: (data: any) => void) {}
	recieveAddress(data: any) {}
}

interface PublicChannelConnection {
	connected: boolean
	onConnectionChange(fn: () => void): () => void
	onMessage(fn: (data: string) => void): () => void
	send(to: PublicKey, data: any): Promise<void>
	destroy(): void
}

interface PublicChannel {
	connect(args: {
		publicKey: PublicKey
		publicKeySignature: PrivateSignedData
	}): PublicChannelConnection
}

function attemptConnection(
	me: PublicPrivateKeyPair,
	to: PublicKey,
	messageBroker: PublicChannelConnection
) {
	const transport = new Transport(true)
	transport.onSendAddress((data) => messageBroker.send)
}
