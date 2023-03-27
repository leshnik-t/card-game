import './loadingBar.css';

class LoadingBar {
    constructor(appendToElement = 'body') {
        this.appendToElement = appendToElement;
        const loadingBar = document.createElement('div');
        loadingBar.className = 'loading-bar';

        const text = document.createElement('span');
        text.textContent = 'Loading';
        loadingBar.appendChild(text);

        const animationBar = document.createElement('div');
        animationBar.className = 'animation-bar';
        loadingBar.appendChild(animationBar);

        const animationBarBackground = document.createElement('div');
        animationBarBackground.className = 'animation-bar-background';
        loadingBar.lastChild.appendChild(animationBarBackground);

        this.loadingBar = loadingBar;
    }
        
    preloadImages = async (urls) => {
        let counter = 0;

        const loadingBarStatus = (imagePath, current, max) => {
            this.loadingBar.children[0].textContent = `Loading ${imagePath} - ${current} of ${max}`;
            this.loadingBar.lastChild.children[0].style.left = "-" + Math.round(100 - ((current * 100)/max)) + "%";
        }

        const promiseImage = (path) => {
            return new Promise( (resolve, reject) => {
                const image = new Image();

                image.onload = () => {
                    let imageNumber = path.split('/').slice(-1).toString().match('[0-9]+');

                    if (imageNumber === null) {
                        imageNumber = -1;
                    } else {
                        imageNumber = parseInt(imageNumber.join(''));
                    }

                    resolve({image: image, index: imageNumber, path: path, status: 'ok'})
                }
                image.onerror = () => reject({path, status: 'error'});
                image.src = path;
                
            });
        }

        document.querySelector(this.appendToElement).prepend(this.loadingBar);

        try {
            const response_1 = await Promise.all(urls.map((path_2) => promiseImage(path_2)
                .then((response) => {
                    // console.log(response.path +  ' ' + response.status)
                    loadingBarStatus(response.path.split('/').slice(-1), ++counter, urls.length);
                    return Promise.resolve({ image: response.image, index: response.index });
                })
                .catch((error) => console.log(error.message))
            ));
            this.loadingBar.children[0].textContent = 'Loading Finished';
            response_1.sort((a, b) => a.index > b.index ? 1 : -1);
            return await new Promise((resolve_1) => {
                setTimeout(() => {
                    document.querySelector(this.appendToElement).removeChild(this.loadingBar);
                    resolve_1({ imageElements: response_1, target: this.appendToElement });
                }, 1000);
            });
        } catch {
            return console.log('error');
        }
    }
}

export default LoadingBar;