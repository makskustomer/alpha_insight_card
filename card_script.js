// ============================
// 1. Global Variables
// ============================
let sideKickAppId = "sidekick_kustomer_570fad9d9001bc1000163b28.app.sidekick"; // default to production
let arrayPosition = 1; // default to production
let settingsUrl = "sidekick_kustomer_570fad9d9001bc1000163b28";
if (window.location.href.includes("kustomer-sandbox")) {
    // Adjust for sandbox
    sideKickAppId = "sidekick_60529db9b793421ac4e421ff.app";
    arrayPosition = 2;
    settingsUrl = "sidekick_60529db9b793421ac4e421ff";
}

const actionsContainer = document.getElementById("actionsContainer");
const editButton = document.getElementById("actionsEditButton");
const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".content");
var conversationId = null;
var aiThreadStr = null;
var currentUserTeamIdsArr = null;
var currentUserName = null;
var currentUserId = null;
let isEditing = false;
let dragSrcEl = null;
var companyId = null;
var currentEscalationCount = 0;
var companyArr = 0;
var companyName = null;
var companyRenewal = null;
var companyHealth = null;
var orgNameListId = null;

var companySeats = 0;
var companyLicense = null;
var companySegment = null;
var companyAccountType = null;
var customerId = null;
var chiliPiperUsername = null;
var customerFirstName = null;
var customerLastName = null;
var customerEmail = null;

var companyImpersonationUserId = null;
var companyData = null;

const headers = new Headers();
headers.append("Content-Type", "application/json");
headers.append(
    "Authorization",
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwOTNkN2Y2OWVhMGMyMDA4ZWYyMjE0MyIsInVzZXIiOiI2MDkzZDdmMjU0OWIzZDAwMWEwMGE5ZmMiLCJvcmciOiI1NzBmYWQ5ZDkwMDFiYzEwMDAxNjNiMjgiLCJvcmdOYW1lIjoia3VzdG9tZXIiLCJ1c2VyVHlwZSI6Im1hY2hpbmUiLCJwb2QiOiJwcm9kMSIsInJvbGVzIjpbIm9yZy5ob29rcyJdLCJhdWQiOiJ1cm46Y29uc3VtZXIiLCJpc3MiOiJ1cm46YXBpIiwic3ViIjoiNjA5M2Q3ZjI1NDliM2QwMDFhMDBhOWZjIn0.HuD_V8z2ZAflqYPmqCPkUK9hTP087XE_0LkLO4r75TA"
); //Key with org.hooks

// ============================
// 2. Utility Functions
// ============================

// Function to enable/disable drag-and-drop
function toggleDragAndDrop(enable) {
    const items = document.querySelectorAll(".action-item");
    items.forEach((item) => {
        item.draggable = enable;
        if (enable) {
            item.addEventListener("dragstart", handleDragStart);
            item.addEventListener("dragover", handleDragOver);
            item.addEventListener("dragenter", handleDragEnter);
            item.addEventListener("dragleave", handleDragLeave);
            item.addEventListener("dragend", handleDragEnd);
            item.addEventListener("drop", handleDrop);
        } else {
            item.removeEventListener("dragstart", handleDragStart);
            item.removeEventListener("dragover", handleDragOver);
            item.removeEventListener("dragenter", handleDragEnter);
            item.removeEventListener("dragleave", handleDragLeave);
            item.removeEventListener("dragend", handleDragEnd);
            item.removeEventListener("drop", handleDrop);
            //save here
        }
    });

    const actionIds = Array.from(items)
        .map((item) => item.id)
        .join(",");
    if (!enable) {
        Kustomer.request(
            {
                url: `/v1/users/${currentUserId}`,
                method: "put",
                body: {
                    custom: {
                        actionsOrderStr: `${actionIds}`,
                    },
                },
            },
            function (err, teamData) {
                if (err || !teamData) {
                    console.error(err);
                    return;
                }
                const params = {
                    type: "success",
                    message: "Actions order saved.", // A friendly message to your users as feedback of something that happened in your app
                };
                Kustomer.handleTriggerToast(params);
            }
        );
    }
}

