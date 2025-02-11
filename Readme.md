![Alt text](frontend/public/sweetnotes-logo-480x270.png "Logo")
 
# Sweetnotes 💌🔐 - Simple, secure, and secret notes revealed in time.
 
Sweetnotes lets you send secret notes to your friends, which are revealed at a later time of your choice. Imagine the anticipation — your friend knows a message awaits them and even has a link, but they have no idea what it says until the time arrives! The notes are end-to-end encrypted, ensuring complete privacy even from the server, which fully encrypts messages.  
Whether it’s a heartfelt confession, a birthday surprise, or just a playful tease, Sweetnotes adds an element of mystery and excitement to your messages. Write a note, set a reveal time, send it to a friend and watch the anticipation build!

💌 Psst... Ready to send a secret? Try it here: https://sweetnotes.art


## 🚀 Features

📝 Create secret notes and set a future reveal time.

🔐 End-to-end encryption to keep notes private.

📩 Share notes via a secure link.

⏳ Recipients can only view notes after the reveal time. 

## 🔐 Encryption Process

To ensure that notes remain private and cannot be accessed by the server, messages are encrypted using symmetric encryption, meaning the same key is used to both encrypt and decrypt the data.

### Encryption on the Frontend:

* When a user creates a note, a random encryption key is generated using AES 256 (CBC), on the client. This isn't sent to the server.

* The note is encrypted  into a ciphertext using the key with a unique IV (Initialization Vector). The IV is a random value used to ensure the encryption output (ciphertext) is unique even if the same plaintext and key are used multiple times. Its saved on the database alongside the encrypted data and is required during decryption to reverse the process.

* Only the encrypted ciphertext and IV are sent to the backend, the key is never stored.

* After the note is saved, the user receives a link for the note with the key as an url parameter - https://sweetnotes.art/notes/<note_id>?key=<encryption_key>
. Hence, only the person generating the message has access to the key and subsequently any person he/she shares the url with.   

### Decryption on the Frontend:

* The recipient's client accesses the note id via the URL and the encryption key which is an url parameter.

* The frontend fetches the encrypted note (ciphertext) and IV from the server, using the note id

and decrypts it using the provided key.

* The decrypted message is displayed only after the reveal time has passed. If the reveal date has not passed, the API returns a placeholder message. If the reveal date has passed, the encrypted message and IV are returned for decryption on the frontend.
## 🛠️ Tech Stack
 * Frontend (React.js), CryptoJS (AES encryption)
 * Backend (Node.js + Express for REST APIs), MongoDB (storing encrypted notes)
## 📜License
This project is open-source under the MIT License. Feel free to fork, modify, and contribute!