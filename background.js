// 监听快捷键
chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle-translation') {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs && tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'toggle-translation'})
                    .catch(error => {
                        console.log('无法发送消息到内容脚本:', error);
                    });
            }
        });
    }
});

// 处理翻译请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'translate') {
        handleTranslateRequest(request.data)
            .then(sendResponse)
            .catch(error => sendResponse({ error: error.message }));
        return true; // 保持消息通道开启
    }
    
    if (request.action === 'updateShortcut') {
        chrome.storage.sync.set({
            translationShortcut: request.shortcut
        }, () => {
            sendResponse({ 
                success: true, 
                message: '快捷键设置已保存。请在扩展管理页面的键盘快捷键设置中手动更新。'
            });
        });
        return true;
    }
});

// 处理翻译请求的函数
async function handleTranslateRequest(data) {
    try {
        console.log('Sending translation request:', data);
        const response = await fetch(data.url, {
            method: data.body ? 'POST' : 'GET',
            headers: data.headers,
            body: data.body ? JSON.stringify(data.body) : undefined
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Translation API error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Translation API response:', result);
        return result;
    } catch (error) {
        console.error('Translation request failed:', error);
        return { error: error.message };
    }
}

// 添加存储变更监听
chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log('Storage changes:', changes);
    if (changes.defaultTargetLang) {
        console.log('目标语言设置已更改:', {
            old: changes.defaultTargetLang.oldValue,
            new: changes.defaultTargetLang.newValue
        });
    }
}); 