// Function to reorder elements by ID
function reorderElementsById(containerId, actionsOrderArr) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Container not found");
        return;
    }

    const fragment = document.createDocumentFragment();

    setTimeout(() => {
        actionsOrderArr.forEach((action) => {
            if (action == "show_stakeholders") {
                //do nothing
            } else {
                const element = document.getElementById(action);
                if (element) {
                    fragment.appendChild(element);
                } else {
                    console.warn(`Element "${action}" not found`);
                }
            }
        });

        container.appendChild(fragment);
    }, 500);
}
// Function to load company metrics data on context change
function loadMetrics(companyData) {
    // Helper function to format date strings
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr; // Return original value if not a valid date
        const options = { year: "numeric", month: "short", day: "numeric" };
        return date.toLocaleDateString("en-US", options);
    }

    // Helper function to format numbers as US dollars without cents
    function formatToUSD(number) {
        return `$${number.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    }

    // Helper function to format numbers with commas
    function formatWithCommas(number) {
        return number.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }

    function computeRenewal(renewalAt) {
        // Parse the renewal date
        const companyRenewal = new Date(renewalAt);

        // Get the current date
        const currentDate = new Date();

        // Calculate the difference in milliseconds
        const differenceInMs = companyRenewal - currentDate;
        const checkDate = new Date("2015-01-01");

        if (companyRenewal < checkDate) {
            return `Renewal is in the past`;
        }

        // Convert the difference to days
        const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24); // No floor to retain decimals

        // Convert to months and years with decimals
        if (differenceInDays < 30) {
            return `In ${differenceInDays.toFixed(1)} day${differenceInDays === 1 ? "" : "s"
                } away`;
        } else if (differenceInDays < 365) {
            const months = differenceInDays / 30;
            return `In ${months.toFixed(1)} month${months === 1 ? "" : "s"}`;
        } else {
            const years = differenceInDays / 365;
            return `In ${years.toFixed(1)} year${years === 1 ? "" : "s"}`;
        }
    }

    function computeStart(originalSubscriptionStartAt) {
        // Parse the subscription start date
        const subscriptionStartDate = new Date(originalSubscriptionStartAt);
        const checkDate = new Date("2015-01-01");

        if (subscriptionStartDate < checkDate) {
            return `-`;
        }
        // Get the current date
        const currentDate = new Date();

        // Calculate the difference in milliseconds
        const differenceInMs = currentDate - subscriptionStartDate;

        // Convert the difference to days
        const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
        if (differenceInDays < 0) {
            return `Renewal is in the past`;
        }
        // Determine the duration and construct the message
        if (differenceInDays < 7) {
            return `${differenceInDays} day${differenceInDays === 1 ? "" : "s"}.`;
        } else if (differenceInDays < 30) {
            const weeks = Math.floor(differenceInDays / 7);
            return `${weeks} week${weeks === 1 ? "" : "s"}`;
        } else if (differenceInDays < 365) {
            const months = Math.floor(differenceInDays / 30);
            return `${months} month${months === 1 ? "" : "s"}`;
        } else {
            const years = Math.floor(differenceInDays / 365);
            return `${years} year${years === 1 ? "" : "s"}`;
        }
    }




    const keyNames = [
        "accountHealthStr",
        "accountOwnerStr",
        "accountTypeStr",
        "aeUserId",
        "arrNum",
        "childOrgsStr",
        "cityNameStr",
        "contractExpirationStr",
        "contractStartStr",
        "csOwnerId",
        "csSegmentEmployeeCountStr",
        "csmUserId",
        "dataStreamStr",
        "employeesNum",
        "hasKiqBool",
        "hipaaBool",
        "imUserId",
        "impersonationUserId",
        "implementationManagerStr",
        "implementationOwnerStr",
        "implementationStartAt",
        "implementationStatusStr",
        "implementationTypeStr",
        "licenseTypeStr",
        "liveDateStr",
        "notesStr",
        "orgIDStr",
        "originalSubscriptionStartAt",
        "podStr",
        "premiereSupportEndDateAt",
        "premiereSupportStartDateAt",
        "rankingStr",
        "renewalAt",
        "revenueNum",
        "salesforceIdStr",
        "setupGuideCompleteNum",
        "tamUserId",
        "technicalAccountManagerId",
        "testNum",
        "timUserId",
        "totalSeatsNum",
        "tseUserId",
        "websiteStr",
        "weeksInJourneyNum",
        "customerTierStr",
        "emailDomainStr",
        "hasAgentAssistBool",
        "hasCustomerAssistBool",
        "hasKinesisBool",
        "hasSnowflakeBool",
        "productChargesStr",
        "projectIdStr",
        "projectStatusStr"
    ];


    // Loop through every key in the companyData object
    keyNames.forEach((key) => {
        // Find the span element with the id equal to the key
        const spanElement = document.getElementById(key);
        // If a span is found
        if (spanElement) {
            let value = companyData[key] != null ? companyData[key] : "--";
            // Format based on key and type
            if (key === "arrNum" && typeof value === "number") {
                value = formatToUSD(value);
            } else if (
                key.endsWith("Num") &&
                key !== "arrNum" &&
                typeof value === "number"
            ) {
                value = formatWithCommas(value);
            } else if (key == "renewalAt") {
                value = computeRenewal(value);
            } else if (key == "originalSubscriptionStartAt") {
                value = computeStart(value);
            } else if (
                typeof value === "string" &&
                value.match(/^\d{4}-\d{2}-\d{2}T?\d*:?(\d*:?)*Z?$/)
            ) {
                value = formatDate(value);
            }
            else if (key == "projectStatusStr") {
                console.log(value);
                if (value == "In progress") {
                    const impElement = document.getElementById("implementationStatus");

                    impElement.classList.add("show");
                } else {
                    const impElement = document.getElementById("implementationStatus")
                    impElement.classList.remove("show");
                }

            }



            else if (key === "accountHealthStr") {
                let element = document.getElementById("accountHealthStr");
                element.dataset.color = value.toLowerCase();
            }
            // Update the text inside the span
            spanElement.textContent = value;
        } else {
            let value = companyData[key] != null ? companyData[key] : "--";

            if (key === "hasSnowflakeBool") {
                if (value == true) {
                    document.getElementById("snowflake").classList.add("enabled");
                } else {
                    document.getElementById("snowflake").classList.remove("enabled");
                }
            } else if (key === "hasKinesisBool") {
                if (value == true) {
                    document.getElementById("kinesis").classList.add("enabled");
                } else {
                    document.getElementById("kinesis").classList.remove("enabled");
                }
            } else if (key === "hasAgentAssistBool") {
                if (value == true) {
                    document.getElementById("agentAssist").classList.add("enabled");
                } else {
                    document.getElementById("agentAssist").classList.remove("enabled");
                }
            }
        }
    });
}

// ============================
// 3. Drag-and-Drop Handlers
// ============================
function handleDragStart(e) {
    this.style.opacity = "0.4";
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = "move";
}

function handleDragEnd() {
    this.style.opacity = "1";
    document.querySelectorAll(".action-item").forEach((item) => {
        item.classList.remove("over");
    });
}

function handleDragOver(e) {
    e.preventDefault();
    return false;
}

function handleDragEnter(e) {
    const actionItem = e.target.closest(".action-item");
    if (actionItem) {
        actionItem.classList.add("over");
    }
}

function handleDragLeave(e) {
    const box = e.target.closest(".action-item");
    if (box && !box.contains(e.relatedTarget)) {
        box.classList.remove("over");
    }
}

function handleDrop(e) {
    e.preventDefault();
    const dropTarget = e.target.closest(".action-item");

    if (dragSrcEl && dragSrcEl !== dropTarget) {
        const allItems = Array.from(
            actionsContainer.querySelectorAll(".action-item")
        );

        const dropIndex = allItems.indexOf(dropTarget);
        const dragIndex = allItems.indexOf(dragSrcEl);

        allItems.splice(dragIndex, 1);
        allItems.splice(dropIndex, 0, dragSrcEl);

        actionsContainer.innerHTML = "";
        allItems.forEach((item) => actionsContainer.appendChild(item));
    }
}

// ============================
// 3. SideKick Functions
// ============================
function initializeSidekick() {
    const actionItems = document.querySelectorAll(".action-item");
    const quckActionItems = document.querySelectorAll(".quick-action-item")[0];
    quckActionItems.addEventListener("click", function (event) {
        const quickActionItem = event.target.closest(".quick-action-item");
        if (quickActionItem) {
            const parentId = quickActionItem.id; // Get the ID of the parent element
            handleAction(parentId);
        }
    });
    for (const item of actionItems) {
        // Check if the event listener is already added
        if (!item.dataset.listenerAdded) {
            item.addEventListener("click", function (event) {
                const actionItem = event.target.closest(".action-item");
                if (actionItem) {
                    const parentId = actionItem.id; // Get the ID of the parent element
                    handleAction(parentId);
                }
            });
            item.dataset.listenerAdded = true; // Mark the listener as added
        }
    }

    const eventMappings = [
        { selector: "menuTrigger", event: "click", handler: toggleMenu },
        { selector: "searchQuery", event: "keypress", handler: handleSearchInput },
        {
            selector: "clearThread",
            event: "click",
            handler: clearThreadShowConfirm,
        },
        { selector: "autoAsk", event: "click", handler: autoAsk },
        { selector: "report", event: "click", handler: report },
    ];

    // Use a similar guard mechanism for individual elements
    const clearYes = document.getElementById("clearYes");
    if (clearYes && !clearYes.dataset.listenerAdded) {
        clearYes.addEventListener("click", function () {
            handleClearConfirmation(true);
        });
        clearYes.dataset.listenerAdded = true;
    }

    const clearNo = document.getElementById("clearNo");
    if (clearNo && !clearNo.dataset.listenerAdded) {
        clearNo.addEventListener("click", function () {
            handleClearConfirmation(false);
        });
        clearNo.dataset.listenerAdded = true;
    }

    eventMappings.forEach(({ selector, event, handler }) => {
        const element = document.querySelector(`#${selector}`);

        if (element && !element.dataset.listenerAdded) {
            element.addEventListener(event, handler);
            element.dataset.listenerAdded = true; // Mark the listener as added
        }
    });
}

function toggleMenu() {
    // Get the menu element from the DOM
    const menu = document.getElementById("menu");

    // Get the up chevron element (used to close the menu)
    const chevronUp = document.getElementById("chevronUp");

    // Get the down chevron element (used to open the menu)
    const chevronDown = document.getElementById("chevronDown");

    // Toggle the class that hides the "up" chevron when the menu is collapsed
    chevronUp.classList.toggle("chevron-up-disappear");

    // Toggle the class that shows the "down" chevron when the menu is collapsed
    chevronDown.classList.toggle("menu-close-appear");

    // Toggle the class that expands or collapses the menu
    menu.classList.toggle("menu-expanded");
}

function handleSearchInput(event) {
    // Check if 'Enter' or 'Ctrl + Enter' is pressed and the input is not empty
    if (
        (event.key === "Enter" || (event.ctrlKey && event.key === "Enter")) &&
        event.target.value.trim() !== ""
    ) {
        try {
            const userMessage = event.target.value.trim(); // Get and trim the user's input
            addMessage(userMessage, "user"); // Display the user's message in the chat
            addMessage(userMessage, "thinking"); // Display a "thinking" message indicating processing
            event.target.value = ""; // Clear the input field after the message is sent
        } catch (messageError) {
            const errorMessage = "Error handling user message:";
            //addMessage(errorMessage, 'sidekick');
            console.error("Error handling user message", messageError);
        }
    }
}

