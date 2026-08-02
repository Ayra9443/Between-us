// =========================================
// CREATE ACCOUNT
// =========================================

const form = document.getElementById("accountForm");

if (form) {

    const successMessage =
        document.getElementById("successMessage");

    form.addEventListener("submit", function(event) {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        if (
            name === "" ||
            email === "" ||
            password === ""
        ) {

            successMessage.textContent =
                "Please fill in all the fields.";

            return;
        }

        const existingAccount =
            localStorage.getItem("betweenUsAccount");

        if (existingAccount) {

            successMessage.textContent =
                "An account already exists on this browser.";

            return;
        }

        const account = {
            name: name,
            email: email,
            password: password
        };

        localStorage.setItem(
            "betweenUsAccount",
            JSON.stringify(account)
        );

        successMessage.textContent =
            "Account created successfully!";

        setTimeout(function() {

            window.location.href =
                "login.html";

        }, 1000);

    });

}


// =========================================
// LOGIN
// =========================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const loginMessage =
            document.getElementById("loginMessage");

        if (
            email === "" ||
            password === ""
        ) {

            loginMessage.textContent =
                "Please fill in all the fields.";

            return;
        }

        const savedAccount =
            localStorage.getItem("betweenUsAccount");

        if (!savedAccount) {

            loginMessage.textContent =
                "No account found. Please create an account first.";

            return;
        }

        const account =
            JSON.parse(savedAccount);

        if (
            email === account.email &&
            password === account.password
        ) {

            localStorage.setItem(
                "betweenUsLoggedIn",
                "true"
            );

            loginMessage.textContent =
                "Login successful!";

            setTimeout(function() {

                window.location.href =
                    "dashboard.html";

            }, 500);

        } else {

            loginMessage.textContent =
                "Incorrect email or password.";

        }

    });

}


// =========================================
// SAVED PEOPLE
// =========================================

let savedPeople = JSON.parse(
    localStorage.getItem("betweenUsPeople")
) || [];


// =========================================
// SAVED CONVERSATIONS
// =========================================

let conversations = JSON.parse(
    localStorage.getItem("betweenUsConversations")
) || {};


// =========================================
// MESSAGES
// =========================================

let selectedPerson = null;


// =========================================
// SAVE EVERYTHING
// =========================================

function savePeople() {

    localStorage.setItem(
        "betweenUsPeople",
        JSON.stringify(savedPeople)
    );

}


function saveConversations() {

    localStorage.setItem(
        "betweenUsConversations",
        JSON.stringify(conversations)
    );

}


// =========================================
// SELECT PERSON
// =========================================

function selectPerson(person) {

    selectedPerson = person;

    const heading =
        document.getElementById("currentChat");

    if (!heading) {
        return;
    }

    heading.textContent = person;

    // Remove active state from everyone

    document
        .querySelectorAll(".person")
        .forEach(function(button) {

            button.classList.remove("selected");

        });


    // Highlight selected person

    const selectedButton =
        document.querySelector(
            `.person[data-person="${CSS.escape(person)}"]`
        );

    if (selectedButton) {

        selectedButton.classList.add("selected");

    }


    renderMessages();

}


// =========================================
// FORMAT TIME
// =========================================

function formatTime(date) {

    return date.toLocaleTimeString([], {

        hour: "numeric",

        minute: "2-digit"

    });

}


// =========================================
// DAY LABEL
// =========================================

function getDayLabel(date) {

    const now = new Date();

    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const messageDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const difference =
        Math.round(
            (today - messageDay) /
            (1000 * 60 * 60 * 24)
        );


    if (difference === 0) {

        return "Today";

    }


    if (difference === 1) {

        return "Yesterday";

    }


    return date.toLocaleDateString([], {

        day: "numeric",

        month: "long",

        year: "numeric"

    });

}


// =========================================
// SAME DAY
// =========================================

function isSameDay(date1, date2) {

    return (

        date1.getFullYear() ===
        date2.getFullYear()

        &&

        date1.getMonth() ===
        date2.getMonth()

        &&

        date1.getDate() ===
        date2.getDate()

    );

}


// =========================================
// SAME MINUTE
// =========================================

