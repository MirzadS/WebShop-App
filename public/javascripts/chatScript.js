const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const person = document.getElementById("person");
// const userList = document.getElementById("users");

const socket = io.connect("ws://localhost:3000");

/* https://css-tricks.com/snippets/javascript/get-url-and-url-parts-in-javascript/ */
var pathArray = window.location.pathname.split("/");
const chat_room = pathArray[pathArray.length - 1].trim();

const ULOGA = pathArray[pathArray.length - 3].trim();
console.log(ULOGA);

//JOIN CHATROOM
socket.emit("joinRoom", { chat_room, ULOGA });

socket.on("displayInfo", ({ room, previous_messages, person_fn, ulogaServer }) => {
  if (ulogaServer === ULOGA) {
    if (previous_messages.length !== 0) {
      previous_messages.forEach((el) => {
        const message = {
          full_name: el.full_name,
          text: el.message,
          time: el.created_at,
        };
        outputMessage(message);
      });
    }

    person.innerHTML = person_fn;
    roomName.innerHTML = room;
  }
});

socket.on("message", (message) => {
  outputMessage(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;

  socket.emit("chatMessage", { msg, chat_room, ULOGA });

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.full_name} <span>${message.time}</span></p>
  <p class="text">
      ${message.text}
  </p>`;

  document.querySelector(".chat-messages").appendChild(div);
}
