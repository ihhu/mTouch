(function(){
	"use strict";
	
	if(!window.ontouchstart){return;}
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
		each(slice.call(arguments,1), function(i,value) {
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
		getTime:(){
			return +new Date();
		},
		/**
		 * 获取坐标点信息
		 * @param {Object} event 对象
		 * @return {Object}	坐标点信息
		 */
		getPosInfo(event){
			let _touches=event.touches;
			if(_touches||_touches.length===0){
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
			if(v>1){
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
			 * @param {Style} type
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
			
		}
	}
	
	
})();
