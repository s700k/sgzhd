// 动态规划算法
function dpSearch(nums, count, target) {
    const dp = Array(target + 1).fill().map(() => 
        Array(count + 1).fill().map(() => new Set())
    );
    
    dp[0][0].add(JSON.stringify([]));
    
    for (const num of nums) {
        for (let t = target; t >= num; t--) {
            for (let c = 1; c <= count; c++) {
                for (const prev of dp[t - num][c - 1]) {
                    const newComb = [...JSON.parse(prev), num];
                    dp[t][c].add(JSON.stringify(newComb));
                }
            }
        }
    }
    
    return Array.from(dp[target][count]).map(comb => JSON.parse(comb));
}

// 回溯剪枝算法
function backtrackSearch(nums, count, target) {
    nums.sort((a, b) => a - b);
    const res = [];
    
    function backtrack(start, path, remain, need) {
        if (remain === 0 && need === 0) {
            res.push([...path]);
            return;
        }
        if (remain < 0 || need === 0) {
            return;
        }
        
        for (let i = start; i < nums.length; i++) {
            if (i > start && nums[i] === nums[i-1]) continue;
            path.push(nums[i]);
            backtrack(i + 1, path, remain - nums[i], need - 1);
            path.pop();
        }
    }
    
    backtrack(0, [], target, count);
    return res;
}

// 并行搜索模拟
function parallelSearch(nums, count, target, numThreads) {
    const chunkSize = Math.ceil(nums.length / numThreads);
    const results = [];
    
    for (let i = 0; i < numThreads; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, nums.length);
        
        const sliceResults = [];
        backtrackSlice(nums, count, target, start, end, [], sliceResults);
        results.push(...sliceResults);
    }
    
    return results;
}

function backtrackSlice(nums, count, target, start, end, path, results) {
    if (path.length === count && path.reduce((a, b) => a + b, 0) === target) {
        results.push([...path]);
        return;
    }
    if (path.length >= count || path.reduce((a, b) => a + b, 0) > target) {
        return;
    }
    
    for (let i = start; i < end; i++) {
        if (i > start && nums[i] === nums[i-1]) continue;
        path.push(nums[i]);
        backtrackSlice(nums, count, target, i + 1, end, path, results);
        path.pop();
    }
}

// 监听主线程消息
self.onmessage = function(e) {
    const { numList, count, targetSum, numThreads, algorithm } = e.data;
    const startTime = performance.now();
    
    let results, algoUsed;
    
    // 根据算法选择和问题规模自动选择计算方式
    if (algorithm === "auto") {
        if (numList.length <= 20) {
            results = dpSearch(numList, count, targetSum);
            algoUsed = "动态规划";
        } else {
            results = parallelSearch(numList, count, targetSum, numThreads);
            algoUsed = `回溯剪枝 (${numThreads}线程)`;
        }
    } else if (algorithm === "dp") {
        results = dpSearch(numList, count, targetSum);
        algoUsed = "动态规划";
    } else {
        if (numList.length > 15) {
            results = parallelSearch(numList, count, targetSum, numThreads);
            algoUsed = `回溯剪枝 (${numThreads}线程)`;
        } else {
            results = backtrackSearch(numList, count, targetSum);
            algoUsed = "回溯剪枝";
        }
    }
    
    const elapsedTime = (performance.now() - startTime) / 1000;
    
    // 返回结果给主线程
    self.postMessage({
        results,
        elapsedTime,
        algoUsed
    });
};