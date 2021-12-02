let userName
let socket = io();

do {
    userName = prompt('Enter your Name: ')
} while (!userName);

const textArea = document.querySelector('#textArea')
const submitButton = document.querySelector('#submitButton')
const COMMENT_BOX = document.querySelector('#commentBox')

submitButton.addEventListener('click', (e) => {
    e.preventDefault();

    let comment = textArea.value;
    if (!comment) {
        return;
    }

    postComment(comment);
})


const postComment = (comment) => {
    // APPEND to DOM
    let data = {
        userName: userName,
        comment: comment
    };
    appendToDom(data);
    textArea.value = '';
    // BROADCAST
    broadcastComment(data);
    // SYNC WITH MONGO-DB
    syncWithDB(data);
}

const appendToDom = (data) => {
    let lTag = document.createElement('li');
    lTag.classList.add('comment', 'mb-3');

    let markup = `
        <div class="card border-light mb-3" >
            <div class="card-body" >
                <h6>${data.userName}</h6>
                <p>${data.comment}</p>
                <div class="clock-img">
                    <img src="./img/clock.png" alt="clock">
                    <small>${moment(data.time).format('LT')}</small>
                </div>
            </ >
        </div >
    `

    lTag.innerHTML = markup;
    COMMENT_BOX.prepend(lTag);

}

const broadcastComment = (data) => {
    // Socket
    socket.emit('comment', data);
}

socket.on('comment', (data) => {
    appendToDom(data);
});

let timerId = null;
const debounce = (func, timer) => {
    if (timerId) {
        clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
        func();
    }, timer);
}

let typingDiv = document.querySelector('.typing')
socket.on('typing', (data) => {
    typingDiv.innerText = `${data.userName} is typing...`
    // DEBOUNCE
    debounce(function () {
        typingDiv.innerText = '';
    }, 500);
})

// Event Listner on Text Area {Typing...}
textArea.addEventListener('keyup', (e) => {
    socket.emit('typing', { userName })
})

// API CALLS
const syncWithDB = (data) => {
    const headers = {
        'Content-Type': 'application/json'
    }
    fetch('/api/comments', { method: 'Post', body: JSON.stringify(data), headers })
        .then(response => response.json())
        .then(result => {
            console.log(result)
        })
}

const fetchComments = () => {
    fetch('/api/comments')
        .then(res => res.json())
        .then(result => {
            result.forEach(comment => {
                comment.userName = comment.username
                comment.time = comment.createdAt
                appendToDom(comment)
            });
            console.log(result);
        })
}

window.onload = fetchComments