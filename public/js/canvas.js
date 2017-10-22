document.addEventListener("DOMContentLoaded", function(event) { 

  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 500;
  const BLOCK_SIDE = 10;
  const INTERVAL_TIME = 80;
  const GRID_COLOR = 'rgb(150, 150, 150)';

  const START_BUTTON_ID = 'startButton';
  const STOP_BUTTON_ID = 'stopButton';
  const RESET_BUTTON_ID = 'resetButton';
  const STATUS_TEXT_ID = 'statusText';

  // Used to track the interval created for the iterations
  intervalId = null;
  canvas = null;
  canvasContext = null;
  grid = null;
  // a Dictionary of live blocks
  liveBlock = null;

  function resetGrid() {
    canvasContext.fillStyle = GRID_COLOR;
    grid = [];
    for (var h = 0; h < CANVAS_HEIGHT; h += BLOCK_SIDE) {
      canvasContext.moveTo(0, h);
      canvasContext.lineTo(CANVAS_WIDTH, h);

      var gridRow = [];
      for (var w = 0; w < CANVAS_WIDTH; w += BLOCK_SIDE) {
        var block = new Block(w, h, BLOCK_SIDE);
        gridRow.push(block);
      }
      grid.push(gridRow);
    }
    for (var w = BLOCK_SIDE; w < CANVAS_WIDTH; w += BLOCK_SIDE) {
      canvasContext.moveTo(w, 0);
      canvasContext.lineTo(w, CANVAS_WIDTH);

    }
    canvasContext.strokeStyle = GRID_COLOR;
    canvasContext.stroke();
  }

  function validateCanvas() {
    if (canvas.width % BLOCK_SIDE != 0) {
      throw 'Invalid width';
    }
    if (canvas.height % BLOCK_SIDE != 0) {
      throw 'Invalid height';
    }
  }

  function toggleBlock(x, y = null) {
    //TODO: Move to another method
    var block;
    if (x != null && y != null) {
      var x = x / BLOCK_SIDE;
      var y = y / BLOCK_SIDE;
      block = grid[y][x];
    } else if (x != null && y == null) {
      block = x;
    }
    var live = block.toggle(canvas);
    if (live) {
      liveBlock[block.getId()] = grid[y][x];
    } else {
      delete liveBlock[block.getId()];
    }
  }


  function onStartButtonClick(clickEvent) {
    if (!intervalId) {
      intervalId = setInterval(step, INTERVAL_TIME);
      console.log('Started iterations');
      document.getElementById(STATUS_TEXT_ID).innerHTML = 'Started';
    }
  }

  function onStopButtonClick(clickEvent) {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      console.log('Stopped iterations');
      document.getElementById(STATUS_TEXT_ID).innerHTML = 'Stopped';
    }
  }

  function onResetButtonClick(clickEvent) {
    onStopButtonClick(null);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    initEntities();
    document.getElementById(STATUS_TEXT_ID).innerHTML = 'Ready';
  }

  function onCanvasClick(clickEvent) {
    //    console.log(clickEvent);

    var x = clickEvent.pageX - canvas.offsetLeft;
    var block_x = x - (x % BLOCK_SIDE);
    var y = clickEvent.pageY - canvas.offsetTop;
    var block_y = y - (y % BLOCK_SIDE);
    toggleBlock(block_x, block_y);
  }

  function initEntities() {
    canvas = document.getElementById('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    liveBlock = {};
    validateCanvas(canvas);

    if (canvas.getContext) {
      canvasContext = canvas.getContext('2d');
      resetGrid();
    }
    console.log('Entities initialised')
  }

  function initListeners() {
    canvas.addEventListener('click', onCanvasClick, false); 
    var startButton = document.getElementById(START_BUTTON_ID);
    startButton.addEventListener('click', onStartButtonClick, false);
    var stopButton = document.getElementById(STOP_BUTTON_ID);
    stopButton.addEventListener('click', onStopButtonClick, false);
    var resetButton = document.getElementById(RESET_BUTTON_ID);
    resetButton.addEventListener('click', onResetButtonClick, false);
    console.log('Listeners initialised')
  }

  function init() {
    initEntities();
    initListeners();
    console.log('Ready');
  }

  function getBlockNeighbours(block, candidateBlock) {
    var blockX = block.x / BLOCK_SIDE;
    var blockY = block.y / BLOCK_SIDE;
    for (var y = -1; y <= 1; y++) {
      for (var x = -1; x <=1; x++) {
        if (blockY + y >= 0 && blockY + y < CANVAS_HEIGHT / BLOCK_SIDE
            && blockX + x >= 0 && blockX + x < CANVAS_WIDTH / BLOCK_SIDE) {
          var neighbour = grid[blockY + y][blockX + x];
          candidateBlock[neighbour.getId()] = neighbour;
        }
      }
    }
    return candidateBlock;
  }

  function getNumberOfLiveNeighbours(block) {
    var blockX = block.x / BLOCK_SIDE;
    var blockY = block.y / BLOCK_SIDE;
    var num = 0;
    for (var y = -1; y <= 1; y++) {
      for (var x = -1; x <=1; x++) {
        if (y == 0 && x == 0) {
          continue;
        }
        if (blockY + y >= 0 && blockY + y < CANVAS_HEIGHT / BLOCK_SIDE
            && blockX + x >= 0 && blockX + x < CANVAS_WIDTH / BLOCK_SIDE
            && grid[blockY + y][blockX + x].live) {
          num++; 
        }
      }
    }
    return num;
  }

  function getBlockFutureStatus(block) {
    // Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
    if (block.live && getNumberOfLiveNeighbours(block) < 2) {
      block.changeStatus = true;
    }

    // Any live cell with more than three live neighbours dies, as if by overpopulation.
    else if (block.live && getNumberOfLiveNeighbours(block) > 3) {
      block.changeStatus = true;
    }

    // Any live cell with two or three live neighbours lives on to the next generation.
    // i.e. Do nothing

    // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    else if (!block.live && getNumberOfLiveNeighbours(block) == 3) {
      block.changeStatus = true;
    }
  }

  function step() {
    // Blocks that are candidates to toggle
    var candidateBlocks = {};
    for (var blockId in liveBlock) {
      if (liveBlock.hasOwnProperty(blockId)) {
        var block = liveBlock[blockId];
        candidateBlocks = getBlockNeighbours(block, candidateBlocks);
        candidateBlocks[block.getId()] = block;
      }
    }
    for (var candidateBlock in candidateBlocks) {
      if (candidateBlocks.hasOwnProperty(candidateBlock)) {
        getBlockFutureStatus(candidateBlocks[candidateBlock]); 
      }
    }
    for (var candidateBlock in candidateBlocks) {
      if (candidateBlocks.hasOwnProperty(candidateBlock)) {
        var block = candidateBlocks[candidateBlock];
        if (block.changeStatus != null) {
          toggleBlock(block.x, block.y);
          block.changeStatus = null;
        } 
      }
    }
    console.log('step done');
  }
  init();
});
