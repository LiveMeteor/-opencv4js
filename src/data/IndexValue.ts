export class IndexValue {

    private index: number;
    private dicValue: object;
    private dicIndex: object;

    constructor() {
        this.index = 0;
        this.dicValue = {};
        this.dicIndex= {};
    }

    /** 生成 index 索引 */
    public generalIndex(value: string): number
    {
        if (this.dicValue[value])
            return this.dicValue[value];

        this.index++;
        this.dicValue[value] = this.index;
        this.dicIndex[this.index] = value;
        return this.index;
    }

    /** 获取 value */
    public getValue(index: number): string
    {
        let value = this.dicIndex[index];
        if (!value)
            return "";
        else
            return value;
    }
}