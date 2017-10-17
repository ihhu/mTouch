(function(){
	"use strict";
	//if(!window.ontouchstart){return;}
	let _wrapped=null;
	const _=function(){
		let type=function(obj){
   			//'boolean', 'number', 'string', 'function', 'array', 'date', 'regexp', 'object', 'error'
			return obj == null ? String(obj) : {}.toString.call(obj).toLowerCase().replace(/\[object\s|\]/g, '')|| "object";
		},
		toArray=function(arr){
			if(!arr) return [];
			return [].slice.call(arr,0);
		},
		isString=function(str){
			return type(str)==="string";
		},
		isArray=Array.isArray||function(arr) {
			return type(arr) === 'array';
		},
		isFunction=function(value) {
			return type(value) === "function";
		},
		isObject=function(obj) {
			return type(obj) === "object";
		};
   		return {
   			type,
   			toArray,
   			isString,
   			isArray,
   			isFunction,
   			isObject,
   		};
	}();
	
	const each=function(obj,callback){
		let len=0,i=0;
		if(!obj){return;}
		if(_.isArray(obj)){
			for(len=obj.length;i<len;i++){
				let val=callback.call(obj[i],i,obj[i]);
				if(val===false) break;
			}
		}else if(_.isObject(obj)){
			for(i in obj){
				if(obj.hasOwnProperty(i)){
					let val=callback.call(obj[i],i,obj[i]);
					if(val===false) break;
				}
			}
		}else{
			throw Error("参数格式错误")
		}
	};
	
	const extend = function(obj) {
		each([].slice.call(arguments,1), function(i,value) {
			for(let prop in value) {
				obj[prop] = value[prop];
			}
		});
		return obj;
    }; 
    	
	//console.log(_.isArray([]),_.isObject({}),_.isFunction(function(){}),_.isString(""));
	

	
	extend(_,{
		/**
		 * 生成uuid
		 * @return {String} uuid
		 */
		uuid(){
			return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
				let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		},
		each,
		extend,
		/**
		 * 获取当前时间距1970/1/1时间戳
		 * @return {Number}	时间戳
		 */
		getTime(){
			return +new Date();
		},
		/**
		 * 获取坐标点信息
		 * @param {Object} event 对象
		 * @return {Object}	坐标点信息
		 */
		getPosInfo(event){
			let _touches=event.touches;
			if(!_touches||_touches.length===0){
				return;
			}
			return {
				pageX:event.touches[0].pageX,
				pageY:event.touches[0].pageY,
				clientX:event.touches[0].clientX||0,
				clientY:event.touches[0].clientY||0
			}
		},
		/**
		 * 获取划动方向
		 * @param {Number} sX 起始点x坐标
		 * @param {Number} sY 起始点y坐标
		 * @param {Number} eX 结束点x坐标
		 * @param {Number} eY 结束点y坐标
		 * @return {String}	direction 方向
		 */
		getDirection(sX,sY,eX,eY){
			let [xRes,xResAbs]=[sX-eX,Math.abs(sX-eX)];
			let [yRes,yResAbs]=[sY-eY,Math.abs(sY-eY)];
			let direction="";
			
			if(xResAbs>=yResAbs&&xResAbs>25){
				direction=(xRes>0)?"Right":"Left";
			}else if(yResAbs>xResAbs&&yResAbs>25){
				direction=(yRes>0?"Down":"Up")
			}
			return direction;	
		},
		/**
		 * 获取两点之间距离
		 * @param {Number} sX 起始点x坐标
		 * @param {Number} sY 起始点y坐标
		 * @param {Number} eX 结束点x坐标
		 * @param {Number} eY 结束点y坐标
		 * @return {Number} 
		 */
		getDistance:(sX,sY,eX,eY)=>Math.sqrt(Math.pow(sX-eX,2)+Math.pow(sY-eY,2)),
		/**
		 * 获取长度
		 * @param {Object} v 坐标点
		 * @return {Number}
		 */
		getLength:v=>Math.sqrt(v.x*v.x+v.y*v.y),
		/**
		 * 叉乘
		 * @param {Object} v1 坐标点
		 * @param {Object} v2 坐标点
		 * @return {Number}
		 */
		cross:(v1,v2)=>v1.x*v2.y-v1.y*v2.x,
		/**
		 * 取向量
		 * @param {Number} sX 起始点x坐标
		 * @param {Number} sY 起始点y坐标
		 * @param {Number} eX 结束点x坐标
		 * @param {Number} eY 结束点y坐标
		 * @return {Number}
		 */
		getVector:(sX,sY,eX,eY)=>sX*eX+sY*eY,
		/**
		 * 获取角度 a*b=|a|*|b|*cos(deg); a*b=x1*x2+y1*y2
		 * @param {Object} v1 坐标点
		 * @param {Object} v2 坐标点
		 * @return {Number} Math.acos(r);
		 * 
		 */
		getAngle(v1,v2){
			let mr=this.getLength(v1)*this.getLength(v2);
			if(mr===0){return 0;}
			
			let r=this.getVector(v1.x,v1.y,v2.x,v2.y)/mr;
			if(r>1){
				r=1;
			}
			return Math.acos(r);
		},
		/**
		 * 获取旋转的角度
		 * @param {Object} v1 坐标点
		 * @param {Object} v2 坐标点
		 * @return {Number} 角度值
		 */
		getRotateAngle(v1,v2){
			let angle=this.getAngle(v1,v2);
			if(this.cross(v1,v2)>0){
				angle*=-1;
			}
			return angle*180/Math.PI;
		},
		
		/**
		 * 绑定事件
		 * @param {Element} el
		 * @param {String} type
		 * @param {Function} fn
		 */
		bind(el,type,fn){
			el.addEventListener ? el.addEventListener(type, fn, false) : el.attachEvent("on" + type, fn);
		},
		/**
		 * 解绑事件
		 * @param {Element} el
		 * @param {String} type
		 * @param {Function} fn
		 */
		unBind(el,type,fn){
			el.removeEventListener ? el.removeEventListener(type, fn, false) : el.detachEvent("on" + type, fn);
		},
		/**
		 * 事件对象
		 * @param {Object} event
		 * @param {Object} obj
		 * @return {Object} new Event
		 */
		wrapEvent(ev,obj){
			let res={
				touches:ev.touches,
				type:ev.type
			}
			if(this.isObject(obj)){
				res=this.extend(res,obj)
			}
			return res;
		},
		/**
		 * 元素A元素是否包含B元素
		 * @param {Element} A
		 * @param {Element} B
		 */
		contains:(A,B)=>A.contains(B)
		
	});
	
	
	var Event=function(){
		let storeEvents={};
		return{
			/**
			 * add an event handler
			 * @param {String} type
			 * @param {String|Function} el
			 * @param {Function} handler
			 */
			add(type,el,handler){
				let selector=el,
					len=arguments.length,
					finalObject={},
					_type;
					
				//Event.add("swipe",function(){});
				if(_.isString(el)){
					el=document.querySelectorAll(el);
				}
				if(len===2 && _.isFunction(el)){
					
					finalObject={
						//selector:"",
						//el:null,
						handler:el
					};
					
				}else if(len===3 && el instanceof HTMLElement || el instanceof NodeList && _.isFunction(handler)){
					//Event.add("swipe","#div",function(ev){})
					
					_type=_.type(el);
					
					finalObject={
						type:_type,
						selector,
						el:_type==="nodelist"?_.toArray(el):el,
						handler
					}
					
				}
				
				storeEvents[type]||(storeEvents[type]=[]);
				storeEvents[type].push(finalObject);
			},
			/**
			 * remove an event handle
			 * @param {String} type
			 * @param {String|Function} selector
			 */
			remove(type,selector){
				let len=arguments.length;
				if(_.isString(type) && _.isArray(storeEvent[type]) && storeEvents[type].length){
					if(len===1){
						storeEvents[type]=[];
					}else if(len===2){
						storeEvents[type]=storeEvents[type].filter(item => !(item.selector===selector || !_.isString(selector) && item.selector.isEqualNode(selector)))
					}
					
				}
			},
			/**
			 * trigger an event handle
			 * @param {String} type
			 * @param {DocumentElement} el
			 * @param {type} argument
			 */
			trigger(type,el,argument){
				let len=arguments.length;
				
				//Event.trigger("swipe",document.querySelector("#div"),{...})
				if(len===3 && _.isArray(storeEvents[type]) && storeEvents[type].length){
					_.each(storeEvents[type],function(i,value){
						if(_.isFunction(value.handler)){
							if(value.type && value.el){
								argument.target = el;
								if(value.type === "nodelist" && _.contain(value.el,el)){
									value.handler(argument);
								}else if(value.el.isEqualNode && value.el.isEqualNode(el)){
									value.handler(argument);
								}
							}else{
								value.handler(argument);
							}
						}
					});
				}
				
			}
		}
	}();
	
	class Touch{
		constructor(selector){
			this.el=selector instanceof HTMLElement?selector:
			_.isString(selector)?document.querySelector(selector):null;
			if(_.type(this.el)==="null"){
				throw new Error("you must specify a particular selector or a particular DOM object");
			}
			this.scale=1;
			this.pinchStartLen=null;
			this.isDoubleTap=false;
			this.triggedSwipeStart=false;
			this.triggedLongTap=false;
			this.delta=null;
			this.last=null;
			this.now=null;
			this.tapTimeout=null;
			this.singleTapTimeout=null;
			this.longTapTimeout=null;
			this.swipeTimeout=null;
			this.startPos={};
			this.endPos={};
			this.preTapPosition={};
			
			this.cfg={
				doubleTapTime:400,
				longTapTime:700
			}

			_.bind(this.el,"touchstart",this._start.bind(this));
			_.bind(this.el,"touchmove",this._move.bind(this));
			_.bind(this.el,"touchcancel",this._cancel.bind(this));
			_.bind(this.el,"touchend",this._end.bind(this));


		}
		/**
		 * set config
		 * @param {Object} options 
		 * @returns {Object} this
		 * @memberof Touch
		 */
		config(option={}){
			if(!_.isObject(option)){
				return this;
			}
			for(let i in option){
				this.cfg[i]=option[i];
			}
			return this;
		}
		/**
		 * on Events
		 * @param {String} type 
		 * @param {Element} el 
		 * @param {Function} callback 
		 * @returns {Object} this
		 * @memberof Touch
		 */
		on(type,el,callback){
			let len=arguments.length;
			len===2?Event.add(type,el):Event.add(type,el,callback);
			return this;
		}
		/**
		 * 
		 * @param {String} type 
		 * @param {String} selector 
		 * @memberof Touch
		 */
		off(type,selector){
			Event.remove(type,selector);
			return this;
		}
		_start(event){
			if(!event.touches||event.touches.length===0){
				return;
			}
			let self=this;
			let otherToucher,v,preV=this.preV,
				target=event.target;
			
			self.now=_.getTime();
			self.startPos=_.getPosInfo(event);
			self.delta=self.now-(self.last||self.now);
			self.triggedSwipeStart=false;
			self.triggedLongTap=false;

			//  快速双击
            if (JSON.stringify(self.preTapPosition).length > 2 && self.delta < self.cfg.doubleTapTime && _.getDistance(self.preTapPosition.clientX, self.preTapPosition.clientY, self.startPos.clientX, self.startPos.clientY) < 25) {
				self.isDoubleTap = true;
			}
			
			//长按
			self._cancelLongTap();
			self.longTapTimeout=setTimeout(()=>{
				_wrapped={
					el:self.el,
					type:"longTap",
					timeStr:_.getTime(),
					position:self.startPos,
					originalEvent:event
				};
				Event.trigger("longTap",target,_wrapped);
				self.triggedLongTap=true;
			},self.cfg.longTapTime)
			
			//多手指
			if(event.touches.length>1){
				self._cancelLongTap();
				otherToucher=event.touches[1];
				v={
					x:otherToucher.pageX-self.startPos.pageX,
					y:otherToucher.pageY-self.startPos.pageY
				};
				this.preV=v;
				self.pinchStartLen=_.getLength(v);
				self.isDoubleTap=false;
			}

			self.last=self.now;
			self.preTapPosition=self.startPos;

			event.stopPropagation();
			//event.preventDefault();

		}
		_move(event){
			if(!event.touches||event.touches.length===0){
				return;
			}
			let v,otherToucher;
			let self=this;
			let len=event.touches.length,
				posNow=_.getPosInfo(event),
				preV=self.preV;
			let [currentX,currentY]=[posNow.pageX,posNow.pageY];
			let target=event.target;			

			//取消长按事件和双击
			self._cancelLongTap();
			self.isDoubleTap=false;

			//触发swipeStart
			if(!self.triggedSwipeStart){
				_wrapped={
					el:self.el,
					type:"swipeStart",
					timeStr:_.getTime(),
					position:posNow,
					originalEvent:event
				};
				Event.trigger("swipeStart",target,_wrapped);
				self.triggedSwipeStart=true;
			}else{
				_wrapped={
					el:self.el,
					type:"swipe",
					timeStr:_.getTime(),
					position:posNow,
					originalEvent:event
				};
				Event.trigger("swipe",target,_wrapped);
			}

			//trigger pinch and rotate
			if(len>1){
				otherToucher=event.touches[1];
				v={
					x:otherToucher.pageX-currentX,
					y:otherToucher.pageY-currentY
				}

				//pinch
				_wrapped=_.wrapEvent(event,{
					el:self.el,
					type:"pinch",
					scale:_.getLength(v)/self.pinchStartLen,
					timeStr:_.getTime(),
					position:posNow,
					originalEvent:event
				});
				Event.trigger("pinch",target,_wrapped);

				//rotate
				_wrapped=_.wrapEvent(event,{
					el:self.el,
					type:"rotate",
					angle:_.getRotateAngle(v,preV),
					timeStr:_.getTime(),
					position:posNow,
					originalEvent:event
				});
				Event.trigger("rotate",target,_wrapped);
				
			}
			self.endPos=posNow;
			event.preventDefault();
			event.stopPropagation();

		}
		_cancel(event){
			clearTimeout(this.longTapTimeout);
            clearTimeout(this.tapTimeout);
            clearTimeout(this.swipeTimeout);
            clearTimeout(this.singleTapTimeout);
            event.stopPropagation();
		}
		_end(event){
			if(!event.changedTouches){
				return;
			}

			//取消长按
			this._cancelLongTap();
			
			let self=this;
			let direction=_.getDirection(self.endPos.clientX,self.endPos.clientY,self.startPos.clientX,self.startPos.clientY);
			let callback,target=event.target;
			
			if(direction!==""){
				self.swipeTimeout=setTimeout(()=>{
					_wrapped=_.wrapEvent(event,{
						el:self.el,
						type:"swipe",
						timeStr:_.getTime(),
						position:self.endPos,
						originalEvent:event
					});
					Event.trigger("swipe",target,_wrapped);

					//获取具体方向
					callback=self[`swipe${direction}`];
					_wrapped=_.wrapEvent(event,{
						el:self.el,
						type:`swipe${direction}`,
						timeStr:_.getTime(),
						position:self.endPos,
						originalEvent:event
					});
					Event.trigger(`swipe${direction}`,target,_wrapped);

					_wrapped=_.wrapEvent(event,{
						el:self.el,
						type:"swipeEnd",
						timeStr:_.getTime(),
						position:self.endPos,
						originalEvent:event
					});
					Event.trigger("swipeEnd",target,_wrapped);
				},0)
			}else if(!self.triggedLongTap){
				self.tapTimeout=setTimeout(()=>{
					if(self.isDoubleTap){
						_wrapped=_.wrapEvent(event,{
							el:self.el,
							type:"doubleTap",
							timeStr:_.getTime(),
							position:self.startPos,
							originalEvent:event
						});
						Event.trigger("doubleTap",target,_wrapped);
						clearTimeout(self.singleTapTimeout);
						self.isDoubleTap=false;
					}else{
						self.singleTapTimeout=setTimeout(()=>{
							_wrapped=_.wrapEvent(event,{
								el:self.el,
								type:"singleTap",
								timeStr:_.getTime(),
								position:self.startPos,
								originalEvent:event
							});
							Event.trigger("singleTap",target,_wrapped);
							self.isDoubleTap=false;
						},200)
					}
				},0)
			}
			this.startPos={};
			this.endPos={};
			event.stopPropagation();
		}
		_cancelLongTap(){
			clearTimeout(this.longTapTimeout);
			
		}
	}
	if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = Touch;
    } else {
        window.MTouch = Touch;
    }
	
})();
