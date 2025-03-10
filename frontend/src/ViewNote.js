import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import html2canvas from "html2canvas";

function ViewNote() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [error, setError] = useState("");
  const [copyButtonText, setCopyButtonText] = useState("Copy Link");
  const [encryptionKey, setEncryptionKey] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_API_URL;

  // Dynamically get the base URL for the React app
  const baseURL = window.location.origin;

  // Step 1: On mount, check for encryption key in URL, otherwise try localStorage
  useEffect(() => {
    // Search for key in params, if present, store in localstorage, to be used for notification clicks
    const keyFromUrl = searchParams.get("key");

    if (keyFromUrl) {
      setEncryptionKey(keyFromUrl);

      // Store key for future visits
      localStorage.setItem(`note-key-${id}`, keyFromUrl);
    } else {
      // No key in URL? Check local storage [Case for notification click]
      const storedKey = localStorage.getItem(`note-key-${id}`);
      if (storedKey) {
        setEncryptionKey(storedKey);
        // Update URL with key without reloading the page
        setSearchParams({ key: storedKey });
      } else {
        // Key missing, show error
        setError(
          "Missing encryption key! Please use the original link provided by the sender."
        );
      }
    }
  }, [id, searchParams, setSearchParams]);

  // Step 2: Once encryptionKey is available, fetch the note
  useEffect(() => {
    if (encryptionKey) {
      const fetchNote = async () => {
        try {
          const response = await fetch(`${backendUrl}/api/notes/${id}`);
          if (!response.ok) throw new Error("Failed to fetch note");
          const data = await response.json();
          // Here you would decrypt the note using encryptionKey and data.iv
          // For this example, we assume data.message is already decrypted
          if (data.timeToDecrypt) {
            // Decrypt the message
            const decryptedMessage = CryptoJS.AES.decrypt(
              data.message,
              encryptionKey,
              { iv: data.iv }
            ).toString(CryptoJS.enc.Utf8);
            if (!decryptedMessage)
              throw new Error("Failed to decrypt the message.");

            setNote({
              sender: data.sender,
              receiver: data.receiver,
              message: decryptedMessage,
              revealDate: new Date(data.revealDate).toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour12: true,
              }),
            });
          } else {
            // Set note as is if timeToDecrypt is false
            setNote({
              sender: data.sender,
              receiver: data.receiver,
              message: data.message, // This Sweetnote is still hidden! 🤫
              revealDate: data.revealDate,
            });
            // setError("Failed to fetch the note.");
          }
        } catch (error) {
          console.error("Error fetching or decrypting the note:", error);

          setError("An error occurred. Please try again later.");
        }
      };

      fetchNote();
    }
  }, [encryptionKey, id, backendUrl]);

  // Once the note is loaded, register service worker and subscribe for push notifications.
  useEffect(() => {
    if (note) {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            return registration.pushManager
              .getSubscription()
              .then((subscription) => {
                if (subscription) return subscription;
                const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
                const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
                return registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: convertedKey,
                });
              });
          })
          .then((subscription) => {
            // Generate a random user id if not already stored
            let userId = localStorage.getItem("userId");
            if (!userId) {
              userId = uuidv4();
              localStorage.setItem("userId", userId);
            }

            // Send the subscription details to the backend along with noteId and revealDate
            fetch(`${backendUrl}/subscribe`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscription,
                userId,
                noteId: id,
                revealDate: note.revealDate,
              }),
            })
              .then((res) => res.json())
              .then((data) => console.log("Subscription saved:", data))
              .catch((err) => console.error("Error saving subscription:", err));
          })
          .catch((err) =>
            console.error("Service Worker registration failed:", err)
          );
      }
    }
  }, [note, backendUrl, id]);

  // Utility function to convert a base64 public key to a Uint8Array
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const copyToClipboard = () => {
    const encryptionKey = searchParams.get("key");

    const noteLink = `${baseURL}/notes/${id}?key=${encryptionKey}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(noteLink)
        .then(() => setCopyButtonText("Copied!"))
        .catch(() => setCopyButtonText("Failed to Copy"));
    } else {
      // setCopyButtonText("Failed to Copy");

      // Use the 'out of viewport hidden text area' trick
      const textArea = document.createElement("textarea");
      textArea.value = noteLink;

      // Move textarea out of the viewport so it's not visible
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";

      document.body.prepend(textArea);
      textArea.select();

      try {
        document.execCommand("copy");
        setCopyButtonText("Copied!");
        // .catch(() => setCopyButtonText("Failed to Copy"));
      } catch (error) {
        console.error(error);
      } finally {
        textArea.remove();
      }
    }
    setTimeout(() => setCopyButtonText("Copy Link"), 2000); // Reset after 2 seconds
  };

  const shareOnWhatsApp = () => {
    const encryptionKey = searchParams.get("key");

    if (note) {
      const noteLink = `${baseURL}/notes/${id}?key=${encryptionKey}`;
      const whatsappMessage = `🎁✨ *Psst! A Sweetnote from ${note.sender} awaits you, ${note.receiver}!* ✨🎁\n 🕰️ Unwrap the secret here: 👇\n ${noteLink}`;
      const whatsappURL = `https://wa.me/?text=${encodeURIComponent(
        whatsappMessage
      )}`;
      window.open(whatsappURL, "_blank");
    }
  };

  // Handler for saving the note as an image
  const handleSaveAsImage = () => {
    // Select the note-box and header elements from the DOM.
    const noteElement = document.querySelector(".note-box");
    const headerElement = document.querySelector(".header-container"); // ensure this class exists in your Header component

    if (!noteElement || !headerElement) {
      alert("Required elements for screenshot not found!");
      return;
    }

    // Create a container to hold both the header and the note content
    const screenshotContainer = document.createElement("div");
    screenshotContainer.style.backgroundColor = "#ffecd2"; // set background color
    screenshotContainer.style.padding = "20px"; // add padding
    screenshotContainer.style.paddingLeft = "60px";
    screenshotContainer.style.display = "inline-block";
    screenshotContainer.style.borderRadius = "8px";

    // Clone header and note elements
    const headerClone = headerElement.cloneNode(true);
    const noteClone = noteElement.cloneNode(true);

    // Remove share buttons from the note clone
    const shareButtons = noteClone.querySelector(".share-buttons");
    if (shareButtons) {
      shareButtons.remove();
    }
    // Optionally remove extra styling (like box-shadow) that might not look good in the screenshot
    noteClone.style.boxShadow = "none";
    noteClone.style.padding = "30px 40px"; // add padding
    headerClone.style.paddingRight = "30px"; // add padding

    // Append the clones to the container
    screenshotContainer.appendChild(headerClone);
    screenshotContainer.appendChild(noteClone);

    // Position the container off-screen so it doesn't affect the UI
    screenshotContainer.style.position = "absolute";
    screenshotContainer.style.top = "-9999px";
    screenshotContainer.style.alignItems = "center";
    screenshotContainer.style.justifyContent = "center";

    document.body.appendChild(screenshotContainer);

    // Use html2canvas to capture the container
    html2canvas(screenshotContainer, { backgroundColor: "#ffecd2" }).then(
      (canvas) => {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `sweetnote-${id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        document.body.removeChild(screenshotContainer);
      }
    );
  };

  return (
    <div className="note-box">
      {error ? (
        <p className="error-message">{error}</p>
      ) : note ? (
        <>
          <p>
            <strong>From:</strong> {note.sender}
          </p>
          <p>
            <strong>To:</strong> {note.receiver}
          </p>
          <p>
            <strong>Message:</strong> {note.message}
          </p>
          <p>
            <strong>Reveal Date: </strong>
            {new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }).format(new Date(note.revealDate))}{" "}
          </p>
          <div className="share-buttons">
            <button className="copy-button" onClick={copyToClipboard}>
              {copyButtonText}
            </button>
            <button className="whatsapp-button" onClick={shareOnWhatsApp}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="whatsapp-icon"
              />
              WhatsApp
            </button>
            <button className="image-button" onClick={handleSaveAsImage}>
              Save As Image
            </button>
          </div>
        </>
      ) : (
        <p>Loading note...</p>
      )}
    </div>
  );
}

export default ViewNote;