function isSameMinute(date1, date2) {

    return (

        isSameDay(date1, date2)

        &&

        date1.getHours() ===
        date2.getHours()

        &&

        date1.getMinutes() ===
        date2.getMinutes()

    );

}


// =========================================
// DAY SEPARATOR
// =========================================

function createDaySeparator(date) {

    const separator =
        document.createElement("div");

    separator.className =
        "date-separator";

    separator.textContent =
        getDayLabel(date);

    return separator;

}


// =========================================
// TIME SEPARATOR
// =========================================

function createTimeSeparator(date) {

    const separator =
        document.createElement("div");

    separator.className =
        "time-separator";

    separator.textContent =
        formatTime(date);

    return separator;

}


// =========================================
// RENDER MESSAGES
// =========================================

function renderMessages() {

    const messagesArea =
        document.getElementById("messagesArea");

    if (
        !messagesArea ||
        !selectedPerson
    ) {

        return;

    }


    messagesArea.innerHTML = "";


    const messages =
        conversations[selectedPerson] || [];


    if (messages.length === 0) {

        messagesArea.innerHTML = `

            <p class="empty-chat">

                No messages with
                ${selectedPerson}
                yet.

            </p>

        `;

        return;

    }


    messages.forEach(function(message, index) {

        const previous =
            messages[index - 1];

        const currentDate =
            new Date(message.time);


        // NEW DAY

        if (

            !previous ||

            !isSameDay(
                new Date(previous.time),
                currentDate
            )

        ) {

            messagesArea.appendChild(
                createDaySeparator(currentDate)
            );

        }


        // DIFFERENT MINUTE

        else if (

            !isSameMinute(
                new Date(previous.time),
                currentDate
            )

        ) {

            messagesArea.appendChild(
                createTimeSeparator(currentDate)
            );

        }


        // MESSAGE WRAPPER

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "message-wrapper";


        // MESSAGE BUBBLE

        const bubble =
            document.createElement("div");

        bubble.className =
            "my-message";

        bubble.textContent =
            message.text;


        // EXACT TIME

        const exactTime =
            document.createElement("span");

        exactTime.className =
            "exact-message-time";

        exactTime.textContent =
            formatTime(currentDate);


        // DELETE BUTTON

        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "delete-message";

        deleteButton.textContent =
            "Delete";

        deleteButton.type =
            "button";


        // RIGHT CLICK TO SHOW DELETE

        bubble.addEventListener(
            "contextmenu",
            function(event) {

                event.preventDefault();

                // Hide any other visible delete buttons

                document
                    .querySelectorAll(".delete-message.visible")
                    .forEach(function(button) {

                        button.classList.remove("visible");

                    });


                deleteButton.classList.add(
                    "visible"
                );

            }
        );


        // DELETE MESSAGE

        deleteButton.addEventListener(
            "click",
            function() {

                conversations[selectedPerson]
                    .splice(index, 1);

                saveConversations();

                updatePersonPreview(
                    selectedPerson
                );

                renderMessages();

            }
        );


        wrapper.appendChild(bubble);

        wrapper.appendChild(exactTime);

        wrapper.appendChild(deleteButton);

        messagesArea.appendChild(wrapper);


        // SWIPE / HOLD TIME

        addSwipeBehavior(
            wrapper,
            bubble
        );

    });


    messagesArea.scrollTop =
        messagesArea.scrollHeight;

}


// =========================================
// SWIPE / HOLD FOR EXACT TIME
// =========================================

function addSwipeBehavior(
    wrapper,
    bubble
) {

    let startX = 0;

    let startY = 0;

    let holding = false;

    let holdTimer = null;


    bubble.addEventListener(
        "pointerdown",
        function(event) {

            startX =
                event.clientX;

            startY =
                event.clientY;

            holding = true;


            holdTimer =
                setTimeout(
                    function() {

                        if (holding) {

                            wrapper.classList.add(
                                "show-exact-time"
                            );

                        }

                    },
                    300
                );

        }
    );


    bubble.addEventListener(
        "pointermove",
        function(event) {

            if (!holding) {
                return;
            }


            const distanceX =
                event.clientX - startX;

            const distanceY =
                event.clientY - startY;


            if (

                distanceX < -35

                &&

                Math.abs(distanceX) >
                Math.abs(distanceY)

            ) {

                wrapper.classList.add(
                    "show-exact-time"
                );

            }

        }
    );


    function endGesture() {

        holding = false;

        clearTimeout(holdTimer);


        // Slide back automatically

        wrapper.classList.remove(
            "show-exact-time"
        );

    }


    bubble.addEventListener(
        "pointerup",
        endGesture
    );


    bubble.addEventListener(
        "pointercancel",
        endGesture
    );

}


