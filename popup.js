let currentSourceLang = 'auto';
let currentTargetLang = 'zh-CN';

document.addEventListener('DOMContentLoaded', () => {
    // 标签页切换
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');

    tabItems.forEach(item => {
        item.addEventListener('click', () => {
            // 移除所有活动状态
            tabItems.forEach(tab => tab.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // 添加当前标签的活动状态
            item.classList.add('active');
            const tabId = item.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    const sourceText = document.getElementById('sourceText');
    const translatedText = document.getElementById('translatedText');
    const translateBtn = document.getElementById('translateBtn');
    const switchBtn = document.getElementById('switchLanguages');
    const sourceLanguage = document.getElementById('sourceLanguage');
    const targetLanguage = document.getElementById('targetLanguage');

    // 加载翻译页面的语言设置（这个是独立的，与网页翻译设置无关）
    chrome.storage.sync.get(['popupSourceLang', 'popupTargetLang'], (result) => {
        if (result.popupSourceLang) {
            sourceLanguage.value = result.popupSourceLang;
        }
        if (result.popupTargetLang) {
            targetLanguage.value = result.popupTargetLang;
        }
    });

    // 添加消息提示函数
    function showMessage(message, type = 'info') {
        const existingMsg = document.querySelector('.message');
        if (existingMsg) {
            existingMsg.remove();
        }

        const msgElement = document.createElement('div');
        msgElement.className = `message ${type}`;
        msgElement.textContent = message;
        
        // 根据当前活动的标签页来决定插入位置
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab.id === 'translate') {
            // 在翻译按钮之前插入消息
            const translateBtn = document.getElementById('translateBtn');
            translateBtn.parentNode.insertBefore(msgElement, translateBtn);
        } else {
            // 在设置页面中插入消息
            const saveLangBtn = document.getElementById('saveLangBtn');
            saveLangBtn.parentNode.insertBefore(msgElement, saveLangBtn.nextSibling);
        }

        // 3秒后自动消失
        setTimeout(() => {
            msgElement.remove();
        }, 3000);
    }

    // 在 popup.js 中添加友好的提示样式
    const styles = `
    .toast {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 1000;
        animation: fadeInOut 2s ease;
    }

    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -20px); }
        20% { opacity: 1; transform: translate(-50%, 0); }
        80% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -20px); }
    }
    `;

    // 添加样式到页面
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // 添加提示函数
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // 2秒后自动移除
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }

    // 修改保存语言设置的函数
    function savePopupLanguageSettings() {
        const settings = {
            popupSourceLang: sourceLanguage.value,
            popupTargetLang: targetLanguage.value,
            // 同时保存为网页翻译的目标语言
            defaultTargetLang: targetLanguage.value
        };

        chrome.storage.sync.set(settings, () => {
            if (chrome.runtime.lastError) {
                showToast('设置保存失败');
            } else {
                showToast('设置已保存');
                console.log('保存的设置:', settings);
            }
        });
    }

    // 语言选择改变时保存设置
    sourceLanguage.addEventListener('change', savePopupLanguageSettings);
    targetLanguage.addEventListener('change', savePopupLanguageSettings);

    // 自动检测输入语言
    sourceText.addEventListener('input', () => {
        const text = sourceText.value.trim();
        if (text && sourceLanguage.value === 'auto') {
            const detectedLang = detectLanguage(text);
            if (detectedLang !== 'unknown') {
                sourceLanguage.value = detectedLang;
                // 如果源语言和目标语言相同，自动切换目标语言
                if (sourceLanguage.value === targetLanguage.value) {
                    targetLanguage.value = detectedLang === 'zh-CN' ? 'en' : 'zh-CN';
                }
            }
        }
    });

    // 翻译按钮点击事件
    translateBtn.addEventListener('click', async () => {
        const text = sourceText.value.trim();
        if (!text) return;

        try {
            translateBtn.disabled = true;
            translateBtn.textContent = '翻译中...';

            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage.value}&tl=${targetLanguage.value}&dt=t&q=${encodeURIComponent(text)}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data && data[0]) {
                const translation = data[0]
                    .filter(item => item && item[0])
                    .map(item => item[0])
                    .join('');
                
                translatedText.value = translation;
            }
        } catch (error) {
            console.error('翻译错误:', error);
            translatedText.value = '翻译失败，请稍后重试';
        } finally {
            translateBtn.disabled = false;
            translateBtn.textContent = '翻译';
        }
    });

    // 切换语言按钮点击事件
    switchBtn.addEventListener('click', () => {
        if (sourceLanguage.value !== 'auto') {
            [sourceLanguage.value, targetLanguage.value] = [targetLanguage.value, sourceLanguage.value];
            [sourceText.value, translatedText.value] = [translatedText.value, sourceText.value];
            savePopupLanguageSettings();
        }
    });

    // 加载保存的设置
    console.log('开始加载设置');
    chrome.storage.sync.get(['popupSourceLang', 'popupTargetLang'], (result) => {
        console.log('加载到的设置:', result); // 添加日志
        if (result.popupSourceLang) {
            sourceLanguage.value = result.popupSourceLang;
            console.log('设置源语言:', result.popupSourceLang);
        }
        if (result.popupTargetLang) {
            targetLanguage.value = result.popupTargetLang;
            console.log('设置目标语言:', result.popupTargetLang);
        }
    });

    // 添加错误处理
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('Error:', {message, source, lineno, colno, error});
        showMessage('发生错误：' + message, 'error');
    };

    // 添加未捕获的 Promise 错误处理
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        showMessage('异步操作失败：' + event.reason, 'error');
    });
});

// 语言检测函数
function detectLanguage(text) {
    const patterns = {
        'zh-CN': /[\u4e00-\u9fa5]/,
        'ja': /[\u3040-\u309F\u30A0-\u30FF]/,
        'ko': /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/,
        'en': /^[a-zA-Z\s.,!?'"()-]+$/
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
        if (pattern.test(text)) {
            return lang;
        }
    }
    return 'unknown';
}

// 在 popup.html 的 <style> 标签中添加消息样式
const styles = `
.message {
    margin: 10px 0;
    padding: 10px;
    border-radius: 8px;
    animation: fadeIn 0.3s ease;
}

.message.success {
    background-color: #dff0d8;
    color: #3c763d;
    border: 1px solid #d6e9c6;
}

.message.error {
    background-color: #f2dede;
    color: #a94442;
    border: 1px solid #ebccd1;
}

.message.info {
    background-color: #d9edf7;
    color: #31708f;
    border: 1px solid #bce8f1;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

@media (prefers-color-scheme: dark) {
    .message.success {
        background-color: #1c3a1c;
        color: #a3d7a3;
        border-color: #2c4a2c;
    }

    .message.error {
        background-color: #3a1c1c;
        color: #d7a3a3;
        border-color: #4a2c2c;
    }

    .message.info {
        background-color: #1c2a3a;
        color: #a3c7d7;
        border-color: #2c3a4a;
    }
}`;

// 添加样式到页面
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet); 