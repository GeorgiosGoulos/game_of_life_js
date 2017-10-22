function Block(x, y, side) {
  this.x = x;
  this.y = y;
  this.side = side;
  this.live = false;
  this.changeStatus = null;
}

Block.prototype.liveColor = 'rgb(150, 80, 100)';
Block.prototype.deadColor = 'rgb(200, 200, 200)';

Block.prototype.info = function() {
  return 'x: ' + this.x + ', y: ' + y + ', side: ' + this.side + ', live: ' + this.live;
}

Block.prototype.getId = function() {
  return this.x + ',' + this.y;
}

Block.prototype.toggle = function(thisCanvas) {
  this.live = !this.live;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = this.live ? this.liveColor : this.deadColor;
  ctx.fillRect(this.x, this.y, this.side, this.side);
  return this.live;
}
