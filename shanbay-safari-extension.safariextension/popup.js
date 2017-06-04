//copied from https://raw.github.com/gamerh2o/shanbay-chromium-extension/master/popup.js

function getFirstChildWithTagName(element, tagName) {
    var tagName = tagName.toUpperCase();
    var childs = element.childNodes;
    for(var i = 0; i < childs.length; i++) {
        if (childs[i].nodeName == tagName)
            return childs[i];
    }
}


function clearArea(area) {
    if (area == 'definition') {
	document.getElementById('content').innerHTML = '';
	document.getElementById('pron').innerHTML = '';
	document.getElementById('sound').innerHTML = '';
	document.getElementById('zh_trans').innerHTML = '';
	document.getElementById('en_trans').innerHTML = '';
	return null;
    }
    document.getElementById(area).innerHTML = '';
}


function showTips(message) {
    var tips = document.getElementById('tips');
    if (message.length == 0)
	clearArea('tips');
    else
	tips.innerHTML = '<p>' + message + '</p>';
}


function loggedIn(nick_name) {
    var status = document.getElementById('status');
    var user_link = document.createElement('a');
    var user_home = 'http://www.shanbay.com/home/';
    user_link.setAttribute('href', user_home);
    user_link.onclick = function(){
        safari.application.activeBrowserWindow.openTab().url = user_home;
    }
    user_link.appendChild(document.createTextNode(nick_name + '的空间'));
    clearArea('status');
    status.appendChild(user_link);
    var search_area = document.getElementById('search_area');
    search_area.setAttribute('class', 'visible');
}


function loggedOut() {
    var status = document.getElementById('status');
    var login_link = document.createElement('a');
    var redirect = 'https://api.shanbay.com/oauth2/auth/success/'
    var clientID = 'c993515132fdae3fc768'
    var oauthType = 'token' // code|token
    var login_url = 'https://api.shanbay.com/oauth2/authorize/?client_id='+clientID
        +'&response_type='+oauthType+'&redirect_uri='+encodeURIComponent(redirect);
    login_link.setAttribute('href', login_url);
    login_link.onclick = function(){
        safari.extension.popovers[0].hide()
        var newTab=safari.application.activeBrowserWindow.openTab()
        newTab.url = login_url;
        newTab.addEventListener("beforeNavigate",beforeNavigateHandler,false)
    }
    login_link.appendChild(document.createTextNode('登录'));
    clearArea('status');
    status.appendChild(login_link);
    // body area
    var search_area = document.getElementById('search_area');
    search_area.setAttribute('class', 'invisible');
    showTips('请点击右上角链接登录，登录后才能查词');
}

function beforeNavigateHandler(evt){
    var successPrefix='https://api.shanbay.com/oauth2/auth/success/#access_token='
    var idx=evt.url.indexOf(successPrefix)
    if(idx===0){
        idx+=successPrefix.length
        var endIdx=evt.url.indexOf('&',idx)
        var token=evt.url.substring(idx,endIdx)
        safari.extension.secureSettings.token = token
        evt.preventDefault()
        safari.application.activeBrowserWindow.activeTab.close()
        alert('登录扇贝成功，现在可以用插件查词了')
        //update UI
        checkLoginStatus()
    }
}

function tokenQueryString(){
    return "access_token="+safari.extension.secureSettings.token
}

function checkLoginStatus() {
    // focus on input area
    //document.getElementById('input').focus();
    // status area
    var status = document.getElementById('status');
    if(!(safari.extension.secureSettings.token)||safari.extension.secureSettings.token.length===0){
        //no token yet
        loggedOut()
        return
    }
    // check status with token, got 401 HTTP status if the token invalid or expired
    status.innerHTML = '正在检查...';
    // tips area
    showTips('提示：使用回车键搜索更快捷');
    var request = new XMLHttpRequest();
    var check_url = 'https://api.shanbay.com/account/?'+tokenQueryString();
    request.open('GET', check_url);
    request.onreadystatechange = function () {
        if (request.readyState === 4) {//DONE
            switch(request.status){
                case 401: loggedOut();break
                case 429: alert("请求次数过多!");break
                case 200:
                    var response = JSON.parse(request.responseText);
                    var nick_name = response.nickname;
                    //other key: username,id,avatar
                    loggedIn(nick_name);
                    break
                default:
                    alert("Error")
                    loggedOut()
            }
        }
    };
    request.send(null);
}


function addWord(evt) {
    var jump = document.getElementById('jump');
    var a = getFirstChildWithTagName(jump, 'a');
    var request = new XMLHttpRequest();
    var word = a.title
    var add_url = 'https://api.shanbay.com/bdc/learning/'
    jump.innerHTML = '添加中...';
    request.open('POST', add_url);
    request.setRequestHeader("Authorization","Bearer "+safari.extension.secureSettings.token);
    request.setRequestHeader("Content-Type","application/x-www-form-urlencoded")
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            var learning_id = JSON.parse(request.responseText).data.id;
            clearArea('jump');
            jump.appendChild(document.createTextNode('已添加 '));
            var check_link = 'http://www.shanbay.com/review/learning/';
            var check = document.createElement('a');
            check.setAttribute('id', 'jump_a');
            check.setAttribute('href', check_link + learning_id);
            check.onclick=function(){
                safari.application.activeBrowserWindow.openTab().url = check_link + learning_id;
            }
            check.appendChild(document.createTextNode('查看'));
            jump.appendChild(check);
            document.getElementById('input').focus();
        }
    };
    request.send("id="+word);
    evt.preventDefault();//disable the page navigation
}


