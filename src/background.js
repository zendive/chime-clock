var app = {
    m_gongMinute: -1,
    m_speakMinute: -1,
    m_gongCount: 0,
    aClock: new Audio('../../src/clock.wav'),
    aGong: new Audio('../../src/gong.wav'),

    timer: window.setInterval(function () {
        if (window.localStorage['tts'] === 'true') {
            if (app.isSpeakTime()) {
                app.speak();
            }
        }
        else {
            if (app.aGong.paused && (app.m_gongCount || app.isGongTime())) {
                --app.m_gongCount;
                app.aGong.play();
            }
        }

    }, 1000),

    isGongTime: function () {
        var now = new Date(),
            minute = now.getMinutes(),
            hour = now.getHours();

        if (app.m_gongMinute == minute) {
            return false;   // skip checking already checked minute

        }
        else {
            app.m_gongMinute = minute;

            if (app.m_gongMinute == 0) {
                if (hour > 12) {
                    app.m_gongCount = hour - 12;
                }
                else if (hour == 0) {
                    app.m_gongCount = 12;
                }
                else {
                    app.m_gongCount = hour;
                }

                return true;
            }
            else if (app.m_gongMinute % window.localStorage['step'] == 0) {
                app.m_gongCount = 1;
                return true;
            }
        }

        return false;
    },

    isSpeakTime: function () {
        var now = new Date(),
            minute = now.getMinutes();

        if (app.m_speakMinute === minute) {
            return false;   // skip checking already checked minute
        }
        else {
            app.m_speakMinute = minute;
            if (minute % window.localStorage['step'] === 0) {
                return true;
            }
        }

        return false;
    },

    speak: function () {
        var now = new Date(),
            minute = now.getMinutes(),
            hour = now.getHours(),
            text = 'OK';

        if (/English/i.test(window.localStorage['voiceName'])) {
            text = (minute? ''+ hour +':'+ (minute <= 9? '0'+minute : minute) : ''+ hour +' o\'clock.');
        }
        else {
            text = (minute? ''+ hour +':'+ (minute <= 9? '0'+minute : minute) : ''+ hour);
        }
        try {
            chrome.tts.speak(text, {
                voiceName: window.localStorage['voiceName'],
                rate: 0.8,
                volume: 1,
                enqueue: true
            });
        }
        catch (bug) {
            // noop
        }
    }
};

app.aClock.loop = true;

// restore volume setup
if (window.localStorage['mute'] !== 'true') {
    // play clock by default if not mute
    app.aClock.play();
}
if (window.localStorage['volume'] !== undefined) {
    app.aClock.volume = +window.localStorage['volume'];
    app.aGong.volume = app.aClock.volume;
}
else {
    app.aClock.volume = 0.2;
    app.aGong.volume = app.aClock.volume;
    window.localStorage['volume'] = app.aClock.volume;
}

chrome.runtime.onMessage.addListener(function (e) {
    if (e.type === 'set') {
        window.localStorage[e.what] = e.value;
        if (e.what === 'mute') {
            if (e.value) {
                app.aClock.pause();
            }
            else {
                app.aClock.play();
            }
        }
        else if (e.what === 'volume') {
            app.aClock.volume = +e.value;
            app.aGong.volume = app.aClock.volume;
        }
        else if (e.what === 'voiceName') {
            chrome.tts.speak(e.value, { voiceName: e.value, enqueue: true });
        }
    }
});