function addMessage(message, sender, messageId) {
    try {
        // Create a messgage element to append to the chatBox
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender);

        // Handle 'thinking' sender: display a loading animation with three circles
        if (sender === "thinking") {
            addThinkingAnimation(message, messageElement);
        }
        //SideKick response
        else if (sender === "sidekick") {
            addSideKickMessage(message, messageElement, messageId);
        } else {
            //User message
            messageElement.innerHTML = message;
            messageElement.id = messageId ?? "";
        }
        // Append the message to the chat-box and scroll to the bottom
        const chatBox = document.getElementById("chat-box");
        if (!chatBox) throw new Error("Chat box element not found.");

        //Add message to the chatBox
        var existingMessage = document.getElementById(messageId);

        if (!existingMessage) {
            chatBox.appendChild(messageElement);
        }
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    } catch (error) {
        console.error("Error adding message:", error);
    }

    // Helper Functions
    function addThinkingAnimation(message, messageElement) {
        messageElement.id = "thinking";

        // Create the "thinking" animation container
        const thinkingDiv = document.createElement("div");
        thinkingDiv.className = "thinking";
        // Append three circles for the animation
        for (let i = 0; i < 4; i++) {
            const circleDiv = document.createElement("div");
            circleDiv.className = "ai_circle";
            thinkingDiv.appendChild(circleDiv);
        }

        // Append thinking animation if not loading a previous thread
        if (message !== "load_previous_thread") {
            messageElement.appendChild(thinkingDiv);
            //only TSEs have access
            if (
                currentUserTeamIdsArr.includes("656a13e494c4a31935c1d2b0") ||
                window.location.href.includes("kustomer-sandbox")
            ) {
                getOpenAIResponse(message);
            }
            // Get SideKick response
        }
    }

    function addSideKickMessage(message, messageElement, messageId) {
        // Generate a random ID for the message to aid in copying text

        // Create elements for copy functionality
        const copySvg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );
        const copyPath = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );
        const copyDiv = document.createElement("div");
        const copyLabel = document.createElement("span");

        // Set attributes and classes for the SVG
        copySvg.setAttribute("width", "25px");
        copySvg.setAttribute("height", "15px");
        copySvg.setAttribute("viewBox", "0 0 15 16");
        copySvg.setAttribute("fill", "black");
        copySvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        copySvg.id = "content-copy-icon";
        copySvg.className = "content-copy-icon";

        // Set attributes for the SVG path
        copyPath.setAttribute(
            "d",
            "M11.8652 13.625H5.00977V4.86523H11.8652V13.625ZM11.8652 3.63477H5.00977C4.6582 3.63477 4.36035 3.75684 4.11621 4.00098C3.87207 4.24512 3.75 4.5332 3.75 4.86523V13.625C3.75 13.9766 3.87207 14.2744 4.11621 14.5186C4.36035 14.7627 4.6582 14.8848 5.00977 14.8848H11.8652C12.2168 14.8848 12.5146 14.7627 12.7588 14.5186C13.0029 14.2744 13.125 13.9766 13.125 13.625V4.86523C13.125 4.5332 13.0029 4.24512 12.7588 4.00098C12.5146 3.75684 12.2168 3.63477 11.8652 3.63477ZM9.99023 1.11523H2.49023C2.1582 1.11523 1.87012 1.2373 1.62598 1.48145C1.38184 1.72559 1.25977 2.02344 1.25977 2.375V11.1348H2.49023V2.375H9.99023V1.11523Z"
        );
        copyPath.setAttribute("fill", "black");

        // Append path to SVG
        copySvg.appendChild(copyPath);

        // Set attributes and classes for the copy container and label
        copyDiv.id = "copy-container";
        copyDiv.className = "copy-container";
        copyLabel.id = "content-copy-label";
        copyLabel.className = "content-copy-label";
        copyLabel.innerHTML = "Copy";

        // Add event listener for the copy button
        copyDiv.addEventListener("click", function () {
            try {
                const element = document.getElementById(messageId);
                if (!element)
                    throw new Error(`Element with ID '${messageId}' not found.`);

                const textToCopy = element.textContent.replace("Copy", "").trim();
                navigator.clipboard
                    .writeText(textToCopy)
                    .then(() => console.log("Message copied to clipboard:", textToCopy))
                    .catch((err) => console.error("Failed to copy message:", err));
                const params = {
                    type: "success",
                    message: "Message copied to clipboard!", // A friendly message to your users as feedback of something that happened in your app
                };
                Kustomer.handleTriggerToast(params);
            } catch (error) {
                console.error("Error copying message to clipboard:", error);
            }
        });

        // Append SVG and label to the copy container, and set message content
        var existingMessage = document.getElementById(messageId);
        if (!existingMessage) {
            messageElement.innerHTML = message;
            messageElement.id = messageId;
            copyDiv.appendChild(copySvg);
            copyDiv.appendChild(copyLabel);
            messageElement.appendChild(copyDiv);
        }
    }
    async function getOpenAIResponse(message) {
        try {
            if (aiThreadStr) {
                createMessageOnThread(message, aiThreadStr);
            } else {
                await createNewThread(message);
            }
        } catch (error) {
            console.error("Error fetching thread ID or processing message:", error);
            replaceThinking("An error occurred.", "errorGettingResponse");
        }
    }

    async function createNewThread(message) {
        try {
            const requestBody = {
                args: { url: `https://api.openai.com/v1/threads/runs` },
                body: {
                    assistant_id: "asst_0q20aQQO7ECwiXMz7D67ZB9E",
                    thread: {
                        messages: [{ role: "user", content: `${message}` }],
                    },
                },
            };

            const response = await Kustomer.request({
                url: `/v1/commands/${sideKickAppId}.open_ai_post_request/run`,
                method: "POST",
                body: requestBody,
            });

            const aiThreadStr = response.attributes.responseBody.thread_id;
            const run_id = response.attributes.responseBody.id;

            const chatboxElement = document.getElementById("chat-box");
            chatboxElement.dataset.thread = aiThreadStr;
            await Kustomer.request({
                url: `/v1/conversations/${conversationId}`,
                method: "PUT",
                body: {
                    custom: { aiThreadStr: `${aiThreadStr}`, sideKickBool: true },
                },
            });

            retrieveRun(aiThreadStr, run_id);
        } catch (error) {
            console.error("Error creating new thread:", error);
            triggerToast("error", "Request failed. Error updating conversation");
            const thinking = document.getElementById("thinking");
            if (!thinking) throw new Error("Thinking element not found");

            thinking.remove();
        }
    }
}

async function createMessageOnThread(message, aiThreadStr) {
    try {
        const requestBody = {
            args: {
                url: `https://api.openai.com/v1/threads/${aiThreadStr}/messages`,
            },
            body: { role: "user", content: `${message}` },
        };

        const response = await Kustomer.request({
            url: `/v1/commands/${sideKickAppId}.open_ai_post_request/run`,
            method: "POST",
            body: requestBody,
        });

        // Process the response and continue the thread interaction
        const run_id = await createRun(aiThreadStr);
        retrieveRun(aiThreadStr, run_id);
    } catch (error) {
        console.error("Error creating message on thread:", error);
    }
}

