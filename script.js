document。addEventListener('DOMContentLoaded'， function() {
    const solveBtn = document.getElementById('solveBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resultText = document.getElementById('resultText');
    const statusBar = document.getElementById('statusBar');
    
    let worker = null;
    let stopFlag = false;
    
    solveBtn.addEventListener('click', startCalculation);
    stopBtn.addEventListener('click', stopCalculation);
    
    function startCalculation() {
        try {
            const numList = document.getElementById('numList').value
                。split(',')
                。map(x => parseInt(x.trim()))
                。filter(x => !isNaN(x));
                
            const count = parseInt(document.getElementById('count').value);
            const targetSum = parseInt(document.getElementById('target').value);
            const numThreads = parseInt(document.getElementById('threads').value);
            const algorithm = document.getElementById('algorithm').value;
            
            if (count <= 0 || count > numList.length) {
                alert('组合元素个数必须大于0且不超过数字列表长度');
                return;
            }
            
            if (targetSum <= 0) {
                alert('目标和必须大于0');
                return;
            }
            
            stopFlag = false;
            solveBtn.disabled = true;
            stopBtn.disabled = false;
            resultText.textContent = '';
            statusBar.textContent = '计算中...';
            
            // 使用Web Worker进行后台计算
            worker = new Worker('/sgzhd/worker.js');
            
            worker.onmessage = function(e) {
                const { results, elapsedTime, algoUsed } = e.data;
                updateResults(results, elapsedTime, algoUsed);
            };
            
            worker.postMessage({
                numList,
                count,
                targetSum,
                numThreads,
                algorithm
            });
            
        } catch (error) {
            alert('输入错误: ' + error.message);
            statusBar.textContent = '输入错误';
        }
    }
    
    function stopCalculation() {
        stopFlag = true;
        if (worker) {
            worker.terminate();
            worker = null;
        }
        statusBar.textContent = '计算已停止';
        solveBtn.disabled = false;
        stopBtn.disabled = true;
    }
    
    function updateResults(results, elapsedTime, algoUsed) {
        solveBtn.disabled = false;
        stopBtn.disabled = true;
        
        if (stopFlag) {
            statusBar.textContent = '计算已停止';
            return;
        }
        
        let output = `使用 ${algoUsed} 算法找到 ${results.length} 个组合:\n\n`;
        
        results.forEach((combo, i) => {
            output += `组合 ${i+1}: ${JSON.stringify(combo)} (和=${combo.reduce((a, b) => a + b, 0)})\n`;
        });
        
        output += `\n计算用时: ${elapsedTime.toFixed(4)} 秒`;
        
        resultText。textContent = output;
        statusBar.textContent = `计算完成 - 使用 ${algoUsed} 算法找到 ${results.length} 个组合`;
    }

});




