function getHeader() {
    return `
    <div class="header">
        <p class="title" id="title">Kanban Project Management Tool</p>
        <div class="circle">
            <a href="help.html" class="helpButton" aria-label="Help">
                <img class="questionCircle" src="../assets/icons/questionsCircle.svg" alt="">
            </a>
            <button type="button" class="profileButton" aria-haspopup="true" aria-expanded="false" aria-label="Profile menu">
                <div class="nameKuerzel">G</div>
            </button>
            <nav class="profileMenu" aria-label="Profile menu" hidden>
                <a class="profileMenuItem" href="legal.html">Legal Notice</a>
                <a class="profileMenuItem" href="privacy.html">Privacy Policy</a>
                <button type="button" class="profileMenuItem logoutButton">Log out</button>
            </nav>
        </div>
    </div>
    `;
}

function getHeaderResponsive() {
    return `
    <img class="logo" src="../assets/icons/logoResponsive.svg" alt="Join Logo">
    <div class="header">
        <div class="circle">
            <a href="help.html" class="helpButton" aria-label="Help">
                <img class="questionCircle" src="../assets/icons/questionsCircle.svg" alt="">
            </a>
            <button type="button" class="profileButton" aria-haspopup="true" aria-expanded="false" aria-label="Profile menu">
                <div class="nameKuerzel">G</div>
            </button>
            <nav class="profileMenu" aria-label="Profile menu" hidden>
                <a class="profileMenuItem" href="legal.html">Legal Notice</a>
                <a class="profileMenuItem" href="privacy.html">Privacy Policy</a>
                <button type="button" class="profileMenuItem logoutButton">Log out</button>
            </nav>
        </div>
    </div>
    `;
}

function getMenuBoard() {
    return `
    <img class="logo" src="../assets/icons/joinDesktop.svg" alt="Join Logo">
    <nav class="menuContainer">
        <a class="menuItems" href="../html/summary.html"> <img src="../assets/icons/summary.svg" alt="Summary Icon"><p>Summary</p></a>
        <a class="menuItems" href="../html/addTask.html"> <img src="../assets/icons/addTask.svg" alt="Add Task Icon"><p>Add Task</p></a>
        <a class="menuItems" href="../html/board.html"> <img src="../assets/icons/board.svg" alt="Board Icon"><p>Board</p></a>
        <a class="menuItems" href="../html/contacts.html"> <img src="../assets/icons/contacts.svg" alt="Contacts Icon"><p>Contacts</p></a>
        <a class="menuItems menuItems--login" href="../html/login.html" hidden><p>Log in</p></a>
        <a class="menuItems menuItems--login" href="../html/login.html" hidden><p>Log in</p></a>
    </nav>
    <div class="menuContainer" id="policyContainer">
        <a class="menuItems" href="../html/privacy.html"> <p>Privacy Policy</p></a>
        <a class="menuItems" href="../html/legal.html"> <p>Legal notice</p></a>
    </div>
    `;
}

function getMenuBoardResponsive() {
    return `
    <nav class="menuContainer" id="menuContainer">
        <a class="menuItems" href="../html/summary.html"> <img src="../assets/icons/summary.svg" alt="Summary Icon">Summary</a>
        <a class="menuItems" href="../html/addTask.html"> <img src="../assets/icons/addTask.svg" alt="Add Task Icon">Add Task</a>
        <a class="menuItems" href="../html/board.html"> <img src="../assets/icons/board.svg" alt="Board Icon">Board</a>
        <a class="menuItems" href="../html/contacts.html"> <img src="../assets/icons/contacts.svg" alt="Contacts Icon">Contacts</a>
        <a class="menuItems menuItems--login" href="../html/login.html" hidden>Log in</a>
    </nav>
    `;
}

function desktop() {
    document.getElementById('topHeaderLegal').innerHTML = getHeader();
    document.getElementById('menuBoardLegal').innerHTML = getMenuBoard();
}

function mobile() {
    document.getElementById('topHeaderResponsiveLegal').innerHTML = getHeaderResponsive();
    document.getElementById('menuBoardResponsiveLegal').innerHTML = getMenuBoardResponsive();
}

function init() {
    desktop();
    mobile();  
}

init();