let currentShortcut = '';

// 加载保存的设置
function loadSettings() {
    chrome.storage.sync.get(['translationShortcut', 'defaultTargetLang'], (result) => {
        if (result.translationShortcut) {
            currentShortcut = result.translationShortcut;
            document.getElementById('shortcutInput').value = currentShortcut;
        }
        
        if (result.defaultTargetLang) {
            document.getElementById('defaultTargetLang').value = result.defaultTargetLang;
        }
    });
}

// 保存语言设置
document.getElementById('saveLangBtn').addEventListener('click', () => {
    const targetLang = document.getElementById('defaultTargetLang').value;
    
    chrome.storage.sync.set({
        defaultTargetLang: targetLang
    }, () => {
        showMessage('网页翻译的目标语言设置已保存', 'success');
    });
});

// 快捷键设置
document.getElementById('shortcutInput').addEventListener('keydown', (e) => {
    e.preventDefault();
    
    const keys = [];
    if (e.ctrlKey) keys.push('Ctrl');
    if (e.shiftKey) keys.push('Shift');
    if (e.altKey) keys.push('Alt');
    
    if (![16, 17, 18].includes(e.keyCode)) {
        keys.push(e.key.toUpperCase());
    }
    
    if (keys.length > 0) {
        currentShortcut = keys.join('+');
        e.target.value = currentShortcut;
    }
});

document.getElementById('saveBtn').addEventListener('click', () => {
    if (currentShortcut) {
        chrome.runtime.sendMessage({
            action: 'updateShortcut',
            shortcut: currentShortcut
        }, (response) => {
            if (chrome.runtime.lastError) {
                showMessage('保存失败：' + chrome.runtime.lastError.message, 'error');
            } else if (response && response.success) {
                showMessage(response.message, 'info');
                setTimeout(() => {
                    chrome.tabs.create({
                        url: 'chrome://extensions/shortcuts'
                    });
                }, 2000);
            } else {
                showMessage('保存失败：' + (response?.error || '未知错误'), 'error');
            }
        });
    } else {
        showMessage('请先设置快捷键！', 'error');
    }
});

function showMessage(message, type = 'info') {
    const existingMsg = document.querySelector('.message');
    if (existingMsg) {
        existingMsg.remove();
    }

    const msgElement = document.createElement('div');
    msgElement.className = `message ${type}`;
    msgElement.textContent = message;
    
    const activeSection = document.activeElement.closest('.section');
    const button = activeSection.querySelector('button');
    button.parentNode.insertBefore(msgElement, button.nextSibling);

    setTimeout(() => {
        msgElement.remove();
    }, 3000);
}

// 初始化加载设置
document.addEventListener('DOMContentLoaded', loadSettings); 