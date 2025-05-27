const slider = document.getElementById("slider");
const sliderValue = document.getElementById("slider-value");
const textToSize = document.getElementById("text-to-size");
const sizeInput = document.getElementById("sizeInput");
const sizeError = document.getElementById("sizeError");



let boxes = slider.value
const svg = document.getElementById('mazeArea')
const svgNS = "http://www.w3.org/2000/svg"

let mazeSize = 0
let cellSize = 0
let gridRestriction = []
let penampungFindingPath = []


function updateControlPositions() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const body = document.body;

    body.classList.remove('layout-landscape', 'layout-portrait');

    if (viewportWidth > viewportHeight) {
        body.classList.add('layout-landscape');
        console.log("Layout set to: Landscape (Kontrol Kanan, Analog Kiri)");
    } else {
        body.classList.add('layout-portrait');
        console.log("Layout set to: Portrait (Kontrol Atas, Analog Bawah)");
    }
}

window.addEventListener('load', updateControlPositions);

window.addEventListener('resize', updateControlPositions);


function sizing() {
    if (!svg) {
        cellSize = 2;
        return;
    }
    const numBoxes = parseInt(boxes);
    if (isNaN(numBoxes) || numBoxes <= 0) {
        cellSize = 2
        return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let targetSvgSideLength;

    if (viewportWidth > viewportHeight) {
        targetSvgSideLength = viewportHeight * 0.90;
    } else {
        targetSvgSideLength = viewportWidth * 0.90;
    }

    targetSvgSideLength = Math.max(50, targetSvgSideLength);

    svg.setAttribute('width', targetSvgSideLength.toString());
    svg.setAttribute('height', targetSvgSideLength.toString())

    const baseMazeSize = targetSvgSideLength;

    cellSize = Math.floor(baseMazeSize / numBoxes);
    cellSize = Math.max(2, cellSize);

    const finalViewBoxSize = cellSize * numBoxes;
    svg.setAttribute('viewBox', `0 0 ${finalViewBoxSize} ${finalViewBoxSize}`);

    const strokeWidth = Math.max(1, Math.floor(cellSize / 8));


}



function setGridRestriction() {
    gridRestriction = []
    for (let i = 0; i < boxes; i++) {
        let penampungkeKanan = []
        for (let x = 0; x < boxes; x++) {
            penampungkeKanan.push({
                keKanan: x,
                keBawah: i,
                visited: false,
                walls: { top: true, right: true, bottom: true, left: true }
            })
        }
        gridRestriction.push(penampungkeKanan)
    }
}

function checkPlusGachaNextPath(orderan, currentGrid) {
    let blomKebuka = []
    const x = orderan.keKanan
    const y = orderan.keBawah

    if (y > 0 && currentGrid[y - 1][x] && !currentGrid[y - 1][x].visited) {
        blomKebuka.push(currentGrid[y - 1][x])
    }
    if (x < boxes - 1 && currentGrid[y][x + 1] && !currentGrid[y][x + 1].visited) {
        blomKebuka.push(currentGrid[y][x + 1])
    }
    if (y < boxes - 1 && currentGrid[y + 1][x] && !currentGrid[y + 1][x].visited) {
        blomKebuka.push(currentGrid[y + 1][x])
    }
    if (x > 0 && currentGrid[y][x - 1] && !currentGrid[y][x - 1].visited) {
        blomKebuka.push(currentGrid[y][x - 1])
    }

    if (blomKebuka.length > 0) {
        const gachaNextPath = Math.floor(Math.random() * blomKebuka.length)
        return blomKebuka[gachaNextPath]
    } else {
        return undefined
    }
}

function removeRestriction(sekarang, next) {
    let checkKananKiri = sekarang.keKanan - next.keKanan
    let checkBawahAtas = sekarang.keBawah - next.keBawah

    if (checkKananKiri === 1) {
        sekarang.walls.left = false
        next.walls.right = false
    } else if (checkKananKiri === -1) {
        sekarang.walls.right = false
        next.walls.left = false
    }

    if (checkBawahAtas === 1) {
        sekarang.walls.top = false
        next.walls.bottom = false
    } else if (checkBawahAtas === -1) {
        sekarang.walls.bottom = false
        next.walls.top = false
    }
}

function findingPath() {
    penampungFindingPath = []
    let akseskeObject = gridRestriction[0][0]
    akseskeObject.visited = true
    let visitedCount = 1

    const totalCells = boxes * boxes

    while (visitedCount < totalCells) {
        let nextStep = checkPlusGachaNextPath(akseskeObject, gridRestriction)

        if (nextStep) {
            nextStep.visited = true
            visitedCount++
            penampungFindingPath.push(akseskeObject)
            removeRestriction(akseskeObject, nextStep)
            akseskeObject = nextStep
        } else if (penampungFindingPath.length > 0) {
            akseskeObject = penampungFindingPath.pop()
        } else {
            break
        }
    }
     console.log("findingPath")
}

function buatWallRestriction() {
    if (!svg) {
        console.error("SVG element not found")
        return
    }

    let pathGroup = svg.querySelector('.maze-paths')
    if (!pathGroup) {
        pathGroup = document.createElementNS(svgNS, 'g')
        pathGroup.setAttribute('class', 'maze-paths')
        svg.appendChild(pathGroup)
    }

    pathGroup.innerHTML = ''

    console.log("Drawing maze...")

    for (let i = 0; i < boxes; i++) {
        for (let x = 0; x < boxes; x++) {
            const cell = gridRestriction[i][x]
            const posX = x * cellSize
            const posY = i * cellSize

            if (cell.walls.top) {
                const line = document.createElementNS(svgNS, 'line')
                line.setAttribute('x1', posX)
                line.setAttribute('y1', posY)
                line.setAttribute('x2', posX + cellSize)
                line.setAttribute('y2', posY)
                pathGroup.appendChild(line)
            }
            if (cell.walls.right) {
                const line = document.createElementNS(svgNS, 'line')
                line.setAttribute('x1', posX + cellSize)
                line.setAttribute('y1', posY)
                line.setAttribute('x2', posX + cellSize)
                line.setAttribute('y2', posY + cellSize)
                pathGroup.appendChild(line)
            }
            if (cell.walls.bottom) {
                const line = document.createElementNS(svgNS, 'line')
                line.setAttribute('x1', posX + cellSize)
                line.setAttribute('y1', posY + cellSize)
                line.setAttribute('x2', posX)
                line.setAttribute('y2', posY + cellSize)
                pathGroup.appendChild(line)
            }
            if (cell.walls.left) {
                const line = document.createElementNS(svgNS, 'line')
                line.setAttribute('x1', posX)
                line.setAttribute('y1', posY + cellSize)
                line.setAttribute('x2', posX)
                line.setAttribute('y2', posY)
                pathGroup.appendChild(line)
            }
        }
    }

    console.log("buatWallRestriction")
}




function penandaStartFinish () {

    if (!svg || cellSize <= 0) {
        console.error("SVG not found or cellSize not calculated for markers")
        return
    }
    let startX = { keKanan: 0 , keBawah: 0}
    let finishX = { keKanan: boxes-1, keBawah: boxes-1 }


    let newElement = svg.querySelector ('.game-elements')

    if (!newElement) {
        newElement = document.createElementNS(svgNS, 'g')
        newElement.setAttribute('class', 'game-elements')
        const pathGroup = svg.querySelector('.maze-paths')
        if (pathGroup && pathGroup.nextSibling) {
             svg.insertBefore(newElement, pathGroup.nextSibling)
        } else {
             svg.appendChild(newElement)
        }
    }

    newElement.innerHTML = ''


    let ukuranPenanda = cellSize * 0.3
    let agarCenter = cellSize / 2


    let penandaStart = document.createElementNS(svgNS, "circle")

    penandaStart.setAttribute( "cx", startX.keKanan * cellSize + agarCenter)
    penandaStart.setAttribute( "cy", startX.keBawah * cellSize + agarCenter)
    penandaStart.setAttribute("r", ukuranPenanda)
    penandaStart.setAttribute("class", "marker penandaStart")
    penandaStart.setAttribute("fill", "lime")
    newElement.appendChild(penandaStart)


    let penandaFinish = document.createElementNS(svgNS, "circle")

    penandaFinish.setAttribute( "cx", finishX.keKanan * cellSize + agarCenter)
    penandaFinish.setAttribute( "cy", finishX.keBawah * cellSize + agarCenter)
    penandaFinish.setAttribute("r", ukuranPenanda)
    penandaFinish.setAttribute("class", "marker penandaFinish")
    penandaFinish.setAttribute("fill", "red")
    newElement.appendChild(penandaFinish)

    console.log("penandaStartFinish")
}

let explorerElement = null
let explorerPos = { keKanan: 0, keBawah: 0 }

function resetExplorer() {
    if (!svg || cellSize <= 0) {
        console.error("SVG not found or cellSize not calculated for explorer")
        return
    }
    let startX = { keKanan: 0 , keBawah: 0}



    let newElement = svg.querySelector('.game-elements')
    if (!newElement) {
        console.warn("Game elements group not found for explorer, attempting to create.")
        newElement = document.createElementNS(svgNS, 'g')
        newElement.setAttribute('class', 'game-elements')
        const pathGroup = svg.querySelector('.maze-paths')
        if (pathGroup && pathGroup.nextSibling) {
             svg.insertBefore(newElement, pathGroup.nextSibling)
        } else {
             svg.appendChild(newElement)
        }
    }


    if (explorerElement) {
        explorerElement.remove()
        explorerElement = null
    }


    explorerPos = { keKanan: startX.keKanan, keBawah: startX.keBawah }


    let ukuranPenjelajah = cellSize * 0.25
    let agarCenter = cellSize / 2


    explorerElement = document.createElementNS(svgNS, "circle")
    explorerElement.setAttribute("id", "explorer")
    explorerElement.setAttribute("r", ukuranPenjelajah)

    explorerElement.setAttribute("cx", explorerPos.keKanan * cellSize + agarCenter)
    explorerElement.setAttribute("cy", explorerPos.keBawah * cellSize + agarCenter)
    explorerElement.setAttribute("fill", "#00FFFF")

    newElement.appendChild(explorerElement)

    console.log("resetExplorer", explorerPos)
}

let tempNotification = document.getElementById('tempNotification')
let notificationTimeout
function showTemporaryNotification(message, duration) {

    if (typeof duration === 'undefined') {
        duration = 3000
    }

    if (tempNotification) {
        tempNotification.textContent = message
        tempNotification.style.display = 'block'

        clearTimeout(notificationTimeout)

        notificationTimeout = setTimeout(function() {
            tempNotification.style.display = 'none'
        }, duration);
    }
}

let isGenerating = false
let gameWon = false

function moveExplorer(dr, dc) {
    if (isGenerating || gameWon) return

    const currentBawah = explorerPos.keBawah
    const currentKanan = explorerPos.keKanan
    const targetBawah = currentBawah + dr
    const targetKanan = currentKanan + dc


    if (targetBawah < 0 || targetBawah >= boxes || targetKanan < 0 || targetKanan >= boxes) {
        return
    }


    let bisaGerak = false
    const currentCellData = gridRestriction?.[currentBawah]?.[currentKanan]
    const currentWalls = currentCellData?.walls

    if (!currentWalls) {
        console.error("Tidak bisa menemukan data dinding untuk sel saat ini:", explorerPos)
        return
    }

    if (dr === -1 && !currentWalls.top) {
        bisaGerak = true
    } else if (dr === 1 && !currentWalls.bottom) {
        bisaGerak = true
    } else if (dc === -1 && !currentWalls.left) {
        bisaGerak = true
    } else if (dc === 1 && !currentWalls.right) {
        bisaGerak = true
    }

    if (!bisaGerak) {
        return
    }


    explorerPos.keBawah = targetBawah
    explorerPos.keKanan = targetKanan

    const agarCenter = cellSize / 2
    const targetX = explorerPos.keKanan * cellSize + agarCenter
    const targetY = explorerPos.keBawah * cellSize + agarCenter

    let finishX = { keKanan: boxes-1, keBawah: boxes-1 }

    if (explorerElement) {

        explorerElement.setAttribute('cx', targetX)
        explorerElement.setAttribute('cy', targetY)
    }

    if (explorerPos.keBawah === finishX.keBawah && explorerPos.keKanan === finishX.keKanan) {
        gameWon = true
        explorerElement.setAttribute("fill", 'white');
        showTemporaryNotification(`Congrats! You completed the ${boxes} x ${boxes} Maze!`, 5000);
    }
}


const loadingOverlay = document.getElementById('loadingOverlay')

function generateMaze() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex'
    }
    isGenerating = true
    gameWon = false

        sizing()
        setGridRestriction()
        findingPath()
        buatWallRestriction()
        penandaStartFinish()
        resetExplorer()

        tempNotification.style.display = 'none'

        if (loadingOverlay) {
            setTimeout(function() {
                loadingOverlay.style.display = 'none';
            showTemporaryNotification("Enjoy your game!")}, 1000);
        }
    isGenerating = false

}

