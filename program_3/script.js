const gameContainer = document.getElementById("game-container");
const player = document.getElementById("player");
const stairsContainer = document.getElementById("stairs-container");
const scoreDisplay = document.getElementById("score");
const healthBarFill = document.getElementById("health-bar-fill");
const healthText = document.getElementById("health-text"); // 正確引用血量數字顯示元素

let playerX = gameContainer.offsetWidth / 2; // 玩家初始 X
let playerY = gameContainer.offsetHeight / 2;     // 玩家初始 Y
let velocityY = 0;                                // 垂直速度
let gravity = 0.5;                                // 重力
let score = 0;                                    // 分數
let stairs = [];                                  // 樓梯陣列
let isGameOver = false;
let health = 10000;                                 // 初始生命值
let moveLeft = false;
let moveRight = false;
const moveSpeed = 4; // 玩家水平移動速度
let stairSpeed = 2; // 樓梯上升速度
let createstairSpeed= 100;// 樓梯生成間隔速度
player.style.left = `${playerX}px`;
player.style.top = `${playerY}px`;

// ** 創建初始樓梯 **
function createInitialStair() {
    const stair = document.createElement("div");
    stair.classList.add("stair");
    stair.style.left = `${playerX }px`; // 與玩家對齊
    stair.style.bottom = `${gameContainer.offsetHeight / 220}px`; // 適當位置
    stairsContainer.appendChild(stair);
    stairs.push(stair);
}

// 創建樓梯
function createStair() {
    const stair = document.createElement("div");
    stair.classList.add("stair");

    // 隨機決定樓梯類型
    if (Math.random() < 0.2) {
        stair.classList.add("spike"); // 20% 機率為地刺樓梯
    }

    stair.style.left = Math.random() * (gameContainer.offsetWidth - 100) + "px";
    stair.style.bottom = "0px";
    stairsContainer.appendChild(stair);
    stairs.push(stair);
}

// 移動樓梯
function moveStairs() {
    stairs.forEach((stair, index) => {
        const bottom = parseFloat(stair.style.bottom);
        if (bottom > gameContainer.offsetHeight) {
            stair.remove();
            stairs.splice(index, 1);
            score++;
            scoreDisplay.textContent = `分數: ${score}`; // 顯示分數
        } else {
            stair.style.bottom = bottom + stairSpeed + "px";
        }
    });
}

let lastHealth = health; // 追蹤上一次的健康值

// 更新血條
function updateHealthBar() {
    if (health !== lastHealth) { // 只有在健康值改變時才更新
        const healthPercentage = (health / 10000) * 100;
        healthBarFill.style.width = `${Math.max(0, healthPercentage)}%`; // 更新血條寬度
        healthText.textContent = `${health}`; // 更新血量數字
        lastHealth = health; // 更新追蹤值
    }
}

// 確認碰撞
let isInSpike = false; // 標誌，確保玩家僅在第一次碰撞地刺樓梯時扣血

function checkCollision() {
    let isOnStair = false;

    stairs.forEach(stair => {
        const stairRect = stair.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        // 碰撞檢測：玩家是否與樓梯重疊
        if (
            playerRect.bottom >= stairRect.top &&
            playerRect.bottom <= stairRect.top + 30 &&
            playerRect.right > stairRect.left &&
            playerRect.left < stairRect.right &&
            velocityY >= 0 // 僅處理下墜過程中的碰撞
        ) {
            isOnStair = true;

            // 碰到地刺樓梯
            if (stair.classList.contains("spike") && !isInSpike) {
                isInSpike = true;  // 設置為已經進入地刺區域，防止重複扣血
                health = Math.max(0, health - 100); // 地刺樓梯扣血
                updateHealthBar(); // 更新血條
            }
            // 碰到其他類型的樓梯
            else if (!stair.classList.contains("spike")) {
                health = Math.min(10000, health + 2); // 其它樓梯回血
                updateHealthBar(); // 更新血條
            }

            // 使玩家停留在樓梯上
            playerY = stairRect.top - playerRect.height;
            velocityY = 0; // 停止垂直速度，防止穿過樓梯
        }
    });
    
    if (isOnStair) {
        velocityY = 0; // 當站在樓梯上時，重置垂直速度，防止玩家穿透樓梯
    }else{
        velocityY += gravity;// 若未碰撞到樓梯，則依重力下墜
    }
    if(score > stairSpeed ** 2 * 10){
        stairSpeed += 0.1;
        if(createstairSpeed > 20)
            createstairSpeed -= 20;
    }

    if (playerY > gameContainer.offsetHeight || health <= 0) {
        isGameOver = true;
    }
}

// 玩家移動
function movePlayer() {
    if (moveLeft) {
        playerX -= moveSpeed;
    }
    if (moveRight) {
        playerX += moveSpeed;
    }

    // 限制玩家不超出遊戲區域
    if (playerX < 0) playerX = 0;
    if (playerX > gameContainer.offsetWidth - 50) playerX = gameContainer.offsetWidth - 50;
}

// 每當玩家離開地刺樓梯區域時，重置 isInSpike 標誌
function resetSpikeStatus() {
    isInSpike = false;
}

// 遊戲主循環
function gameLoop() {
    if (isGameOver) {
        alert(`遊戲結束！您的分數是 ${score}`);
        window.location.reload();
        return;
    }
    
    movePlayer();  // 更新玩家位置
    moveStairs();  // 更新樓梯位置
    checkCollision(); // 確認碰撞

    playerY += velocityY; // 更新玩家垂直位置
    player.style.top = `${playerY}px`;
    player.style.left = `${playerX}px`;

    // 如果玩家已經超過樓梯區域，重置地刺區域的標誌
    stairs.forEach(stair => {
        const stairRect = stair.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        if (playerRect.bottom < stairRect.top) {
            resetSpikeStatus();
        }
    });
    requestAnimationFrame(gameLoop);
}

// 按下方向鍵
document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
        moveLeft = true;
    } else if (event.key === "ArrowRight") {
        moveRight = true;
    }
});

// 放開方向鍵
document.addEventListener("keyup", event => {
    if (event.key === "ArrowLeft") {
        moveLeft = false;
    } else if (event.key === "ArrowRight") {
        moveRight = false;
    }
});

// 初始化
createInitialStair(); // 創建初始樓梯
setInterval(createStair, createstairSpeed); // 不斷生成樓梯
gameLoop();