async function createRun(aiThreadStr) {
    try {
        const requestBody = {
            args: { url: `https://api.openai.com/v1/threads/${aiThreadStr}/runs` },
            body: {
                assistant_id: "asst_0q20aQQO7ECwiXMz7D67ZB9E",
                max_prompt_tokens: 50000,
                max_completion_tokens: 50000,
            },
        };

        const response = await Kustomer.request({
            url: `/v1/commands/${sideKickAppId}.open_ai_post_request/run`,
            method: "POST",
            body: requestBody,
        });
        const run_id = response.attributes.responseBody.id;
        return run_id;
    } catch (error) {
        console.error("Error creating run:", error);
    }
}

function retrieveRun(aiThreadStr, run_id) {
    const maxCount = 15;
    let count = 0;

    const intervalId = setInterval(async () => {
        try {
            var projectId = await getProjectId();

            let run_status; // Declare run_status outside the try block
            let data; // Declare data so it can be accessed later

            try {
                const response = await fetch(
                    `https://api.openai.com/v1/threads/${aiThreadStr}/runs/${run_id}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `${projectId}`, // Ensure projectId is the token
                            "Content-Type": "application/json",
                            "OpenAI-Beta": "assistants=v2",
                        },
                    }
                );

                // Check if the response is okay
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                data = await response.json();
                run_status = data.status; // Assign run_status here
            } catch (error) {
                console.error("Error fetching data:", error);
            }

            // Stop if the maximum number of attempts is reached
            if (count >= maxCount) {
                clearInterval(intervalId);
                document.getElementById("thinking").remove();
                const params = {
                    type: "warn",
                    message: `The request to reterieve the response timed out. Please close and reopen the conversation to retrieve the response.`,
                };
                Kustomer.handleTriggerToast(params);
            } else if (run_status === "completed") {
                clearInterval(intervalId);
                listMessages(aiThreadStr);
            } else if (run_status === "incomplete") {
                replaceThinking(
                    `Open AI API Error: ${data.incomplete_details.reason}`,
                    "apiError"
                );
            }

            count++;
        } catch (error) {
            console.error("Error polling run status:", error);
            clearInterval(intervalId); // Stop polling on error
        }
    }, 1000);
}

function replaceThinking(message, messageId) {
    try {
        const thinking = document.getElementById("thinking");
        if (!thinking) throw new Error("Thinking element not found");
        thinking.remove();
        const cleanedMessage = message.replace(/【\d{1,2}:\d{1,2}†source】/g, "");
        addMessage(marked.parse(cleanedMessage), "sidekick", messageId);
    } catch (error) {
        console.error("Error replacing thinking message:", error);
    }
}

async function listMessages(aiThreadStr) {
    try {
        var projectId = await getProjectId();
        const response = await fetch(
            `https://api.openai.com/v1/threads/${aiThreadStr}/messages`,
            {
                method: "GET",
                headers: {
                    Authorization: projectId,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2",
                },
            }
        );

        if (!response.ok)
            throw new Error(`Failed to fetch messages for thread ID: ${aiThreadStr}`);

        const data = await response.json();
        replaceThinking(data.data[0].content[0].text.value, data.data[0].id);
    } catch (error) {
        console.error("Error listing messages:", error);
    }
}

async function getProjectId() {
    const appSettings = await Kustomer.request({
        url: `/v1/settings/${settingsUrl}`,
        method: "GET",
    });
    //need to change for prod
    return "Bearer " + appSettings.default[arrayPosition].attributes.value;
}

async function loadThread(aiThreadStr) {
    var projectId = await getProjectId();

    if (aiThreadStr) {
        const chatboxElement = document.getElementById("chat-box");
        chatboxElement.dataset.thread = aiThreadStr;

        try {
            const response = await fetch(
                `https://api.openai.com/v1/threads/${aiThreadStr}/messages`,
                {
                    method: "GET",
                    headers: {
                        Authorization: projectId,
                        "Content-Type": "application/json",
                        "OpenAI-Beta": "assistants=v2",
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    const params = {
                        type: "error",
                        message: "Open AI Thread not found.",
                    };
                    Kustomer.handleTriggerToast(params);
                } else {
                    const params = {
                        type: "error",
                        message: `Error fetching thread: ${response.statusText} (${response.status})`,
                    };
                    Kustomer.handleTriggerToast(params);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Process the data as needed
            var messages = data.data;
            messages.sort((a, b) => a.created_at - b.created_at);

            // Loop through the sorted data array and print the messages
            messages.forEach((message) => {
                // Determine the role (assistant or user)
                let role = message.role === "assistant" ? "assistant" : "user";
                let messageId = message.id;

                // Print each content's text along with the role
                message.content.forEach((content) => {
                    if (content.text && content.text.value) {
                        const regex = /【\d{1,2}:\d{1,2}†source】/g;
                        var cleaned_message = content.text.value.replace(regex, "");
                        if (role == "assistant") {
                            addMessage(marked.parse(cleaned_message), "sidekick", messageId);
                        }
                        if (role == "user") {
                            addMessage(marked.parse(cleaned_message), "user", messageId);
                        }
                    }
                });
            });
        } catch (error) {
            console.error("Error fetching thread messages:", error);
        }
    }
}

async function clearThread(action) {
    try {
        const chatBox = document.getElementById("chat-box");
        if (!chatBox) throw new Error("Chat box element not found");

        chatBox.innerHTML = ""; // Clear the chat box
        if (action === "clear_messages_only") {
            //do not clear thread id from conversation
        } else {
            Kustomer.request(
                {
                    url: `/v1/conversations/${conversationId}`,
                    method: "PUT",
                    body: { custom: { aiThreadStr: "" } },
                },
                function (err) {
                    if (err) {
                        console.error("Error clearing thread:", err);
                    } else {
                        triggerToast("success", `Thread cleared.`);
                    }
                }
            );
        }
    } catch (error) {
        console.error("Error clearing thread:", error);
    }
    return;
}

function clearThreadShowConfirm(event) {
    var element = event.target;
    try {
        const clearYes = document.getElementById("clearYes");
        const clearNo = document.getElementById("clearNo");

        if (!clearYes || !clearNo)
            throw new Error("Clear confirmation elements not found");

        if (
            element.id === "clearThread" &&
            window.getComputedStyle(clearYes).display === "none"
        ) {
            clearYes.style.display = "inline";
            element.classList.add("waiting-confirm");
            clearNo.classList.add("clear-no-hover");
        }
    } catch (error) {
        console.error("Error showing confirmation to clear thread:", error);
    }
}

function handleClearConfirmation(isConfirmed) {
    try {
        const clearYes = document.getElementById("clearYes");
        const clearNo = document.getElementById("clearNo");
        const clearSpan = document.getElementById("clearThread");

        if (!clearYes || !clearNo || !clearSpan) {
            throw new Error("Clear confirmation elements not found");
        }

        clearYes.style.display = "none"; // Always hide the "Yes" button

        if (isConfirmed) {
            clearSpan.classList.remove("waiting-confirm");
            clearNo.classList.add("clear");
            clearThread(""); // Call the function to clear the thread
            toggleMenu(); // Optional: Close menu
        } else {
            clearSpan.classList.remove("waiting-confirm");
            clearNo.classList.remove("clear-no-hover");
        }
    } catch (error) {
        console.error("Error handling clear confirmation:", error);
    }
}

async function autoAsk() {
    try {
        toggleMenu();
        const response = await Kustomer.request({
            url: `/v1/conversations/${conversationId}/messages`,
            method: "GET",
        });

        let customerMessages = "";
        response.forEach((message) => {
            if (
                message.attributes &&
                message.attributes.preview &&
                !message.attributes.auto
            ) {
                customerMessages += message.attributes.preview + " ";
            }
        });

        const userMessage =
            "Help answer the questions in this conversation using the information in the following vector store vs_giI5Hu9xV27WqsQqyGaxRono: " +
            customerMessages;
        addMessage(userMessage, "user");
        addMessage(userMessage, "thinking");
    } catch (error) {
        console.error("Error fetching messages for autoAsk:", error);
    }
}

async function report() {
    try {
        toggleMenu();

        const issue = prompt(
            `Please describe the issue. This will be sent to #sidekick `,
            "Enter issue here..."
        );
        if (issue && issue !== "Enter issue here...") {
            const response = await fetch(
                "https://hooks.slack.com/services/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",
                {
                    method: "POST",
                    body: JSON.stringify({
                        channel: "C07NFEKFFC6",
                        icon_emoji: ":sidekick:",
                        username: `Reported Issue from ${currentUserName}`,
                        unfurl_links: false,
                        text: `<https://kustomer.kustomerapp.com/app/conversations/${conversationId}|Conversation> | Thread Id: \`${aiThreadStr}\` \`\`\`${issue}\`\`\` `,
                    }),
                }
            );

            if (!response.ok) throw new Error("Failed to send issue to Slack");
        }
    } catch (error) {
        console.error("Error reporting issue:", error);
    }
}

function createDocTask(taskDescription) {
    fetch(
        "https://api.kustomerapp.com/v1/hooks/form/570fad9d9001bc1000163b28/2fc946f7570bde13ccfeca7a02d1e0c18c6e56603e7bddcb195c45cb78059108",
        {
            method: "POST",
            body: JSON.stringify({
                task_description: `${taskDescription}`,
                current_user_id: `${currentUserId}`,
                current_conversation_id: `${conversationId}`,
            }),
        }
    );

    triggerToast("success", `Task creation started...`);
}

async function handleAction(id) {
    switch (id) {
        case "junk":
            Kustomer.request(
                {
                    url: "/v1/conversations/" + conversationId,
                    method: "put",
                    body: {
                        custom: {
                            resolutionTree: "closed.junk.spam",
                            topicTree: "na",
                            "@timerDurationMinutesNum": 0,
                        },
                    },
                },

                function (err, conversations) {
                    if (err || !conversations) {
                        console.log(err);
                        return;
                    }
                }
            );
            handleAssignments("to_junk", "");
            Kustomer.request(
                {
                    url: "/v1/conversations/" + conversationId,
                    method: "put",
                    body: {
                        status: "done",
                    },
                },
                function (err, conversations) {
                    if (err || !conversations) {
                        console.log(err);
                        return;
                    }
                }
            );
            break;
        case "impersonate":
            window.open(
                `https://kustomer.kustomerapp.com/app/customers/${companyImpersonationUserId}`
            );
            break;
        case "bug":
            var bugLink = "";

            if (companyArr > 255000) {
                bugLink = `https://kustomer.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10005&issuetype=10004&summary=%5BAREA%5D%20Summary&priority=4&&customfield_10321=${orgNameListId}&labels=CX&labels=TopAccount&description=*Overview*%0A%0A%0A%0A*Troubleshooting%20Attempts*&customfield_10072=Steps%20to%20reproduce%20(Please%20include%20all%20impacted%20Channels%2C%20Integrations%2C%20and%20Apps)%0A%23%0A%0AReproducible%20in%20other%20orgs%3F%0AYes%2FNo&customfield_10074=Name%3A%20${companyName}%0AHealth%3A%20${companyHealth}%0ASeats%3A%20${companySeats}%0ASegment%3A%20${companySegment}&customfield_10076=10099&customfield_10078=%5BKustomer%20Conversation%7Chttps%3A%2F%2Fkustomer.kustomerapp.com%2Fapp%2Fconversations%2F${conversationId}%5D%0A%5BImpersonation%20profile%7Chttps%3A%2F%2Fkustomer.kustomerapp.com%2Fapp%2Fcustomers%2F${customerId},
          ""
        )}`;
            } else {
                bugLink = `https://kustomer.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10005&issuetype=10004&summary=%5BAREA%5D%20Summary&priority=4&customfield_10321=${orgNameListId}&labels=CX&description=*Overview*%0A%0A%0A%0A*Troubleshooting%20Attempts*&customfield_10072=Steps%20to%20reproduce%20(Please%20include%20all%20impacted%20Channels%2C%20Integrations%2C%20and%20Apps)%0A%23%0A%0AReproducible%20in%20other%20orgs%3F%0AYes%2FNo&customfield_10074=Name%3A%20${companyName}%0AHealth%3A%20${companyHealth}%0ASeats%3A%20${companySeats}%0ASegment%3A%20${companySegment}&customfield_10076=10099&customfield_10078=%5BKustomer%20Conversation%7Chttps%3A%2F%2Fkustomer.kustomerapp.com%2Fapp%2Fconversations%2F${conversationId}%5D%0A%5BImpersonation%20profile%7Chttps%3A%2F%2Fkustomer.kustomerapp.com%2Fapp%2Fcustomers%2F${customerId}&customfield_10321=${orgNameListId},
          ""
        )}`;
            }
            window.open(bugLink, "_blank");
            break;
        case "docTask":
            var taskLink = "";
            var reason = prompt(
                `***Create a Documentation Task*** \n\nPlease indicate what needs to be documented or updated and the documentation taskforce will work to make the improvements.`,
                "Enter here..."
            );

            if (reason != null && (reason !== "" || reason !== "here")) {
                createDocTask(reason);
            }
            break;
        case "task":
            var taskLink = "";
            if (companyArr > 255000) {
                taskLink = `https://kustomer.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10005&issuetype=10002&customfield_10321=${orgNameListId}&summary=%5BAREA%5D%20Summary&description=*Description%20%26%20Impact*%3A%0A%0A%20%0AClient%3A%20${companyName}%0AHealth%3A%20${companyHealth}%0ASeats%3A%20${companySeats}%0ALicense%3A%20${companyLicense}%0A%20%0A%5BKustomer%20Conversation%7Chttps%3A%2F%2Fkustomer.kustomerapp.com%2Fapp%2Fconversations%2F${conversationId}%5D%0A%20%0A_Reminder%3A%20Please%20fill%20in%20the%20due%20date%20below%20if%20this%20is%20time-critical._&priority=4,&labels=CX&labels=TSE&labels=TopAccount`;
            } else {
                taskLink = `https://kustomer.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10005&issuetype=10002&customfield_10321=${orgNameListId}&summary=%5BAREA%5D%20Summary&description=*Description%20%26%20Impact*%3A%0A%0A%20%0AClient%3A%20${companyName}%0AHealth%3A%20${companyHealth}%0ASeats%3A%20${companySeats}%0ALicense%3A%20${companyLicense}%0A%20%0A%5BKustomer%20Conversation%7Chttps%3A%2F%2Fkustomer.kustomerapp.com%2Fapp%2Fconversations%2F${conversationId}%5D%0A%20%0A_Reminder%3A%20Please%20fill%20in%20the%20due%20date%20below%20if%20this%20is%20time-critical._&priority=4&labels=CX&labels=TSE`;
            }
            window.open(taskLink, "_blank");
            break;
        case "story":
            var bugLink = "";
            var taskLink = "";
            var storyLink = "";

            if (companyArr > 255000) {
                bugLink = `https://kustomer.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10005&customfield_10321=${orgNameListId}&issuetype=10004&summary=%5BAREA%5D%20Summary&priority=4&customfield_10321=${orgNameListId}&labels=CX&labels=TopAccount&description=*Overview*%0A%0A%0A%0A*Troubleshooting%20Attempts*&customfield_10072=Steps%20to%20reproduce%20(Please%20include%20all%20impacted%20Channels%2C%20Integrations%2C%20and%20Apps)%0A%23%0A%0AReproducible%20in%20other%20orgs%3F%0AYes%2FNo&customfield_10074=Name%3A%20${companyName}%0AHealth%3A%20${companyHealth}%0ASeats%3A%20${companySeats}%0ASegment%3A%20${companySegment}&customfield_10076=10099&customfield_10078=%5BKustomer%20Conversation%7Chttps%3A%2F%2Fkustomer.kustomerapp.com%2Fapp%2Fconversations%2F${conversationId}%5D%0A%5BImpersonation%20profile%7Chttps%3A%2F%2Fkustomer.kustomerapp.com%2Fapp%2Fcustomers%2F${customerId}%5D%0A&labels=TSE&customfield_10321=${orgNameListId}`;
                taskLink = `https://kustomer.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10005&customfield_10321=${orgNameListId}&issuetype=10002&summary=%5BAREA%5D%20Summary&description=*Description%20%26%20Impact*%3A%0A%0A%20%0AClient%3A%20${companyName}%0AHealth%3A%20${companyHealth}%0ASeats%3A%20${companySeats}%0ALicense%3A%20${companyLicense}%0A%20%0A%5BKustomer%20Conversation%7Chttps%3A%2F%2Fkustomer.kustomerapp.com%2Fapp%2Fconversations%2F${conversationId}%5D%0A%20%0A_Reminder%3A%20Please%20fill%20in%20the%20due%20date%20below%20if%20this%20is%20time-critical._&priority=4&labels=CX&labels=TSE&labels=TopAccount`;
                storyLink = `https://kustomer.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10005&customfield_10321=${orgNameListId}&issuetype=10001&summary=%5BAREA%5D%20Summary&description=*Description%20%26%20Impact*%0A%0A%20%0AClient%3A%20${companyName}%20%0AHealth%3A%20${companyHealth}%0ASeats%3A%20${companySeats}%0ALicense%3A%20${companyLicense}%0A%20%0A%5BKustomer%20Conversation%7Chttps%3A%2F%2Fkustomer.kustomerapp.com%2Fapp%2Fconversations%2F${conversationId}%5D%0A%20%0A*Workaround%20Provided*%0A%0A&priority=4&labels=CX&labels=TSE&labels=TopAccount`;
            } else {
                bugLink = `https://kustomer.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10005&issuetype=10004&customfield_10321=${orgNameListId}&summary=%5BAREA%5D%20Summary&priority=4&customfield_10321=${orgNameListId}&labels=CX&description=*Overview*%0A%0A%0A%0A*Troubleshooting%20Attempts*&customfield_10072=Steps%20to%20reproduce%20(Please%20include%20all%20impacted%20Channels%2C%20Integrations%2C%20and%20Apps)%0A%23%0A%0AReproducible%20in%20other%20orgs%3F%0AYes%2FNo&customfield_10074=Name%3A%20${companyName}%0AHealth%3A%20${companyHealth}%0ASeats%3A%20${companySeats}%0ASegment%3A%20${companySegment}&customfield_10076=10099&customfield_10078=%5BKustomer%20Conversation%7Chttps%3A%2F%2Fkustomer.kustomerapp.com%2Fapp%2Fconversations%2F${conversationId}%5D%0A%5BImpersonation%20profile%7Chttps%3A%2F%2Fkustomer.kustomerapp.com%2Fapp%2Fcustomers%2F${customerId}%5D%0A&labels=TSE&customfield_10321=${orgNameListId}`;
                taskLink = `https://kustomer.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10005&customfield_10321=${orgNameListId}&issuetype=10002&summary=%5BAREA%5D%20Summary&description=*Description%20%26%20Impact*%3A%0A%0A%20%0AClient%3A%20${companyName}%0AHealth%3A%20${companyHealth}%0ASeats%3A%20${companySeats}%0ALicense%3A%20${companyLicense}%0A%20%0A%5BKustomer%20Conversation%7Chttps%3A%2F%2Fkustomer.kustomerapp.com%2Fapp%2Fconversations%2F${conversationId}%5D%0A%20%0A_Reminder%3A%20Please%20fill%20in%20the%20due%20date%20below%20if%20this%20is%20time-critical._&priority=4&labels=CX&labels=TSE`;
                storyLink = `https://kustomer.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10005&customfield_10321=${orgNameListId}&issuetype=10001&summary=%5BAREA%5D%20Summary&description=*Description%20%26%20Impact*%0A%0A%20%0AClient%3A%20${companyName}%20%0AHealth%3A%20${companyHealth}%0ASeats%3A%20${companySeats}%0ALicense%3A%20${companyLicense}%0A%20%0A%5BKustomer%20Conversation%7Chttps%3A%2F%2Fkustomer.kustomerapp.com%2Fapp%2Fconversations%2F${conversationId}%5D%0A%20%0A*Workaround%20Provided*%0A%0A&priority=4&labels=CX&labels=TSE`;
            }
            window.open(storyLink, "_blank");
            break;
        case "jira_search":
            window.open(
                `https://kustomer.atlassian.net/issues/?filter=-4&jql=status%20!%3D%20Done%20AND%20%22Related%20Customers%5BLabels%5D%22%20%3D%20${companyName.replace(
                    /\s/g,
                    ""
                )}%20ORDER%20BY%20created%20ASC`,
                "_blank"
            );

            break;
        case "alert_tse":
            fetch(
                "https://api.kustomerapp.com/v1/hooks/form/570fad9d9001bc1000163b28/faf66367857cdbff416bb2cddb5652530943a087a800e637d4d53858b74bd229",
                {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({
                        isAgent: true,
                        option: 1,
                        currentUser: currentUserName,
                    }),
                }
            );
            break;
        case "alert_tse_backup":
            fetch(
                "https://api.kustomerapp.com/v1/hooks/form/570fad9d9001bc1000163b28/faf66367857cdbff416bb2cddb5652530943a087a800e637d4d53858b74bd229",
                {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({
                        isAgent: true,
                        option: 2,
                        currentUser: currentUserName,
                    }),
                }
            );
            break;
        case "alert_admin":
            fetch(
                "https://api.kustomerapp.com/v1/hooks/form/570fad9d9001bc1000163b28/faf66367857cdbff416bb2cddb5652530943a087a800e637d4d53858b74bd229",
                {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({
                        isAgent: true,
                        option: 5,
                        currentUser: currentUserName,
                    }),
                }
            );
            break;
        case "alert_manager":
            fetch(
                "https://api.kustomerapp.com/v1/hooks/form/570fad9d9001bc1000163b28/faf66367857cdbff416bb2cddb5652530943a087a800e637d4d53858b74bd229",
                {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({
                        isAgent: true,
                        option: 3,
                        currentUser: currentUserName,
                    }),
                }
            );
            break;
        case "pager_duty_schedules":
            window.open("https://kustomer.pagerduty.com/schedules-new", "_blank");
            break;
        case "sow_form":
            window.open(
                "https://form.asana.com/",
                "_blank"
            );
            break;
        case "escalate_to_billing":
            var reason = prompt(
                `Please enter a reason for escalating this conversation to the Billing team`,
                "Enter reason here..."
            );
            if (reason != null && reason != "") {
                handleAssignments("to_escalations_billing", reason);
            } else {
                return;
            }
            break;
        case "escalate_to_support":
            var reason = prompt(
                `Please enter a reason for escalating this conversation to the Support team`,
                "Enter reason here..."
            );
            if (reason != null && reason != "") {
                handleAssignments("to_escalations_support", reason);
            } else {
                return;
            }
            break;
        case "billing_help_alert":
            break;
        case "show_stakeholders":
            initModal(companyData, true);

            break;
        case "assign_to_support":
            genericPut(
                "conversations",
                conversationId,
                {
                    assignedUsers: [],
                    queue: { id: "61aa1756573ed1001b15da1c" },
                    assignedTeams: ["5c38c68a50b7a60019b3621f"],
                    status: "open",
                },
                "Conversation assigned to Support."
            );
            break;
        case "assign_to_billing":
            genericPut(
                "conversations",
                conversationId,
                {
                    assignedUsers: [],
                    assignedTeams: ["63f7916d980ae683e4fc3843"],
                    queue: { id: "63d29b6c28ab968c97493654" },
                },
                "Conversation assigned to the Billing team."
            );
            break;
        case "assign_to_data_export":
            const data = await genericGet(
                "conversations",
                conversationId,
                "Cannot find conversation id"
            );


            if (data.attributes.firstResponse?.createdAt !== undefined) {
                // If firstResponse.createdAt exists
                await genericPut(
                    "conversations",
                    conversationId,
                    {
                        assignedUsers: [],
                        queue: { id: "657c7c15b2af6348c6ebdc9f" },
                        assignedTeams: ["5c38c68a50b7a60019b3621f"],
                        status: "open",
                    },
                    "Conversation assigned to the Data export team."
                );
            } else {
                // If firstResponse.createdAt does not exist
                triggerToast(
                    "error",
                    "⚠️ Please send a first response using the shortcut exportrequest before assigning to the Data export team."
                );
            }
            break;
        case "edit_conversation_fields":
            break;
        case "cp_30m":
            handleConnectClick("64f745e6b113be20542db25e", "single_use", "30 minute");
            break;
        case "cp_45m":
            handleConnectClick("64f766e6d1fafd404ec3cdf2", "single_use", "45 minute");
            break;
        case "cp_60m":
            handleConnectClick("64f766fad1fafd404ec3ce09", "single_use", "60 minute");

            break;
        case "personal_zoom_url":
            break;
        default:
    }
}

function handleConnectClick(event_type, type, length) {
    if (type == "personal") {
        //navigator.clipboard.writeText("https://chili_piper.com/" + chili_piper_username);
    } else if (type === "single_use") {
        fetch("https://api.chilipiper.com/api/v2/bookinglinks/singleuse", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Bearer eyJ1aWQiOiI2NGYyMDgwMWYxZTgyNDI5M2FmNzI3MTgiLCJuYmYiOjE3MjU5MDE5MzQsImV4cCI6MTc1NzQzNzkzOSwiaWF0IjoxNzI1OTAxOTM5LCJ0aWQiOiJrdXN0b21lci4xIiwianRpIjoiYjY2MDY3MDktNzllZS00MzJiLWEyYWYtZjA3ODUzZDAxZTRlIn0.ls7idmVgYh6IIKUtt5JlebXo01USu2K2rZstYZI9Kwo",
            },
            body: JSON.stringify({
                templateId: `${event_type}`,
                assigneeName: `${chiliPiperUsername}`,
                type: "Personal",
            }),
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                navigator.clipboard.writeText(
                    data.address +
                    "?email=" +
                    customerEmail +
                    "&name=" +
                    customerFirstName +
                    "&conversation_id=" +
                    conversationId
                );
            });
        triggerToast(
            "success",
            `${length} Chili Piper scheduling link copied to clipboard!`
        );
    } else if (type === "kustomer_zoom") {
        //navigator.clipboard.writeText(kustomer_zoom_link);
    }
}

function triggerToast(type, message) {
    console.log("firing");
    const params = {
        type: type,
        message: message,
    };
    console.log(params);
    Kustomer.handleTriggerToast(params);
}

function genericPut(sobject, id, body, successMessage) {
    Kustomer.request(
        {
            url: `/v1/${sobject}/${id}`,
            method: "put",
            body,
        },
        function (err, response) {
            if (err) {
                console.error("Error updating conversation:", err);
                triggerToast(
                    "error",
                    "Error updating conversation - " +
                    err.error.code +
                    ": " +
                    err.error.source.parameter
                );
            } else {
                if (successMessage) {
                    triggerToast("success", successMessage);
                }
            }
        }
    );
}

function handleAssignments(type, reason) {
    const queues = {
        to_krew_support: {
            id: "64641e1c47c7acdeedf5d03d",
            team: "5c38c68a50b7a60019b3621f",
        },
        to_ts: { id: "61aa1756573ed1001b15da1c", team: "5c38c68a50b7a60019b3621f" },
        to_data_exports: {
            id: "657c7c15b2af6348c6ebdc9f",
            team: "5c38c68a50b7a60019b3621f",
        },
        to_billing: {
            id: "63d29b6c28ab968c97493654",
            team: "63f7916d980ae683e4fc3843",
        },
    };

    const escalationMapping = {
        to_escalations_support: "Support",
        to_escalations_billing: "Billing",
        to_escalations_internal_billing: "Billing - Internal",
    };

    function assignQueue(queueId, teamId) {
        genericPut(
            "conversations",
            conversationId,
            {
                assignedUsers: [],
                assignedTeams: [teamId],
                queue: { id: queueId },
                status: "open",
            },
            "Conversation assigned. "
        );
    }

    if (queues[type]) {
        const { id, team } = queues[type];
        assignQueue(id, team);
    } else if (escalationMapping[type]) {
        escalate(currentEscalationCount, escalationMapping[type], reason);
    } else if (type === "to_junk") {
        genericPut(
            "conversations",
            conversationId,
            {
                assignedUsers: [],
                tags: ["586fe182ea385611004508f9"],
                spam: true,
                custom: {
                    resolutionTree: "closed.junk.spam",
                    topicTree: "na",
                    "@timerDurationMinutesNum": 0,
                },
            },
            "Conversation marked as Junk"
        );
        genericPut(
            "conversations",
            conversationId,
            { status: "done" },
            "Conversation marked done"
        );
    } else if (type === "to_incident") {
        genericPut(
            "conversations",
            conversationId,
            {
                custom: {
                    appResolutionTree:
                        "incidents.platform_wide_latency_degraded_performance",
                    cxContactResolutionTree: "59d6b3e7d1ba720001f2fb1f",
                    cxContactReasonTree: "59d6b28cdd797600019a2415",
                    appIntegrationTree: "n_a",
                    resolutionTree: "other",
                    topicTree: "na",
                    "@timerDurationMinutesNum": 0,
                },
            },
            ""
        );
        genericPut("conversations", conversationId, { status: "done" });
    }
}

function escalate(type, reason) {
    //Changing the count/boolean causes this workflow to run: https://kustomer.kustomerapp.com/app/settings/workflows/5e73c85109801c00195a99cc/edit
    console.log(type);
    var newCount = 0;
    var escalatedBool = false;
    if (currentEscalationCount == 0) {
        newCount = 1;
        escalatedBool = true;
    } else if (currentEscalationCount == 1) {
        newCount = 2;
        escalatedBool = true;
    }

    try {
        Kustomer.request(
            {
                url: "/v1/conversations/" + conversationId,
                method: "put",
                body: {
                    custom: {
                        escalationCountNum: newCount,
                        escalatedBool: escalatedBool,
                        escalationTypeStr: `${type}`,
                        escalationReasonStr: `${reason}`,
                    },
                },
            },
            function (err, conversations) {
                if (err || !conversations) {
                    console.log(err);
                    return;
                }
            }
        );
    } catch (err) {
        console.log(err);
    }
}

// ============================
// 5. Edit Button Logic
// ============================
editButton.addEventListener("click", function () {
    isEditing = !isEditing;

    editButton.textContent = isEditing ? "Save" : "Edit Actions Order";
    editButton.classList.toggle("visible-always", isEditing);

    toggleDragAndDrop(isEditing);
});

// ============================
// 6. Tab Navigation Logic
// ============================
tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        contents.forEach((content) => content.classList.add("hidden"));
        contents[index].classList.remove("hidden");
    });
});
async function genericGet(sobject, id, failureMessage) {
    const data = await Kustomer.request(
        {
            url: `/v1/${sobject}/${id}`,
            method: "get",
        },
        function (err, response) {
            if (err) {
                triggerToast("error", failureMessage);
            }
        }
    );
    return data;
}