function showEnDefinitions(en_definitions) {
    var en_trans = document.getElementById('en_trans');
    for (var i in en_definitions) {
	var div = document.createElement('div');
	div.setAttribute('class', 'part-of-speech');
	div.innerHTML = '<strong>' + i + '</strong>';
	var ol = document.createElement('ol');
	for (var j = 0; j < en_definitions[i].length; j++) {
	    var li = document.createElement('li');
	    li.innerText = en_definitions[i][j];
	    ol.appendChild(li);
	}
	en_trans.appendChild(div);
	en_trans.appendChild(ol);
    }
}


function queryOk(response) {
    // clear tips area
    showTips('');
    clearArea('jump');
    clearArea('definition');    

    var learning_id = response.learning_id;
    var voc = response;

    // word and pronouncation
    var content = document.getElementById('content');
    content.innerHTML = voc.content + ' ';
    if (response.pronunciation.length != 0) {
	   var pron = document.getElementById('pron');
	   // if word too long, put pronouncation in the next line
	   if (response.content.length > 11)
            pron.innerHTML = '<br />[' + response.pronunciation + ']';
	   else
            pron.innerHTML = '[' + response.pronunciation + '] ';
    }

    // if audio is available
    if (voc.audio.length != 0) {
        var alt = voc.content;
        var img = document.createElement('img');
        img.setAttribute('src', 'audio.png');
        img.setAttribute('id', 'horn');
        img.setAttribute('alt', alt);
        var sound = document.getElementById('sound');
        sound.appendChild(img);
    }

    var zh_trans = document.getElementById('zh_trans');
    zh_trans.innerHTML = voc.definition;

    showEnDefinitions(voc.en_definitions)

    // jump area
    var jump = document.getElementById('jump');
    if (learning_id) {
            var check_link = 'http://www.shanbay.com/review/learning/';
            var check = document.createElement('a');
            check.setAttribute('id', 'jump_a');
            check.setAttribute('href', check_link + learning_id);
            check.appendChild(document.createTextNode('查看'));
            check.onclick=function(){
                safari.application.activeBrowserWindow.openTab().url = check_link + learning_id;
            }
            jump.appendChild(check);
        }
    else {
        //never learnt, can add to learning plan
        var add = document.createElement('a');
        add.setAttribute('id', 'jump_a');
        add.setAttribute('href', '#');
        // let addWord function can access the word name by title name
        add.setAttribute('title', voc.id);
        add.appendChild(document.createTextNode('添加到生词本'));
        add.addEventListener('click', addWord);
        jump.appendChild(add);
    }
}

function queryNotFound(word) {
    // clear jump area
    clearArea('jump');
    showTips('<span class="word">' + word + '</span> 没有找到。');
}

function query(word) {
    // show this let user don't panic
    showTips('查询中...');
    clearArea('jump');
    clearArea('definition');
    
    //enhancement: only search the first word even there are multiple words selected
    word=word.split(' ')[0]

    var request = new XMLHttpRequest();
    var query_url = 'https://api.shanbay.com/bdc/search/?word=' + word + "&"+tokenQueryString();
    request.open('GET', query_url);
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
                            var realResponse = JSON.parse(request.responseText);
                            if (realResponse.status_code===0){
                                queryOk(realResponse.data);
                            }else{
                                queryNotFound(word);
                            }
        }
    }
    request.send(null);
}

function parse(input) {
    var re = /[^a-zA-Z ]+/g;
    input = input.replace(re, '');
    if (input.length == 0 || input.search(/^ +$/) != -1)
	// have no valid character 
	return null;
    else {
	var word = input.replace(/ +/, ' ');
	word = word.replace(/^ +| +$/, '');
	return word;
    }
}

function click() {
    var input = document.getElementById('input').value;
    var word = parse(input);
    if (word == null) {
	clearArea('jump');
	clearArea('definition');
	showTips('<span class="color">英文字符</span>和<span class="color">空格</span>为有效的关键字，请重新输入');
    }
    else
	query(word);
    document.getElementById('input').focus();
}

function keydown() {
    if (event.keyCode == 13) {
        var input = document.getElementById('input').value;
	var word = parse(input);
	if (word == null) {
	    clearArea('jump');
	    clearArea('definition');
	    showTips('<span class="color">英文字符</span>和<span class="color">空格</span>为有效的关键字，请重新输入');
	}
	else
	    query(word);
    }
}

function playSound() {
    var audio = document.createElement('audio');
    // sound api has changed, url made by my own hand
    var sound_url = 'http://media.shanbay.com/audio/$country/$word.mp3';
    // now hard coded to use American english
    var country = 'us';
    // find word name from element img's alt attribute
    var audio_img = document.getElementById('horn');
    // get word and change space to underscore to generate the url
    var word = audio_img.alt.replace(/ /g, '_');
    sound_url = sound_url.replace('$country', country);
    sound_url = sound_url.replace('$word', word);
    audio.setAttribute('src', sound_url);
    audio.setAttribute('autoplay', 'true');
    var sound = document.getElementById('sound');
    sound.appendChild(audio);
    document.getElementById('input').focus();
}

document.addEventListener('DOMContentLoaded', function () {
    checkLoginStatus();
    document.querySelector('button').addEventListener('click', click);
    document.querySelector('input').addEventListener('keydown', keydown);
    
    document.querySelector('#sound').addEventListener('click', playSound);
    //fix issue#6, disable the mouseover sound play, otherwise it will be playied twice with single click
    //document.querySelector('#sound').addEventListener('mouseover', playSound);
});