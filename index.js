const params = new URLSearchParams(window.location.search)
const filePath = params.get("file") || "http://127.0.0.1:8887/initial/plant/peashooter/peashooter.pam.json"
const folder = filePath.substring(0, filePath.lastIndexOf("/"))
const file = filePath.substring(filePath.lastIndexOf("/") + 1, filePath.length)
const animationIndex = parseInt(params.get("animation_index")) || 0

const animationsElement = document.querySelector(`#animations`)
const frameElement = document.querySelector(`#frame`)

window.fetch(new Request(`${folder}/${file}`)).then(response => {
    response.text().then(text => {
        const data = JSON5.parse(text)

        const images = data.image.map(it => {
            it.name = `${folder}/${it.name.substring(0, it.name.indexOf("|"))}.png`
            return it
        })
        const sprites = data.sprite.map(it => images[it.frame[0].append[0].resource].name)
        let resMap = new Map()
        data.main_sprite.frame.forEach(frame => {
            frame.append.forEach(it => {
                resMap.set(it.index, it.resource)
            })
        })

        const animations = data.main_sprite.frame.map(it => it.label).filter(it => it != null)
        animations.forEach((it, index) => {
            animationsElement.innerHTML += `<button onclick="
if (location.href.match(/animation_index=\\d+/)) {
    location.href = location.href.replace(/animation_index=\\d+/, 'animation_index=${index}')
} else if (location.href.match(/\\?/)) {
    location.href = '${location.href}&animation_index=${index}'
} else {
    location.href = '${location.href}?animation_index=${index}'
}
">${it}</button>`
        })

        const startFrameIndex = data.main_sprite.frame.map(it => it.label).indexOf(animations[animationIndex])
        let endFrameIndex = data.main_sprite.frame.map(it => it.label).indexOf(animations[animationIndex + 1])
        if (endFrameIndex === -1) {
            endFrameIndex = data.main_sprite.frame.length - 1
        }
        const frameCount = endFrameIndex - startFrameIndex - 1
        let localCurrentFrame = 0
        let frames = new Map()

        for (let i = 0; i < frameCount; i++) {
            setTimeout(() => {
                const currentFrame = startFrameIndex + localCurrentFrame
                const frame = data.main_sprite.frame[currentFrame]
                if (currentFrame === startFrameIndex) {
                    frames.clear()
                }
                frame.change.forEach(it => {
                    it.color = it.color || frames.get(it.index)?.color
                    frames.set(it.index, it)
                })
                frame.remove.forEach(it => {
                    frames.delete(it.index)
                })

                frameElement.innerHTML = ``
                frames.forEach((change, index) => {
                    if (change.color?.[3] !== 0.0 && resMap.has(index)) {
                        const src = sprites[resMap.get(index)]
                        const image = images.find(it => it.name === src)
                        const transform = TransformData.parse(image.transform).then(TransformData.parse(change.transform))
                        frameElement.innerHTML += `<style>
.main_frame_${currentFrame}_${index} {
width: ${image.size[0] * image.transform[0]}px;
height: ${image.size[1] * image.transform[3]}px;
${transform.cssTransformString()}
transform-origin: ${-image.transform[4]}px ${-image.transform[5]}px;
filter: brightness(${(change.color?.[0] + change.color?.[1] + change.color?.[2]) / 3 || 1});
opacity: ${change.color?.[3] || 1};
}
</style>`
                        frameElement.innerHTML += `<img
src="${src}"
alt="${src}"
class="image main_frame_${currentFrame}_${index}">`
                    }
                })
                frameElement.innerHTML += `</div>`

                localCurrentFrame += 1
                localCurrentFrame = localCurrentFrame % frameCount
            }, 1000 / data.frame_rate * i)
        }
    })
})