async function initModal(company, initialize) {
    try {
        company = companyData?.attributes?.custom;
        if (!company) {
            throw new Error("Company data is missing or undefined.");
        }
    } catch (error) {
        var params = {
            type: "error",
            message: "Company does not exist", // A friendly message to your users as feedback of something that happened in your app
        };
        Kustomer.handleTriggerToast(params);
        console.error("Company data is missing. Handling gracefully.");
        return;
    }

    const stakeholders = [];
    const stakeholderData = [];

    // Check if the fields exist in the JSON payload and add them with their field names
    if (company.csOwnerId)
        stakeholders.push({ id: company.csOwnerId, fieldName: "csOwnerId" });
    if (company.assignedTsePrimaryId)
        stakeholders.push({
            id: company.assignedTsePrimaryId,
            fieldName: "assignedTsePrimaryId",
        });
    if (company.tamUserId)
        stakeholders.push({ id: company.tamUserId, fieldName: "tamUserId" });
    if (company.aeUserId)
        stakeholders.push({ id: company.aeUserId, fieldName: "aeUserId" });
    if (company.imUserId)
        stakeholders.push({ id: company.imUserId, fieldName: "imUserId" });

    for (const stakeholder of stakeholders) {
        try {
            // Call the API to get user data
            const response = await genericGet(
                "users",
                `${stakeholder.id}`,
                "Cannot find user."
            );

            // Push the entire response along with the field name to the stakeholderData array
            stakeholderData.push({
                id: stakeholder.id,
                fieldName: stakeholder.fieldName, // Include the field name
                data: response.attributes,
            });
        } catch (error) {
            console.error(
                `Error fetching user data for ID: ${stakeholder.id}`,
                error
            );
        }
    }
    const options = {
        id: "stakeholders",
        title: "Stakeholders",
        additionalData: {
            stakeholderData: stakeholderData,
        },
        url: "https://bryce-kustomer.github.io/alpha_insight_card/modal_index.html",
        height: 700,
        width: 800,
    };

    try {
        Kustomer.modal.init(options, (data) => {
            // Initialization logic
            console.log("Modal initialized successfully:", data);
        });
    } catch (error) {
        console.error("Error initializing modal:", error);
    } finally {
        Kustomer.modal.show("stakeholders");
        return;
    }
}

