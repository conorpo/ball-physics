let balls = [{
    pos: [500,250],
    mass: 0
}];

let props = {
    gravity: true,
    friction: false,
    windLeft: false,
    windRight: false,
    drag: false,
    objectGravity: false,
    edges: true
};

let config = {
    verticalBounceRetain: 1,
    horizontalBounceRetain: 0.9,
    gravityStrength: 0.2,
    frictionStrength: 0.1,
    windForce: 0.25,
    dragCoefficient: 0.005
}

Array.prototype.add = function(other) {
    for(let i = 0; i < this.length; i++){
        this[i]+=other[i];
    }
    return this;
}

Array.prototype.sub = function(other) {
    for(let i = 0; i < this.length; i++){
        this[i]-=other[i];
    }
    return this;
}

Array.prototype.mult = function(scalar) {
    for(let i = 0; i < this.length; i++){
        this[i]*=scalar;
    }
    return this;
}

Array.prototype.div = function(scalar) {
    for(let i = 0; i < this.length; i++){
        this[i]/=scalar;
    }
    return this;
}

Array.prototype.mag = function(){
    const reducer = (acc, cur) => {
        return acc+cur**2
    }
    return Math.sqrt(this.reduce(reducer,0));
}

Array.prototype.normalize = function(){
    if(this.mag() == 0){
        return this;
    }
    this.div(this.mag());
    return this;
}

class Ball {
    constructor(){
        this.radius = randMap(4,20);
        this.mass = randMap(4,20);
        this.density = (Math.PI*(this.radius**2))/this.mass;
        this.color = calcColor(this.density);
        this.pos = [randMap(this.radius,width-this.radius),250];//randMap(this.radius,height-this.radius)];
        this.vel = [0,0];
        this.acc = [0,0];
    }

    applyForce(force){
        let f = force.slice().div(this.mass);
        this.acc.add(f);
    }

    move(){
        this.vel.add(this.acc);

        this.pos.add(this.vel);

        this.acc.mult(0);

        if(props.edges){
            if(this.pos[0]+this.radius>width){
                this.vel[0]*=-config.horizontalBounceRetain;
                this.pos[0] = width-this.radius;
    
            }else if(this.pos[0]-this.radius < 0){
                this.vel[0]*=-config.horizontalBounceRetain;
                this.pos[0] = this.radius;
            }
            if(this.pos[1]+this.radius>height){
                this.vel[1]*=-config.verticalBounceRetain;
                this.pos[1] = height-this.radius;
            }
        }
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.pos[0],this.pos[1],this.radius,0,2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
}

function map(x,min,max,newMin,newMax,round=true){
    const returnValue = newMin+((newMax-newMin)*((x-min)/(max-min)));
    return (round) ? Math.floor(returnValue) : returnValue
}

function randMap(newMin,newMax,round=true){
    return map(Math.random(),0,1,newMin,newMax,round);
}

function randColor(){
    return '#' + randomHexByte() + randomHexByte() + randomHexByte();
}

function randomHexByte(){
    return randMap(0,255).toString(16).padStart(2,'0');
}

function init(){
    const canvas = document.getElementById("myCanvas");
    width = canvas.width = 1000;
    height = canvas.height = 500;
    ctx = canvas.getContext('2d');
    mousedown = 0;
    document.addEventListener('mousedown',evt => {
        mousedown++;
        balls[0].mass = 50;
    })
    document.addEventListener('mouseup',evt => {
        mousedown--;
        balls[0].mass = 0;
    })

    canvas.addEventListener('mousemove', function(evt) {
        var rect = canvas.getBoundingClientRect();
        balls[0].pos =  [
            evt.clientX - rect.left,
            evt.clientY - rect.top
        ];
    }, false);
    document.addEventListener('keypress',evt => {
        if(evt.key == "Enter"){
            balls.push(new Ball());
        }else if(evt.key == "f"){
            toggleProp('friction');
        }else if(evt.key == "g"){
            toggleProp('gravity')
        }else if(evt.key == "d"){
            toggleProp('drag')
        }else if(evt.key == "o"){
            toggleProp('objectGravity')
        }else if(evt.key == "e"){
            toggleProp('edges')
        }
    })
    document.addEventListener('keydown', function(evt){
        if(evt.key == "ArrowLeft"){
            props.windLeft = true;
            document.getElementById('windLeft').classList.add('button-active');
        }else if(evt.key == "ArrowRight"){
            props.windRight = true;
            document.getElementById('windRight').classList.add('button-active');
        }
    });
    document.addEventListener('keyup', function(evt){
        if(evt.key == "ArrowLeft"){
            props.windLeft = false;
            document.getElementById('windLeft').classList.remove('button-active');
        }else if(evt.key == "ArrowRight"){
            props.windRight = false;
            document.getElementById('windRight').classList.remove('button-active');
        }
    });
    document.getElementById('friction').checked = false;
    document.getElementById('gravity').checked = true;
    document.getElementById('drag').checked = false;
    document.getElementById('objectGravity').checked = false;
    document.getElementById('edges').checked = true;
    requestAnimationFrame(draw);
};

function draw(){
    ctx.clearRect(0,0,width,height)
    for(let j = 1; j<balls.length; j++){
        let ball = balls[j];
        if(props.gravity){
            const gravity = [0,config.gravityStrength].mult(ball.mass);
            ball.applyForce(gravity);
        }
        if(props.windRight || props.windLeft){
            if(props.windLeft && !props.WindRight){ball.applyForce([-config.windForce,0])}
            if(props.windRight && !props.windLeft){ball.applyForce([config.windForce,0])}
        }
        if(props.friction){
            let friction = ball.vel.slice();

            friction.normalize().mult(-config.frictionStrength);
            ball.applyForce(friction);
        }
        if(props.drag){
            let drag = ball.vel.slice();
            let speed = drag.mag()**2;
            drag.normalize().mult(-config.dragCoefficient*speed*ball.radius)
            ball.applyForce(drag);
        }
        if(props.objectGravity){
            for(let i = 0; i<balls.length; i++){
                let other = balls[i];
                if(other == ball){ continue; }
                let gravityDirection = [other.pos[0]-ball.pos[0],other.pos[1]-ball.pos[1]];
                let dis = gravityDirection.mag();
                gravityDirection.normalize();
                gravityDirection.mult((ball.mass*other.mass)/(dis**2));
                ball.applyForce(gravityDirection);
            }
        }

        ball.move();
        ball.draw(); 
    }       
    requestAnimationFrame(draw);
}

function toggleProp(propName){
    props[propName] = !props[propName]
    document.getElementById(propName).checked = props[propName];
}


function calcColor(density){
    const brightness = map(density,(16*Math.PI)/20,(100*Math.PI),0,255).toString(16).padStart(2,'0');
    return '#'+brightness+brightness+brightness;
}

