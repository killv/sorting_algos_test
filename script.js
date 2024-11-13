document.getElementById('startRace').addEventListener('click', startRace);
document.getElementById('startListLength').addEventListener('input', validateInput);

function validateInput(event) {
    const input = event.target;
    const value = parseInt(input.value);
    if (isNaN(value) || value < input.min) {
        input.value = input.min;
    } else if (value > input.max) {
        input.value = input.max;
    }
}

const algorithms = [
    {id: 'bubbleSort', sort: bubbleSort},
    {id: 'mergeSort', sort: mergeSort},
    {id: 'quickSort', sort: quickSort},
    {id: 'heapSort', sort: heapSort},
    {id: 'insertionSort', sort: insertionSort}
];

function createStartList(length) {
    // create linear array and shuffle
    return Array.from({length}, () => Math.floor(Math.random() * 100));
}

async function startRace() {
    const startListLength = parseInt(document.getElementById('startListLength').value) || 30;
    const startList = createStartList(startListLength);

    function run(i = 0) {
        const algo = algorithms[i];
        const canvas = document.querySelector(`#${algo.id} canvas`);
        const ctx = canvas.getContext('2d');
        const iterationsElement = document.getElementById(`${algo.id}Iterations`);

        algo.sort([...startList], ctx, iterationsElement).then(() => {
            i++;
            if (algorithms[i]) run(i);
            else console.log('done');
        });
    }

    run();
}

function bubbleSort(arr, ctx, iterationsElement) {
    return new Promise(resolve => {
        let iterations = 0;
        let n = arr.length;
        let i = 0;
        let j = 0;

        function step() {
            if (i < n - 1) {
                if (j < n - i - 1) {
                    if (arr[j] > arr[j + 1]) {
                        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    }
                    iterations++;
                    iterationsElement.textContent = iterations;
                    drawArray(arr, ctx);
                    j++;
                } else {
                    j = 0;
                    i++;
                }
                
                actionDelay(i, step); // Задержка для визуализации
            } else {
                resolve();
            }
        }

        step();
    });
}

function mergeSort(arr, ctx, iterationsElement) {
    return new Promise(resolve => {
        let iterations = 0;
        drawArray(arr, ctx);

        function mergeSortHelper(arr) {
            if (arr.length <= 1) return arr;
            const mid = Math.floor(arr.length / 2);
            const left = arr.slice(0, mid);
            const right = arr.slice(mid);
            return merge(mergeSortHelper(left), mergeSortHelper(right));
        }

        function merge(left, right) {
            let result = [];
            let i = 0;
            let j = 0;

            while (i < left.length && j < right.length) {
                if (left[i] < right[j]) {
                    result.push(left[i]);
                    i++;
                } else {
                    result.push(right[j]);
                    j++;
                }
                iterations++;
                iterationsElement.textContent = iterations;
                drawArray(result.concat(left.slice(i)).concat(right.slice(j)), ctx);
            }

            return result.concat(left.slice(i)).concat(right.slice(j));
        }

        mergeSortHelper(arr);

        resolve();
    });
}

function quickSort(arr, ctx, iterationsElement) {
    return new Promise(resolve => {
        let iterations = 0;

        function quickSortHelper(arr, low, high) {
            if (low < high) {
                const pi = partition(arr, low, high);
                quickSortHelper(arr, low, pi - 1);
                quickSortHelper(arr, pi + 1, high);
            }
        }

        function partition(arr, low, high) {
            const pivot = arr[high];
            let i = low - 1;

            for (let j = low; j < high; j++) {
                if (arr[j] < pivot) {
                    i++;
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    iterations++;
                    iterationsElement.textContent = iterations;
                    drawArray(arr, ctx);
                }
            }

            [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
            return i + 1;
        }

        quickSortHelper(arr, 0, arr.length - 1);
        resolve();
    });
}

function heapSort(arr, ctx, iterationsElement) {
    return new Promise(resolve => {
        let iterations = 0;

        function heapify(arr, n, i) {
            let largest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            if (left < n && arr[left] > arr[largest]) {
                largest = left;
            }

            if (right < n && arr[right] > arr[largest]) {
                largest = right;
            }

            if (largest !== i) {
                [arr[i], arr[largest]] = [arr[largest], arr[i]];
                iterations++;
                iterationsElement.textContent = iterations;
                drawArray(arr, ctx);
                heapify(arr, n, largest);
            }
        }

        function heapSortHelper(arr) {
            const n = arr.length;

            for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
                heapify(arr, n, i);
            }

            for (let i = n - 1; i > 0; i--) {
                [arr[0], arr[i]] = [arr[i], arr[0]];
                iterations++;
                iterationsElement.textContent = iterations;
                drawArray(arr, ctx);
                heapify(arr, i, 0);
            }
        }

        heapSortHelper(arr);
        resolve();
    });
}

function actionDelay(i, action) {
    if (i % 5 == 0) {
        setTimeout(action, 2); // Задержка для визуализации
    } else {
        action();
    }
}

function insertionSort(arr, ctx, iterationsElement) {
    return new Promise(resolve => {
        let iterations = 0;
        let i = 1;
        let j = 0;

        function step() {
            if (i < arr.length) {
                if (j >= 0 && arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    j--;
                    iterations++;
                    iterationsElement.textContent = iterations;
                    drawArray(arr, ctx);
                    
                    actionDelay(i, step); 

                } else {
                    i++;
                    j = i - 1;
                    step();
                }
            } else {
                resolve();
            }
        }

        step();
    });
}

function drawArray(arr, ctx) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const barWidth = canvasWidth / arr.length;
    const maxValue = Math.max(...arr);

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    arr.forEach((value, index) => {
        const barHeight = (value / maxValue) * canvasHeight;
        ctx.fillStyle = '#007BFF';
        ctx.fillRect(index * barWidth, canvasHeight - barHeight, barWidth, barHeight);
    });
}
