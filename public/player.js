var toBeRender = [];
var socket = io();

class Player {
    constructor(x, y, color){
        this.height = 10;
        this.width = 10;
        this.x = x;
        this.y = y;
        this.direction = "up";
        this.color = color;
        this.isColliding = false;
        this.isShoting = false;
    }


    up(){
        this.y = this.y - 10;
        this.direction = "up";
        socket.emit('mySpecs', [this.x, this.y]);
    } 
    
    down(){
        this.direction = "down";
        this.y = this.y + 10;
        socket.emit('mySpecs', [this.x, this.y]);
    }
    left(){
        this.direction = "left";

        this.x = this.x - 10;
        socket.emit('mySpecs', [this.x, this.y]);

    }
    rigth(){
        this.direction = "rigth";

        this.x = this.x + 10;
        socket.emit('mySpecs', [this.x, this.y]);

    }
    draw() {
        var canvas = document.getElementById("canvas");
        if (canvas.getContext) {
            var ctx = canvas.getContext("2d");
    
            ctx.fillStyle = this.color;
            ctx.fillRect (this.x, this.y, this.width, this.height);
        }
    }
    update(){
        
    }
    shoot(){
        if(!this.isShoting){
            let ax = this.x;
            if(this.direction === "left"){
                ax-= 10;
            }else {
                ax += 10;
            }
            let b = new Bullet(ax, this.y+5, this.direction);
            toBeRender.push(b);
            socket.emit('setBullets', [ax, this.y+5, this.direction]);
        }
        this.isShoting = true;
    }
    
}

class Bullet {
    constructor(x,y, direction){
        this.height = 7;
        this.width = 7;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.isColliding = false;
    }
    draw(){
        var canvas = document.getElementById("canvas");
        if (canvas.getContext) {
            var ctx = canvas.getContext("2d");
    
            ctx.fillStyle = "rgb(0,0,0)";
            ctx.fillRect (this.x, this.y, this.width, this.height);
        }
    }
    update(){

        if(this.direction === "rigth"){
            this.x += 10;
        }
        if(this.direction === "left"){
            this.x -= 10;
        }
        if(this.direction === "up"){
            this.y -= 10;
        }
        if(this.direction === "down"){
            this.y += 10;
        }
    }

}

let randX = Math.floor((Math.random()/10) * 600) * 10;
let randY = Math.floor((Math.random()/10) * 400) * 10;

console.log(randX, randY);

const p1 = new Player(randX, randY, "rgb(0,0,200)");
const p2 = new Player(5, 5, "rgb(250,250,250)");

socket.emit('mySpecs', [randX, randY]);

toBeRender.push(p1);
toBeRender.push(p2);

function main(){
    document.addEventListener('keydown', logKey);
    function logKey(e) {
        if (`${e.code}` == "ArrowRight") {
            p1.rigth();
            
        }
        if (`${e.code}` == "ArrowLeft") {
            p1.left();
            
        }
        if (`${e.code}` == "ArrowDown") {
            p1.down();
            
        }
        if (`${e.code}` == "ArrowUp") {
            p1.up();
           
        }
        if(`${e.code}` == "Space"){
            p1.shoot();
        }
    }
    


    window.requestAnimationFrame(mainloop);
}
function mainloop(){
    socket.on('getObjs', (enemy) => {
        p2.x = enemy[0];
        p2.y = enemy[1];
        p2.color = "rgb(200, 0, 0)"
    });
    socket.on('getBullets', b =>{
        if(toBeRender.length < 4){
            let enemy_bullet = new Bullet(b[0], b[1], b[2]);
            toBeRender.push(enemy_bullet);
        }
        
    });
    if(p1.isColliding){
        p1.x = 700;
        socket.emit('mySpecs', [700, 700]);
    }

    flush();
    detectCollisions(toBeRender);
    
    //draw and update
    toBeRender.forEach((b, i) => {
        b.draw();
        b.update();
        //console.log(b.x);
        if(-1 > b.x || b.x > 601 || -1 > b.y ||b.y > 401){
            toBeRender.splice(i,1);
            p1.isShoting = false;
        }

    })
    
    window.requestAnimationFrame(mainloop);

}
function rangeIntersect(min0, max0, min1, max1){
    return Math.max(min0, max0) >= Math.min(min1, max1) &&
           Math.min(min0, max0) <= Math.max(min1, max1);
}
function rectIntersect(x0, y0, x1, y1) {
    return rangeIntersect(x0,x0+5, x1, x1+5) &&
           rangeIntersect(y0, y0+5, y1, y1+5);
}


function detectCollisions(gameObjects){
    let obj1;
    let obj2;

    // Start checking for collisions
    for (let i = 0; i < gameObjects.length; i++)
    {
        obj1 = gameObjects[i];
        for (let j = i + 1; j < gameObjects.length; j++)
        {
            obj2 = gameObjects[j];

            // Compare object1 with object2
            if (rectIntersect(obj1.x, obj1.y, obj2.x, obj2.y)){
                obj1.isColliding = true;
                obj2.isColliding = true;
            }
        }
    }
}


function flush(){
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
}
