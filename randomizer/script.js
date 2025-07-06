let userLevel = 30;
let recents = [];
let recentsMaxSize = 5;
const maxIterationsBeforeBreak = 100000;
let blacklist = [];
let items = [];
let dlcActive = 1; // 0: DLC Off, 1: DLC Sometimes, 2: DLC On
let version = 10;

document.getElementById("generate-button").addEventListener("click", () => {
    console.log("Generate button clicked");
    generate();
});
document.getElementById("minus-button").addEventListener("click", () => {
    console.log("Minus button clicked");
    changeLevel(-1);
});
document.getElementById("plus-button").addEventListener("click", () => {
    console.log("Plus button clicked");
    changeLevel(1);
});
document.getElementById("remove-button").addEventListener("click", () => {
    console.log("Remove button clicked");
    removeItem();
});
document.getElementById("dlc-button").addEventListener("click", () => {
    console.log("DLC button clicked");
    dlcActive = (dlcActive + 1) % 3; // Cycle through 0, 1, 2
    updateDlcButton();
});
document.getElementById("version-button").addEventListener("click", () => {
    console.log("Version button clicked");
    version = version === 10 ? 9 : 10; // Cycle between versions 9- and 10+
    document.getElementById("version-button").innerText = `Version: ${version}`;
});

function updateDlcButton() {
    const dlcButton = document.getElementById("dlc-button");
    if (dlcActive == 0) {
        dlcButton.innerText = "DLC: Off";
    } else if (dlcActive == 1) {
        dlcButton.innerText = "DLC: 50%";
    } else if (dlcActive == 2) {
        dlcButton.innerText = "DLC: On";
    }
}

function changeLevel(change) {
    // validate argument, since only 1 weapon is available at lv1 we
    // don't allow the user to set it that low
    if (userLevel >= 30 && change > 0) {
        return;
    }
    if (userLevel <= 2 && change < 0) {
        return;
    }
    userLevel += change;
    document.getElementById("level-text").innerText = userLevel;
    console.log("User level changed to: ", userLevel);

    if (userLevel <= 6) {
        recentsMaxSize = 1;
    } else {
        recentsMaxSize = 5;
    }

    // Clear recents
    recents = [];

    // trigger a new item generation after the level is changed
    generate();
}

function generate() {
    if (items.length === 0) {
        console.error("Items data is not loaded");
        return;
    }

    let item = getRandomItem();
    let iterations = 0;

    // generate until something is found that meets criteria
    while (
        item.level > userLevel ||
        item.version > version ||
        blacklist.includes(item.main) ||
        recents.includes(item.main) ||
        (item.weight && Math.random() > item.weight)
    ) {
        item = getRandomItem();
        iterations++;
        if (iterations > maxIterationsBeforeBreak) break; // failsafe
    }

    // debug
    console.log(
        `iterations: ${iterations}, recents: ${JSON.stringify(recents)}`
    );

    // keep track of recent rolls to make results more varied
    recents.push(item.main);
    if (recents.length > recentsMaxSize) {
        recents.shift();
    }

    // convert to dlc when appropriate
    if (item.dlc && dlcActive == 2) {
        document.getElementById("item-name").innerText = item.dlc;
        document.getElementById(
            "main-image"
        ).src = `sprites/main/dlc/${item.dlc}.png`;
    } else if (item.dlc && dlcActive == 1 && Math.random() < 0.5) {
        document.getElementById("item-name").innerText = item.dlc;
        document.getElementById(
            "main-image"
        ).src = `sprites/main/dlc/${item.dlc}.png`;
    } else {
        document.getElementById("item-name").innerText = item.main;
        document.getElementById(
            "main-image"
        ).src = `sprites/main/${item.main}.png`;
    }

    document.getElementById("sub-image").src = `sprites/sub/${item.sub}.png`;
    document.getElementById(
        "special-image"
    ).src = `sprites/special/${item.special}.png`;

    console.log("Generated item: ", item);
}

function getRandomItem() {
    return items[Math.floor(Math.random() * items.length)];
}

function removeItem() {
    const itemName = document.getElementById("item-name").innerText;
    blacklist.push(itemName);
    generate();
}

// Fetch items.json
fetch("./items.json")
    .then((response) => {
        if (!response.ok) {
            throw new Error(
                "Network response was not ok " + response.statusText
            );
        }
        return response.json();
    })
    .then((data) => {
        console.log("Data fetched successfully:", data);
        items = data; // set items to the fetched array

        if (!Array.isArray(items)) {
            throw new Error("Items data is not an array");
        }

        // generate a set when user loads the page
        generate();
    })
    .catch((error) => console.error("Error loading items.json:", error));

// Initialize the DLC button text
updateDlcButton();