function handleKeyDown(event) {

    if (isGenerating || gameWon) {
        return;
    }

    switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
            event.preventDefault();
            moveExplorer(-1, 0);
            break;
        case "ArrowDown":
        case "s":
        case "S":
            event.preventDefault();
            moveExplorer(1, 0);
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            event.preventDefault();
            moveExplorer(0, -1);
            break;
        case "ArrowRight":
        case "d":
        case "D":
            event.preventDefault();
            moveExplorer(0, 1);
            break;
    }
}

function handleGenerateClick() {

    generateMaze();
    backgroundMusic.play()
        playPauseBtn.textContent = "Pause Music";
}

function handleWindowLoad() {
    console.log("generateMaze");
    generateMaze();

}

window.addEventListener('keydown', handleKeyDown);



slider.addEventListener("input", function() {
    let value = slider.value;
    sliderValue.textContent = `Current size: ${value}`;
    sizeInput.value = value;
    sizeError.style.display = 'none';
    boxes = value
  });


sizeInput.addEventListener("input", function() {
    let value = sizeInput.value

    if (value < 3 ) {
        sizeError.style.display = 'block'
        value = 3
    }
    if (value > 100) {
        sizeError.style.display = 'block'
        value = 100
    } else {
      sizeError.style.display = 'none';
    }
    sizeInput.value = value;
    slider.value = value;
    sliderValue.textContent = `Current size: ${value}`;
    boxes = value;
});



