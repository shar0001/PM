/* =============================================================
   Production OS V4 — Weather & Sun API
   OpenMeteo (No API Key)
   日の出 (Sunrise) と日の入り (Sunset) の取得対応
   ============================================================= */
window.Weather = (function () {
    const CACHE_KEY = 'pos_weather_cache';
    const CACHE_TTL = 3600000; // 1 hour

    function _loadCache() {
        try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch (e) { return {}; }
    }
    function _saveCache(data) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) { }
    }
    function _getIcon(code) {
        // WMO Weather interpretation codes
        if (code === 0) return 'sunny';
        if (code === 1 || code === 2) return 'partly_cloudy_day';
        if (code === 3) return 'cloudy';
        if (code >= 45 && code <= 48) return 'foggy';
        if (code >= 51 && code <= 67) return 'rainy';
        if (code >= 71 && code <= 77) return 'weather_snowy';
        if (code >= 80 && code <= 82) return 'rainy';
        if (code >= 85 && code <= 86) return 'weather_snowy';
        if (code >= 95) return 'thunderstorm';
        return 'partly_cloudy_day';
    }

    async function fetchWeather(lat, lng, dateString) {
        const key = `${lat}_${lng}_${dateString}`;
        const cache = _loadCache();
        if (cache[key] && (Date.now() - cache[key].timestamp < CACHE_TTL)) {
            return cache[key].data;
        }

        try {
            // 日本のタイムゾーン指定で高精度な天気データを取得
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=sunrise,sunset&timezone=Asia%2FTokyo`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Weather API error');
            const json = await res.json();

            const current = {
                temp: Math.round(json.current.temperature_2m),
                rain: Math.round(json.current.precipitation > 0 ? 100 : 0),
                icon: _getIcon(json.current.weather_code)
            };

            const hCodes = json.hourly.weather_code || [];
            const hTemps = json.hourly.temperature_2m || [];
            const hPops = json.hourly.precipitation_probability || [];
            const hTimes = json.hourly.time || [];

            const nowIdx = hTimes.findIndex(t => new Date(t).getTime() > Date.now());
            const startIdx = Math.max(0, nowIdx > 0 ? nowIdx - 1 : 0);
            const hourly = [];
            for (let i = startIdx; i < startIdx + 8 && i < hTimes.length; i++) {
                hourly.push({
                    time: new Date(hTimes[i]).getHours() + ':00',
                    temp: Math.round(hTemps[i] ?? 0),
                    rain: hPops[i] ?? 0,
                    icon: _getIcon(hCodes[i] ?? 0)
                });
            }

            let sunsetTime = null;
            let sunriseTime = null;
            if (json.daily && json.daily.sunset && json.daily.sunset.length > 0) {
                sunsetTime = json.daily.sunset[0].split('T')[1];
            }
            if (json.daily && json.daily.sunrise && json.daily.sunrise.length > 0) {
                sunriseTime = json.daily.sunrise[0].split('T')[1];
            }

            const data = { current, hourly, sunriseTime, sunsetTime };
            cache[key] = { timestamp: Date.now(), data };
            _saveCache(cache);
            return data;
        } catch (e) {
            console.warn('Weather fetch failed:', e);
            return {
                current: { temp: '--', rain: 0, icon: 'partly_cloudy_day' },
                hourly: [], sunriseTime: null, sunsetTime: null
            };
        }
    }

    function clearCache() { localStorage.removeItem(CACHE_KEY); }

    return { fetchWeather, clearCache };
})();
