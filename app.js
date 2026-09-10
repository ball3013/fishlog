// ========================================
// FISHLOG - APP.JS
// ========================================

// ---------- USER SYSTEM ----------

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem("fishUsers")) || [];
    } catch (error) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem("fishUsers", JSON.stringify(users));
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("currentUser"));
    } catch (error) {
        return null;
    }
}

function requireLogin() {
    var user = getCurrentUser();

    if (!user) {
        window.location.href = "login.html";
        return false;
    }

    return true;
}

function logoutUser() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

function goHome() {
    window.location.href = "index.html";
}


// ---------- REGISTER ----------

function registerUser(event) {

    if (event) {
        event.preventDefault();
    }

    var nameElement = document.getElementById("registerName");
    var usernameElement = document.getElementById("registerUsername");
    var passwordElement = document.getElementById("registerPassword");
    var confirmElement = document.getElementById("registerConfirmPassword");

    if (!nameElement || !usernameElement || !passwordElement || !confirmElement) {
        alert("ไม่พบช่องข้อมูลสมัครสมาชิก");
        return false;
    }

    var name = nameElement.value.trim();
    var username = usernameElement.value.trim();
    var password = passwordElement.value;
    var confirmPassword = confirmElement.value;

    if (!name || !username || !password || !confirmPassword) {
        alert("กรุณากรอกข้อมูลให้ครบ");
        return false;
    }

    if (password !== confirmPassword) {
        alert("รหัสผ่านไม่ตรงกัน");
        return false;
    }

    var users = getUsers();

    var newUsername = username.toLowerCase();

    for (var i = 0; i < users.length; i++) {

        var oldUsername = "";

        if (users[i] && users[i].username) {
            oldUsername = String(users[i].username);
        }

        if (oldUsername.toLowerCase() === newUsername) {
            alert("ชื่อผู้ใช้นี้มีอยู่แล้ว");
            return false;
        }
    }

    var newUser = {
        id: Date.now().toString(),
        name: name,
        username: username,
        password: password
    };

    users.push(newUser);

    saveUsers(users);

    alert("สมัครสมาชิกสำเร็จ");

    window.location.href = "login.html";

    return false;
}


// ---------- LOGIN ----------

function loginUser(event) {

    if (event) {
        event.preventDefault();
    }

    var usernameElement = document.getElementById("loginUsername");
    var passwordElement = document.getElementById("loginPassword");

    if (!usernameElement || !passwordElement) {
        alert("ไม่พบช่องเข้าสู่ระบบ");
        return false;
    }

    var username = usernameElement.value.trim();
    var password = passwordElement.value;

    if (!username || !password) {
        alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
        return false;
    }

    var users = getUsers();

    var loginUsername = username.toLowerCase();
    var foundUser = null;

    for (var i = 0; i < users.length; i++) {

        if (!users[i]) {
            continue;
        }

        var savedUsername = users[i].username
            ? String(users[i].username).toLowerCase()
            : "";

        var savedPassword = users[i].password
            ? String(users[i].password)
            : "";

        if (
            savedUsername === loginUsername &&
            savedPassword === password
        ) {
            foundUser = users[i];
            break;
        }
    }

    if (!foundUser) {
        alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        return false;
    }

    localStorage.setItem(
        "currentUser",
        JSON.stringify(foundUser)
    );

    window.location.href = "index.html";

    return false;
}


// ---------- PAGE LOGIN CHECK ----------

function checkPageLogin() {

    var user = getCurrentUser();

    var page = window.location.pathname.toLowerCase();

    var isLoginPage =
        page.indexOf("login.html") !== -1;

    var isRegisterPage =
        page.indexOf("register.html") !== -1;

    if (
        !user &&
        !isLoginPage &&
        !isRegisterPage
    ) {
        window.location.href = "login.html";
        return;
    }

    if (
        user &&
        (isLoginPage || isRegisterPage)
    ) {
        window.location.href = "index.html";
        return;
    }

    var userNameElements =
        document.querySelectorAll("[data-user-name]");

    userNameElements.forEach(function (element) {

        element.textContent =
            user.name ||
            user.username ||
            "USER";

    });
}


// ========================================
// FISH STORAGE
// ========================================

function getFishKey() {

    var user = getCurrentUser();

    if (!user) {
        return null;
    }

    return "fishList_" + user.id;
}


function getFishList() {

    var key = getFishKey();

    if (!key) {
        return [];
    }

    try {

        var list =
            JSON.parse(localStorage.getItem(key));

        return Array.isArray(list)
            ? list
            : [];

    } catch (error) {

        return [];
    }
}


function saveFishList(list) {

    var key = getFishKey();

    if (!key) {
        return;
    }

    localStorage.setItem(
        key,
        JSON.stringify(list)
    );
}


// ========================================
// SAVE FISH
// ========================================