// ============================
// 7. Kustomer Initialization
// ============================
Kustomer.initialize(async function (data) {
    setTimeout(() => {
        console.log("init");
        companyData = data[2];
        data = data[3];

        initializeSidekick();
        //set conversation attributes

        if (data && data.conversation) {
            conversationId = data.conversation?.id ?? "";
            customerId =
                data.conversation?.relationships?.customer?.data?.id ??
                customerId ??
                "";
            aiThreadStr = data.conversation?.attributes?.custom?.aiThreadStr ?? null;
            currentEscalationCount =
                data.conversation?.attributes?.custom?.escalationCountNum ?? "";
        }
        document.getElementById("chat-box").innerHTML = "";
        customerFirstName = data.customer?.attributes?.firstName ?? "";
        customerLastName = data.customer?.attributes?.lastName ?? "";
        console.log(data);
        customerEmail = data.customer?.attributes?.emails?.[0]?.email ?? "";
        loadThread(aiThreadStr);

        if (data?.company?.attributes?.custom) {
            loadMetrics(data.company.attributes.custom);
            companyId = data.company?.id ?? "";
            companyImpersonationUserId =
                data.company?.attributes?.custom?.impersonationUserId ?? "";
            companyHealth = data.company?.attributes?.custom?.accountHealthStr ?? "";
            orgNameListId = data.company?.attributes?.custom?.orgNameListIdStr ?? "";

            companyArr = data.company?.attributes?.custom?.arrNum ?? "";
            companySeats = data.company?.attributes?.custom?.totalSeatsNum ?? "";
            companyLicense = data.company?.attributes?.custom?.licenseTypeStr ?? "";
            companySegment =
                data.company?.attributes?.custom?.csSegmentEmployeeCountStr ?? "";
            companyAccountType =
                data.company?.attributes?.custom?.accountTypeStr ?? "";
            companyName = data.company?.attributes?.name ?? "";
            console.log(companyImpersonationUserId);
            document.getElementById("companyName").innerHTML = companyName;
        } else {
            console.log("else");
            document.getElementById("companyName").innerHTML = "-";
        }

        currentUserId = data.user;

        Kustomer.request(
            {
                url: `/v1/users/${data.user}`,
                method: "get",
            },
            function (err, userData) {
                if (err || !userData) {
                    console.error(err);
                    return;
                }
                currentUserName = userData.attributes.name;
                chiliPiperUsername = userData.attributes.custom.chiliPiperUsernameStr;

                const actionsOrderArr = userData?.attributes?.custom?.actionsOrderStr
                    ? userData.attributes.custom.actionsOrderStr
                        .split(",")
                        .map((str) => str.trim())
                    : [];

                reorderElementsById("actionsContainer", actionsOrderArr);

                Kustomer.request(
                    {
                        url: `/v1/users/${data.user}/teams`,
                        method: "get",
                    },
                    function (err, teamData) {
                        if (err || !teamData) {
                            console.error(err);
                            return;
                        }

                        currentUserTeamIdsArr = teamData.map((obj) => obj.id).join(" ");
                    }
                );
            }
        );
    }, 500);
});

