var chkMute = document.getElementById('chkMute'),
    chkTTS = document.getElementById('chkTTS'),
    rngVolume = document.getElementById('rngVolume'),
    rngStep = document.getElementById('rngStep'),
    outStep = document.getElementById('outStep'),
    ddlVoiceNameLabel = document.getElementById('ddlVoiceNameLabel'),
    ddlVoiceName = document.getElementById('ddlVoiceName'),
    aStepMinuteMap = [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30];

function ddlVoiceName_render () {
    chrome.tts.getVoices(function (voices) {
        var defaultOption,
            selected = window.localStorage['voiceName'],
            options = document.createDocumentFragment();

        ddlVoiceNameLabel.style.display = 'block';
        ddlVoiceName.innerHTML = '';
        for (var i = 0, I = voices.length; i < I; i++) {
            if (i === 0) {
                defaultOption = voices[i].voiceName;
            }
            var option = document.createElement('option');
            option.value = voices[i].voiceName;
            option.text = voices[i].voiceName;
            options.appendChild(option);
        }
        ddlVoiceName.appendChild(options);

        if (selected) {
            ddlVoiceName.value = selected;
        } else if (defaultOption) {
            ddlVoiceName.value = defaultOption;
        }
    });
}

// restore settings from localStorage
if (window.localStorage['mute'] === 'true') {
    chkMute.checked = true;
}
if (window.localStorage['tts'] === 'true') {
    chkTTS.checked = true;
    ddlVoiceName_render();
}
if (window.localStorage['volume'] !== undefined) {
    rngVolume.value = +window.localStorage['volume'];
} else {
    rngVolume.value = 0.2;
}
if (window.localStorage['step'] !== undefined) {
    var minute = +window.localStorage['step'];
    rngStep.value = aStepMinuteMap.indexOf(minute);
    outStep.value = minute;
}

// setup dom events
chkMute.addEventListener('click', function () {
    chrome.runtime.sendMessage({ type: 'set', what: 'mute', value: chkMute.checked });
});
chkTTS.addEventListener('click', function () {
    chrome.runtime.sendMessage({ type: 'set', what: 'tts', value: chkTTS.checked });
    if (chkTTS.checked) {
        ddlVoiceName_render();
    } else {
        ddlVoiceNameLabel.style.display = 'none';
        ddlVoiceName.innerHTML = '';
    }
});
rngVolume.addEventListener('change', function () {
    chrome.runtime.sendMessage({ type: 'set', what: 'volume', value: rngVolume.value });
});
rngStep.addEventListener('change', function () {
    var value = aStepMinuteMap[+rngStep.value];
    outStep.value = value;
    chrome.runtime.sendMessage({ type: 'set', what: 'step', value: value });
});
ddlVoiceName.addEventListener('change', function () {
    chrome.runtime.sendMessage({ type: 'set', what: 'voiceName', value: ddlVoiceName.selectedOptions[0].value });
});