// =========================================
// UPDATE PERSON PREVIEW
// =========================================

function updatePersonPreview(person) {

    const messages =
        conversations[person] || [];


    const preview =
        document.getElementById(
            "preview-" + person
        );

    const time =
        document.getElementById(
            "time-" + person
        );


    if (messages.length === 0) {

        if (preview) {

            preview.textContent =
                "No messages yet";

        }

        if (time) {

            time.textContent =
                "";

        }

        return;

    }


    const latest =
        messages[messages.length - 1];


    if (preview) {

        preview.textContent =
            latest.text;

    }


    if (time) {

        time.textContent =
            formatTime(
                new Date(latest.time)
            );

    }

}


// =========================================
// MOVE RECENT CHAT TO TOP
// =========================================

function movePersonToTop(person) {

    const peopleList =
        document.querySelector(
            ".people-list"
        );

    if (!peopleList) {
        return;
    }


    const button =
        peopleList.querySelector(
            `.person[data-person="${CSS.escape(person)}"]`
        );


    if (!button) {
        return;
    }


    const firstPerson =
        peopleList.querySelector(".person");


    if (
        firstPerson &&
        button !== firstPerson
    ) {

        peopleList.insertBefore(
            button,
            firstPerson
        );

    }

}


// =========================================
// SEND MESSAGE
// =========================================

const messageForm =
    document.querySelector(
        ".message-form"
    );


if (messageForm) {

    messageForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const input =
                document.getElementById(
                    "messageInput"
                );


            if (!input) {
                return;
            }


            const message =
                input.value.trim();


            if (message === "") {
                return;
            }


            if (!selectedPerson) {

                alert(
                    "Select someone to message first."
                );

                return;

            }


            const newMessage = {

                text: message,

                time: new Date().toISOString()

            };


            if (!conversations[selectedPerson]) {

                conversations[selectedPerson] = [];

            }


            conversations[selectedPerson]
                .push(newMessage);


            // SAVE MESSAGE

            saveConversations();


            // UPDATE PREVIEW

            updatePersonPreview(
                selectedPerson
            );


            // MOVE PERSON TO TOP

            movePersonToTop(
                selectedPerson
            );


            input.value = "";


            renderMessages();

        }
    );

}


// =========================================
// EMOJI PICKER
// =========================================

const emojiButton =
    document.getElementById(
        "emojiButton"
    );


const emojiPicker =
    document.getElementById(
        "emojiPicker"
    );


const messageInput =
    document.getElementById(
        "messageInput"
    );


if (
    emojiButton &&
    emojiPicker &&
    messageInput
) {

    emojiButton.addEventListener(
        "click",
        function() {

            emojiPicker.classList.toggle(
                "open"
            );

        }
    );


    const emojiButtons =
        emojiPicker.querySelectorAll(
            "button"
        );


    emojiButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    messageInput.value +=
                        button.textContent;

                    messageInput.focus();

                }
            );

        }
    );

}


// =========================================
// ADD PERSON
// =========================================

const addPersonButton =
    document.getElementById(
        "addPersonButton"
    );


