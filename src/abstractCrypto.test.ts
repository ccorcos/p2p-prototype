import {
	createPublicPrivateKeyPair,
	createSymmetricKey,
	decryptPublicMessage,
	encryptPublicMessage,
	privateDecrypt,
	privateSign,
	publicEncrypt,
	publicVerify,
	signMessage,
	symmetricDecrypt,
	symmetricEncrypt,
	verifyMessage,
} from "./abstractCrypto"

declare const describe: any
declare const it: any
declare const assert: any
// import {strict as assert} from "assert"

describe("abstract crypto", () => {
	describe("symmtric encryption", () => {
		it("works", () => {
			const data = "hello"

			const key = createSymmetricKey()

			const encrypted = symmetricEncrypt(key, data)
			assert.ok(data !== encrypted)

			const decrypted = symmetricDecrypt(key, encrypted)
			assert.equal(decrypted, data)
		})

		it("fails when tampered", () => {
			const data = "hello"

			const key = createSymmetricKey()

			const encrypted = symmetricEncrypt(key, data)
			assert.ok(data !== encrypted)

			const tampered = encrypted + "blah"
			assert.throws(() => symmetricDecrypt(key, tampered))
		})

		it("fails with a different key", () => {
			const data = "hello"

			const key = createSymmetricKey()

			const encrypted = symmetricEncrypt(key, data)
			assert.ok(data !== encrypted)

			const wrongKey = createSymmetricKey()
			assert.throws(() => symmetricDecrypt(wrongKey, encrypted))
		})
	})

	describe("asymmetric encryption", () => {
		it("encryption works", () => {
			const bob = createPublicPrivateKeyPair()

			const data = "hello"

			const encrypted = publicEncrypt(bob.public, data)
			assert.ok(data !== encrypted)

			const decrypted = privateDecrypt(bob.private, encrypted)
			assert.equal(decrypted, data)
		})

		it("encryption fails when tampered", () => {
			const bob = createPublicPrivateKeyPair()

			const data = "hello"

			const encrypted = publicEncrypt(bob.public, data)
			assert.ok(data !== encrypted)

			const tampered = encrypted + "blah"
			assert.throws(() => privateDecrypt(bob.private, tampered))
		})

		it("encryption fails with the same key", () => {
			const bob = createPublicPrivateKeyPair()

			const data = "hello"

			const encrypted = publicEncrypt(bob.public, data)
			assert.ok(data !== encrypted)
			assert.throws(() => privateDecrypt(bob.private, encrypted))
		})

		it("encryption fails with a different key", () => {
			const bob = createPublicPrivateKeyPair()

			const data = "hello"

			const encrypted = publicEncrypt(bob.public, data)
			assert.ok(data !== encrypted)

			const alice = createPublicPrivateKeyPair()
			assert.throws(() => privateDecrypt(alice.private, encrypted))
		})

		it("signing works", () => {
			const bob = createPublicPrivateKeyPair()

			const data = "hello"

			const signed = privateSign(bob.private, data)
			assert.ok(data !== signed)

			const decrypted = publicVerify(bob.public, signed)
			assert.equal(decrypted, data)
		})

		it("signing fails when tampered", () => {
			const bob = createPublicPrivateKeyPair()

			const data = "hello"

			const signed = privateSign(bob.private, data)
			assert.ok(data !== signed)

			const tampered = signed + "blah"
			assert.throws(() => publicVerify(bob.public, tampered))
		})

		it("signing fails with the same key", () => {
			const bob = createPublicPrivateKeyPair()

			const data = "hello"

			const signed = privateSign(bob.private, data)
			assert.ok(data !== signed)
			assert.throws(() => publicVerify(bob.public, signed))
		})

		it("signing fails with a different key", () => {
			const bob = createPublicPrivateKeyPair()

			const data = "hello"

			const signed = privateSign(bob.private, data)
			assert.ok(data !== signed)

			const alice = createPublicPrivateKeyPair()
			assert.throws(() => publicVerify(alice.public, signed))
		})
	})

	describe("public messages", () => {
		it("works", () => {
			const data = "hello"

			const alice = createPublicPrivateKeyPair()
			const bob = createPublicPrivateKeyPair()

			const sessionKey = createSymmetricKey()
			const encrypted = encryptPublicMessage(
				alice,
				bob.public,
				data,
				sessionKey
			)
			assert.ok(encrypted.encryptedMessage !== data)
			assert.ok(encrypted.encryptedSessionKey !== data)
			assert.ok(encrypted.encryptedMessage !== sessionKey)
			assert.ok(encrypted.encryptedSessionKey !== sessionKey)

			const decrypted = decryptPublicMessage(bob, encrypted)
			assert.equal(decrypted.sessionKey, sessionKey)
			assert.equal(decrypted.message.from, alice.public)
			assert.equal(decrypted.message.data, data)
		})

		it("fails with the same key", () => {
			const data = "hello"

			const alice = createPublicPrivateKeyPair()
			const bob = createPublicPrivateKeyPair()

			const sessionKey = createSymmetricKey()
			const encrypted = encryptPublicMessage(
				alice,
				bob.public,
				data,
				sessionKey
			)

			assert.throws(() => decryptPublicMessage(alice, encrypted))
		})

		it("fails with a different key", () => {
			const data = "hello"

			const alice = createPublicPrivateKeyPair()
			const bob = createPublicPrivateKeyPair()
			const chet = createPublicPrivateKeyPair()

			const sessionKey = createSymmetricKey()
			const encrypted = encryptPublicMessage(
				alice,
				bob.public,
				data,
				sessionKey
			)

			assert.throws(() => decryptPublicMessage(chet, encrypted))
		})

		describe("sign and verify message", () => {
			it("works", () => {
				const data = "hello"

				const alice = createPublicPrivateKeyPair()
				const bob = createPublicPrivateKeyPair()

				const signed = signMessage(alice, bob.public, data)
				verifyMessage(bob, signed)
			})

			it("fails with the same key", () => {
				const data = "hello"

				const alice = createPublicPrivateKeyPair()
				const bob = createPublicPrivateKeyPair()

				const signed = signMessage(alice, bob.public, data)
				assert.throws(() => verifyMessage(alice, signed))
			})

			it("fails with a different key", () => {
				const data = "hello"

				const alice = createPublicPrivateKeyPair()
				const bob = createPublicPrivateKeyPair()
				const chet = createPublicPrivateKeyPair()

				const signed = signMessage(alice, bob.public, data)
				assert.throws(() => verifyMessage(chet, signed))
			})
		})
	})
})
