function Block(x, y, side) {
  this.x = x;
  this.y = y;
  this.side = side;
  this.active = false;
}

Block.prototype.activeColor = 'rgb(150, 150, 0)';
Block.prototype.inactiveColor = 'rgb(255, 255, 255)';

Block.prototype.info = function() {
  return 'x: ' + this.x + ', y: ' + y + ', side: ' + this.side + ', active: ' + this.active;
}

Block.prototype.toggle = function(thisCanvas) {
  this.active = !this.active;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = this.active ? this.activeColor : this.inactiveColor;
  ctx.fillRect(this.x, this.y, this.side, this.side);
  return this.active;
}