function saveFish(event) {

    if (event) {
        event.preventDefault();
    }

    if (!requireLogin()) {
        return false;
    }

    var fishType =
        getValue("fishType");

    var weight =
        getValue("weight");

    var length =
        getValue("length");

    var bait =
        getValue("bait");

    var location =
        getValue("location");

    var date =
        getValue("date");

    var fishTime =
        getValue("fishTime");

    var weather =
        getValue("weather");

    var waterCondition =
        getValue("waterCondition");

    var note =
        getValue("note");

    var photoElement =
        document.getElementById("photo");

    if (!fishType) {
        alert("กรุณาระบุชนิดปลา");
        return false;
    }

    if (!weight) {
        alert("กรุณาระบุน้ำหนักปลา");
        return false;
    }

    var photo = "";

    if (
        photoElement &&
        photoElement.files &&
        photoElement.files.length > 0
    ) {

        var file =
            photoElement.files[0];

        var reader =
            new FileReader();

        reader.onload = function (e) {

            photo = e.target.result;

            createAndSaveFish(
                fishType,
                weight,
                length,
                bait,
                location,
                date,
                fishTime,
                weather,
                waterCondition,
                note,
                photo
            );
        };

        reader.readAsDataURL(file);

    } else {

        createAndSaveFish(
            fishType,
            weight,
            length,
            bait,
            location,
            date,
            fishTime,
            weather,
            waterCondition,
            note,
            photo
        );
    }

    return false;
}


// ========================================
// CREATE FISH
// ========================================

function createAndSaveFish(
    fishType,
    weight,
    length,
    bait,
    location,
    date,
    fishTime,
    weather,
    waterCondition,
    note,
    photo
) {

    var fishList =
        getFishList();

    var fish = {

        id: Date.now().toString(),

        fishType: fishType,

        weight: Number(weight),

        length: Number(length || 0),

        bait: bait,

        location: location,

        date: date,

        fishTime: fishTime,

        weather: weather,

        waterCondition: waterCondition,

        note: note,

        photo: photo
    };

    fishList.push(fish);

    saveFishList(fishList);

    alert("บันทึกประวัติปลาเรียบร้อยแล้ว");

    window.location.href =
        "history.html";
}


// ========================================
// PHOTO PREVIEW
// ========================================

function setupPhotoPreview() {

    var photoInput =
        document.getElementById("photo");

    var preview =
        document.getElementById("photoPreview");

    if (!photoInput || !preview) {
        return;
    }

    photoInput.addEventListener(
        "change",
        function () {

            var file =
                photoInput.files[0];

            if (!file) {

                preview.style.display =
                    "none";

                preview.src = "";

                return;
            }

            var reader =
                new FileReader();

            reader.onload =
                function (event) {

                    preview.src =
                        event.target.result;

                    preview.style.display =
                        "block";
                };

            reader.readAsDataURL(file);
        }
    );
}


// ========================================
// DASHBOARD
// ========================================

function loadDashboard() {

    if (!requireLogin()) {
        return;
    }

    var fishList =
        getFishList();

    var totalFish =
        fishList.length;

    var biggestWeight = 0;

    fishList.forEach(function (fish) {

        var weight =
            Number(fish.weight || 0);

        if (weight > biggestWeight) {
            biggestWeight = weight;
        }
    });

    var totalFishElement =
        document.getElementById("totalFish");

    if (totalFishElement) {
        totalFishElement.textContent =
            totalFish;
    }

    var biggestElement =
        document.getElementById("biggestFish");

    if (biggestElement) {

        biggestElement.textContent =
            biggestWeight.toFixed(2) + " kg";
    }

    loadWeightRanking();
}


// ========================================
// WEIGHT RANKING
// น้ำหนักปลาต่อตัว
// ไม่รวมยอดน้ำหนัก
// ========================================

function loadWeightRanking() {

    var rankingElement =
        document.getElementById("weightRanking");

    if (!rankingElement) {
        return;
    }

    var fishList =
        getFishList();

    // เรียงปลาจากหนักสุด -> เบาสุด
    fishList.sort(function (a, b) {

        return (
            Number(b.weight || 0) -
            Number(a.weight || 0)
        );

    });

    if (fishList.length === 0) {

        rankingElement.innerHTML = `
            <div class="empty-ranking">
                ยังไม่มีข้อมูลปลา
            </div>
        `;

        return;
    }

    rankingElement.innerHTML = "";

    fishList.forEach(function (fish, index) {

        var weight =
            Number(fish.weight || 0);

        var rankClass = "";

        if (index === 0) {
            rankClass = "rank-1";
        } else if (index === 1) {
            rankClass = "rank-2";
        } else if (index === 2) {
            rankClass = "rank-3";
        }

        var item =
            document.createElement("div");

        item.className =
            "ranking-item " +
            rankClass;

        item.innerHTML = `

            <div class="ranking-number">
                ${index + 1}
            </div>

            <div class="ranking-fish">
                ${escapeHTML(
                    fish.fishType ||
                    "ไม่ระบุชื่อปลา"
                )}
            </div>

            <div class="ranking-weight">
                ${weight.toFixed(2)} kg
            </div>

        `;

        rankingElement.appendChild(item);
    });
}


