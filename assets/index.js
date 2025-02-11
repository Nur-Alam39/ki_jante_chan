document.addEventListener("DOMContentLoaded", function () {
    initializeRecentQuestions();
    initializeFrequentQuestions();
});

function fetchFrequentQuestions(subject) {
    if (subject === "namaz") {
        return ["সেজদা সাহু দিতে ভুলে গেলে করণীয়", "অসুস্থ ব্যক্তি কীভাবে নামায আদায় করবে"]
    } else if (subject === "roza") {
        return ["রমজান মাসের প্রস্তুতি কেমন হবে?", "রোযা ভঙ্গের কারণসমূহ"]
    } else if (subject === "quran") {
        return ["সূরা ইখলাস পড়ার ফযীলত"]
    } else if (subject === "zakat") {
        return ["যাদের উপর যাকাত ফরয হয়", "যেসব জিনিসের উপর যাকাত ফরয হয়"]
    } else {
        return ["যাদের উপর যাকাত ফরয হয়", "যেসব জিনিসের উপর যাকাত ফরয হয়", "রমজান মাসের প্রস্তুতি কেমন হবে?", "রোযা ভঙ্গের কারণসমূহ", "সেজদা সাহু দিতে ভুলে গেলে করণীয়",  "সূরা ইখলাস পড়ার ফযীলত", "অসুস্থ ব্যক্তি কীভাবে নামায আদায় করবে"]
    }
}

function clearHistory() {
    alert(" আপনি কি নিশ্চিত?");
    localStorage.setItem('recent_questions', JSON.stringify([]));
    let recentEle = document.getElementById("recent_questions");
    recentEle.innerHTML = "<small>আপনি এখনও কিছু জিজ্ঞাসা করেননি</small>";
    document.getElementById("delete-history-btn").style.display = "none";
}

document.getElementById("frequent-filter").addEventListener('keyup', (event) => {
    filterFrequentQuestions(event.target.value);
})

let frequent_questions = fetchFrequentQuestions();
function filterFrequentQuestions(term) {
    let filtered = frequent_questions.filter(question => question.includes(term));
    if (filtered.length > 0) {
        let recentEle = document.getElementById("frequent_questions");
        recentEle.innerHTML = '';
        initializeFrequentQuestions(filtered);
    }
}

function toggleSubject(subject) {
    let subjectiveQuestions = fetchFrequentQuestions(subject)
    if (subjectiveQuestions.length > 0) {
        let recentEle = document.getElementById("frequent_questions");
        recentEle.innerHTML = '';
        initializeFrequentQuestions(subjectiveQuestions);
    }
}
function initializeFrequentQuestions(questions) {
    let frequent_questions = questions || fetchFrequentQuestions();
    for (let i = 0; i < frequent_questions.length; i++) {
        appendFrequentQuestion(frequent_questions[i]);
    }
}
function initializeRecentQuestions() {
    let qus = JSON.parse(localStorage.getItem("recent_questions"));
    if (qus && qus.length > 0) {
        for (let i = 0; i < qus.length; i++) {
            appendRecentQuestion(qus[i]);
        }
        document.getElementById("delete-history-btn").style.display = "block";
    } else {
        let recentEle = document.getElementById("recent_questions");
        recentEle.innerHTML = "<small>আপনি এখনও কিছু জিজ্ঞাসা করেননি</small>";
        document.getElementById("delete-history-btn").style.display = "none";
    }
}

function appendFrequentQuestion(question) {
    let recentEle = document.getElementById("frequent_questions");
    appendChild(recentEle, question);
}

function appendRecentQuestion(question) {
    let recentEle = document.getElementById("recent_questions");
    appendChild(recentEle, question);
    document.getElementById("delete-history-btn").style.display = "block";
}

function appendChild(parent, question) {
    let item = document.createElement("div");
    item.classList.add("question-item");
    item.setAttribute("title", "জানতে ক্লিক করুন");
    item.addEventListener("click", function() {
        frequentQuestion(question)
    });
    item.innerHTML = question;
    parent.insertBefore(item, parent.firstChild);
}

function frequentQuestion(content) {
    document.getElementById("user-input").value = content;
    sendMessage();
}

const userInput = document.getElementById("user-input");
userInput.onkeyup = function(e){
    if(e.key === "Enter"){
        sendMessage();
    }
}

async function sendMessage() {
    let userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return;

    let userInputs = [];
    userInputs = JSON.parse(localStorage.getItem('recent_questions')) || [];
    if (!userInputs.includes(userInput)){
        if (userInputs.length === 0) {
            let recentEle = document.getElementById("recent_questions");
            recentEle.innerHTML = "";
        }
        userInputs.push(userInput);
        localStorage.setItem('recent_questions', JSON.stringify(userInputs));
        appendRecentQuestion(userInput);
    }

    let chatBox = document.getElementById("chat-box-wrapper");

    if (chatBox) {
        chatBox.innerHTML += `<div class='user-message'>${userInput}</div>`;
        document.getElementById("user-input").value = "";
    }

    let loaderDiv = document.createElement("div");
    loaderDiv.classList.add("loader");
    loaderDiv.innerHTML = "জানাচ্ছি, একটু অপেক্ষা করেন...";

    chatBox.appendChild(loaderDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        let response = await axios.post("https://api.together.xyz/v1/chat/completions", {
            model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages: [
                {role: "system", content: "You are an AI assistant specialized in answering questions about Islamic studies. Provide accurate, concise, and respectful responses. If unsure about an answer, indicate the need for further research. Please provide the information formatted in Markdown."},
                {role: "user", content: userInput},
            ]
        }, {
            headers: { "Authorization": "Bearer 146256ab83c558e84c2283e270855da846ff4ea4941a6cac109161c06167d88f" }
        });

        loaderDiv.remove();

        let botMessage = response.data.choices[0].message.content;
        const dirtyHtmlContent = marked.parse(botMessage);
        const htmlContent = DOMPurify.sanitize(dirtyHtmlContent);
        let botMessageDiv = document.createElement("div");
        botMessageDiv.classList.add("bot-message");
        chatBox.appendChild(botMessageDiv);
        // botMessageDiv.innerHTML += htmlContent

        const instance = new TypeIt(botMessageDiv, {
            html: true,
            speed: 10,
            afterStep: function(instance) {
                let chatBox = document.getElementById("chat-box-wrapper");
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }).type(htmlContent).go();

        instance.reset();

        // let i = 0;
        // function typeCharacter() {
        //     if (i < htmlContent.length) {
        //         botMessageDiv.innerHTML += htmlContent.slice(0, i);
        //         chatBox.scrollTop = chatBox.scrollHeight;
        //         i++;
        //         setTimeout(typeCharacter, 20);
        //     }
        // }
        // typeCharacter();
    } catch (error) {
        loaderDiv.remove();
        chatBox.innerHTML += `<div class='bot-message text-danger'>Error: Unable to fetch response.</div>`;
    }
}
