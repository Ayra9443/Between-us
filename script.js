// =========================================
// CREATE ACCOUNT
// =========================================

const form =
    document.getElementById("accountForm");

if (form) {

    const successMessage =
        document.getElementById("successMessage");

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;


            if (!name || !email || !password) {

                successMessage.textContent =
                    "Please fill in all the fields.";

                return;
            }


            successMessage.textContent =
                "Creating account...";


            const {
                data,
                error
            } =
                await supabaseClient.auth.signUp({

                    email: email,

                    password: password,

                    options: {
                        data: {
                            username: name,
                            display_name: name
                        }
                    }

                });


            if (error) {

                successMessage.textContent =
                    error.message;

                return;
            }


            if (data.user) {

                successMessage.textContent =
                    "Account created successfully!";


                setTimeout(
                    function () {

                        window.location.href =
                            "login.html";

                    },
                    1000
                );

            }

        }
    );

}

// =========================================
// LOGIN
// =========================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;

            const loginMessage =
                document.getElementById("loginMessage");


            if (!email || !password) {

                loginMessage.textContent =
                    "Please fill in all the fields.";

                return;
            }


            loginMessage.textContent =
                "Signing in...";


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.signInWithPassword({

                        email: email,

                        password: password

                    });


                if (error) {

                    console.error(
                        "Login error:",
                        error
                    );

                    loginMessage.textContent =
                        error.message;

                    return;
                }


                console.log(
                    "Login successful:",
                    data
                );

                if (data.user) {

    localStorage.setItem(
        "betweenUsCurrentAccount",
        data.user.id
    );

}


                loginMessage.textContent =
                    "Login successful!";


                setTimeout(
                    function () {

                        window.location.href =
                            "dashboard.html";

                    },
                    500
                );

            } catch (error) {

                console.error(
                    "Unexpected login error:",
                    error
                );

                loginMessage.textContent =
                    "Something went wrong while logging in.";

            }

        }
    );

}



// =========================================
// LOG OUT
// =========================================

const logoutButton =
    document.querySelector(".logout");

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            try {

                await supabaseClient.auth.signOut();

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }
            localStorage.removeItem(
    "betweenUsCurrentAccount"
);

            window.location.href = "index.html";

        }
    );

}

// =========================================
// SAVED PEOPLE
// =========================================

// Each account gets its own localStorage keys.
const currentAccountId =
    localStorage.getItem("betweenUsCurrentAccount") || "guest";

const peopleStorageKey =
    "betweenUsPeople_" + currentAccountId;

const personIdsStorageKey =
    "betweenUsPersonIds_" + currentAccountId;

const conversationsStorageKey =
    "betweenUsConversations_" + currentAccountId;


let savedPeople = JSON.parse(
    localStorage.getItem(peopleStorageKey)
) || [];

let savedPersonIds = JSON.parse(
    localStorage.getItem(personIdsStorageKey)
) || {};


function savePersonIds() {
    localStorage.setItem(
        personIdsStorageKey,
        JSON.stringify(savedPersonIds)
    );
}


// =========================================
// SAVED CONVERSATIONS
// =========================================

let conversations = JSON.parse(
    localStorage.getItem(conversationsStorageKey)
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
        peopleStorageKey,
        JSON.stringify(savedPeople)
    );

}


