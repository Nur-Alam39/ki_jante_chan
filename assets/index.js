initializeRecentQuestions();
function initializeRecentQuestions() {
    let qus = JSON.parse(localStorage.getItem("recent_questions"));
    if (qus && qus.length > 0) {
        qus.reverse();
    }
    for (let i = 0; i < qus.length; i++) {
        appendRecentQuestion(qus[i]);
    }
}

function appendRecentQuestion(question) {
    let recentEle = document.getElementById("recent_questions");
    let button = document.createElement("button");
    button.classList.add("btn", "btn-light", "btn-sm", "btn-block", "mb-2", "d-block");
    button.addEventListener("click", function() {
        frequentQuestion(question)
    });
    button.innerHTML = question;
    recentEle.insertBefore(button, recentEle.firstChild)
    // recentEle.appendChild(button);
}

function frequentQuestion(content) {
    document.getElementById("user-input").value = content;
    sendMessage();
}

const userInput = document.getElementById("user-input");
userInput.onkeyup = function(e){
    if(e.keyCode === 13){
        sendMessage();
    }
}

function storeSearches(userInput) {
    let userInputs = [];
    let time = Date.now.toLocaleString();
    userInputs = JSON.parse(localStorage.getItem('recent_questions')) || [];
    if (!userInputs.includes(userInput)){
        userInputs.push(userInput);
        localStorage.setItem('recent_questions', JSON.stringify(userInputs));
        appendRecentQuestion(userInput);
    }
}
async function sendMessage() {
    let userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return;

    storeSearches(userInput);


    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<div class='user-message'>${userInput}</div>`;
    document.getElementById("user-input").value = "";
    let loaderDiv = document.createElement("div");
    loaderDiv.classList.add("loader");
    loaderDiv.innerHTML = "জানাইতেছি, একটু সবুর করেন...";
    chatBox.appendChild(loaderDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        let response = await axios.post("https://api.together.xyz/v1/chat/completions", {
            model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages: [{role: "user", content: userInput}]
        }, {
            headers: { "Authorization": "Bearer 146256ab83c558e84c2283e270855da846ff4ea4941a6cac109161c06167d88f" }
        });

        loaderDiv.remove();

        let botMessage = response.data.choices[0].message.content;
        let botMessageDiv = document.createElement("div");
        botMessageDiv.classList.add("bot-message");
        chatBox.appendChild(botMessageDiv);

        let i = 0;
        function typeCharacter() {
            if (i < botMessage.length) {
                botMessageDiv.innerHTML += botMessage[i];
                chatBox.scrollTop = chatBox.scrollHeight;
                i++;
                setTimeout(typeCharacter, 20);
            }
        }
        typeCharacter();
    } catch (error) {
        loaderDiv.remove();
        chatBox.innerHTML += `<div class='bot-message text-danger'>Error: Unable to fetch response.</div>`;
    }
}
