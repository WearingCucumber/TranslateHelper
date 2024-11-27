// 移除 script 注入部分，直接实现 MD5
function MD5(string) {
    function RotateLeft(lValue, iShiftBits) {
        return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    }
 
    function AddUnsigned(lX,lY) {
        var lX4,lY4,lX8,lY8,lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }
 
    function F(x,y,z) { return (x & y) | ((~x) & z); }
    function G(x,y,z) { return (x & z) | (y & (~z)); }
    function H(x,y,z) { return (x ^ y ^ z); }
    function I(x,y,z) { return (y ^ (x | (~z))); }
 
    function FF(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
 
    function GG(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
 
    function HH(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
 
    function II(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
 
    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1=lMessageLength + 8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
        var lWordArray=Array(lNumberOfWords-1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while ( lByteCount < lMessageLength ) {
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
        return lWordArray;
    }
 
    function WordToHex(lValue) {
        var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
        for (lCount = 0;lCount<=3;lCount++) {
            lByte = (lValue>>>(lCount*8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
        }
        return WordToHexValue;
    }
 
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }
 
    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;
 
    string = Utf8Encode(string);
    x = ConvertToWordArray(string);
    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
 
    for (k=0;k<x.length;k+=16) {
        AA=a; BB=b; CC=c; DD=d;
        a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
        d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
        c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
        b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
        a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
        d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
        c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
        b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
        a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
        d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
        c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
        b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
        a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
        d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
        c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
        b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
        a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
        d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
        c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
        b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
        a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
        d=GG(d,a,b,c,x[k+10],S22,0x2441453);
        c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
        b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
        a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
        d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
        c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
        b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
        a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
        d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
        c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
        b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
        a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
        d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
        c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
        b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
        a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
        d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
        c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
        b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
        a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
        d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
        c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
        b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
        a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
        d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
        c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
        b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
        a=II(a,b,c,d,x[k+0], S41,0xF4292244);
        d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
        c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
        b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
        a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
        d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
        c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
        b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
        a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
        d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
        c=II(c,d,a,b,x[k+6], S43,0xA3014314);
        b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
        a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
        d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
        c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
        b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
        a=AddUnsigned(a,AA);
        b=AddUnsigned(b,BB);
        c=AddUnsigned(c,CC);
        d=AddUnsigned(d,DD);
    }
 
    var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
    return temp.toLowerCase();
}

let isTranslationEnabled = false;
let originalTexts = new Map();

// 语言检测函数
function detectLanguage(text) {
    const chineseRegex = /[\u4e00-\u9fa5]/;
    const englishRegex = /[a-zA-Z]/;
    
    if (chineseRegex.test(text)) return 'zh-Hans';
    if (englishRegex.test(text)) return 'en';
    return 'unknown';
}

// 在 content.js 中添加获取默认语言设置的函数
async function getDefaultTargetLanguage() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['defaultTargetLang'], (result) => {
            const targetLang = result.defaultTargetLang || 'zh-CN';
            console.log('获取到的目标语言设置:', targetLang);
            resolve(targetLang);
        });
    });
}

// 修改 translateText 函数
async function translateText(text, sourceLang) {
    console.log('开始翻译:', { text, sourceLang });
    
    try {
        // 每次翻译前重新获取目标语言设置
        const targetLang = await getDefaultTargetLanguage();
        console.log('使用目标语言:', targetLang);
        
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        
        // 如果文本长度超过1000字符，进行分段处理
        if (text.length > 1000) {
            // 按句子分割文本
            const sentences = text.match(/[^.!?。！？]+[.!?。！？]+/g) || [text];
            let result = '';
            let currentChunk = '';

            for (const sentence of sentences) {
                // 如果当前块加上新句子不超过1000字符
                if ((currentChunk + sentence).length <= 1000) {
                    currentChunk += sentence;
                } else {
                    // 翻译当前块
                    if (currentChunk) {
                        const translatedChunk = await translateSingleChunk(currentChunk, sourceLang, targetLang);
                        result += translatedChunk;
                        currentChunk = sentence;
                    }
                }
            }

            // 翻译最后一块
            if (currentChunk) {
                const translatedChunk = await translateSingleChunk(currentChunk, sourceLang, targetLang);
                result += translatedChunk;
            }

            return result;
        } else {
            // 短文本直接翻译
            return await translateSingleChunk(text, sourceLang, targetLang);
        }
    } catch (error) {
        console.error('翻译错误:', error);
        return null;
    }
}

// 添加单个文本块的翻译函数
async function translateSingleChunk(text, from, to) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await chrome.runtime.sendMessage({
        action: 'translate',
        data: {
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: null
        }
    });
    
    console.log('翻译响应:', response);
    
    if (response && response[0]) {
        // 合并所有翻译结果
        return response[0]
            .filter(item => item && item[0])
            .map(item => item[0])
            .join('');
    } else if (response.error) {
        throw new Error(response.error);
    } else {
        throw new Error('翻译返回数据格式错误');
    }
}

// Base64 编码工具
const Base64 = {
    encode: function(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
    },
    decode: function(str) {
        return decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }
};

// 处理段落翻译
async function translateParagraph(element) {
    try {
        console.log('处理段落:', element);
        
        // 跳过已翻译的元素
        if (element.hasAttribute('data-translated')) {
            console.log('段落已翻译，跳过');
            return;
        }
        
        // 跳过翻译结果元素
        if (element.classList.contains('translation-result')) {
            console.log('跳过翻译结果元素');
            return;
        }
        
        const text = element.textContent.trim();
        if (!text || text.length < 2) {  // 跳过太短的文本
            console.log('文本太短或为空，跳过');
            return;
        }
        
        const lang = detectLanguage(text);
        console.log('检测到语言:', lang);
        
        if (lang === 'unknown') {
            console.log('未知语言，跳过');
            return;
        }
        
        const translation = await translateText(text, lang);
        if (!translation) {
            console.log('翻译失败，跳过');
            return;
        }
        
        console.log('翻译结果:', translation);
        
        // 保存原始文本
        originalTexts.set(element, element.innerHTML);
        
        // 创建翻译结果容器，继承原元素的样式
        const translationDiv = element.cloneNode(false);
        translationDiv.removeAttribute('data-translated');
        translationDiv.className = 'translation-result ' + element.className;
        translationDiv.style.cssText = element.style.cssText;
        
        // 设置翻译文本
        translationDiv.textContent = translation;
        
        // 插入翻译结果
        element.setAttribute('data-translated', 'true');
        element.insertAdjacentElement('afterend', translationDiv);
        
        console.log('翻译已添加到页面');
    } catch (error) {
        console.error('处理段落时出错:', error);
    }
}

// 恢复原始文本
function restoreOriginalText(element) {
    try {
        console.log('恢复原文:', element);
        if (originalTexts.has(element)) {
            // 移除翻译结果元素
            const translationResult = element.nextElementSibling;
            if (translationResult && translationResult.classList.contains('translation-result')) {
                translationResult.remove();
            }
            
            element.innerHTML = originalTexts.get(element);
            element.removeAttribute('data-translated');
            originalTexts.delete(element);
            console.log('原文已恢复');
        }
    } catch (error) {
        console.error('恢复原文时出错:', error);
    }
}

// 切换翻译状态
async function toggleTranslation() {
    console.log('切换翻译状态, 当前状态:', isTranslationEnabled);
    isTranslationEnabled = !isTranslationEnabled;
    
    try {
        if (isTranslationEnabled) {
            console.log('开始翻译文章内容');
            
            // 常见的博客文章内容选择器
            const articleSelectors = [
                'article',                    // 标准文章标签
                '.post-content',              // 常见的文章内容类名
                '.article-content',
                '.entry-content',
                '.blog-post',
                '.post-body',
                'main',                       // 主要内容区域
                '[role="main"]',
                '.main-content'
            ].join(',');

            // 获取文章内容区域
            const articleElements = document.querySelectorAll(articleSelectors);
            
            for (const article of articleElements) {
                // 使用 TreeWalker 遍历文本节点
                const walker = document.createTreeWalker(
                    article,
                    NodeFilter.SHOW_TEXT,
                    {
                        acceptNode: function(node) {
                            // 过滤条件
                            const parent = node.parentElement;
                            const text = node.textContent.trim();
                            
                            // 跳过这些元素
                            if (
                                parent.tagName === 'CODE' ||          // 代码块
                                parent.tagName === 'PRE' ||           // 预格式化文本
                                parent.tagName === 'SCRIPT' ||        // 脚本
                                parent.tagName === 'STYLE' ||         // 样式
                                parent.classList.contains('code') ||   // 包含 code 类的元素
                                parent.classList.contains('prism') ||  // Prism 代码高亮
                                text.length < 10 ||                   // 太短的文本
                                /^[0-9\s\W]+$/.test(text) ||         // 只包含数字和标点的文本
                                parent.closest('pre, code')           // 在代码块内的文本
                            ) {
                                return NodeFilter.FILTER_REJECT;
                            }
                            
                            return NodeFilter.FILTER_ACCEPT;
                        }
                    }
                );

                // 遍历并翻译文本节点
                let node;
                while (node = walker.nextNode()) {
                    const parent = node.parentElement;
                    if (!parent.hasAttribute('data-translated')) {
                        await translateParagraph(parent);
                    }
                }
            }
            
            console.log('文章翻译完成');
        } else {
            console.log('开始恢复原文');
            const translatedElements = document.querySelectorAll('[data-translated]');
            console.log('找到已翻译元素数量:', translatedElements.length);
            translatedElements.forEach(restoreOriginalText);
            console.log('所有原文已恢复');
        }
    } catch (error) {
        console.error('切换翻译状态时出错:', error);
    }
}

// 监听快捷键消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消:', request);
    if (request.action === 'toggle-translation') {
        toggleTranslation();
        sendResponse({ success: true });
    }
    return true;
});

// 初始化
console.log('翻译脚本已加载'); 