if (addPersonButton) {

    addPersonButton.addEventListener(
        "click",
        function() {

            const personName =
                prompt("Enter their name:");


            if (!personName) {
                return;
            }


            const name =
                personName.trim();


            if (name === "") {
                return;
            }


            const peopleList =
                document.querySelector(
                    ".people-list"
                );


            if (!peopleList) {
                return;
            }


            // CHECK DUPLICATES

            const existingPeople =
                peopleList.querySelectorAll(
                    ".person"
                );


            for (
                const person
                of existingPeople
            ) {

                if (
                    person.dataset.person
                        .toLowerCase() ===
                    name.toLowerCase()
                ) {

                    alert(
                        "This person is already in your list."
                    );

                    return;

                }

            }


            // CREATE BUTTON

            const personButton =
                document.createElement(
                    "button"
                );


            personButton.type =
                "button";

            personButton.className =
                "person";

            personButton.dataset.person =
                name;


            personButton.innerHTML = `

                <strong>${name}</strong>

                <span
                    class="preview"
                    id="preview-${name}"
                >
                    No messages yet
                </span>

                <span
                    class="preview-time"
                    id="time-${name}"
                ></span>

            `;


            personButton.addEventListener(
                "click",
                function() {

                    selectPerson(name);

                }
            );


            // ADD TO LIST

            peopleList.appendChild(
                personButton
            );


            // CREATE CONVERSATION

            if (!conversations[name]) {

                conversations[name] = [];

            }


            // SAVE PERSON

            if (
                !savedPeople.some(
                    function(person) {

                        return person.toLowerCase() ===
                            name.toLowerCase();

                    }
                )
            ) {

                savedPeople.push(name);

            }


            savePeople();

            saveConversations();


            alert(
                name + " has been added!"
            );

        }
    );

}


// =========================================
// LOAD SAVED PEOPLE
// =========================================

function loadSavedPeople() {

    const peopleList =
        document.querySelector(
            ".people-list"
        );


    if (!peopleList) {
        return;
    }


    savedPeople.forEach(
        function(name) {

            // Don't create duplicates

            if (
                peopleList.querySelector(
                    `.person[data-person="${CSS.escape(name)}"]`
                )
            ) {

                return;

            }


            const personButton =
                document.createElement(
                    "button"
                );


            personButton.type =
                "button";

            personButton.className =
                "person";

            personButton.dataset.person =
                name;


            personButton.innerHTML = `

                <strong>${name}</strong>

                <span
                    class="preview"
                    id="preview-${name}"
                >
                    No messages yet
                </span>

                <span
                    class="preview-time"
                    id="time-${name}"
                ></span>

            `;


            personButton.addEventListener(
                "click",
                function() {

                    selectPerson(name);

                }
            );


            peopleList.appendChild(
                personButton
            );


            if (!conversations[name]) {

                conversations[name] = [];

            }


            updatePersonPreview(name);

        }
    );


    // Update previews for default people

    [
        "Mom",
        "Sister",
        "Best friend"
    ].forEach(function(name) {

        updatePersonPreview(name);

    });

}


// =========================================
// SORT PEOPLE BY MOST RECENT MESSAGE
// =========================================

function sortPeopleByRecent() {

    const peopleList =
        document.querySelector(
            ".people-list"
        );


    if (!peopleList) {
        return;
    }


    const buttons =
        Array.from(
            peopleList.querySelectorAll(
                ".person"
            )
        );


    buttons.sort(function(a, b) {

        const personA =
            a.dataset.person;

        const personB =
            b.dataset.person;


        const messagesA =
            conversations[personA] || [];


        const messagesB =
            conversations[personB] || [];


        const latestA =
            messagesA.length
                ? new Date(
                    messagesA[messagesA.length - 1].time
                ).getTime()
                : 0;


        const latestB =
            messagesB.length
                ? new Date(
                    messagesB[messagesB.length - 1].time
                ).getTime()
                : 0;


        return latestB - latestA;

    });


    buttons.forEach(function(button) {

        peopleList.appendChild(
            button
        );

    });

}


// =========================================
// LOG OUT
// =========================================

const logoutButton =
    document.querySelector(
        ".logout"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();


            localStorage.removeItem(
                "betweenUsLoggedIn"
            );


            window.location.href =
                "index.html";

        }
    );

}


// =========================================
// LOAD EVERYTHING WHEN PAGE OPENS
// =========================================

loadSavedPeople();

sortPeopleByRecent();

// =========================================
// NOTES
// =========================================

let savedNotes = JSON.parse(
    localStorage.getItem("betweenUsNotes")
) || [];

let editingNoteIndex = null;


// Elements

const newNoteButton =
    document.getElementById("newNoteButton");

const noteEditor =
    document.getElementById("noteEditor");