// ============================
// 8. Kustomer Context Handling
// ============================
Kustomer.on("context", function (data) {
    if (data[3].conversation.id !== conversationId) {
        setTimeout(() => {
            console.log("context");
            companyData = data[2];
            data = data[3];

            initializeSidekick();

            //set conversation attributes

            conversationId = data.conversation?.id ?? "";
            customerId =
                data.conversation?.relationships?.customer?.data?.id ??
                customerId ??
                "";
            aiThreadStr = data.conversation?.attributes?.custom?.aiThreadStr ?? null;
            currentEscalationCount =
                data.conversation?.attributes?.custom?.escalationCountNum ?? "";

            document.getElementById("chat-box").innerHTML = "";
            customerFirstName = data.customer?.attributes?.firstName ?? "";
            customerLastName = data.customer?.attributes?.lastName ?? "";
            customerEmail = data.customer?.attributes?.emails?.[0]?.email ?? "";
            loadThread(aiThreadStr);
            if (data?.company?.attributes?.custom) {
                loadMetrics(data.company.attributes.custom);
                companyId = data.company?.id ?? "";
                companyImpersonationUserId =
                    data.company?.attributes?.custom?.impersonationUserId ?? "";
                companyHealth =
                    data.company?.attributes?.custom?.accountHealthStr ?? "";
                companyArr = data.company?.attributes?.custom?.arrNum ?? "";
                orgNameListId = data.company?.attributes?.custom?.orgNameListIdStr ?? "";

                companySeats = data.company?.attributes?.custom?.totalSeatsNum ?? "";
                companyLicense = data.company?.attributes?.custom?.licenseTypeStr ?? "";
                companySegment =
                    data.company?.attributes?.custom?.csSegmentEmployeeCountStr ?? "";
                companyAccountType =
                    data.company?.attributes?.custom?.accountTypeStr ?? "";
                companyName = data.company?.attributes?.name ?? "";

                document.getElementById("companyName").innerHTML = companyName;
            } else {
                const elements = document.querySelectorAll(".metric_value"); // Select all elements with the class name

                elements.forEach((element) => {
                    element.innerHTML = "-"; // Set innerHTML for each element
                });
                document.getElementById("companyName").innerHTML = "-";
            }

            currentUserId = data.user;
        }, 500);
    } else {
    }
});
