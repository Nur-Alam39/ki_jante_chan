var topics, allTopics, currentActiveLink = "all";
document.addEventListener("DOMContentLoaded", function () {
    initializeRecentQuestions();
    document.getElementById("chat-box-wrapper").innerHTML = "<small class='text-gray'>" +
        "আমি একজন এআই সহকারী। আমি ইসলামিক বিভিন্ন বিষয়ের প্রশ্নের উত্তর দেওয়ার জন্য বিশেষভাবে প্রশিক্ষিত, তবে আমি যেকোনো প্রশ্নের উত্তরও দিতে পারি। <br><br>মাসলা-মাসায়েল উত্তরের ক্ষেত্রে, অনুগ্রহ করে যাচাই করুন এবং আলেমদের সাথে পরামর্শ করুন।\n</small>";
    fetchFrequentQuestionsData();

});

function initializeNavlinks() {
    let navLinks = document.getElementById('nav-links');
    Object.keys(topics).forEach(function (key) {
        navLinks.innerHTML += `<li class="nav-item"><a id="${key}" class="nav-link" href="#" onclick="toggleSubject('${key}')">  ${key} </a></li>`
    })
}

function fetchFrequentQuestionsData() {
    fetch('assets/topics.json')
        .then(response => response.json())
        .then(data => {
            topics = data[0]; // Example: Output Namaz topics
            allTopics = Object.keys(topics).map(function (key) {
                return topics[key];
            });
            allTopics = allTopics.flat();
            initializeFrequentQuestions(allTopics);
            initializeNavlinks();
        })
        .catch(error => console.error("Error fetching JSON:", error));
}

function fetchFrequentQuestions(subject) {
    let link = document.getElementById(subject);
    let currActiveLink = document.getElementById(currentActiveLink);
    console.log('currentActiveLink = ', currentActiveLink);
    console.log('currActiveLink Ele = ', currActiveLink);
    console.log(subject);
    console.log(link);
    let topic = document.getElementById("current-topic");
    if (link) {
        link.classList.add("active-link");
        currActiveLink.classList.remove("active-link");
        currentActiveLink = subject;
    }
    if (subject === "all") {
        topic.innerHTML =  "সকল বিষয় এর জিজ্ঞাসা সমূহ";
        return allTopics;
    } else {
        topic.innerHTML = `${subject} এর জিজ্ঞাসা সমূহ `;
        return topics[subject];
    }
}

function clearHistory() {
    localStorage.setItem('recent_questions', JSON.stringify([]));
    let recentEle = document.getElementById("recent_questions");
    recentEle.innerHTML = "<small>আপনি এখনও কিছু জিজ্ঞাসা করেননি</small>";
    document.getElementById("delete-history-btn").style.display = "none";
    $('#exampleModal').modal('hide');
}


function filterFrequentQuestions(term) {
    let recentEle = document.getElementById("frequent_questions");
    if (term) {
        let filtered = allTopics.filter(question => question.includes(term));
        if (filtered.length > 0) {
            recentEle.innerHTML = '';
            initializeFrequentQuestions(filtered);
        } else {
            recentEle.innerHTML = 'কিছু পাওয়া যায় নি';
        }
    } else {
        recentEle.innerHTML = '';
        initializeFrequentQuestions(allTopics);
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
    for (let i = 0; i < questions.length; i++) {
        appendFrequentQuestion(questions[i]);
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
    item.addEventListener("click", function () {
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
userInput.onkeyup = function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
}

async function sendMessage() {
    let userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return;

    let userInputs = [];
    userInputs = JSON.parse(localStorage.getItem('recent_questions')) || [];
    if (!userInputs.includes(userInput)) {
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
    loaderDiv.innerHTML = "<span>জানাচ্ছি,</span> <span>একটু</span> <span>অপেক্ষা</span> <span>করেন</span><span>.</span><span>.</span><span>.</span>";

    chatBox.appendChild(loaderDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        let response = await axios.post("https://api.together.xyz/v1/chat/completions", {
            model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an AI assistant specialized in answering questions about Islamic Questions like Iman, Namaz, Zakat, Hajj, Fasting. Provide accurate, concise, and respectful responses. If unsure about an answer, indicate the need for further research. Please provide the information formatted in Markdown. Preferred language is Bengali"
                },
                {role: "user", content: userInput},
            ]
        }, {
            headers: {"Authorization": "Bearer 146256ab83c558e84c2283e270855da846ff4ea4941a6cac109161c06167d88f"}
        });

        loaderDiv.remove();

        let botMessage = response.data.choices[0].message.content;
        const dirtyHtmlContent = marked.parse(botMessage);
        const htmlContent = DOMPurify.sanitize(dirtyHtmlContent);
        let botMessageDiv = document.createElement("div");
        botMessageDiv.classList.add("bot-message");
        chatBox.appendChild(botMessageDiv);

        const instance = new TypeIt(botMessageDiv, {
            html: true,
            speed: 10,
            afterStep: function (instance) {
                let chatBox = document.getElementById("chat-box-wrapper");
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }).type(htmlContent).go();
        instance.reset();
    } catch (error) {
        loaderDiv.remove();
        chatBox.innerHTML += `<div class='bot-message text-danger'>Error: Unable to fetch response.</div>`;
    }
}

function changeIcon(btn) {
    const button = document.getElementById(`${btn}-collapse-btn`);
    const icon = button.querySelector("i");
    if (icon.classList.contains("fa-plus")) {
        icon.classList.replace("fa-plus", "fa-minus");
    } else {
        icon.classList.replace("fa-minus", "fa-plus");
    }
}

function toggleMenuIcon() {
    const button = document.getElementById('toggle-menu');
    const icon = button.querySelector("span");
    if (icon.classList.contains("fa-bars")) {
        icon.classList.replace("fa-bars", "fa-xmark");
    } else {
        icon.classList.replace("fa-xmark", "fa-bars");
    }
}