const noteTitle =
    document.getElementById("noteTitle");

const noteContent =
    document.getElementById("noteContent");

const saveNoteButton =
    document.getElementById("saveNoteButton");

const cancelNoteButton =
    document.getElementById("cancelNoteButton");

const notesContainer =
    document.getElementById("notesContainer");

const noNotes =
    document.getElementById("noNotes");


// =========================================
// OPEN NEW NOTE
// =========================================

if (newNoteButton) {

    newNoteButton.addEventListener(
        "click",
        function() {

            editingNoteIndex = null;

            noteTitle.value = "";

            noteContent.value = "";

            noteEditor.classList.add(
                "open"
            );

            noteTitle.focus();

        }
    );

}


// =========================================
// CANCEL
// =========================================

if (cancelNoteButton) {

    cancelNoteButton.addEventListener(
        "click",
        function() {

            editingNoteIndex = null;

            noteTitle.value = "";

            noteContent.value = "";

            noteEditor.classList.remove(
                "open"
            );

        }
    );

}


// =========================================
// SAVE NOTE
// =========================================

if (saveNoteButton) {

    saveNoteButton.addEventListener(
        "click",
        function() {

            const title =
                noteTitle.value.trim();

            const content =
                noteContent.value.trim();


            if (
                title === "" &&
                content === ""
            ) {

                alert(
                    "Please write something first."
                );

                return;

            }


            const note = {

                title:
                    title || "Untitled Note",

                content:
                    content,

                updatedAt:
                    new Date().toISOString()

            };


            // EDIT EXISTING NOTE

            if (
                editingNoteIndex !== null
            ) {

                savedNotes[
                    editingNoteIndex
                ] = note;

            }


            // CREATE NEW NOTE

            else {

                savedNotes.unshift(
                    note
                );

            }


            // SAVE

            localStorage.setItem(
                "betweenUsNotes",
                JSON.stringify(savedNotes)
            );


            // RESET

            editingNoteIndex = null;

            noteTitle.value = "";

            noteContent.value = "";

            noteEditor.classList.remove(
                "open"
            );


            renderNotes();

        }
    );

}


// =========================================
// RENDER NOTES
// =========================================

function renderNotes() {

    if (!notesContainer) {
        return;
    }


    notesContainer.innerHTML = "";


    if (savedNotes.length === 0) {

        notesContainer.appendChild(
            noNotes
        );

        noNotes.style.display =
            "block";

        return;

    }


    noNotes.style.display =
        "none";


    savedNotes.forEach(
        function(note, index) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "note-card";


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                note.title;


            const content =
                document.createElement(
                    "p"
                );

            content.textContent =
                note.content;


            const date =
                document.createElement(
                    "small"
                );

            date.textContent =
                "Edited " +
                new Date(
                    note.updatedAt
                ).toLocaleString();


            const buttons =
                document.createElement(
                    "div"
                );

            buttons.className =
                "note-buttons";


            const editButton =
                document.createElement(
                    "button"
                );

            editButton.textContent =
                "Edit";


            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.textContent =
                "Delete";


            // EDIT

            editButton.addEventListener(
                "click",
                function() {

                    editingNoteIndex =
                        index;

                    noteTitle.value =
                        note.title;

                    noteContent.value =
                        note.content;

                    noteEditor.classList.add(
                        "open"
                    );

                    noteTitle.focus();

                }
            );


            // DELETE

            deleteButton.addEventListener(
                "click",
                function() {

                    const confirmed =
                        confirm(
                            "Delete this note?"
                        );


                    if (!confirmed) {
                        return;
                    }


                    savedNotes.splice(
                        index,
                        1
                    );


                    localStorage.setItem(
                        "betweenUsNotes",
                        JSON.stringify(
                            savedNotes
                        )
                    );


                    renderNotes();

                }
            );


            buttons.appendChild(
                editButton
            );

            buttons.appendChild(
                deleteButton
            );


            card.appendChild(
                title
            );

            card.appendChild(
                content
            );

            card.appendChild(
                date
            );

            card.appendChild(
                buttons
            );


            notesContainer.appendChild(
                card
            );

        }
    );

}


// =========================================
// LOAD NOTES
// =========================================

renderNotes();