const generateBtn = document.getElementById('generateBtn');
if (generateBtn) {
    generateBtn.addEventListener('click', handleGenerateClick);
} else {
    console.error("generateBtn error");
}



window.addEventListener('load', handleWindowLoad);

const backgroundMusic = document.getElementById('backgroundMusic')
const playPauseBtn = document.getElementById('playPauseBtn')


function playPause (){
    if (backgroundMusic.paused) {
        backgroundMusic.play()
        playPauseBtn.textContent = "Pause Music";
      } else {
        backgroundMusic.pause();
        playPauseBtn.textContent = "Play Music";
      }
}
playPauseBtn.addEventListener('click', playPause);



var fullscreenBtn = document.getElementById('fullscreenBtn');

function fullscreenB(){

        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else {
          alert("Browser tidak mendukung fullscreen.");
        }
      }
fullscreenBtn.addEventListener('click', fullscreenB);


var fullscreenExit = document.getElementById('fullscreenExit');
function fullscreenX(){
    if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
fullscreenExit.addEventListener('click', fullscreenX);




document.addEventListener('fullscreenchange', function() {
    if (document.fullscreenElement) {

      fullscreenExit.style.display = 'inline-block';
      fullscreenBtn.style.display = 'none'
    } else {

      fullscreenExit.style.display = 'none';
      fullscreenBtn.style.display = 'inline-block'
    }
  })

var upBtn = document.getElementById('upBtn')
var leftBtn = document.getElementById('leftBtn')
var rightBtn = document.getElementById('rightBtn')
var downBtn = document.getElementById('downBtn')

upBtn.addEventListener('click', function(){moveExplorer(-1, 0)})
leftBtn.addEventListener('click', function(){moveExplorer(0, -1)})
rightBtn.addEventListener('click', function(){moveExplorer(0, 1 )})
downBtn.addEventListener('click', function(){moveExplorer(1, 0)})