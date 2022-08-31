class TransformData {
    constructor(a = 1.0, b = 0.0, c = 0.0, d = 1.0, rotate = 0.0, x = 0.0, y = 0.0) {
        this.a = a
        this.b = b
        this.c = c
        this.d = d
        this.rotate = rotate
        this.x = x
        this.y = y
    }

    then = (other) => new TransformData(
        this.a * other.a + this.b * other.c,
        this.a * other.b + this.b * other.d,
        this.c * other.a + this.d * other.c,
        this.c * other.b + this.d * other.d,
        this.rotate + other.rotate,
        this.x + other.x,
        this.y + other.y
    )

    cssTransformString = () => `transform: matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.x}, ${this.y}) rotate(${this.rotate}rad);`

    static parse = (data) => {
        if (data.length === 6) {
            return new TransformData(data[0], data[1], data[2], data[3], 0.0, data[4], data[5])
        } else if (data.length === 3) {
            return new TransformData(1.0, 0.0, 0.0, 1.0, data[0], data[1], data[2])
        } else if (data.length === 2) {
            return new TransformData(1.0, 0.0, 0.0, 1.0, 0.0, data[0], data[1])
        }
    }
}