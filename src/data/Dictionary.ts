export class Dictionary<T>{

	constructor() {
	}

	private _keys = [];
	/**
	 *	存储字典信息 
	 */
	private _items = new Object();

	/**
	 *	将一个键值添加到数组的结尾。
	 * @param key 键名
	 * @param value 值
	 * @return Object
	 * 
	 */
	public push(key: string | number, value: any): T {
		var result: T = null;
		if (this.containsKey(key)) {
			result = this._items[key];
			this._items[key] = value;
		}
		else {
			this._items[key] = value;
			this._keys.push(key);
			result = this._items[key];
		}
		return result;
	}

	/**
	 *	将一个键值添加到数组的开始。 只针对getIndexValue()时，起作用
	 * @param key 键名
	 * @param value 值
	 * @return Object
	 * 
	 */
	public unshift(key: string | number, value: any): T {
		var result: T = null;
		if (this.containsKey(key)) {
			result = this._items[key];
			this._items[key] = value;
		}
		else {
			this._items[key] = value;
			this._keys.unshift(key);
			result = this._items[key];
		}
		return result;
	}

	/**
	 * 插入数据到特定位置
	 * @param index 插入位置 只针对getIndexValue()时，起作用
	 * @param key 键名
	 * @param value 值
	 * @return 添加Object 如果失败返回NULL
	 * 
	 */
	public splice(index: number, key: string, value: any): T {
		var result: T = null;
		if (this.containsKey(key)) {
			this.remove(key);
		}
		if (index < 0) {
			return result;
		}
		this._items[key] = value;
		this._keys.splice(index, 0, key);
		result = this._items[key];
		return result;
	}

	/**
	 *	读取值信息。 
	 * @param key 键名
	 */
	public getValue(key: string | number): T {
		return this._items[key];
	}
	/**
	 *	根据索引ID，返回key 
	 */
	public getKey(i: number): string {
		return this._keys[i];
	}

	/**
	 *	根据索引ID，返回值 
	 * @param i
	 * @return 返回对象，如果对象不存在，返回NULL
	 * 
	 */
	public getIndexValue(i: number): T {
		if (i < 0) {
			console.log("YXDictionary:getIndexValue:i:", i);
			return null;
		}
		if (this._keys.length == 0) {
			return null;
		}
		if (this._keys.length <= i) {
			return null;
		}
		if (this.containsKey(this._keys[i])) {
			return this._items[this._keys[i]];
		}
		return null;
	}

	/**
	 * 	删除字典中第一个元素，并返回该元素。 
	 * @return 返回该键值所关联元素
	 */
	public shift(): T {
		var result: T = null;
		if (this.containsKey(this._keys[0])) {
			result = this._items[this._keys[0]];
			this.remove(this._keys[0]);
		}
		return result;
	}

	/**
	 *	删除数组中最后一个元素，并返回该键值对象。 
	 * @return 
	 * 
	 */
	public pop(): T {
		var result: any = null;
		var len = this._keys.length - 1;
		if (this.containsKey(this._keys[len])) {
			result = this._items[this._keys[len]];
			this.remove(this._keys[len]);
		}
		return result;
	}

	/**
	 *	按指定键删除键值 
	 * @param key 键名
	 */
	public remove(key: string | number): T {
		var temp: any;
		if (this.containsKey(key)) {
			temp = this._items[key];
			delete this._items[key];
			var len = this._keys.length
			for (var i = 0; i < len; i++) {
				if (this._keys[i] == key) {
					this._keys.splice(i, 1);
					break;
				}
			}
		}
		return temp;
	}

	public removeAt(i: number): void {
		if (this._keys[i] != null) {
			this.remove(this._keys[i]);
		}
	}
	/**
	 *	删除全部 
	 */
	public allRemove(): void {
		var len = this._keys.length
		for (var i = 0; i < len; i++) {
			delete this._items[this._keys[0]];
			this._keys.splice(0, 1);
		}
	}

	/**
	 *	判断键是否存在，如果存在，返回true 
	 * @param key 键名称
	 * @return Boolean
	 * 
	 */
	public containsKey(key: string | number): boolean {
		return this._items[key] != null;
	}
	/**
	 *	判断值是否存在，如果存在，返回true 
	 * @param key 值 Object
	 * @return Boolean
	 * 
	 */
	public containsValue(value: any): boolean {
		var result: boolean = false;
		var len: number = this.length;
		if (len > 0) {
			for (var i: number = 0; i < len; i++) {
				if (this._items[this._keys[i]] == value) {
					result = true;
					break;
				}
			}
		}
		return result;
	}

	/**
	 *	字典转换为数组 
	 * @return 
	 */
	public toArray(): T[] {
		let array = [];
		//遍历 keys，保证按 push 的先后顺序输出 Array
		for (let key in this._keys) {
			array.push(this._items[this._keys[key]]);
		}
		return array;
	}

	public keys() {
		return this._keys;
	}
	/**
	 *	键值长度 
	 * @return 
	 * 
	 */
	public get length(): number {
		return this._keys.length;
	}

	/** 为每个 key 执行一个 function */
	public forEachKey(func: (key: string | number) => void, thisObj: any): void {
		for (let index = 0; index < this._keys.length; index++) {
			func.call(thisObj, this._keys[index]);
		}
	}

	/** 为每个 value 执行一个 function */
	public forEachValue(func: (value: T) => void, thisObj: any): void {
		for (let key in this._items) {
			func.call(thisObj, this._items[key]);
		}
	}
}