$(function() {
  
  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 300;
  const BLOCK_SIDE = 10;

  const GRID_COLOR = 'rgb(150,150, 150)';
  const BLOCK_COLOR = 'rgb(200, 0, 0)';

  canvas = null;
  grid = null;

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
    grid[y][x].toggle(canvas);
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
    validateCanvas(canvas);

    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');
      createAndDrawGrid(ctx);
      // ctx.fillStyle = 'rgb(200, 0, 0)';
      // ctx.fillRect(10, 10, 1, 1);
    }
    canvas.addEventListener('click', onCanvasClick, false); 
    console.log('Ready');
  }

  init();
});
