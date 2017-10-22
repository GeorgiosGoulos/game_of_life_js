$(function() {

  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 500;
  const BLOCK_SIDE = 10;

  const GRID_COLOR = 'rgb(150,150, 150)';
  const BLOCK_COLOR = 'rgb(200, 0, 0)';

  intervalId = null;
  INTERVAL_TIME = 200;

  canvas = null;
  grid = null;
  liveBlock = null;

  function createAndDrawGrid(canvasContext) {
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

  function validateCanvas(canvas) {
    if (canvas.width % BLOCK_SIDE != 0) {
      throw 'Invalid width';
    }
    if (canvas.height % BLOCK_SIDE != 0) {
      throw 'Invalid height';
    }
  }

  function toggleBlock(x, y) {
    //TODO: Move to another method
    x = x / BLOCK_SIDE;
    y = y / BLOCK_SIDE;
    active = grid[y][x].toggle(canvas);
    if (active) {
      liveBlock[grid[y][x].getId()] = grid[y][x];
    } else {
      delete liveBlock[grid[y][x].getId()];
    }
  }

  function onStartButtonClick(clickEvent) {
    if (!intervalId) {
      intervalId = setInterval(iteration, INTERVAL_TIME);
      console.log('Started iterations');
    }
  }

  function onStopButtonClick(clickEvent) {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      console.log('Stopped iterations');
    }
  }

  function onCanvasClick(clickEvent) {
    //    console.log(clickEvent);

    var x = event.pageX - canvas.offsetLeft;
    var block_x = x - (x % BLOCK_SIDE);
    var y = event.pageY - canvas.offsetTop;
    var block_y = y - (y % BLOCK_SIDE);
    toggleBlock(block_x, block_y);
  }

  function init() {

    canvas = document.getElementById('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    liveBlock = {};
    validateCanvas(canvas);

    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');
      createAndDrawGrid(ctx);
      // ctx.fillStyle = 'rgb(200, 0, 0)';
      // ctx.fillRect(10, 10, 1, 1);
    }
    canvas.addEventListener('click', onCanvasClick, false); 
    console.log('Ready');

    var startButton = document.getElementById('startButton');
    startButton.addEventListener('click', onStartButtonClick, false);
    var stopButton = document.getElementById('stopButton');
    stopButton.addEventListener('click', onStopButtonClick, false);
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
            && grid[blockY + y][blockX + x].active) {
          num++; 
        }
      }
    }
    return num;
  }

  function getBlockFutureStatus(block) {
    // Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
    if (block.active && getNumberOfLiveNeighbours(block) < 2) {
      block.changeStatus = true;
    } 
    // Any live cell with more than three live neighbours dies, as if by overpopulation.
    else if (block.active && getNumberOfLiveNeighbours(block) > 3) {
      block.changeStatus = true;
    }
    // Any live cell with two or three live neighbours lives on to the next generation.
    // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    else if (!block.active && getNumberOfLiveNeighbours(block) == 3) {
      block.changeStatus = true;
    }
  }

  function iteration() {
    var candidateBlocks = {};
    for (var blockId in liveBlock) {
      if (liveBlock.hasOwnProperty(blockId)) {
        // TODO: Get neighbours too
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
    console.log('Iteration done');
  }

  init();
});