function saveConversations() {

    localStorage.setItem(
        conversationsStorageKey,
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

    if (!selectedPerson) return;

    const messagesArea =
        document.getElementById("messagesArea");

    if (!messagesArea) return;

    const messages =
        conversations[selectedPerson] || [];

    messagesArea.innerHTML = "";

    if (messages.length === 0) {

        messagesArea.innerHTML = `
            <p class="empty-chat">
                No messages with ${selectedPerson} yet.
            </p>
        `;

        return;
    }

    messages.forEach(function(message, index) {

        const previous =
            messages[index - 1];

        const currentDate =
            new Date(message.time);


        // ==============================
        // DAY SEPARATOR
        // ==============================

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

        // ==============================
        // TIME SEPARATOR
        // ==============================

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


        // ==============================
        // MESSAGE WRAPPER
        // ==============================

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "message-wrapper";


        // ==============================
        // MESSAGE BUBBLE
        // ==============================

        const bubble =
            document.createElement("div");

        bubble.className =
            "my-message";

        bubble.textContent =
            message.text;


        // ==============================
        // EXACT TIME
        // ==============================

        const exactTime =
            document.createElement("span");

        exactTime.className =
            "exact-message-time";

        exactTime.textContent =
            formatTime(currentDate);


        // ==============================
        // DELETE BUTTON
        // ==============================

        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "delete-message";

        deleteButton.textContent =
            "Delete";

        deleteButton.type =
            "button";


        // ==============================
        // RIGHT CLICK → DELETE
        // ==============================

        bubble.addEventListener(
            "contextmenu",
            function(event) {

                event.preventDefault();

                document
                    .querySelectorAll(
                        ".delete-message.visible"
                    )
                    .forEach(function(button) {

                        button.classList.remove(
                            "visible"
                        );

                    });

                deleteButton.classList.add(
                    "visible"
                );

            }
        );


        // ==============================
        // DELETE MESSAGE
        // ==============================

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


        // ==============================
        // PUT EVERYTHING TOGETHER
        // ==============================

        wrapper.appendChild(
            bubble
        );

        wrapper.appendChild(
            exactTime
        );

        wrapper.appendChild(
            deleteButton
        );

        messagesArea.appendChild(
            wrapper
        );


        // ==============================
        // HOLD / SWIPE FOR EXACT TIME
        // ==============================

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
    document.querySelector(".message-form");

if (messageForm) {

    messageForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const messageInput =
                document.getElementById(
                    "messageInput"
                );

            if (!messageInput) {
                return;
            }

            const text =
                messageInput.value.trim();

            if (!text) {
                return;
            }

            if (!selectedPerson) {
                alert(
                    "Please select someone first."
                );
                return;
            }

            // Create conversation if it doesn't exist
            if (!conversations[selectedPerson]) {
                conversations[selectedPerson] = [];
            }

            // Add message locally
            conversations[selectedPerson].push({

                text: text,

                sender: "me",

                time:
                    new Date().toISOString()

            });

            // Save to this account's localStorage
            saveConversations();

            // Clear input
            messageInput.value = "";

            // Update chat
            updatePersonPreview(
                selectedPerson
            );

            sortPeopleByRecent();

            renderMessages();

            messageInput.focus();

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
    document.getElementById("addPersonButton");

if (addPersonButton) {

    addPersonButton.addEventListener(
        "click",
        async function () {

            const usernameInput =
                prompt(
                    "Enter their Between Us username:"
                );

            if (!usernameInput) {
                return;
            }

            const username =
                usernameInput.trim();

            if (username === "") {
                return;
            }


            // CHECK IF ALREADY ADDED

            const alreadyAdded =
                savedPeople.some(
                    function (person) {

                        return (
                            person.toLowerCase() ===
                            username.toLowerCase()
                        );

                    }
                );

            if (alreadyAdded) {

                alert(
                    "This person is already in your list."
                );

                return;
            }


            // FIND USER IN SUPABASE

            const {
                data: profile,
                error: profileError
            } =
                await supabaseClient
                    .from("profiles")
                    .select(
                        "id, username, display_name"
                    )
                    .eq("username", username)
                    .maybeSingle();


            if (profileError) {

                alert(
                    "Could not find that account: " +
                    profileError.message
                );

                return;
            }


            if (!profile) {

                alert(
                    "No Between Us account was found with that username."
                );

                return;
            }


            // GET CURRENT USER

            const {
                data: {
                    user
                }
            } =
                await supabaseClient.auth.getUser();


            if (!user) {

                alert(
                    "Please log in first."
                );

                return;
            }


            // DON'T ADD YOURSELF

            if (profile.id === user.id) {

                alert(
                    "You can't add yourself."
                );

                return;
            }


            // SAVE PERSON

            const personName =
                profile.username;


            savedPeople.push(
                personName
            );


            // SAVE THEIR REAL SUPABASE ID

            savedPersonIds[personName] =
                profile.id;


            // CREATE LOCAL CONVERSATION

            if (!conversations[personName]) {

                conversations[personName] = [];

            }


            savePeople();

            savePersonIds();

            saveConversations();


            // CREATE PERSON BUTTON

            const peopleList =
                document.querySelector(
                    ".people-list"
                );

            if (!peopleList) {
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
                personName;


            personButton.innerHTML = `

                <strong>${personName}</strong>

                <span
                    class="preview"
                    id="preview-${personName}"
                >
                    No messages yet
                </span>

                <span
                    class="preview-time"
                    id="time-${personName}"
                ></span>

            `;


            personButton.addEventListener(
                "click",
                function () {

                    selectPerson(
                        personName
                    );

                }
            );


            peopleList.appendChild(
                personButton
            );


            alert(
                personName +
                " has been added!"
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
// LOAD EVERYTHING WHEN PAGE OPENS
// =========================================

loadSavedPeople();

sortPeopleByRecent();
// =========================================
// NOTES
// =========================================

let currentAccount = null;

async function loadCurrentUser(){

const { data } =
await supabaseClient.auth.getUser();

currentAccount =
data.user;

}

loadCurrentUser();

// Give each account its own notes storage key

const notesStorageKey =
    currentAccount
        ? "betweenUsNotes_" + currentAccount.email
        : "betweenUsNotes_guest";


let savedNotes = JSON.parse(
    localStorage.getItem(notesStorageKey)
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
// SAVE NOTES
// =========================================

function saveNotes() {

    localStorage.setItem(
        notesStorageKey,
        JSON.stringify(savedNotes)
    );

}


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


            // SAVE TO THIS ACCOUNT ONLY

            saveNotes();


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


                    saveNotes();

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