// ========================================
// HISTORY
// ========================================

function loadHistory() {

    if (!requireLogin()) {
        return;
    }

    var historyElement =
        document.getElementById("historyList");

    if (!historyElement) {
        return;
    }

    var fishList =
        getFishList();

    if (fishList.length === 0) {

        historyElement.innerHTML = `
            <div class="empty-history">
                ยังไม่มีประวัติการตกปลา
            </div>
        `;

        return;
    }

    // ใหม่สุดก่อน
    fishList.sort(function (a, b) {

        return Number(b.id) -
            Number(a.id);

    });

    historyElement.innerHTML = "";

    fishList.forEach(function (fish) {

        var imageHTML = "";

        if (fish.photo) {

            imageHTML = `
                <img
                    src="${fish.photo}"
                    class="history-fish-image"
                    alt="Fish"
                >
            `;

        } else {

            imageHTML = `
                <div class="history-no-image">
                    🐟
                </div>
            `;
        }

        var card =
            document.createElement("div");

        card.className =
            "history-card";

        card.innerHTML = `

            <div class="history-image-box">
                ${imageHTML}
            </div>

            <div class="history-info">

                <div class="history-fish-name">
                    ${escapeHTML(
                        fish.fishType ||
                        "ไม่ระบุชื่อปลา"
                    )}
                </div>

                <div class="history-weight">
                    ${Number(
                        fish.weight || 0
                    ).toFixed(2)} kg
                </div>

                <div class="history-detail">
                    📅 ${formatDate(fish.date)}
                </div>

                <div class="history-detail">
                    📍 ${escapeHTML(
                        fish.location || "-"
                    )}
                </div>

                <div class="history-detail">
                    🎣 ${escapeHTML(
                        fish.bait || "-"
                    )}
                </div>

            </div>

            <button
                class="delete-fish"
                onclick="deleteFish('${fish.id}')"
            >
                ลบ
            </button>
        `;

        historyElement.appendChild(card);
    });
}


// ========================================
// DELETE FISH
// ========================================

function deleteFish(id) {

    if (!confirm("ต้องการลบประวัตินี้หรือไม่?")) {
        return;
    }

    var fishList =
        getFishList();

    fishList =
        fishList.filter(function (fish) {

            return String(fish.id) !==
                String(id);

        });

    saveFishList(fishList);

    loadHistory();

    loadDashboard();
}


// ========================================
// DOWNLOAD CATCH CARD
// ========================================

function downloadCatchCard(id) {

    var fishList =
        getFishList();

    var fish =
        fishList.find(function (item) {

            return String(item.id) ===
                String(id);

        });

    if (!fish) {
        alert("ไม่พบข้อมูลปลา");
        return;
    }

    var text =

        "FISHLOG CATCH RECORD\n\n" +

        "ปลา: " +
        (fish.fishType || "-") +
        "\n" +

        "น้ำหนัก: " +
        Number(fish.weight || 0)
            .toFixed(2) +
        " kg\n" +

        "ความยาว: " +
        Number(fish.length || 0)
            .toFixed(2) +
        " cm\n" +

        "เหยื่อ: " +
        (fish.bait || "-") +
        "\n" +

        "สถานที่: " +
        (fish.location || "-") +
        "\n" +

        "วันที่: " +
        formatDate(fish.date) +
        "\n" +

        "เวลา: " +
        (fish.fishTime || "-") +
        "\n" +

        "สภาพอากาศ: " +
        (fish.weather || "-") +
        "\n" +

        "สภาพน้ำ: " +
        (fish.waterCondition || "-") +
        "\n\n" +

        "หมายเหตุ: " +
        (fish.note || "-");

    var blob =
        new Blob(
            [text],
            {
                type: "text/plain;charset=utf-8"
            }
        );

    var url =
        URL.createObjectURL(blob);

    var a =
        document.createElement("a");

    a.href = url;

    a.download =
        sanitizeFileName(
            fish.fishType ||
            "fish-record"
        ) +
        ".txt";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}


// ========================================
// UTILITIES
// ========================================

function getValue(id) {

    var element =
        document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value.trim();
}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    var date =
        new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        "th-TH",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


function shortenText(text, maxLength) {

    text =
        String(text || "");

    if (text.length <= maxLength) {
        return text;
    }

    return (
        text.substring(0, maxLength) +
        "..."
    );
}


function sanitizeFileName(name) {

    return String(name || "fish")
        .replace(/[\\/:*?"<>|]/g, "")
        .replace(/\s+/g, "_");
}


function escapeHTML(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function setText(id, text) {

    var element =
        document.getElementById(id);

    if (element) {
        element.textContent = text;
    }
}


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        checkPageLogin();

        setupPhotoPreview();

        if (
            document.getElementById("totalFish") ||
            document.getElementById("weightRanking")
        ) {
            loadDashboard();
        }

        if (
            document.getElementById("historyList")
        ) {
            loadHistory();
        }

    }
);