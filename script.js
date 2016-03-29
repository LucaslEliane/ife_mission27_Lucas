/**
 * 飞船对象
 * @param {[int]} track [轨道编号]
 */
function Spaceship(track, power, energy) {

	this.isFlying    = true;
	this.flag        = track;	
	this.fuelSurplus = 100;
	this.speed       = power[0];
	this.consume     = power[1];
	this.fuelCharge  = energy;
	this.rotateDeg   = 0;

	this.duration;
	this.timeOut;
	this.chargeInterval;

	this.controlPanel;
	this.element;
	this.element      = document.getElementsByClassName("ship ship"+track)[0];
	this.controlPanel = document.getElementsByClassName("control cship"+track)[0];

	this.element.style.visibility   = "visible";	
	this.controlPanel.style.display = "block";
}
/**
 * [充电函数]
 * @return {[type]} [description]
 */
Spaceship.prototype.charge  = function() {
	var that = this;
	var charge;
	this.chargeInterval = setInterval(function(){
		if (that.fuelSurplus < 100) {
			charge = that.fuelCharge/10;
		} else {
			charge = 0;
		}
		that.fuelSurplus = that.fuelSurplus + charge;
		if (that.fuelSurplus < 0) {
			that.fuelSurplus = 0;
		}
		that.element.firstElementChild.firstElementChild.textContent = Math.floor(that.fuelSurplus)+"%";
	},100);
};
Spaceship.prototype.stopFly = function() {
	window.clearInterval(this.duration);
	this.isFlying = false;
	this.charge();
};
Spaceship.prototype.beginFly = function() {
	this.isFlying = true;
	var that = this;
	this.duration = setInterval(function() {
		if (that.fuelSurplus <= 0) {
			clearTimeout(that.timeOut);
			that.stopFly();
		}
		that.timeOut = setTimeout (function() {
			that.fuelSurplus = that.fuelSurplus - that.consume/50;
			that.element.firstElementChild.firstElementChild.textContent = Math.floor(that.fuelSurplus)+"%";
			that.rotateDeg = that.rotateDeg + that.speed/50;
			that.element.style.transform = "rotate("+that.rotateDeg+"deg)";
		},21);
	},20);
};
Spaceship.prototype.adapter = function(command) {
	var commandDecimal = parseInt(command,2);
	var commandInfor = commandDecimal%16;
	var id = Math.floor(commandDecimal/16);
	var analysis;
	switch(parseInt(commandInfor)) {
		case 1:
			analysis = "fly";
			break;
		case 2:
			analysis = "stop";
			break;
		case 12:
			analysis = "destroy";
			break;
	}
	return {
		id : id,
		command : analysis
	};
};
Spaceship.prototype.destroy = function() {
	this.stopFly();
	window.clearInterval(this.chargeInterval);
	this.element.style.visibility = "hidden";
	this.controlPanel.style.display = "none";
};
/**
 * 从星球上接收命令，命令格式为JSON,现在改变为二进制格式的命令，使用adapter方法进行命令转换
 * @param  {[type]} command [Json格式的命令]
 * @return {[type]}         [description]
 */
Spaceship.prototype.commandReceive = function(command) {
	command = this.adapter(command);
	if (parseInt(command.id) === parseInt(this.flag)) {
		if (command.command === "fly") {
			if (!this.isFlying) {
				this.beginFly();
			}
		} else if (command.command === "stop") {
			if (this.isFlying) {
				this.stopFly();
			}
		} else if (command.command === "destroy") {
			this.destroy();
		} else {
			window.alert("命令出错");
		}
	}
};
function Commander() {
	this.shipExist            = [false,false,false,false];
	this.newShipButton        = document.getElementsByClassName("create")[0];
	this.allShipControlButton = document.querySelectorAll(".control button");
	this.powerRadio           = document.querySelectorAll(".power input");
	this.energyRadio          = document.querySelectorAll(".energy input");
	this.powerLevel           = {
		0  :  [ 10 , 5 ],
		1  :  [ 20 , 7 ],
		2  :  [ 30 , 9 ]
	};
	this.commandAccepted = [false,false,false,false];
	this.energyLevel 		  = [2,3,4];
	this.command              = {
		id : 0,
		command: ""
	};
}
Commander.prototype.newShip = function() {
	var that = this;

	this.newShipButton.addEventListener ("click",function(){
		var newShipNumber = that.shipExist.indexOf(false);
		var shipPower = -1;
		var shipEnergy = -1;
		for (var i = 0;i < 3;i++) {
			if (that.powerRadio[i].checked  === true) {
				shipPower  = i;
				that.powerRadio[i].checked = false;
			}
			if (that.energyRadio[i].checked === true) {
				shipEnergy = i;
				that.energyRadio[i].checked = false;
			}
		}
		if (shipPower === -1 || shipEnergy === -1) {
			window.alert("请点击按钮选择动力和能源系统来创建飞船");
			return false;
		}
		if (newShipNumber === -1) {
			window.alert("没有空轨道了");
			return false;
		}
		that.shipExist[newShipNumber] = new Spaceship(newShipNumber+1,that.powerLevel[shipPower],that.energyLevel[shipEnergy]);
		that.shipExist[newShipNumber].beginFly();
	});
};
Commander.prototype.adapter = function(command) {
	var binaryCommand = "";
	switch(parseInt(command.id)) {
		case 1:
			binaryCommand += "0001";
			break;
		case 2:
			binaryCommand += "0010";
			break;
		case 3:
			binaryCommand += "0011";
			break;
		case 4:
			binaryCommand += "0100";
			break;
	}
	switch(command.command) {
		case "fly":
			binaryCommand += "0001";
			break;
		case "stop":
			binaryCommand += "0010";
			break;
		case "destroy":
			binaryCommand += "1100";
			break;
	}
	return binaryCommand;
};
Commander.prototype.sendCommand = function(command) {
	var that = this
	var commandConfirm = setInterval(function(){
		if (that.commandAccepted.indexOf(false) === -1) {
			window.clearInterval(commandConfirm);
		}
		for (var j = 0; j < 4; j++) {
			if (that.shipExist[j] && !that.commandAccepted[j]) {
				console.log("命令发送成功");
				var num = Math.floor(Math.random() * 10);
				if (num !== 0) {
					that.commandAccepted[j] = true;
					that.shipExist[j].commandReceive(that.adapter(command));
					if (command.command === "destroy" && command.id === (j+1)) {
						that.shipExist[command.id-1] = false;
					}
				} else {
					console.log("命令发送失败");
				}
			} else if (!that.shipExist[j]) {
				that.commandAccepted[j] = true;
			}
		}
	},300);
};
Commander.prototype.buttonBind = function() {
	var that = this;
	for (var i = 0 ; i<this.allShipControlButton.length ; i++) {
		this.allShipControlButton[i].addEventListener("click",function(event){
			that.command.id      = event.target.parentNode.getAttribute("class").split("ship")[1];
			that.command.command = event.target.getAttribute("class");
			setTimeout(function(){
				that.sendCommand(that.command);
			},300);
			that.commandAccepted = [false,false,false,false];
		});
	}
};
function Common() {
	this.addLoadEvent;
	this.init;
}
Common.prototype.addLoadEvent = function (func){
	var oldonload = window.onload;
	if (typeof window.onload !== 'function'){
		window.onload = func;
	}else {
		window.onload = function(){
			oldonload();
			func();
		};
	}
};
Common.prototype.init = function () {
	var commander = new Commander();
	commander.newShip();
	commander.buttonBind();
};
var common = new Common();
common.addLoadEvent(common.init);